// Content script for ChromaPeek extension

let isInspecting = false;
let overlay = null;

function cleanHostname(hostname) {
  return hostname.replace(/^www\./i, "");
}

function normalizeColorValue(color) {
  if (!color || color === "transparent" || color === "rgba(0, 0, 0, 0)") {
    return null;
  }

  const rgbMatch = color.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)/i);

  if (rgbMatch) {
    return `rgb(${rgbMatch[1]}, ${rgbMatch[2]}, ${rgbMatch[3]})`;
  }

  return color;
}

function createOverlay() {
  overlay = document.createElement("div");
  overlay.id = "chromapeek-overlay";
  overlay.style.cssText = `
    position: absolute;
    pointer-events: none;
    z-index: 999999;
    border: 2px solid #f0ebd8;
    background: rgba(240, 235, 216, 0.1);
    display: none;
    box-sizing: border-box;
  `;
  document.body.appendChild(overlay);
}

function init() {
  if (!overlay) {
    createOverlay();
  }
}

function extractColors() {
  const colors = new Set();
  const elements = document.querySelectorAll("*");

  elements.forEach((element) => {
    const styles = window.getComputedStyle(element);
    [
      styles.backgroundColor,
      styles.color,
      styles.borderTopColor,
      styles.borderRightColor,
      styles.borderBottomColor,
      styles.borderLeftColor,
    ].forEach((color) => {
      const normalized = normalizeColorValue(color);
      if (normalized) {
        colors.add(normalized);
      }
    });
  });

  return Array.from(colors).slice(0, 12);
}

function extractFonts() {
  const fonts = new Map();
  const elements = document.querySelectorAll("*");

  elements.forEach((element) => {
    const styles = window.getComputedStyle(element);
    const family = styles.fontFamily;

    if (!family || family === "inherit") {
      return;
    }

    const fontKey = family.replace(/['"]/g, "");
    if (!fonts.has(fontKey)) {
      fonts.set(fontKey, {
        family: fontKey,
        size: styles.fontSize,
        weight: styles.fontWeight,
        style: styles.fontStyle,
        lineHeight: styles.lineHeight,
      });
    }
  });

  return Array.from(fonts.values()).slice(0, 10);
}

function extractImages() {
  const images = [];
  const imgElements = document.querySelectorAll("img");

  imgElements.forEach((img) => {
    if (img.src && img.src.startsWith("http")) {
      images.push({
        src: img.src,
        alt: img.alt || "",
        width: img.naturalWidth || img.width || 0,
        height: img.naturalHeight || img.height || 0,
      });
    }
  });

  return images.slice(0, 20);
}

function extractText() {
  const textElements = document.querySelectorAll(
    "p, h1, h2, h3, h4, h5, h6, span, div, li, td"
  );
  const blocks = [];

  textElements.forEach((element) => {
    const elementText = element.textContent?.trim();
    if (elementText && elementText.length > 10) {
      blocks.push(elementText);
    }
  });

  return blocks.join("\n\n").trim();
}

function extractButtons() {
  const buttons = [];
  const buttonElements = document.querySelectorAll(
    "button, input[type='button'], input[type='submit'], [role='button']"
  );

  buttonElements.forEach((element) => {
    const text =
      element.textContent?.trim() ||
      element.value?.trim() ||
      element.getAttribute("aria-label") ||
      "";

    if (!text) {
      return;
    }

    buttons.push({
      text,
      tag: element.tagName.toLowerCase(),
      id: element.id || "",
      classes: typeof element.className === "string" ? element.className : "",
      selector: getSelector(element),
    });
  });

  return buttons.slice(0, 50);
}

function extractLinks() {
  const links = [];
  const linkElements = document.querySelectorAll("a[href]");

  linkElements.forEach((element) => {
    const href = element.href || "";
    if (!href.startsWith("http")) {
      return;
    }

    links.push({
      text: element.textContent?.trim() || element.getAttribute("aria-label") || href,
      href,
      external: new URL(href).hostname !== window.location.hostname,
      selector: getSelector(element),
    });
  });

  return links.slice(0, 50);
}

function extractHeadings() {
  const headings = [];
  const headingElements = document.querySelectorAll("h1, h2, h3, h4, h5, h6");

  headingElements.forEach((element) => {
    headings.push({
      level: element.tagName.toLowerCase(),
      text: element.textContent?.trim() || "",
      selector: getSelector(element),
    });
  });

  return headings.slice(0, 50);
}

function extractAccessibility() {
  const images = document.querySelectorAll("img");
  const missingAltImages = Array.from(images).filter((img) => !img.alt).length;

  return {
    headingCount: document.querySelectorAll("h1, h2, h3, h4, h5, h6").length,
    imageCount: images.length,
    missingAltImages,
    hasMainLandmark: Boolean(document.querySelector("main")),
  };
}

function extractCssSnapshot() {
  const bodyStyles = window.getComputedStyle(document.body);
  return {
    body: {
      backgroundColor: bodyStyles.backgroundColor,
      color: bodyStyles.color,
      fontFamily: bodyStyles.fontFamily,
      fontSize: bodyStyles.fontSize,
    },
  };
}

function buildPageData() {
  const title = document.title?.trim() || cleanHostname(window.location.hostname);
  const url = window.location.href;

  return {
    title,
    url,
    colors: extractColors(),
    fonts: extractFonts(),
    images: extractImages(),
    text: extractText(),
    buttons: extractButtons(),
    links: extractLinks(),
    headings: extractHeadings(),
    css: extractCssSnapshot(),
    accessibility: extractAccessibility(),
  };
}

function getSelector(element) {
  const tag = element.tagName.toLowerCase();
  const id = element.id ? `#${element.id}` : "";
  const classes =
    typeof element.className === "string" && element.className.trim()
      ? `.${element.className.trim().split(/\s+/).join(".")}`
      : "";
  return `${tag}${id}${classes}`;
}

function describeElement(element) {
  const styles = window.getComputedStyle(element);
  const rect = element.getBoundingClientRect();

  return {
    tag: element.tagName.toLowerCase(),
    id: element.id || "",
    classes: typeof element.className === "string" ? element.className : "",
    selector: getSelector(element),
    textContent: element.textContent?.trim() || "",
    styles: {
      fontFamily: styles.fontFamily,
      fontSize: styles.fontSize,
      fontWeight: styles.fontWeight,
      fontStyle: styles.fontStyle,
      lineHeight: styles.lineHeight,
      letterSpacing: styles.letterSpacing,
      color: styles.color,
      backgroundColor: styles.backgroundColor,
      borderColor: styles.borderColor,
      borderRadius: styles.borderRadius,
      display: styles.display,
      position: styles.position,
      width: styles.width,
      height: styles.height,
      margin: styles.margin,
      padding: styles.padding,
    },
    dimensions: {
      width: Math.round(rect.width),
      height: Math.round(rect.height),
    },
  };
}

function handleMouseOver(event) {
  if (!isInspecting || !overlay) return;

  const element = event.target;
  if (!(element instanceof Element)) return;

  const rect = element.getBoundingClientRect();

  overlay.style.display = "block";
  overlay.style.left = `${rect.left + window.scrollX}px`;
  overlay.style.top = `${rect.top + window.scrollY}px`;
  overlay.style.width = `${rect.width}px`;
  overlay.style.height = `${rect.height}px`;
}

function handleMouseOut() {
  if (overlay) {
    overlay.style.display = "none";
  }
}

function handleClick(event) {
  if (!isInspecting) return;

  const element = event.target;
  if (!(element instanceof Element)) return;

  event.preventDefault();
  event.stopPropagation();

  chrome.runtime.sendMessage({
    type: "ELEMENT_SELECTED",
    data: describeElement(element),
  });
}

function toggleInspection(enable) {
  isInspecting = enable;

  if (enable) {
    document.addEventListener("mouseover", handleMouseOver, true);
    document.addEventListener("mouseout", handleMouseOut, true);
    document.addEventListener("click", handleClick, true);
    document.body.style.cursor = "crosshair";
  } else {
    document.removeEventListener("mouseover", handleMouseOver, true);
    document.removeEventListener("mouseout", handleMouseOut, true);
    document.removeEventListener("click", handleClick, true);
    document.body.style.cursor = "";
    if (overlay) overlay.style.display = "none";
  }
}

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === "extractData") {
    sendResponse(buildPageData());
    return true;
  }

  if (request.action === "toggleInspection") {
    toggleInspection(Boolean(request.enabled));
    sendResponse({ success: true });
    return true;
  }
});

window.initializeChromaPeek = () => toggleInspection(true);

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", init);
} else {
  init();
}
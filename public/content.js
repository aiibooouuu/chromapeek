// Content script for ChromaPeek extension

let isInspecting = false;
let overlay = null;

// Initialize the extension when loaded
function init() {
  console.log('ChromaPeek content script loaded');
  createOverlay();
}

// Create hover overlay for element inspection
function createOverlay() {
  overlay = document.createElement('div');
  overlay.id = 'chromapeek-overlay';
  overlay.style.cssText = `
    position: absolute;
    pointer-events: none;
    z-index: 999999;
    border: 2px solid #f0ebd8;
    background: rgba(240, 235, 216, 0.1);
    display: none;
  `;
  document.body.appendChild(overlay);
}

// Extract colors from the page
function extractColors() {
  const colors = new Set();
  const elements = document.querySelectorAll('*');
  
  elements.forEach(element => {
    const styles = window.getComputedStyle(element);
    const bgColor = styles.backgroundColor;
    const textColor = styles.color;
    const borderColor = styles.borderColor;
    
    [bgColor, textColor, borderColor].forEach(color => {
      if (color && color !== 'rgba(0, 0, 0, 0)' && color !== 'transparent') {
        colors.add(color);
      }
    });
  });

  return Array.from(colors).slice(0, 10).map(color => {
    const rgb = color.match(/\d+/g);
    if (rgb) {
      const hex = '#' + rgb.map(x => {
        const hex = parseInt(x).toString(16);
        return hex.length === 1 ? '0' + hex : hex;
      }).join('');
      return {
        hex: hex,
        rgb: rgb.map(x => parseInt(x))
      };
    }
    return null;
  }).filter(Boolean);
}

// Extract fonts from the page
function extractFonts() {
  const fonts = new Set();
  const elements = document.querySelectorAll('*');
  
  elements.forEach(element => {
    const styles = window.getComputedStyle(element);
    const fontFamily = styles.fontFamily;
    const fontSize = styles.fontSize;
    const fontWeight = styles.fontWeight;
    const fontStyle = styles.fontStyle;
    
    if (fontFamily && fontFamily !== 'inherit') {
      fonts.add(JSON.stringify({
        family: fontFamily.replace(/['"]/g, ''),
        size: fontSize,
        weight: fontWeight,
        style: fontStyle
      }));
    }
  });

  return Array.from(fonts).slice(0, 10).map(font => JSON.parse(font));
}

// Extract images from the page
function extractImages() {
  const images = [];
  const imgElements = document.querySelectorAll('img');
  
  imgElements.forEach(img => {
    if (img.src && img.src.startsWith('http')) {
      images.push({
        src: img.src,
        alt: img.alt || '',
        width: img.naturalWidth,
        height: img.naturalHeight
      });
    }
  });

  return images.slice(0, 20);
}

// Extract text from the page
function extractText() {
  const textElements = document.querySelectorAll('p, h1, h2, h3, h4, h5, h6, span, div, li, td');
  let text = '';
  
  textElements.forEach(element => {
    const elementText = element.textContent.trim();
    if (elementText && elementText.length > 10) {
      text += elementText + '\n\n';
    }
  });

  return text.trim();
}

// Handle hover effects
function handleMouseOver(event) {
  if (!isInspecting) return;
  
  const element = event.target;
  const rect = element.getBoundingClientRect();
  
  overlay.style.display = 'block';
  overlay.style.left = (rect.left + window.scrollX) + 'px';
  overlay.style.top = (rect.top + window.scrollY) + 'px';
  overlay.style.width = rect.width + 'px';
  overlay.style.height = rect.height + 'px';
}

function handleMouseOut() {
  if (overlay) {
    overlay.style.display = 'none';
  }
}

// Toggle inspection mode
function toggleInspection(enable) {
  isInspecting = enable;
  
  if (enable) {
    document.addEventListener('mouseover', handleMouseOver);
    document.addEventListener('mouseout', handleMouseOut);
    document.body.style.cursor = 'crosshair';
  } else {
    document.removeEventListener('mouseover', handleMouseOver);
    document.removeEventListener('mouseout', handleMouseOut);
    document.body.style.cursor = '';
    if (overlay) overlay.style.display = 'none';
  }
}

// Listen for messages from popup
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'extractData') {
    const data = {
      colors: extractColors(),
      fonts: extractFonts(),
      images: extractImages(),
      text: extractText()
    };
    sendResponse(data);
  } else if (request.action === 'toggleInspection') {
    toggleInspection(request.enabled);
    sendResponse({ success: true });
  }
});

// Initialize when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}
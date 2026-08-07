import React, { useEffect, useMemo, useState } from "react";
import {
  Type,
  Copy,
  CheckCheck,
  Download,
  Sparkles,
  Palette,
  Ruler,
  CaseSensitive,
  Layers,
} from "lucide-react";

import "./FontInspector.css";

const FontInspector = ({ selectedElement, pageData }) => {
  const [fontInfo, setFontInfo] = useState(null);
  const [pageFonts, setPageFonts] = useState([]);
  const [copiedItem, setCopiedItem] = useState(null);

  useEffect(() => {
    setPageFonts(Array.isArray(pageData?.fonts) ? pageData.fonts : []);

    if (selectedElement?.styles) {
      setFontInfo({
        fontFamily: selectedElement.styles.fontFamily || "inherit",
        fontSize: selectedElement.styles.fontSize || "16px",
        fontWeight: selectedElement.styles.fontWeight || "400",
        fontStyle: selectedElement.styles.fontStyle || "normal",
        lineHeight: selectedElement.styles.lineHeight || "normal",
        letterSpacing: selectedElement.styles.letterSpacing || "normal",
        textDecoration: selectedElement.styles.textDecoration || "none",
        textTransform: selectedElement.styles.textTransform || "none",
        color: selectedElement.styles.color || "rgb(255,255,255)",
      });
    } else {
      setFontInfo(null);
    }
  }, [selectedElement, pageData]);

  const parseFontStack = (family) =>
    family
      .split(",")
      .map((font) => font.trim().replace(/['"]/g, ""))
      .filter(Boolean);

  const readableWeight = (weight) => {
    const map = {
      100: "Thin",
      200: "Extra Light",
      300: "Light",
      400: "Regular",
      500: "Medium",
      600: "Semi Bold",
      700: "Bold",
      800: "Extra Bold",
      900: "Black",
    };

    return map[weight] || weight;
  };

  const copyText = async (id, text) => {
    await navigator.clipboard.writeText(text);
    setCopiedItem(id);
    setTimeout(() => setCopiedItem(null), 1200);
  };

  const copyCSS = () => {
    if (!fontInfo) return;

    copyText(
      "css",
      `font-family: ${fontInfo.fontFamily};
font-size: ${fontInfo.fontSize};
font-weight: ${fontInfo.fontWeight};
font-style: ${fontInfo.fontStyle};
line-height: ${fontInfo.lineHeight};
letter-spacing: ${fontInfo.letterSpacing};
color: ${fontInfo.color};`
    );
  };

  const copyFontStack = () => {
    if (!fontInfo) return;
    copyText("stack", fontInfo.fontFamily);
  };

  const exportFonts = () => {
    const data = { selected: fontInfo, fonts: pageFonts };
    const blob = new Blob([JSON.stringify(data, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `chromapeek-fonts-${Date.now()}.json`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const fontStack = useMemo(() => {
    if (!fontInfo) return [];
    return parseFontStack(fontInfo.fontFamily);
  }, [fontInfo]);

  if (!fontInfo) {
    return (
      <div className="font-inspector">
        <div className="font-header">
          <div>
            <h2>Typography</h2>
            <p>Inspect the typography of any selected element.</p>
          </div>
        </div>

        <div className="empty-font">
          <Type size={46} />
          <h3>Typography Ready</h3>
          <p>
            Start Live Inspect and select any text element to analyze its
            typography.
          </p>
        </div>

        <div className="page-fonts">
          <div className="section-header">
            <Sparkles size={16} />
            <span>Page Fonts</span>
          </div>

          {pageFonts.length ? (
            <div className="fonts-list">
              {pageFonts.map((font, index) => (
                <div key={`${font.family}-${index}`} className="font-card">
                  <div>
                    <h4>{font.family}</h4>
                    <span className="mono">
                      {font.size} • {font.weight} • {font.style}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="empty-font" style={{ minHeight: 180 }}>
              <Type size={30} />
              <h3>No page fonts yet</h3>
              <p>Run a scan to extract typography from the current page.</p>
            </div>
          )}
        </div>
      </div>
    );
  }

  const propertyCards = [
    { icon: Type, label: "Size", value: fontInfo.fontSize },
    {
      icon: Layers,
      label: "Weight",
      value: `${fontInfo.fontWeight} • ${readableWeight(fontInfo.fontWeight)}`,
    },
    { icon: Ruler, label: "Line Height", value: fontInfo.lineHeight },
    { icon: CaseSensitive, label: "Letter Spacing", value: fontInfo.letterSpacing },
    { icon: Palette, label: "Color", value: fontInfo.color },
  ];

  return (
    <div className="font-inspector">
      <div className="font-header">
        <div>
          <h2>Typography</h2>
          <p>Visual typography inspection for the selected element.</p>
        </div>

        <button className="secondary-btn" onClick={exportFonts}>
          <Download size={16} />
          Export
        </button>
      </div>

      <div className="font-preview-card">
        <div className="preview-top">
          <div>
            <h3>{fontStack[0] || "Unknown Font"}</h3>
            <span className="mono">
              {readableWeight(fontInfo.fontWeight)} • {fontInfo.fontWeight}
            </span>
          </div>

          <div className="preview-actions">
            <button className="secondary-btn" onClick={copyCSS}>
              {copiedItem === "css" ? <CheckCheck size={14} /> : <Copy size={14} />}
              Copy CSS
            </button>

            <button className="icon-button" onClick={copyFontStack}>
              {copiedItem === "stack" ? <CheckCheck size={16} /> : <Copy size={16} />}
            </button>
          </div>
        </div>

      <div className="property-grid">
        {propertyCards.map(({ icon: Icon, label, value }) => (
          <div key={label} className="property-card">
            <div className="property-top">
              <div className="property-title">
                <Icon size={16} />
                <span>{label}</span>
              </div>
            </div>

            <div className="property-value mono">{value}</div>
          </div>
        ))}
      </div>

      <div className="page-fonts">
        <div className="section-header">
          <Sparkles size={16} />
          <span>Page Fonts</span>
        </div>

        {pageFonts.length ? (
          <div className="fonts-list">
            {pageFonts.map((font, index) => (
              <div key={`${font.family}-${index}`} className="font-card">
                <div>
                  <h4>{font.family}</h4>
                  <span className="mono">
                    {font.size} • {font.weight} • {font.style}
                  </span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="empty-font" style={{ minHeight: 180 }}>
            <Type size={30} />
            <h3>No page fonts yet</h3>
            <p>Run a scan to extract typography from the current page.</p>
          </div>
        )}
      </div>
    </div>
    </div>
  );
};

export default FontInspector;
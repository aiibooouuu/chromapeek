import React, { useMemo, useState } from "react";
import {
  Palette,
  Copy,
  Download,
  RefreshCw,
  Check,
} from "lucide-react";

import "./ColorPalette.css";

const ColorPalette = ({ colors = [], onExtractColors, isLoading }) => {
  const [copiedColor, setCopiedColor] = useState(null);

  const normalizeColor = (color) => {
    if (typeof color !== "string") return "";

    const rgbMatch = color.match(/rgb\((\d+),\s*(\d+),\s*(\d+)\)/i);
    if (!rgbMatch) return color;

    const [, r, g, b] = rgbMatch;
    return (
      "#" +
      [r, g, b]
        .map((value) => {
          const hex = parseInt(value, 10).toString(16);
          return hex.length === 1 ? `0${hex}` : hex;
        })
        .join("")
        .toUpperCase()
    );
  };

  const palette = useMemo(() => {
    return colors
      .filter(Boolean)
      .map((color) => ({
        rgb: color,
        hex: normalizeColor(color),
      }));
  }, [colors]);

  const dominantColor = palette.length > 0 ? palette[0].hex : null;

  const copyColor = async (color) => {
    try {
      await navigator.clipboard.writeText(color);
      setCopiedColor(color);
      setTimeout(() => {
        setCopiedColor(null);
      }, 1200);
    } catch (error) {
      console.error(error);
    }
  };

  const copyEntirePalette = async () => {
    const output = palette.map((color) => color.hex).join("\n");
    await navigator.clipboard.writeText(output);
  };

  const exportPalette = () => {
    const json = JSON.stringify(palette, null, 2);
    const blob = new Blob([json], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `chromapeek-palette-${Date.now()}.json`;
    link.click();
    URL.revokeObjectURL(url);
  };

  if (!palette.length) {
    return (
      <div className="color-palette">
        <div className="palette-header">
          <div>
            <h2>Color Palette</h2>
            <p>Scan the current webpage to extract its visual color palette.</p>
          </div>

          <div className="palette-count">
            <Palette size={18} />
            <span>0 Colors</span>
          </div>
        </div>

        <div className="empty-palette">
          <Palette size={46} strokeWidth={1.8} />
          <h3>No colors found</h3>
          <p>Click below to analyze the current webpage.</p>

          <button
            className="primary-btn"
            onClick={onExtractColors}
            disabled={isLoading}
          >
            <RefreshCw size={16} />
            {isLoading ? "Scanning..." : "Extract Colors"}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="color-palette">
      <div className="palette-header">
        <div>
          <h2>Color Palette</h2>
          <p>{palette.length} unique colors detected</p>
        </div>

        <div className="palette-count">
          <Palette size={18} />
          <span>{palette.length}</span>
        </div>
      </div>

      <div className="palette-summary">
        <div className="summary-card">
          <span className="summary-label">Primary Color</span>

          <div className="primary-color">
            <div
              className="primary-swatch"
              style={{
                background: dominantColor,
              }}
            />

            <span className="mono">{dominantColor}</span>
          </div>
        </div>
      </div>

      <div className="color-grid">
        {palette.map((color, index) => (
          <div key={index} className="color-card">
            <div
              className="color-swatch"
              style={{
                backgroundColor: color.hex,
              }}
            />

            <div className="color-details">
              <span className="color-hex mono">{color.hex}</span>
              <span className="color-rgb mono">{color.rgb}</span>
            </div>

            <button className="icon-button" onClick={() => copyColor(color.hex)}>
              {copiedColor === color.hex ? <Check size={16} /> : <Copy size={16} />}
            </button>
          </div>
        ))}
      </div>

      <div className="palette-actions">
        <button className="secondary-btn" onClick={copyEntirePalette}>
          <Copy size={16} />
          Copy All
        </button>

        <button className="secondary-btn" onClick={exportPalette}>
          <Download size={16} />
          Export
        </button>

        <button
          className={`primary-btn ${isLoading ? "scanning" : ""}`}
          onClick={onExtractColors}
          disabled={isLoading}
        >
          <RefreshCw size={16} />
          {isLoading ? "Scanning..." : "Scan Again"}
        </button>
      </div>
    </div>
  );
};

export default ColorPalette;
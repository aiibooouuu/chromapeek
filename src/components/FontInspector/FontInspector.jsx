import React, { useState, useEffect, useMemo } from "react";
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

const FontInspector = ({
  selectedElement,
  pageData,
}) => {
  const [fontInfo, setFontInfo] =
    useState(null);

  const [pageFonts, setPageFonts] =
    useState([]);

  const [copiedItem, setCopiedItem] =
    useState(null);

  useEffect(() => {
    if (selectedElement?.styles) {
      extractFontInfo(
        selectedElement.styles
      );
    }

    extractPageFonts();
  }, [
    selectedElement,
    pageData,
  ]);

  const extractFontInfo = (
    styles
  ) => {
    setFontInfo({
      fontFamily:
        styles.fontFamily ||
        "inherit",

      fontSize:
        styles.fontSize ||
        "16px",

      fontWeight:
        styles.fontWeight ||
        "400",

      fontStyle:
        styles.fontStyle ||
        "normal",

      lineHeight:
        styles.lineHeight ||
        "normal",

      letterSpacing:
        styles.letterSpacing ||
        "normal",

      textDecoration:
        styles.textDecoration ||
        "none",

      textTransform:
        styles.textTransform ||
        "none",

      color:
        styles.color ||
        "rgb(255,255,255)",
    });
  };

  const extractPageFonts = () => {
    setPageFonts([
      {
        family: "Inter",
        usage: "28%",
        type: "Sans Serif",
      },
      {
        family: "Roboto",
        usage: "18%",
        type: "Sans Serif",
      },
      {
        family: "Poppins",
        usage: "12%",
        type: "Sans Serif",
      },
      {
        family: "Georgia",
        usage: "9%",
        type: "Serif",
      },
    ]);
  };

  const parseFontStack = (
    family
  ) =>
    family
      .split(",")
      .map((font) =>
        font
          .trim()
          .replace(
            /['"]/g,
            ""
          )
      )
      .filter(Boolean);

  const readableWeight = (
    weight
  ) => {
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

    return (
      map[weight] ||
      weight
    );
  };

  const copyText = async (
    id,
    text
  ) => {
    await navigator.clipboard.writeText(
      text
    );

    setCopiedItem(id);

    setTimeout(() => {
      setCopiedItem(null);
    }, 1200);
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

  const copyFontStack =
    () => {
      if (!fontInfo) return;

      copyText(
        "stack",
        fontInfo.fontFamily
      );
    };

  const exportFonts =
    () => {
      const data = {
        selected:
          fontInfo,
        fonts:
          pageFonts,
      };

      const blob =
        new Blob(
          [
            JSON.stringify(
              data,
              null,
              2
            ),
          ],
          {
            type: "application/json",
          }
        );

      const url =
        URL.createObjectURL(
          blob
        );

      const link =
        document.createElement(
          "a"
        );

      link.href = url;

      link.download = `chromapeek-fonts-${Date.now()}.json`;

      link.click();

      URL.revokeObjectURL(
        url
      );
    };

  const fontStack =
    useMemo(() => {
      if (!fontInfo)
        return [];

      return parseFontStack(
        fontInfo.fontFamily
      );
    }, [fontInfo]);

  if (!fontInfo) {
    return (
      <div className="font-inspector">

        <div className="font-header">

          <div>

            <h2>
              Typography
            </h2>

            <p>
              Inspect the
              typography of any
              selected element.
            </p>

          </div>

        </div>

        <div className="empty-font">

          <Type
            size={46}
          />

          <h3>
            Typography Ready
          </h3>

          <p>
            Start Live Inspect
            and select any text
            element to analyze
            its typography.
          </p>

        </div>

      </div>
    );
  }

  const propertyCards = [
    {
      icon: Type,
      label:
        "Size",
      value:
        fontInfo.fontSize,
    },
    {
      icon: Layers,
      label:
        "Weight",
      value: `${fontInfo.fontWeight} • ${readableWeight(
        fontInfo.fontWeight
      )}`,
    },
    {
      icon: Ruler,
      label:
        "Line Height",
      value:
        fontInfo.lineHeight,
    },
    {
      icon:
        CaseSensitive,
      label:
        "Letter Spacing",
      value:
        fontInfo.letterSpacing,
    },
    {
      icon: Palette,
      label:
        "Color",
      value:
        fontInfo.color,
    },
  ];

  return (
    <div className="font-inspector">

      <div className="font-header">

        <div>

          <h2>Typography</h2>

          <p>
            Visual typography inspection for the selected element.
          </p>

        </div>

        <button
          className="secondary-btn"
          onClick={exportFonts}
        >

          <Download size={16} />

          Export

        </button>

      </div>

      <div className="font-preview-card">

        <div className="preview-top">

          <div>

            <h3>
              {fontStack[0] || "Unknown Font"}
            </h3>

            <span className="mono">
              {readableWeight(
                fontInfo.fontWeight
              )} • {fontInfo.fontWeight}
            </span>

          </div>

          <button
            className="icon-button"
            onClick={copyFontStack}
          >

            {copiedItem === "stack" ? (
              <CheckCheck size={16} />
            ) : (
              <Copy size={16} />
            )}

          </button>

        </div>

        <div
          className="font-preview"
          style={{
            fontFamily:
              fontInfo.fontFamily,
            fontWeight:
              fontInfo.fontWeight,
            fontStyle:
              fontInfo.fontStyle,
            lineHeight:
              fontInfo.lineHeight,
            letterSpacing:
              fontInfo.letterSpacing,
            color:
              fontInfo.color,
          }}
        >

          The quick brown fox jumps over the lazy dog

        </div>

      </div>

      <div className="font-stack">

        <div className="section-header">

          <Sparkles size={16} />

          <span>Font Stack</span>

        </div>

        <div className="font-pills">

          {fontStack.map((font) => (

            <span
              key={font}
              className="font-pill mono"
            >

              {font}

            </span>

          ))}

        </div>

      </div>

      <div className="property-grid">

        {propertyCards.map(
          ({
            icon: Icon,
            label,
            value,
          }) => (

            <div
              key={label}
              className="property-card"
            >

              <div className="property-top">

                <div className="property-title">

                  <Icon size={15} />

                  <span>{label}</span>

                </div>

                <button
                  className="icon-button"
                  onClick={() =>
                    copyText(
                      label,
                      value
                    )
                  }
                >

                  {copiedItem ===
                  label ? (
                    <CheckCheck
                      size={15}
                    />
                  ) : (
                    <Copy
                      size={15}
                    />
                  )}

                </button>

              </div>

              {label === "Color" ? (

                <div className="color-property">

                  <div
                    className="color-dot"
                    style={{
                      background:
                        value,
                    }}
                  />

                  <span className="mono">

                    {value}

                  </span>

                </div>

              ) : (

                <span className="property-value mono">

                  {value}

                </span>

              )}

            </div>

          )
        )}

      </div>

      <div className="page-fonts">

        <div className="section-header">

          <Layers size={16} />

          <span>
            Fonts Found on Page
          </span>

        </div>

        <div className="fonts-list">

          {pageFonts.map(
            (font) => (

              <div
                key={font.family}
                className="font-card"
              >

                <div>

                  <h4
                    style={{
                      fontFamily:
                        font.family,
                    }}
                  >

                    {font.family}

                  </h4>

                  <span className="mono">

                    {font.type}

                  </span>

                </div>

                <div className="font-meta">

                  <span className="usage">

                    {font.usage}

                  </span>

                </div>

              </div>

            )
          )}

        </div>

      </div>

      <div className="font-actions">

        <button
          className="secondary-btn"
          onClick={copyFontStack}
        >

          {copiedItem === "stack" ? (
            <CheckCheck size={16} />
          ) : (
            <Copy size={16} />
          )}

          Copy Font Stack

        </button>

        <button
          className="primary-btn"
          onClick={copyCSS}
        >

          {copiedItem === "css" ? (
            <CheckCheck size={16} />
          ) : (
            <Copy size={16} />
          )}

          Copy CSS

        </button>

      </div>

    </div>
  );
};

export default FontInspector;
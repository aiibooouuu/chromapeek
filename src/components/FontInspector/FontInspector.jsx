import React, { useState, useEffect } from 'react';
import './FontInspector.css';

const FontInspector = ({ selectedElement, pageData }) => {
  const [fontInfo, setFontInfo] = useState(null);
  const [pageFonts, setPageFonts] = useState([]);

  useEffect(() => {
    if (selectedElement?.styles) {
      extractFontInfo(selectedElement.styles);
    }
    extractPageFonts();
  }, [selectedElement, pageData]);

  const extractFontInfo = (styles) => {
    const info = {
      fontFamily: styles.fontFamily || 'inherit',
      fontSize: styles.fontSize || '16px',
      fontWeight: styles.fontWeight || '400',
      fontStyle: styles.fontStyle || 'normal',
      lineHeight: styles.lineHeight || 'normal',
      letterSpacing: styles.letterSpacing || 'normal',
      textDecoration: styles.textDecoration || 'none',
      textTransform: styles.textTransform || 'none',
      color: styles.color || 'rgb(0, 0, 0)'
    };
    setFontInfo(info);
  };

  const extractPageFonts = () => {
    // This would be populated by the content script
    // For now, we'll simulate some common fonts
    const fonts = [
      { family: 'Arial', usage: '25%', type: 'sans-serif' },
      { family: 'Helvetica', usage: '20%', type: 'sans-serif' },
      { family: 'Times New Roman', usage: '15%', type: 'serif' },
      { family: 'Roboto', usage: '10%', type: 'sans-serif' },
      { family: 'Open Sans', usage: '8%', type: 'sans-serif' }
    ];
    setPageFonts(fonts);
  };

  const parseFontFamily = (fontFamily) => {
    return fontFamily
      .split(',')
      .map(font => font.trim().replace(/['"]/g, ''))
      .filter(font => font);
  };

  const getFontWeight = (weight) => {
    const weights = {
      '100': 'Thin',
      '200': 'Extra Light',
      '300': 'Light',
      '400': 'Normal',
      '500': 'Medium',
      '600': 'Semi Bold',
      '700': 'Bold',
      '800': 'Extra Bold',
      '900': 'Black'
    };
    return weights[weight] || weight;
  };

  const copyFontCSS = () => {
    if (!fontInfo) return;

    const css = `font-family: ${fontInfo.fontFamily};
font-size: ${fontInfo.fontSize};
font-weight: ${fontInfo.fontWeight};
font-style: ${fontInfo.fontStyle};
line-height: ${fontInfo.lineHeight};
letter-spacing: ${fontInfo.letterSpacing};
color: ${fontInfo.color};`;

    navigator.clipboard.writeText(css);
  };

  const exportFontInfo = () => {
    const data = {
      selectedElement: fontInfo,
      pageFonts: pageFonts,
      timestamp: new Date().toISOString()
    };

    const dataStr = JSON.stringify(data, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
    
    const exportFileDefaultName = `chromapeek-fonts-${Date.now()}.json`;
    
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
  };

  if (!selectedElement && pageFonts.length === 0) {
    return (
      <div className="font-inspector">
        <div className="component-title">
          🔤 Font Inspector
        </div>
        <div className="empty-state">
          <div className="empty-state-icon">🔤</div>
          <h3>No font data</h3>
          <p>Select an element to view its font properties, or scan the page for all fonts.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="font-inspector">
      <div className="component-title">
        🔤 Font Inspector
        <button 
          className="btn small outline"
          onClick={exportFontInfo}
          title="Export font data"
        >
          💾 Export
        </button>
      </div>

      {fontInfo && (
        <div className="selected-font">
          <div className="font-preview">
            <div 
              className="font-sample"
              style={{
                fontFamily: fontInfo.fontFamily,
                fontSize: fontInfo.fontSize,
                fontWeight: fontInfo.fontWeight,
                fontStyle: fontInfo.fontStyle,
                lineHeight: fontInfo.lineHeight,
                letterSpacing: fontInfo.letterSpacing,
                color: fontInfo.color
              }}
            >
              The quick brown fox jumps over the lazy dog
            </div>
          </div>

          <div className="font-properties">
            <div className="property-row">
              <span className="property-label">Font Family:</span>
              <span className="property-value">
                {parseFontFamily(fontInfo.fontFamily).map((font, index) => (
                  <span key={index} className="font-name">
                    {font}
                    {index < parseFontFamily(fontInfo.fontFamily).length - 1 && ', '}
                  </span>
                ))}
              </span>
            </div>

            <div className="property-row">
              <span className="property-label">Size:</span>
              <span className="property-value">{fontInfo.fontSize}</span>
            </div>

            <div className="property-row">
              <span className="property-label">Weight:</span>
              <span className="property-value">
                {getFontWeight(fontInfo.fontWeight)} ({fontInfo.fontWeight})
              </span>
            </div>

            <div className="property-row">
              <span className="property-label">Style:</span>
              <span className="property-value">{fontInfo.fontStyle}</span>
            </div>

            <div className="property-row">
              <span className="property-label">Line Height:</span>
              <span className="property-value">{fontInfo.lineHeight}</span>
            </div>

            <div className="property-row">
              <span className="property-label">Letter Spacing:</span>
              <span className="property-value">{fontInfo.letterSpacing}</span>
            </div>

            <div className="property-row">
              <span className="property-label">Color:</span>
              <span className="property-value color-value">
                <span 
                  className="color-preview"
                  style={{ backgroundColor: fontInfo.color }}
                ></span>
                {fontInfo.color}
              </span>
            </div>
          </div>

          <div className="font-actions">
            <button className="btn secondary" onClick={copyFontCSS}>
              📋 Copy CSS
            </button>
          </div>
        </div>
      )}

      {pageFonts.length > 0 && (
        <div className="page-fonts">
          <h4 className="section-title">Fonts Used on Page</h4>
          <div className="fonts-grid">
            {pageFonts.map((font, index) => (
              <div key={index} className="font-item">
                <div className="font-header">
                  <span className="font-family">{font.family}</span>
                  <span className="font-usage">{font.usage}</span>
                </div>
                <div className="font-type">{font.type}</div>
                <div 
                  className="font-sample-small"
                  style={{ fontFamily: font.family }}
                >
                  Aa Bb Cc 123
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="font-tools">
        <h4 className="section-title">Font Tools</h4>
        <div className="tools-grid">
          <button className="tool-btn">
            <span className="tool-icon">📏</span>
            <span className="tool-label">Measure Text</span>
          </button>
          <button className="tool-btn">
            <span className="tool-icon">🔍</span>
            <span className="tool-label">Find Similar</span>
          </button>
          <button className="tool-btn">
            <span className="tool-icon">⚡</span>
            <span className="tool-label">Web Safe</span>
          </button>
          <button className="tool-btn">
            <span className="tool-icon">🌐</span>
            <span className="tool-label">Google Fonts</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default FontInspector;
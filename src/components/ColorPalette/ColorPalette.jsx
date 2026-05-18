import React, { useState } from 'react';
import './ColorPalette.css';

const ColorPalette = ({ colors = [], onExtractColors, isLoading }) => {
  const [copiedColor, setCopiedColor] = useState(null);

  const rgbToHex = (rgb) => {
    const match = rgb.match(/rgb\((\d+),\s*(\d+),\s*(\d+)\)/);
    if (!match) return rgb;
    
    const [, r, g, b] = match;
    return '#' + [r, g, b].map(x => {
      const hex = parseInt(x).toString(16);
      return hex.length === 1 ? '0' + hex : hex;
    }).join('');
  };

  const copyToClipboard = async (color) => {
    const hexColor = rgbToHex(color);
    try {
      await navigator.clipboard.writeText(hexColor);
      setCopiedColor(hexColor);
      setTimeout(() => setCopiedColor(null), 1000);
    } catch (err) {
      console.error('Failed to copy color:', err);
    }
  };

  const exportPalette = () => {
    const palette = colors.map(color => ({
      rgb: color,
      hex: rgbToHex(color)
    }));
    
    const dataStr = JSON.stringify(palette, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
    
    const exportFileDefaultName = `chromapeek-palette-${Date.now()}.json`;
    
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
  };

  if (colors.length === 0) {
    return (
      <div className="color-palette">
        <div className="component-title">
          🎨 Color Palette
        </div>
        <div className="empty-state">
          <div className="empty-state-icon">🎨</div>
          <h3>No colors extracted</h3>
          <p>Click "Extract Colors" to analyze the current page's color palette.</p>
          <button 
            className="btn mt-3"
            onClick={onExtractColors}
            disabled={isLoading}
          >
            {isLoading ? 'Extracting...' : 'Extract Colors'}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="color-palette">
      <div className="component-title">
        🎨 Color Palette
        <button 
          className="btn small outline"
          onClick={onExtractColors}
          disabled={isLoading}
        >
          {isLoading ? 'Extracting...' : 'Re-extract'}
        </button>
      </div>
      
      <div className="color-grid">
        {colors.map((color, index) => (
          <div key={index} className="color-item">
            <div 
              className="color-swatch"
              style={{ backgroundColor: color }}
              onClick={() => copyToClipboard(color)}
              title="Click to copy"
            >
              {copiedColor === rgbToHex(color) && (
                <div className="copy-feedback">✓</div>
              )}
            </div>
            <div className="color-info">
              <div className="color-hex">{rgbToHex(color)}</div>
              <div className="color-rgb">{color}</div>
            </div>
          </div>
        ))}
      </div>
      
      <div className="palette-actions">
        <button className="btn secondary" onClick={exportPalette}>
          💾 Export Palette
        </button>
        <button 
          className="btn outline" 
          onClick={() => {
            const hexColors = colors.map(rgbToHex).join('\n');
            navigator.clipboard.writeText(hexColors);
          }}
        >
          📋 Copy All
        </button>
      </div>
    </div>
  );
};

export default ColorPalette;
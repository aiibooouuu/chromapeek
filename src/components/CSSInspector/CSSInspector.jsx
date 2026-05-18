import React, { useState, useEffect } from 'react';
import './CSSInspector.css';

const CSSInspector = ({ selectedElement, onPropertyChange }) => {
  const [editingProperty, setEditingProperty] = useState(null);
  const [editValue, setEditValue] = useState('');

  const handleEditStart = (property, currentValue) => {
    setEditingProperty(property);
    setEditValue(currentValue);
  };

  const handleEditSave = (property) => {
    if (onPropertyChange) {
      onPropertyChange(property, editValue);
    }
    setEditingProperty(null);
    setEditValue('');
  };

  const handleEditCancel = () => {
    setEditingProperty(null);
    setEditValue('');
  };

  const formatPropertyName = (property) => {
    return property.replace(/([A-Z])/g, '-$1').toLowerCase();
  };

  const copyProperty = (property, value) => {
    const cssText = `${formatPropertyName(property)}: ${value};`;
    navigator.clipboard.writeText(cssText);
  };

  const copyAllCSS = () => {
    if (!selectedElement?.styles) return;
    
    const cssText = Object.entries(selectedElement.styles)
      .map(([prop, value]) => `  ${formatPropertyName(prop)}: ${value};`)
      .join('\n');
    
    const fullCSS = `${selectedElement.tag}${selectedElement.id ? '#' + selectedElement.id : ''}${selectedElement.classes ? '.' + selectedElement.classes.split(' ').join('.') : ''} {\n${cssText}\n}`;
    
    navigator.clipboard.writeText(fullCSS);
  };

  if (!selectedElement) {
    return (
      <div className="css-inspector">
        <div className="component-title">
          🔍 CSS Inspector
        </div>
        <div className="empty-state">
          <div className="empty-state-icon">🎯</div>
          <h3>No element selected</h3>
          <p>Click "Inspect" and hover over elements on the page to view their CSS properties.</p>
        </div>
      </div>
    );
  }

  const importantProperties = [
    'fontSize', 'fontFamily', 'fontWeight', 'color', 'backgroundColor',
    'width', 'height', 'margin', 'padding', 'border', 'borderRadius'
  ];

  const otherProperties = Object.keys(selectedElement.styles || {})
    .filter(prop => !importantProperties.includes(prop))
    .sort();

  return (
    <div className="css-inspector">
      <div className="component-title">
        🔍 CSS Inspector
        <button 
          className="btn small outline"
          onClick={copyAllCSS}
          title="Copy all CSS"
        >
          📋 Copy CSS
        </button>
      </div>

      <div className="element-info">
        <div className="element-selector">
          <span className="tag">{selectedElement.tag}</span>
          {selectedElement.id && <span className="id">#{selectedElement.id}</span>}
          {selectedElement.classes && (
            <span className="classes">
              .{selectedElement.classes.split(' ').join('.')}
            </span>
          )}
        </div>
        
        {selectedElement.dimensions && (
          <div className="element-dimensions">
            {selectedElement.dimensions.width} × {selectedElement.dimensions.height}px
          </div>
        )}
        
        {selectedElement.textContent && (
          <div className="element-text">
            "{selectedElement.textContent}"
          </div>
        )}
      </div>

      <div className="css-properties">
        <div className="properties-section">
          <h4 className="section-title">Key Properties</h4>
          <div className="properties-list">
            {importantProperties.map(property => {
              const value = selectedElement.styles?.[property];
              if (!value || value === 'none' || value === 'auto') return null;

              return (
                <div key={property} className="property-item">
                  <div className="property-label">
                    {formatPropertyName(property)}
                  </div>
                  <div className="property-value">
                    {editingProperty === property ? (
                      <div className="property-edit">
                        <input
                          type="text"
                          value={editValue}
                          onChange={(e) => setEditValue(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') handleEditSave(property);
                            if (e.key === 'Escape') handleEditCancel();
                          }}
                          autoFocus
                        />
                        <button 
                          className="btn small"
                          onClick={() => handleEditSave(property)}
                        >
                          ✓
                        </button>
                        <button 
                          className="btn small secondary"
                          onClick={handleEditCancel}
                        >
                          ✕
                        </button>
                      </div>
                    ) : (
                      <div className="property-display">
                        <span 
                          className="value-text"
                          onClick={() => handleEditStart(property, value)}
                          title="Click to edit"
                        >
                          {value}
                        </span>
                        <button 
                          className="copy-btn"
                          onClick={() => copyProperty(property, value)}
                          title="Copy property"
                        >
                          📋
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {otherProperties.length > 0 && (
          <div className="properties-section">
            <h4 className="section-title">Other Properties</h4>
            <div className="properties-list compact">
              {otherProperties.map(property => {
                const value = selectedElement.styles[property];
                if (!value || value === 'none' || value === 'auto') return null;

                return (
                  <div key={property} className="property-item compact">
                    <span className="property-label">
                      {formatPropertyName(property)}:
                    </span>
                    <span className="property-value">
                      {value}
                    </span>
                    <button 
                      className="copy-btn"
                      onClick={() => copyProperty(property, value)}
                      title="Copy property"
                    >
                      📋
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>

      <div className="inspector-actions">
        <button 
          className="btn outline"
          onClick={() => {
            const selector = `${selectedElement.tag}${selectedElement.id ? '#' + selectedElement.id : ''}${selectedElement.classes ? '.' + selectedElement.classes.split(' ').join('.') : ''}`;
            navigator.clipboard.writeText(selector);
          }}
        >
          📋 Copy Selector
        </button>
      </div>
    </div>
  );
};

export default CSSInspector;
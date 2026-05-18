import React, { useState, useEffect } from 'react';
import ColorPalette from '../components/ColorPalette/ColorPalette';
import FontInspector from '../components/FontInspector/FontInspector';
import CSSInspector from '../components/CSSInspector/CSSInspector';
import ImageExtractor from '../components/ImageExtractor/ImageExtractor';
import TextExtractor from '../components/TextExtractor/TextExtractor';
import './Popup.css';

const Popup = () => {
  const [activeTab, setActiveTab] = useState('inspector');
  const [pageData, setPageData] = useState(null);
  const [selectedElement, setSelectedElement] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    loadPageData();
    
    // Listen for element selection from content script
    chrome.runtime.onMessage.addListener((message) => {
      if (message.type === 'ELEMENT_SELECTED') {
        setSelectedElement(message.data);
        setActiveTab('inspector');
      }
    });
  }, []);

  const loadPageData = async () => {
    setIsLoading(true);
    try {
      const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
      
      const response = await chrome.runtime.sendMessage({
        type: 'GET_PAGE_DATA'
      });
      
      if (response && !response.error) {
        setPageData(response);
      }
    } catch (error) {
      console.error('Failed to load page data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const extractColors = async () => {
    setIsLoading(true);
    try {
      const response = await chrome.runtime.sendMessage({
        type: 'EXTRACT_COLORS'
      });
      
      if (response && response.colors) {
        setPageData(prev => ({
          ...prev,
          colors: response.colors
        }));
      }
    } catch (error) {
      console.error('Failed to extract colors:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const activateInspection = async () => {
    try {
      const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
      
      await chrome.scripting.executeScript({
        target: { tabId: tab.id },
        function: () => {
          if (typeof window.initializeChromaPeek === 'function') {
            window.initializeChromaPeek();
          }
        }
      });
    } catch (error) {
      console.error('Failed to activate inspection:', error);
    }
  };

  const tabs = [
    { id: 'inspector', label: 'Inspector', icon: '🔍' },
    { id: 'colors', label: 'Colors', icon: '🎨' },
    { id: 'fonts', label: 'Fonts', icon: '🔤' },
    { id: 'images', label: 'Images', icon: '🖼️' },
    { id: 'text', label: 'Text', icon: '📝' }
  ];

  const renderTabContent = () => {
    switch (activeTab) {
      case 'inspector':
        return (
          <CSSInspector 
            selectedElement={selectedElement}
            onPropertyChange={(property, value) => {
              chrome.runtime.sendMessage({
                type: 'UPDATE_CSS',
                property,
                value
              });
            }}
          />
        );
      case 'colors':
        return (
          <ColorPalette 
            colors={pageData?.colors || []}
            onExtractColors={extractColors}
            isLoading={isLoading}
          />
        );
      case 'fonts':
        return (
          <FontInspector 
            selectedElement={selectedElement}
            pageData={pageData}
          />
        );
      case 'images':
        return (
          <ImageExtractor 
            images={pageData?.images || []}
            onDownload={(imageUrl) => {
              chrome.runtime.sendMessage({
                type: 'DOWNLOAD_IMAGE',
                imageUrl
              });
            }}
          />
        );
      case 'text':
        return (
          <TextExtractor 
            textElements={pageData?.text || []}
          />
        );
      default:
        return null;
    }
  };

  return (
    <div className="popup">
      <header className="popup-header">
        <div className="popup-title">
          <span className="popup-icon">👁️</span>
          <h1>ChromaPeek</h1>
        </div>
        <button 
          className="inspect-btn"
          onClick={activateInspection}
          title="Activate inspection mode"
        >
          <span>🎯</span>
          Inspect
        </button>
      </header>

      <nav className="popup-tabs">
        {tabs.map(tab => (
          <button
            key={tab.id}
            className={`tab ${activeTab === tab.id ? 'active' : ''}`}
            onClick={() => setActiveTab(tab.id)}
          >
            <span className="tab-icon">{tab.icon}</span>
            <span className="tab-label">{tab.label}</span>
          </button>
        ))}
      </nav>

      <main className="popup-content">
        {isLoading ? (
          <div className="loading">
            <div className="loading-spinner"></div>
            <p>Loading...</p>
          </div>
        ) : (
          renderTabContent()
        )}
      </main>

      <footer className="popup-footer">
        <button onClick={loadPageData} className="refresh-btn">
          🔄 Refresh
        </button>
        <span className="page-info">
          {pageData?.title ? pageData.title.substring(0, 30) + '...' : 'No page data'}
        </span>
      </footer>
    </div>
  );
};

export default Popup;
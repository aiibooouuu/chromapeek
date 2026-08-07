import React, { useEffect, useState } from "react";
import { Search } from "lucide-react";
import {
  FaPalette,
  FaFont,
  FaImages,
  FaChartPie,
  FaGear,
  FaMagnifyingGlass,
  FaRotateRight,
  FaWandMagicSparkles,
  FaFileLines,
} from "react-icons/fa6";

import ColorPalette from "../components/ColorPalette/ColorPalette";
import FontInspector from "../components/FontInspector/FontInspector";
import ImageExtractor from "../components/ImageExtractor/ImageExtractor";
import Overview from "../components/Overview/Overview";
import Settings from "../components/Settings/Settings";
import TextExtractor from "../components/TextExtractor/TextExtractor";
import "./Popup.css";

const Popup = () => {
  const [pageData, setPageData] = useState(null);
  const [selectedElement, setSelectedElement] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("overview");

  useEffect(() => {
    const listener = (message) => {
      if (message?.type === "ELEMENT_SELECTED") {
        setSelectedElement(message.data);
        setActiveTab("fonts");
      }
    };

    chrome.runtime.onMessage.addListener(listener);

    return () => {
      chrome.runtime.onMessage.removeListener(listener);
    };
  }, []);

  const scanCurrentPage = async () => {
    setIsLoading(true);

    try {
      const [tab] = await chrome.tabs.query({
        active: true,
        currentWindow: true,
      });

      if (!tab?.id) {
        throw new Error("No active tab found");
      }

      const response = await chrome.tabs.sendMessage(tab.id, {
        type: "GET_PAGE_DATA",
      });

      if (response && !response.error) {
        setPageData(response);
      }
    } catch (error) {
      console.error("Failed to scan page:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const extractPageColors = async () => {
    setIsLoading(true);

    try {
      const [tab] = await chrome.tabs.query({
        active: true,
        currentWindow: true,
      });

      if (!tab?.id) {
        throw new Error("No active tab found");
      }

      const response = await chrome.tabs.sendMessage(tab.id, {
        type: "EXTRACT_COLORS",
      });

      if (response?.colors) {
        setPageData((prev) => ({
          ...(prev || {}),
          colors: response.colors,
        }));
      }
    } catch (error) {
      console.error("Failed to extract colors:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const startInspector = async () => {
    try {
      const [tab] = await chrome.tabs.query({
        active: true,
        currentWindow: true,
      });

      if (!tab?.id) {
        throw new Error("No active tab found");
      }

      await chrome.tabs.sendMessage(tab.id, {
        type: "TOGGLE_INSPECTION",
        enabled: true,
      });
    } catch (error) {
      console.error("Failed to activate inspector:", error);
    }
  };

  const tabs = [
    { id: "overview", label: "Overview", icon: FaChartPie },
    { id: "colors", label: "Palette", icon: FaPalette },
    { id: "fonts", label: "Typography", icon: FaFont },
    { id: "images", label: "Assets", icon: FaImages },
    { id: "text", label: "Text", icon: FaFileLines },
    { id: "settings", label: "Settings", icon: FaGear },
  ];

  const renderTabContent = () => {
    switch (activeTab) {
      case "overview":
        return <Overview pageData={pageData} />;

      case "colors":
        return (
          <ColorPalette
            colors={pageData?.colors || []}
            onExtractColors={extractPageColors}
            isLoading={isLoading}
          />
        );

      case "fonts":
        return (
          <FontInspector
            selectedElement={selectedElement}
            pageData={pageData}
          />
        );

      case "images":
        return (
          <ImageExtractor
            images={pageData?.images || []}
            onDownload={(imageUrl) => {
              chrome.runtime.sendMessage({
                type: "DOWNLOAD_IMAGE",
                imageUrl,
              });
            }}
          />
        );

      case "text":
        return <TextExtractor textElements={pageData?.text || []} />;

      case "settings":
        return <Settings />;

      default:
        return null;
    }
  };

  return (
    <div className="popup">
      <header className="popup-header">
        <div className="brand">
          <div className="brand-logo">
            <FaWandMagicSparkles size={18} strokeWidth={2.2} />
          </div>

          <div className="brand-info">
            <h1>ChromaPeek</h1>
            <p>Visual Intelligence Toolkit</p>
          </div>
        </div>
      </header>

      <section className="scan-section">
        <button
          className={`primary-btn scan-btn ${isLoading ? "scanning" : ""}`}
          onClick={scanCurrentPage}
          disabled={isLoading}
        >
          <FaMagnifyingGlass size={18} />
          {isLoading ? "Scanning Current Page..." : "Scan Current Page"}
        </button>

        <button className="secondary-btn" onClick={startInspector}>
          <FaFileLines size={16} />
          Live Inspect
        </button>
      </section>

      <nav className="popup-tabs">
        {tabs.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            className={`tab ${activeTab === id ? "active" : ""}`}
            onClick={() => setActiveTab(id)}
          >
            <Icon size={17} strokeWidth={2} />
            <span>{label}</span>
          </button>
        ))}
      </nav>

      <main className="popup-content">
        {isLoading ? (
          <div className="loading">
            <div className="loading-spinner" />
            <h3>Scanning page...</h3>
            <p>Extracting colors, fonts, images and page content.</p>
          </div>
        ) : pageData ? (
          renderTabContent()
        ) : (
          <div className="empty-state">
            <Search size={42} strokeWidth={1.8} />
            <h3>Ready to Inspect</h3>
            <p>
              Scan the current webpage to discover its colors, typography,
              images and visual styles.
            </p>

            <button className="primary-btn" onClick={scanCurrentPage}>
              <Search size={16} />
              Scan Current Page
            </button>
          </div>
        )}
      </main>

      <footer className="popup-footer">
        <div className="page-details">
          <span className="page-title">
            {pageData?.title
              ? pageData.title.length > 38
                ? pageData.title.substring(0, 38) + "..."
                : pageData.title
              : "No page scanned"}
          </span>
        </div>

        <div className="footer-actions">
          <button
            className="secondary-btn"
            onClick={scanCurrentPage}
            disabled={isLoading}
          >
            <FaRotateRight size={15} />
            Refresh
          </button>
        </div>
      </footer>
    </div>
  );
};

export default Popup;
import React, { useEffect, useState } from "react";
import {
  FaCrosshairs,
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

  const [isInspecting, setIsInspecting] = useState(false);
  const [lastScannedAt, setLastScannedAt] = useState(null);
  const [pageHost, setPageHost] = useState(null);

  const getActiveTab = async () => {
    const [tab] = await chrome.tabs.query({
      active: true,
      currentWindow: true,
    });

    if (!tab?.id) {
      throw new Error("No active tab found");
    }

    return tab;
  };

  // Self-healing message sender: if the content script hasn't been
  // injected yet (e.g. page loaded before the extension, or a
  // navigation happened), inject it on the fly and retry once.
  const sendToTab = async (tabId, message) => {
    try {
      return await chrome.tabs.sendMessage(tabId, message);
    } catch (error) {
      await chrome.scripting.executeScript({
        target: { tabId },
        files: ["content.js"],
      });

      return await chrome.tabs.sendMessage(tabId, message);
    }
  };

  const sendMessage = async (type, payload = {}) => {
    const tab = await getActiveTab();
    return sendToTab(tab.id, { type, ...payload });
  };

  const scanCurrentPage = async () => {
    setIsLoading(true);

    try {
      const tab = await getActiveTab();
      const response = await sendToTab(tab.id, { type: "GET_PAGE_DATA" });

      if (response && !response.error) {
        setPageData(response);
        setLastScannedAt(new Date());

        try {
          setPageHost(new URL(tab.url).hostname);
        } catch {
          setPageHost(tab.url || null);
        }
      } else {
        console.error("Failed to scan page:", response?.error);
      }
    } catch (error) {
      console.error("Failed to scan page:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    // No auto-scan on open — scanning only happens when the user
    // presses "Scan Current Page".
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

  const extractPageColors = async () => {
    setIsLoading(true);

    try {
      const response = await sendMessage("EXTRACT_COLORS");

      if (response?.colors) {
        setPageData((prev) => ({
          ...(prev || {}),
          colors: response.colors,
        }));
      } else {
        console.error("Failed to extract colors:", response?.error);
      }
    } catch (error) {
      console.error("Failed to extract colors:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const toggleInspector = async () => {
    const next = !isInspecting;

    try {
      await sendMessage("TOGGLE_INSPECTION", { enabled: next });
      setIsInspecting(next);
    } catch (error) {
      console.error("Failed to toggle inspector:", error);
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
        return <TextExtractor text={pageData?.text || ""} />;

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

      <section className="scan-section">
        <button
        className={`
          ${pageData ? "secondary-btn scanned-btn" : "primary-btn"}
          scan-btn
          ${isLoading ? "scanning" : ""}
        `}
          onClick={scanCurrentPage}
          disabled={isLoading}
        >
          <FaMagnifyingGlass size={18} />
          {isLoading
          ? "Scanning Current Page..."
          : pageData
              ? "Scan Again"
              : "Scan Current Page"}
        </button>
{/* 
        <button
          className={`secondary-btn ${isInspecting ? "active" : ""}`}
          onClick={toggleInspector}
        >
          <FaCrosshairs size={16} />
          {isInspecting ? "Stop Inspect" : "Start Inspect"}
        </button> */}
      </section>

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
            <FaMagnifyingGlass size={42} strokeWidth={1.8} />
            <h3>No page scanned yet.</h3>
            <p>Click &quot;Scan Current Page&quot;</p>
          </div>
        )}
      </main>

      <footer className="popup-footer">
        <div className="page-details">
          {pageHost ? (
            <>
              <span className="page-title">{pageHost}</span>
              <span className="page-meta">
                Last scanned:{" "}
                {lastScannedAt?.toLocaleTimeString([], {
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </span>
            </>
          ) : (
            <span className="page-title">No page scanned</span>
          )}
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
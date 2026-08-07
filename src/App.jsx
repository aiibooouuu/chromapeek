import { useEffect, useState } from "react";
import {
  FaPalette,
  FaFont,
  FaImages,
  FaFileLines,
  FaChartPie,
  FaGear,
} from "react-icons/fa6";

import "./App.css";

import ColorPalette from "./components/ColorPalette/ColorPalette";
import FontInspector from "./components/FontInspector/FontInspector";
import ImageExtractor from "./components/ImageExtractor/ImageExtractor";
import Overview from "./components/Overview/Overview";
import Settings from "./components/Settings/Settings";

const EMPTY_PAGE_DATA = {
  title: "",
  url: "",
  colors: [],
  fonts: [],
  images: [],
  text: "",
};

const normalizePageData = (data = {}) => ({
  title: typeof data.title === "string" ? data.title : "",
  url: typeof data.url === "string" ? data.url : "",
  colors: Array.isArray(data.colors) ? data.colors : [],
  fonts: Array.isArray(data.fonts) ? data.fonts : [],
  images: Array.isArray(data.images) ? data.images : [],
  text: typeof data.text === "string" ? data.text : "",
});

function App() {
  const [activeTab, setActiveTab] = useState("overview");
  const [pageData, setPageData] = useState(EMPTY_PAGE_DATA);
  const [isScanning, setIsScanning] = useState(false);

  useEffect(() => {
    loadPageData();
  }, []);

  const loadPageData = async () => {
    try {
      const result = await chrome.storage.local.get(["extractedData"]);

      if (result.extractedData) {
        setPageData(normalizePageData(result.extractedData));
      }
    } catch (error) {
      console.error(error);
    }
  };

  const scanPage = async () => {
    setIsScanning(true);

    try {
      const [tab] = await chrome.tabs.query({
        active: true,
        currentWindow: true,
      });

      if (!tab?.id) {
        throw new Error("No active tab found");
      }

      const response = await chrome.tabs.sendMessage(tab.id, {
        action: "extractData",
      });

      if (!response) {
        throw new Error("No scan data returned from content script");
      }

      const normalized = normalizePageData({
        ...response,
        title: tab.title || response.title || "",
        url: tab.url || response.url || "",
      });

      setPageData(normalized);

      await chrome.storage.local.set({
        extractedData: normalized,
      });
    } catch (error) {
      console.error("Failed to scan page:", error);
    } finally {
      setIsScanning(false);
    }
  };

  const tabs = [
    { id: "overview", label: "Overview", icon: FaChartPie },
    { id: "colors", label: "Palette", icon: FaPalette },
    { id: "fonts", label: "Typography", icon: FaFont },
    { id: "images", label: "Assets", icon: FaImages },
    { id: "text", label: "Text", icon: FaFileLines },
  ];

  const renderContent = () => {
    switch (activeTab) {
      case "overview":
        return <Overview pageData={pageData} />;

      case "colors":
        return <ColorPalette colors={pageData.colors} isLoading={isScanning} />;

      case "fonts":
        return <FontInspector pageData={pageData} />;

      case "images":
        return <ImageExtractor images={pageData.images} />;

      case "text":
        return (
          <div className="text-panel">
            <textarea
              className="text-area"
              readOnly
              value={pageData.text}
            />
          </div>
        );

      case "settings":
        return <Settings />;

      default:
        return null;
    }
  };

  return (
    <div className="chromapeek-app">
      <header className="app-header">
        <h1>ChromePeek</h1>

        <div className="header-actions">
          <button
            className="secondary-btn header-gear-btn"
            onClick={() => setActiveTab("settings")}
            aria-label="Open settings"
            title="Settings"
          >
            <FaGear size={14} />
          </button>

          <button
            className={`primary-btn ${isScanning ? "scanning" : ""}`}
            onClick={scanPage}
            disabled={isScanning}
          >
            {isScanning ? "Scanning..." : "Scan Page"}
          </button>
        </div>
      </header>

      <nav className="tab-nav">
        {tabs.map((tab) => {
          const Icon = tab.icon;

          return (
            <button
              key={tab.id}
              className={`tab-btn ${activeTab === tab.id ? "active" : ""}`}
              onClick={() => setActiveTab(tab.id)}
            >
              <Icon size={15} />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </nav>

      <main className="app-content">{renderContent()}</main>
    </div>
  );
}

export default App;
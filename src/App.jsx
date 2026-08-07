import { useEffect, useState } from "react";
import {
  FaCrosshairs,
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
import CSSInspector from "./components/CSSInspector/CSSInspector";
import ImageExtractor from "./components/ImageExtractor/ImageExtractor";
import Overview from "./components/Overview/Overview";
import Settings from "./components/Settings/Settings";

const EMPTY_PAGE_DATA = {
  colors: [],
  fonts: [],
  images: [],
  text: "",
  buttons: [],
  links: [],
  headings: [],
  css: {},
  accessibility: {},
  title: "",
  url: "",
};

const normalizePageData = (data = {}) => ({
  title: typeof data.title === "string" ? data.title : "",
  url: typeof data.url === "string" ? data.url : "",
  colors: Array.isArray(data.colors) ? data.colors : [],
  fonts: Array.isArray(data.fonts) ? data.fonts : [],
  images: Array.isArray(data.images) ? data.images : [],
  text: typeof data.text === "string" ? data.text : "",
  buttons: Array.isArray(data.buttons) ? data.buttons : [],
  links: Array.isArray(data.links) ? data.links : [],
  headings: Array.isArray(data.headings) ? data.headings : [],
  css: data.css && typeof data.css === "object" ? data.css : {},
  accessibility:
    data.accessibility && typeof data.accessibility === "object"
      ? data.accessibility
      : {},
});

function App() {
  const [activeTab, setActiveTab] = useState("overview");
  const [pageData, setPageData] = useState(EMPTY_PAGE_DATA);
  const [selectedElement, setSelectedElement] = useState(null);
  const [isScanning, setIsScanning] = useState(false);

  useEffect(() => {
    loadPageData();

    const listener = (message) => {
      if (message?.type === "ELEMENT_SELECTED") {
        setSelectedElement(message.data ?? null);
        setActiveTab("inspect");
      }

      if (message?.type === "PAGE_DATA_UPDATED") {
        setPageData(normalizePageData(message.data));
      }
    };

    chrome.runtime.onMessage.addListener(listener);

    return () => {
      chrome.runtime.onMessage.removeListener(listener);
    };
  }, []);

  const loadPageData = async () => {
    try {
      const result = await chrome.storage.local.get(["extractedData"]);

      if (result.extractedData) {
        setPageData(normalizePageData(result.extractedData));
      }
    } catch (err) {
      console.error(err);
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

      const normalized = normalizePageData(response);
      setPageData(normalized);

      await chrome.storage.local.set({
        extractedData: normalized,
      });
    } catch (err) {
      console.error("Failed to scan page:", err);
    } finally {
      setIsScanning(false);
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
        action: "toggleInspection",
        enabled: true,
      });
    } catch (err) {
      console.error("Failed to activate inspector:", err);
    }
  };

  const tabs = [
    { id: "overview", label: "Overview", icon: FaChartPie },
    { id: "inspect", label: "Inspect", icon: FaCrosshairs },
    { id: "colors", label: "Palette", icon: FaPalette },
    { id: "fonts", label: "Typography", icon: FaFont },
    { id: "images", label: "Assets", icon: FaImages },
    { id: "text", label: "Text", icon: FaFileLines },
    { id: "settings", label: "Settings", icon: FaGear },
  ];

  const renderContent = () => {
    switch (activeTab) {
      case "overview":
        return <Overview pageData={pageData} />;

      case "inspect":
        return <CSSInspector selectedElement={selectedElement} />;

      case "colors":
        return (
          <ColorPalette
            colors={pageData.colors ?? []
            }
            isLoading={isScanning}
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
        return <ImageExtractor images={pageData.images ?? []} />;

      case "text":
        return (
          <div className="text-panel">
            <textarea
              className="text-area"
              readOnly
              value={pageData.text ?? ""}
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
            className={`secondary-btn ${isScanning ? "scanning" : ""}`}
            onClick={startInspector}
          >
            <FaCrosshairs size={14} />
            Live Inspect
          </button>

          <button
            className={`primary-btn ${isScanning ? "scanning" : ""}`}
            onClick={scanPage}
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
import React, { useState } from "react";
import {
  Palette,
  Monitor,
  ScanSearch,
  WandSparkles,
  FileJson,
  Bell,
  Shield,
  Moon,
  Sun,
  Laptop,
  Info,
  ChevronRight,
  GitBranch,
} from "lucide-react";

import "./Settings.css";

const Toggle = ({ value, onChange }) => (
  <button
    className={`toggle ${value ? "active" : ""}`}
    onClick={() => onChange(!value)}
  >
    <span className="toggle-thumb" />
  </button>
);

const Settings = () => {
  const [theme, setTheme] = useState("dark");
  const [colorFormat, setColorFormat] = useState("HEX");
  const [autoScan, setAutoScan] = useState(true);
  const [animations, setAnimations] = useState(true);
  const [notifications, setNotifications] = useState(true);
  const Toggle = ({ value, onChange }) => (
    <button
      className={`toggle ${value ? "active" : ""}`}
      onClick={() => onChange(!value)}
    >
      <span className="toggle-thumb" />
    </button>
  );

  return (
    <div className="settings">
      <div className="settings-header">
        <div>
          <h2>Settings</h2>
          <p>Customize your ChromePeek experience.</p>
        </div>
      </div>

      <div className="settings-section">
        <div className="section-title">
          <Monitor size={16} />
          <span>Appearance</span>
        </div>

        <div className="setting-card">
          <div className="setting-info">
            <div className="setting-title">
              <Moon size={16} />
              <span>Theme</span>
            </div>

            <p>Choose the appearance of ChromePeek.</p>
          </div>

          <div className="theme-selector">
            <button
              className={theme === "dark" ? "active" : ""}
              onClick={() => setTheme("dark")}
            >
              <Moon size={15} />
              Dark
            </button>

            <button
              className={theme === "light" ? "active" : ""}
              onClick={() => setTheme("light")}
            >
              <Sun size={15} />
              Light
            </button>

            <button
              className={theme === "system" ? "active" : ""}
              onClick={() => setTheme("system")}
            >
              <Laptop size={15} />
              System
            </button>
          </div>
        </div>
      </div>

      <div className="settings-section">
        <div className="section-title">
          <Palette size={16} />
          <span>Color Format</span>
        </div>

        <div className="setting-card">
          <div className="setting-info">
            <div className="setting-title">
              <Palette size={16} />
              <span>Default Color Format</span>
            </div>

            <p>Preferred color format throughout the extension.</p>
          </div>

          <select value={colorFormat} onChange={(e) => setColorFormat(e.target.value)}>
            <option>HEX</option>
            <option>RGB</option>
            <option>HSL</option>
          </select>
        </div>
      </div>

      <div className="settings-section">
        <div className="section-title">
          <WandSparkles size={16} />
          <span>Preferences</span>
        </div>

        <div className="setting-card">
          <div className="setting-info">
            <div className="setting-title">
              <ScanSearch size={16} />
              <span>Auto Scan</span>
            </div>

            <p>Automatically scan the webpage after opening ChromePeek.</p>
          </div>

          <Toggle value={autoScan} onChange={setAutoScan} />
        </div>

        <div className="setting-card">
          <div className="setting-info">
            <div className="setting-title">
              <WandSparkles size={16} />
              <span>Animations</span>
            </div>

            <p>Enable transitions and interface animations.</p>
          </div>

          <Toggle value={animations} onChange={setAnimations} />
        </div>

        <div className="setting-card">
          <div className="setting-info">
            <div className="setting-title">
              <Bell size={16} />
              <span>Notifications</span>
            </div>

            <p>Show copy and export success notifications.</p>
          </div>

          <Toggle value={notifications} onChange={setNotifications} />
        </div>
      </div>

      <div className="settings-section">
        <div className="section-title">
          <FileJson size={16} />
          <span>Export</span>
        </div>

        <div className="setting-card clickable">
          <div className="setting-info">
            <div className="setting-title">
              <FileJson size={16} />
              <span>Default Export Format</span>
            </div>

            <p>JSON report</p>
          </div>

          <ChevronRight size={18} />
        </div>
      </div>

      <div className="settings-section">
        <div className="section-title">
          <Info size={16} />
          <span>About</span>
        </div>

        <div className="about-card">
          <div className="logo-box">
            <Palette size={28} />
          </div>

          <div>
            <h3>ChromaPeek</h3>
            <span className="mono">Version 1.0.0</span>
            <p>A premium design inspection toolkit for modern web developers.</p>
          </div>
        </div>

        <div className="setting-card clickable">
          <div className="setting-title">
            <GitBranch size={16} />
            <span>GitHub Repository</span>
          </div>

          <ChevronRight size={18} />
        </div>

        <div className="setting-card clickable">
          <div className="setting-title">
            <Shield size={16} />
            <span>Privacy Policy</span>
          </div>

          <ChevronRight size={18} />
        </div>
      </div>
    </div>
  );
};

export default Settings;
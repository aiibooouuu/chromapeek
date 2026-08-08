import React from "react";
import {
  Info,
  ChevronRight,
  GitBranch,
  FileJson,
  Palette,
} from "lucide-react";

import "./Settings.css";

const REPO_URL = "https://github.com/aiibooouuu/chromapeek";

const Settings = () => {
  return (
    <div className="settings">
      <div className="settings-header">
        <div>
          <h2>Settings</h2>
          <p>About ChromaPeek and how it works.</p>
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
            <span className="mono">by aiibooouuu</span>
            <p>
              A Chrome extension for inspecting and analyzing colors, fonts,
              and images on any webpage.
            </p>
          </div>
        </div>

        <a
          className="setting-card clickable"
          href={REPO_URL}
          target="_blank"
          rel="noreferrer"
        >
          <div className="setting-title">
            <GitBranch size={16} />
            <span>GitHub Repository</span>

          </div>

          <ChevronRight size={18} />
          <p className="githubreponame">repo : {REPO_URL}</p>
        </a>
      </div>

      <div className="settings-section">
        <div className="section-title">
          <FileJson size={16} />
          <span>Export</span>
        </div>

        <div className="setting-card">
          <div className="setting-info">
            <div className="setting-title">
              <FileJson size={16} />
              <span>Export Format</span>
            </div>

            <p>
              Colors, fonts, and images each export as a JSON file from their
              respective tab.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Settings;
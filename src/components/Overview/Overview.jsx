import React from "react";
import { Globe, Palette, Type, Image, FileDown } from "lucide-react";

import "./Overview.css";

const getHostname = (value) => {
  if (!value) return "No page scanned";

  try {
    return new URL(value).hostname.replace(/^www\./i, "");
  } catch {
    return value.replace(/^www\./i, "");
  }
};

const Overview = ({ pageData = null }) => {
  const hasData = Boolean(pageData);

  const {
    title = "",
    url = "",
    colors = [],
    fonts = [],
    images = [],
    text = "",
  } = pageData || {};

  const displayTitle = title.trim() || getHostname(url);
  const displayUrl = url || "No URL captured";
  const textBlocks = text ? text.split(/\n\s*\n/).filter(Boolean).length : 0;

  const cards = [
    { icon: Palette, label: "Colors", value: hasData ? colors.length : "—", accent: "teal" },
    { icon: Type, label: "Fonts", value: hasData ? fonts.length : "—", accent: "gold" },
    { icon: Image, label: "Images", value: hasData ? images.length : "—", accent: "teal" },
    { icon: Type, label: "Text", value: hasData ? textBlocks : "—", accent: "gold" },
  ];

  return (
    <div className="overview">
      {/* <div className="overview-header">
        <div>
          <h2>Overview</h2>
          <p>Quick summary of the current webpage.</p>
        </div>

        <button className="secondary-btn" disabled={!hasData}>
          <FileDown size={16} />
          Export
        </button>
      </div> */}

      {!hasData ? (
        <div className="overview-empty">
          <Globe size={42} />
          <h3>Scan to get started</h3>
          <p>
            Run a scan to populate colors, fonts, images, and extracted text for
            the current page.
          </p>
        </div>
      ) : (
        <>
          <div className="website-card">
            <div className="website-icon">
              <Globe size={22} />
            </div>

            <div className="website-info">
              <h3>{displayTitle}</h3>
              <span className="mono">{displayUrl}</span>
            </div>
          </div>

          <div className="overview-grid">
            {cards.map(({ icon: Icon, label, value, accent }) => (
              <div key={label} className={`overview-card ${accent}`}>
                <div className="card-top">
                  <Icon size={18} />
                  <span>{label}</span>
                </div>
                <h3>{value}</h3>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
};

export default Overview;
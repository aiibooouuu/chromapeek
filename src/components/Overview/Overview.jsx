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

const Overview = ({ pageData = {} }) => {
  const {
    title = "",
    url = "",
    colors = [],
    fonts = [],
    images = [],
    text = "",
  } = pageData;

  const displayTitle = title.trim() || getHostname(url);
  const displayUrl = url || "No URL captured";
  const textBlocks = text ? text.split(/\n\s*\n/).filter(Boolean).length : 0;

  const cards = [
    { icon: Palette, label: "Colors", value: colors.length, accent: "teal" },
    { icon: Type, label: "Fonts", value: fonts.length, accent: "gold" },
    { icon: Image, label: "Images", value: images.length, accent: "teal" },
    { icon: Type, label: "Text", value: textBlocks, accent: "gold" },
  ];

  return (
    <div className="overview">
      <div className="overview-header">
        <div>
          <h2>Overview</h2>
          <p>Quick summary of the current webpage.</p>
        </div>

        <button className="secondary-btn">
          <FileDown size={16} />
          Export
        </button>
      </div>

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
    </div>
  );
};

export default Overview;
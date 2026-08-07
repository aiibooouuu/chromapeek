import React from "react";
import {
  Globe,
  Palette,
  Type,
  Image,
  MousePointerClick,
  Link,
  ShieldCheck,
  TriangleAlert,
  CircleCheck,
  Sparkles,
  FileDown,
} from "lucide-react";

import "./Overview.css";

const getHostname = (value) => {
  if (!value) return "";
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
    buttons = [],
    links = [],
    accessibility = {},
    css = {},
  } = pageData;

  const displayTitle = title.trim() || getHostname(url) || "Current Page";
  const displayUrl = url || "No URL captured";
  const primaryFont = fonts[0]?.family || fonts[0] || "Unknown";
  const dominantColor =
    colors[0] || css?.body?.backgroundColor || "#4FD8C4";

  const cards = [
    { icon: Palette, label: "Colors", value: colors.length, accent: "teal" },
    { icon: Type, label: "Fonts", value: fonts.length, accent: "gold" },
    { icon: Image, label: "Images", value: images.length, accent: "teal" },
    {
      icon: MousePointerClick,
      label: "Buttons",
      value: buttons.length,
      accent: "gold",
    },
    { icon: Link, label: "Links", value: links.length, accent: "teal" },
  ];

  return (
    <div className="overview">
      <div className="overview-header">
        <div>
          <h2>Overview</h2>
          <p>Complete summary of the current webpage.</p>
        </div>

        <button className="secondary-btn">
          <FileDown size={16} />
          Export Report
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

      <div className="overview-section">
        <div className="section-title">
          <Sparkles size={16} />
          <span>Brand Identity</span>
        </div>

        <div className="identity-card">
          <div className="color-preview" style={{ background: dominantColor }} />
          <div>
            <h4>Dominant Color</h4>
            <span className="mono">{dominantColor}</span>
          </div>
        </div>

        <div className="identity-card">
          <Type size={18} />
          <div>
            <h4>Primary Font</h4>
            <span className="mono">{primaryFont}</span>
          </div>
        </div>
      </div>

      <div className="overview-section">
        <div className="section-title">
          <ShieldCheck size={16} />
          <span>Accessibility</span>
        </div>

        <div className="audit-list">
          <div className="audit-item success">
            <CircleCheck size={16} />
            <span>Heading Structure</span>
            <strong>{accessibility.headingCount > 0 ? "Good" : "Needs Review"}</strong>
          </div>

          <div className="audit-item warning">
            <TriangleAlert size={16} />
            <span>Alt Text</span>
            <strong>
              {accessibility.missingAltImages > 0 ? "Needs Review" : "Good"}
            </strong>
          </div>

          <div className="audit-item success">
            <CircleCheck size={16} />
            <span>Main Landmark</span>
            <strong>{accessibility.hasMainLandmark ? "Good" : "Needs Review"}</strong>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Overview;
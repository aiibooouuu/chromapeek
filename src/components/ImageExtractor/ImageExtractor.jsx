import React, { useMemo, useState } from "react";
import {
  Image,
  Grid2X2,
  List,
  Download,
  Copy,
  CheckCheck,
  ExternalLink,
  FileImage,
  Filter,
  Sparkles,
} from "lucide-react";

import "./ImageExtractor.css";

const ImageExtractor = ({ images = [], onDownload }) => {
  const [selectedImages, setSelectedImages] = useState(new Set());
  const [viewMode, setViewMode] = useState("grid");
  const [sortBy, setSortBy] = useState("size");
  const [copiedItem, setCopiedItem] = useState(null);

  const getImageType = (src) =>
    src?.split(".").pop()?.split("?")[0]?.toUpperCase() || "UNKNOWN";

  const getImageSize = (image) => {
    if (image.width && image.height) {
      return `${image.width} × ${image.height}`;
    }

    return "Unknown";
  };

  const toggleSelection = (index) => {
    const next = new Set(selectedImages);

    if (next.has(index)) {
      next.delete(index);
    } else {
      next.add(index);
    }

    setSelectedImages(next);
  };

  const selectAll = () => {
    if (selectedImages.size === images.length) {
      setSelectedImages(new Set());
    } else {
      setSelectedImages(new Set(images.map((_, index) => index)));
    }
  };

  const downloadSelected = () => {
    selectedImages.forEach((index) => {
      if (onDownload) {
        onDownload(images[index].src);
      }
    });
  };

  const copyURL = async (src) => {
    await navigator.clipboard.writeText(src);
    setCopiedItem(src);

    setTimeout(() => {
      setCopiedItem(null);
    }, 1200);
  };

  const exportImages = () => {
    const data = images.map((image) => ({
      src: image.src,
      alt: image.alt,
      width: image.width,
      height: image.height,
      type: getImageType(image.src),
    }));

    const blob = new Blob([JSON.stringify(data, null, 2)], {
      type: "application/json",
    });

    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");

    link.href = url;
    link.download = `chromapeek-images-${Date.now()}.json`;
    link.click();

    URL.revokeObjectURL(url);
  };

  const sortedImages = useMemo(() => {
    return [...images].sort((a, b) => {
      switch (sortBy) {
        case "size":
          return (b.width || 0) * (b.height || 0) - (a.width || 0) * (a.height || 0);

        case "name":
          return (a.alt || "").localeCompare(b.alt || "");

        case "type":
          return getImageType(a.src).localeCompare(getImageType(b.src));

        default:
          return 0;
      }
    });
  }, [images, sortBy]);

  if (!images.length) {
    return (
      <div className="image-extractor">
        <div className="image-header">
          <div>
            <h2>Assets</h2>
            <p>Images detected from the current webpage.</p>
          </div>
        </div>

        <div className="empty-images">
          <Image size={46} />
          <h3>No Images Found</h3>
          <p>Scan a page containing images to build your asset gallery.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="image-extractor">
      <div className="image-header">
        <div>
          <h2>Assets</h2>
          <p>{images.length} images detected</p>
        </div>

        <button className="secondary-btn" onClick={exportImages}>
          <Download size={16} />
          Export
        </button>
      </div>

      <div className="gallery-toolbar">
        <div className="gallery-stats">
          <span className="stat-chip">
            <Image size={14} />
            {images.length}
          </span>

          <span className="stat-chip">
            <Sparkles size={14} />
            {selectedImages.size} Selected
          </span>
        </div>

        <div className="toolbar-actions">
          <select value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
            <option value="size">Largest</option>
            <option value="name">Name</option>
            <option value="type">Type</option>
          </select>

          <button
            className={`icon-button ${viewMode === "grid" ? "active" : ""}`}
            onClick={() => setViewMode("grid")}
          >
            <Grid2X2 size={16} />
          </button>

          <button
            className={`icon-button ${viewMode === "list" ? "active" : ""}`}
            onClick={() => setViewMode("list")}
          >
            <List size={16} />
          </button>
        </div>
      </div>

      {selectedImages.size > 0 && (
        <div className="bulk-panel">
          <div className="bulk-header">
            <Filter size={16} />
            <span>Bulk Actions</span>
          </div>

          <div className="bulk-actions">
            <button className="secondary-btn" onClick={selectAll}>
              {selectedImages.size === images.length ? "Clear Selection" : "Select All"}
            </button>

            <button className="secondary-btn" onClick={downloadSelected}>
              <Download size={16} />
              Download Selected
            </button>
          </div>
        </div>
      )}

      <div className={`images-gallery ${viewMode}`}>
        {sortedImages.map((image, index) => {
          const isSelected = selectedImages.has(index);

          return (
            <div key={index} className={`image-card ${isSelected ? "selected" : ""}`}>
              <div className="image-preview">
                <img src={image.src} alt={image.alt || "Extracted image"} />

                <div className="image-overlay">
                  <button
                    className={`icon-button ${isSelected ? "active" : ""}`}
                    onClick={() => toggleSelection(index)}
                  >
                    <CheckCheck size={16} />
                  </button>

                  <button className="icon-button" onClick={() => copyURL(image.src)}>
                    {copiedItem === image.src ? <CheckCheck size={16} /> : <Copy size={16} />}
                  </button>

                  <button className="icon-button" onClick={() => onDownload?.(image.src)}>
                    <Download size={16} />
                  </button>

                  <a
                    className="icon-button"
                    href={image.src}
                    target="_blank"
                    rel="noreferrer"
                  >
                    <ExternalLink size={16} />
                  </a>
                </div>
              </div>

              <div className="image-content">
                <h4>{image.alt || "Untitled image"}</h4>

                <div className="image-meta">
                  <span className="meta-chip type">{getImageType(image.src)}</span>
                  <span className="meta-chip">{getImageSize(image)}</span>
                </div>

                <div className="image-url mono">{image.src}</div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default ImageExtractor;
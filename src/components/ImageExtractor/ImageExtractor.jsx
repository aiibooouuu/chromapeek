import React, { useState } from 'react';
import './ImageExtractor.css';

const ImageExtractor = ({ images = [], onDownload }) => {
  const [selectedImages, setSelectedImages] = useState(new Set());
  const [viewMode, setViewMode] = useState('grid'); // 'grid' or 'list'
  const [sortBy, setSortBy] = useState('size'); // 'size', 'name', 'type'

  const toggleImageSelection = (index) => {
    const newSelected = new Set(selectedImages);
    if (newSelected.has(index)) {
      newSelected.delete(index);
    } else {
      newSelected.add(index);
    }
    setSelectedImages(newSelected);
  };

  const selectAllImages = () => {
    if (selectedImages.size === images.length) {
      setSelectedImages(new Set());
    } else {
      setSelectedImages(new Set(images.map((_, index) => index)));
    }
  };

  const downloadSelected = () => {
    selectedImages.forEach(index => {
      const image = images[index];
      if (onDownload) {
        onDownload(image.src);
      }
    });
  };

  const getImageSize = (image) => {
    return image.width && image.height ? `${image.width}×${image.height}` : 'Unknown';
  };

  const getFileSize = (src) => {
    // This would need to be implemented in the content script
    // For now, return a placeholder
    return 'Unknown';
  };

  const getImageType = (src) => {
    const extension = src.split('.').pop()?.toLowerCase();
    return extension || 'unknown';
  };

  const sortedImages = [...images].sort((a, b) => {
    switch (sortBy) {
      case 'size':
        return (b.width * b.height) - (a.width * a.height);
      case 'name':
        return a.alt.localeCompare(b.alt);
      case 'type':
        return getImageType(a.src).localeCompare(getImageType(b.src));
      default:
        return 0;
    }
  });

  const copyImageInfo = (image) => {
    const info = `Image: ${image.alt || 'Untitled'}
URL: ${image.src}
Size: ${getImageSize(image)}
Type: ${getImageType(image.src)}`;
    
    navigator.clipboard.writeText(info);
  };

  const exportImageList = () => {
    const imageData = images.map(image => ({
      src: image.src,
      alt: image.alt,
      width: image.width,
      height: image.height,
      type: getImageType(image.src),
      size: getFileSize(image.src)
    }));

    const dataStr = JSON.stringify(imageData, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
    
    const exportFileDefaultName = `chromapeek-images-${Date.now()}.json`;
    
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
  };

  if (images.length === 0) {
    return (
      <div className="image-extractor">
        <div className="component-title">
          🖼️ Image Extractor
        </div>
        <div className="empty-state">
          <div className="empty-state-icon">🖼️</div>
          <h3>No images found</h3>
          <p>This page doesn't contain any images, or they haven't been detected yet.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="image-extractor">
      <div className="component-title">
        🖼️ Image Extractor
        <div className="header-controls">
          <select 
            value={sortBy} 
            onChange={(e) => setSortBy(e.target.value)}
            className="sort-select"
          >
            <option value="size">Sort by Size</option>
            <option value="name">Sort by Name</option>
            <option value="type">Sort by Type</option>
          </select>
          <button 
            className={`view-toggle ${viewMode === 'grid' ? 'active' : ''}`}
            onClick={() => setViewMode('grid')}
            title="Grid view"
          >
            ⊞
          </button>
          <button 
            className={`view-toggle ${viewMode === 'list' ? 'active' : ''}`}
            onClick={() => setViewMode('list')}
            title="List view"
          >
            ☰
          </button>
        </div>
      </div>

      <div className="extractor-stats">
        <span className="stat">
          {images.length} image{images.length !== 1 ? 's' : ''}
        </span>
        <span className="stat">
          {selectedImages.size} selected
        </span>
      </div>

      <div className="extractor-actions">
        <button 
          className="btn outline small"
          onClick={selectAllImages}
        >
          {selectedImages.size === images.length ? 'Deselect All' : 'Select All'}
        </button>
        <button 
          className="btn small"
          onClick={downloadSelected}
          disabled={selectedImages.size === 0}
        >
          💾 Download Selected ({selectedImages.size})
        </button>
        <button 
          className="btn secondary small"
          onClick={exportImageList}
        >
          📋 Export List
        </button>
      </div>

      <div className={`images-container ${viewMode}`}>
        {sortedImages.map((image, index) => (
          <div 
            key={index} 
            className={`image-item ${selectedImages.has(index) ? 'selected' : ''}`}
          >
            <div className="image-preview">
              <img 
                src={image.src} 
                alt={image.alt || `Image ${index + 1}`}
                loading="lazy"
                onError={(e) => {
                  e.target.style.display = 'none';
                  e.target.nextSibling.style.display = 'flex';
                }}
              />
              <div className="image-placeholder" style={{ display: 'none' }}>
                <span>🖼️</span>
                <span>Failed to load</span>
              </div>
              <div className="image-overlay">
                <button 
                  className="select-btn"
                  onClick={() => toggleImageSelection(index)}
                >
                  {selectedImages.has(index) ? '✓' : '+'}
                </button>
                <button 
                  className="download-btn"
                  onClick={() => onDownload && onDownload(image.src)}
                  title="Download image"
                >
                  💾
                </button>
                <button 
                  className="info-btn"
                  onClick={() => copyImageInfo(image)}
                  title="Copy image info"
                >
                  ℹ️
                </button>
              </div>
            </div>
            
            <div className="image-details">
              <div className="image-title">
                {image.alt || `Image ${index + 1}`}
              </div>
              <div className="image-meta">
                <span className="meta-item">
                  📐 {getImageSize(image)}
                </span>
                <span className="meta-item">
                  🏷️ {getImageType(image.src).toUpperCase()}
                </span>
              </div>
              {viewMode === 'list' && (
                <div className="image-url">
                  <a 
                    href={image.src} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    title={image.src}
                  >
                    {image.src.length > 50 ? image.src.substring(0, 50) + '...' : image.src}
                  </a>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      <div className="bulk-actions">
        <div className="action-group">
          <h5>Bulk Actions</h5>
          <div className="bulk-buttons">
            <button 
              className="btn outline small"
              onClick={() => {
                const jpgImages = images.filter(img => getImageType(img.src) === 'jpg' || getImageType(img.src) === 'jpeg');
                setSelectedImages(new Set(jpgImages.map((_, idx) => images.indexOf(jpgImages[idx]))));
              }}
            >
              Select JPG
            </button>
            <button 
              className="btn outline small"
              onClick={() => {
                const pngImages = images.filter(img => getImageType(img.src) === 'png');
                setSelectedImages(new Set(pngImages.map((_, idx) => images.indexOf(pngImages[idx]))));
              }}
            >
              Select PNG
            </button>
            <button 
              className="btn outline small"
              onClick={() => {
                const largeImages = images.filter(img => img.width > 500 || img.height > 500);
                setSelectedImages(new Set(largeImages.map((_, idx) => images.indexOf(largeImages[idx]))));
              }}
            >
              Select Large
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ImageExtractor;
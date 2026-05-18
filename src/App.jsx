import { useState, useEffect } from 'react'
import './App.css'

function App() {
  const [activeTab, setActiveTab] = useState('colors')
  const [extractedData, setExtractedData] = useState({
    colors: [],
    fonts: [],
    images: [],
    text: ''
  })
  const [isScanning, setIsScanning] = useState(false)

  useEffect(() => {
    // Load any saved data when component mounts
    loadExtractedData()
  }, [])

  const loadExtractedData = async () => {
    try {
      const result = await chrome.storage.local.get(['extractedData'])
      if (result.extractedData) {
        setExtractedData(result.extractedData)
      }
    } catch (error) {
      console.error('Error loading data:', error)
    }
  }

  const scanCurrentPage = async () => {
    setIsScanning(true)
    try {
      const [tab] = await chrome.tabs.query({ active: true, currentWindow: true })
      
      // Inject content script and extract data
      await chrome.scripting.executeScript({
        target: { tabId: tab.id },
        files: ['content.js']
      })

      // Send message to content script to start extraction
      const response = await chrome.tabs.sendMessage(tab.id, { action: 'extractData' })
      
      if (response) {
        setExtractedData(response)
        await chrome.storage.local.set({ extractedData: response })
      }
    } catch (error) {
      console.error('Error scanning page:', error)
    } finally {
      setIsScanning(false)
    }
  }

  const copyToClipboard = async (text) => {
    try {
      await navigator.clipboard.writeText(text)
      // Could add a toast notification here
    } catch (error) {
      console.error('Failed to copy:', error)
    }
  }

  const downloadAsJSON = () => {
    const dataStr = JSON.stringify(extractedData, null, 2)
    const blob = new Blob([dataStr], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'chromapeek-data.json'
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div className="chromapeek-app">
      <header className="app-header">
        <h1>ChromaPeek</h1>
        <button 
          className={`scan-btn ${isScanning ? 'scanning' : ''}`}
          onClick={scanCurrentPage}
          disabled={isScanning}
        >
          {isScanning ? 'Scanning...' : 'Scan Page'}
        </button>
      </header>

      <nav className="tab-nav">
        <button 
          className={`tab-btn ${activeTab === 'colors' ? 'active' : ''}`}
          onClick={() => setActiveTab('colors')}
        >
          Colors
        </button>
        <button 
          className={`tab-btn ${activeTab === 'fonts' ? 'active' : ''}`}
          onClick={() => setActiveTab('fonts')}
        >
          Fonts
        </button>
        <button 
          className={`tab-btn ${activeTab === 'images' ? 'active' : ''}`}
          onClick={() => setActiveTab('images')}
        >
          Images
        </button>
        <button 
          className={`tab-btn ${activeTab === 'text' ? 'active' : ''}`}
          onClick={() => setActiveTab('text')}
        >
          Text
        </button>
      </nav>

      <main className="app-content">
        {activeTab === 'colors' && (
          <div className="colors-panel">
            <div className="panel-header">
              <h2>Color Palette</h2>
              <button className="export-btn" onClick={downloadAsJSON}>
                Export
              </button>
            </div>
            <div className="color-grid">
              {extractedData.colors.length > 0 ? (
                extractedData.colors.map((color, index) => (
                  <div key={index} className="color-item">
                    <div 
                      className="color-swatch"
                      style={{ backgroundColor: color.hex }}
                      onClick={() => copyToClipboard(color.hex)}
                    ></div>
                    <div className="color-info">
                      <span className="color-hex">{color.hex}</span>
                      <span className="color-rgb">rgb({color.rgb.join(', ')})</span>
                    </div>
                  </div>
                ))
              ) : (
                <p className="empty-state">No colors extracted. Click "Scan Page" to start.</p>
              )}
            </div>
          </div>
        )}

        {activeTab === 'fonts' && (
          <div className="fonts-panel">
            <div className="panel-header">
              <h2>Fonts</h2>
            </div>
            <div className="fonts-list">
              {extractedData.fonts.length > 0 ? (
                extractedData.fonts.map((font, index) => (
                  <div key={index} className="font-item">
                    <div className="font-family" style={{ fontFamily: font.family }}>
                      {font.family}
                    </div>
                    <div className="font-details">
                      <span>Size: {font.size}</span>
                      <span>Weight: {font.weight}</span>
                      <span>Style: {font.style}</span>
                    </div>
                  </div>
                ))
              ) : (
                <p className="empty-state">No fonts detected. Hover over elements to inspect fonts.</p>
              )}
            </div>
          </div>
        )}

        {activeTab === 'images' && (
          <div className="images-panel">
            <div className="panel-header">
              <h2>Images</h2>
            </div>
            <div className="images-grid">
              {extractedData.images.length > 0 ? (
                extractedData.images.map((image, index) => (
                  <div key={index} className="image-item">
                    <img src={image.src} alt={image.alt || 'Extracted image'} />
                    <div className="image-actions">
                      <button onClick={() => window.open(image.src, '_blank')}>
                        View
                      </button>
                      <button onClick={() => copyToClipboard(image.src)}>
                        Copy URL
                      </button>
                    </div>
                  </div>
                ))
              ) : (
                <p className="empty-state">No images found. Scan the page to extract images.</p>
              )}
            </div>
          </div>
        )}

        {activeTab === 'text' && (
          <div className="text-panel">
            <div className="panel-header">
              <h2>Extracted Text</h2>
              <button 
                className="copy-btn"
                onClick={() => copyToClipboard(extractedData.text)}
              >
                Copy All
              </button>
            </div>
            <div className="text-content">
              {extractedData.text ? (
                <textarea 
                  value={extractedData.text} 
                  readOnly 
                  className="text-area"
                />
              ) : (
                <p className="empty-state">No text extracted. Select elements to extract text.</p>
              )}
            </div>
          </div>
        )}
      </main>
    </div>
  )
}

export default App
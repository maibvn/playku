import { useCallback, useEffect, useRef, useState } from "react";
import StickyWaveform from "./StickyWaveform"; // <-- Add this import

// Demo products array
const DEMO_PRODUCTS = [
  {
    audioUrl:
      "https://dl.dropboxusercontent.com/s/cvl7pvjvlzt0i7bhko3iu/DMPAuth-Cajon-Cajon-9.mp3?rlkey=vszq7fflb7tomuqf3xz7ngt00&st=euobgg5j",
    title: "Dirty Kick - Sample Pack",
    image:
      "https://maibuivn.myshopify.com/cdn/shop/files/dirtykick_new.webp?v=1739400793",
  },
  {
    audioUrl:
      "https://cdn.shopify.com/s/files/1/0259/9026/6977/files/Retro_Vibes_Bundle.mp3?v=1721995574",
    title: "Rise - Beta - Sample Pack",
    image:
      "https://maibuivn.myshopify.com/cdn/shop/files/Risebeta_new.webp?v=1739400793&width=533",
  },
];

function PlayerPreview({ settings, elements }) {
  const [currentIdx, setCurrentIdx] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);

  const autoLoopRef = useRef(settings.autoLoop);
  useEffect(() => {
    autoLoopRef.current = settings.autoLoop;
  }, [settings.autoLoop]);

  const [prevIcon, nextIcon] = settings.nextPrevIcons.split(",");
  const [playIcon, pauseIcon] = settings.playPauseIcons.split(",");
  const visibleElements = elements.filter((el) => el.visible);

  // Handle auto-play next
  const handleEnded = useCallback(() => {
    console.log(2, autoLoopRef.current);

    if (currentIdx < DEMO_PRODUCTS.length - 1) {
      setCurrentIdx(currentIdx + 1);
      setIsPlaying(true);
    } else if (autoLoopRef.current) {
      setCurrentIdx(0);
      setIsPlaying(true);
    } else {
      setIsPlaying(false);
    }
  }, [currentIdx]);

  // Play selected product
  const handlePlayProduct = (idx) => {
    setCurrentIdx(idx);
    setIsPlaying(false);
  };

  // Play/pause button handler
  const handlePlayPause = () => {
    setIsPlaying((prev) => !prev);
  };

  const currentProduct = DEMO_PRODUCTS[currentIdx];

  return (
    <div>
      {/* Product images grid */}
      <div
        style={{
          display: "flex",
          gap: 48,
          marginBottom: 32,
        }}
      >
        {DEMO_PRODUCTS.map((product, idx) => (
          <div key={product.audioUrl} style={{ textAlign: "center" }}>
            <div style={{ position: "relative", width: 120, margin: "0 auto" }}>
              <img
                src={product.image}
                alt={product.title}
                style={{
                  width: 120,
                  height: 120,
                  objectFit: "cover",
                  borderRadius: 8,
                  boxShadow: "0 2px 8px #0006",
                  opacity: idx === currentIdx ? 1 : 0.7,
                  filter: idx === currentIdx ? "none" : "grayscale(1)",
                  cursor: "pointer",
                  transition: "all 0.2s",
                }}
                onClick={() => handlePlayProduct(idx)}
              />
              <button
                style={{
                  position: "absolute",
                  top: 8,
                  left: 8,
                  background: "rgba(0,0,0,0.5)",
                  color: settings.iconColor,
                  border: "none",
                  borderRadius: "50%",
                  width: 32,
                  height: 32,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  cursor: "pointer",
                  zIndex: 10,
                  fontSize: 20,
                }}
                onClick={() => {
                  if (idx === currentIdx) {
                    setIsPlaying((prev) => !prev); // toggle play/pause for current product
                  } else {
                    handlePlayProduct(idx);
                    setIsPlaying(true); // play new product
                  }
                }}
              >
                {idx === currentIdx && isPlaying
                  ? (pauseIcon || "⏸️")
                  : (playIcon || "▶️")}
              </button>
            </div>
            <div style={{ marginTop: 8, fontWeight: "bold" }}>
              {product.title}
            </div>
          </div>
        ))}
      </div>

      {/* Sticky player (one only) */}
      <div
        style={{
          margin: "32px 0 0 0",
          background: settings.playerBgColor,
          color: settings.iconColor,
          minHeight: settings.playerHeight,
          width: "100%",
          display: "flex",
          alignItems: "center",
          padding: "16px 24px",
          gap: 16,
        }}
      >
        {visibleElements.map((el) => {
          switch (el.key) {
            case "image":
              return settings.showImage ? (
                <img
                  key="preview-img"
                  src={currentProduct.image}
                  alt={currentProduct.title}
                  style={{
                    width: 48,
                    height: 48,
                    objectFit: "cover",
                    borderRadius: 8,
                    boxShadow: "0 2px 8px #0006",
                  }}
                />
              ) : null;
            case "title":
              return settings.showTitle ? (
                <span
                  key="preview-title"
                  style={{
                    fontWeight: "bold",
                    marginRight: 16,
                    minWidth: 80,
                    maxWidth: 160,
                    whiteSpace: "nowrap",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                  }}
                >
                  {currentProduct.title}
                </span>
              ) : null;
            case "controls":
              return (
                <span key="preview-controls" style={{ display: "flex", gap: 8 }}>
                  <button
                    style={{
                      background: "none",
                      border: "none",
                      color: settings.iconColor,
                      fontSize: 20,
                      cursor: "pointer",
                    }}
                    onClick={() =>
                      setCurrentIdx(
                        (currentIdx - 1 + DEMO_PRODUCTS.length) %
                          DEMO_PRODUCTS.length
                      )
                    }
                  >
                    {prevIcon || "⏮️"}
                  </button>
                  <button
                    style={{
                      background: "none",
                      border: "none",
                      color: settings.iconColor,
                      fontSize: 24,
                      cursor: "pointer",
                    }}
                    onClick={handlePlayPause}
                  >
                    {isPlaying
                      ? (pauseIcon || "⏸️")
                      : (playIcon || "▶️")}
                  </button>
                  <button
                    style={{
                      background: "none",
                      border: "none",
                      color: settings.iconColor,
                      fontSize: 20,
                      cursor: "pointer",
                    }}
                    onClick={() =>
                      setCurrentIdx((currentIdx + 1) % DEMO_PRODUCTS.length)
                    }
                  >
                    {nextIcon || "⏭️"}
                  </button>
                </span>
              );
            case "close":
              return (
                <button
                  key="preview-close"
                  style={{
                    marginLeft: 16,
                    fontSize: 20,
                    background: "none",
                    border: "none",
                    color: settings.iconColor,
                    cursor: "pointer",
                  }}
                  title="This will close the player"
                >
                  {settings.closeIcon || "✖"}
                </button>
              );
            default:
              return null;
          }
        })}
        {/* Always render waveform for current product */}
        <StickyWaveform
          audioUrl={currentProduct.audioUrl}
          settings={settings}
          isPlaying={isPlaying}
          onEnded={handleEnded}
        />
      </div>
    </div>
  );
}

export default PlayerPreview;
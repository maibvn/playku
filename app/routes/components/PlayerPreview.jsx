import { useCallback, useEffect, useRef, useState } from "react";
import StickyWaveform from "./StickyWaveform";
import IconParser from "./IconParser";

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

  const [playIconKey, pauseIconKey] = settings.playPauseIcons.split(",");
  const [prevIconKey, nextIconKey] = settings.nextPrevIcons.split(",");
  const closeIconKey = settings.closeIcon;

  const visibleElements = elements.filter((el) => el.visible);

  // Handle auto-play next
  const handleEnded = useCallback(() => {
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
              <span
                style={{
                  position: "absolute",
                  top: 8,
                  left: 8,
                  background: "rgba(0,0,0,0.5)",
                  borderRadius: "50%",
                  width: 32,
                  height: 32,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  cursor: "pointer",
                  zIndex: 10,
                }}
                onClick={() => {
                  if (idx === currentIdx) {
                    setIsPlaying((prev) => !prev);
                  } else {
                    handlePlayProduct(idx);
                    setIsPlaying(true);
                  }
                }}
              >
                {idx === currentIdx && isPlaying
                  ? <IconParser iconKey={pauseIconKey} color={settings.iconColor} size={20} />
                  : <IconParser iconKey={playIconKey} color={settings.iconColor} size={20} />}
              </span>
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
        {/* Left elements (image, title, controls) */}
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
                    flexShrink: 0,
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
                    flexShrink: 0,
                  }}
                >
                  {currentProduct.title}
                </span>
              ) : null;
            case "controls":
              return (
                <span key="preview-controls" style={{ display: "flex", gap: 8, alignItems: "center", flexShrink: 0 }}>
                  <span
                    style={{ cursor: "pointer" }}
                    onClick={() =>
                      setCurrentIdx(
                        (currentIdx - 1 + DEMO_PRODUCTS.length) %
                          DEMO_PRODUCTS.length
                      )
                    }
                  >
                    <IconParser iconKey={prevIconKey} color={settings.iconColor} size={20} />
                  </span>
                  <span
                    style={{ cursor: "pointer" }}
                    onClick={handlePlayPause}
                  >
                    {isPlaying
                      ? <IconParser iconKey={pauseIconKey} color={settings.iconColor} size={32} />
                      : <IconParser iconKey={playIconKey} color={settings.iconColor} size={32} />}
                  </span>
                  <span
                    style={{ cursor: "pointer" }}
                    onClick={() =>
                      setCurrentIdx((currentIdx + 1) % DEMO_PRODUCTS.length)
                    }
                  >
                    <IconParser iconKey={nextIconKey} color={settings.iconColor} size={20} />
                  </span>
                </span>
              );
            default:
              return null;
          }
        })}
        {/* Waveform expands to fill remaining space */}
        <div style={{ flex: 1, minWidth: 0, display: "flex", alignItems: "center" }}>
          <StickyWaveform
            audioUrl={currentProduct.audioUrl}
            settings={settings}
            isPlaying={isPlaying}
            onEnded={handleEnded}
          />
        </div>
        {/* Close button always at the end */}
        <span
          key="preview-close"
          style={{ marginLeft: 16, cursor: "pointer", flexShrink: 0 }}e={{ marginLeft: 16, cursor: "pointer", flexShrink: 0 }}
          title="This will close the player"
        >
         <IconParser iconKey={closeIconKey} color={settings.iconColor} size={20} />
        </span>
      </div>
    </div>
  );
}

export default PlayerPreview;
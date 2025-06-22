import { useEffect, useRef, useState } from "react";

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

function StickyWaveform({ audioUrl, settings, isPlaying, onEnded }) {
  const waveformRef = useRef(null);
  const wavesurfer = useRef(null);

  useEffect(() => {
    let WaveSurfer;
    let ws;

    async function setup() {
      if (wavesurfer.current) {
        wavesurfer.current.destroy();
        wavesurfer.current = null;
      }
      WaveSurfer = (await import("wavesurfer.js")).default;
      ws = WaveSurfer.create({
        container: waveformRef.current,
        waveColor: settings.waveColor,
        progressColor: settings.progressColor,
        height: settings.waveformHeight,
        barWidth: settings.waveformBarWidth,
        responsive: true,
        cursorColor: settings.iconColor,
        interact: true,
      });
      ws.load(audioUrl);

      ws.on("finish", onEnded);

      wavesurfer.current = ws;
    }

    if (waveformRef.current && isPlaying) {
      setup();
    }

    return () => {
      if (wavesurfer.current) {
        wavesurfer.current.destroy();
        wavesurfer.current = null;
      }
    };
  }, [
    audioUrl,
    settings.waveColor,
    settings.progressColor,
    settings.waveformHeight,
    settings.waveformBarWidth,
    settings.iconColor,
    onEnded,
    isPlaying,
  ]);

  // Sync play/pause with parent
  useEffect(() => {
    if (wavesurfer.current) {
      if (isPlaying) {
        wavesurfer.current.play();
      } else {
        wavesurfer.current.pause();
      }
    }
  }, [isPlaying]);

  // Only render the waveform container when playing
  if (!isPlaying) return null;

  return (
    <div
      ref={waveformRef}
      style={{
        flex: 1,
        height: settings.waveformHeight,
        minWidth: 80,
        maxWidth: 300,
        margin: "0 16px",
      }}
    />
  );
}

export function PlayerPreview({ settings, elements }) {
  const [currentIdx, setCurrentIdx] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const audioRef = useRef(null);

  const [prevIcon, nextIcon] = settings.nextPrevIcons.split(",");
  const [playIcon, pauseIcon] = settings.playPauseIcons.split(",");
  const visibleElements = elements.filter((el) => el.visible);

  // Handle auto-play next
  const handleEnded = () => {
    setIsPlaying(false);
    setCurrentIdx((idx) => (idx + 1) % DEMO_PRODUCTS.length);
  };

  // Play selected product
  const handlePlayProduct = (idx) => {
    setCurrentIdx(idx);
    setIsPlaying(false);
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
    }
  };

  // Play/pause button handler
  const handlePlayPause = () => {
    if (!audioRef.current) return;
    if (audioRef.current.paused) {
      audioRef.current.play();
      setIsPlaying(true);
    } else {
      audioRef.current.pause();
      setIsPlaying(false);
    }
  };

  // Sync play/pause state with audio element
  useEffect(() => {
    if (!audioRef.current) return;
    if (isPlaying) {
      audioRef.current.play();
    } else {
      audioRef.current.pause();
    }
  }, [isPlaying, currentIdx]);

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
                  handlePlayProduct(idx);
                  setIsPlaying(true);
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
        {visibleElements.map((el, idx) => {
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
                  <audio
                    ref={audioRef}
                    src={currentProduct.audioUrl}
                    onEnded={handleEnded}
                    style={{ display: "none" }}
                  />
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
            case "waveform":
              // Render waveform inside sticky player, only when playing
              return (
                <StickyWaveform
                  key="sticky-waveform"
                  audioUrl={currentProduct.audioUrl}
                  settings={settings}
                  isPlaying={isPlaying}
                  onEnded={handleEnded}
                />
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
      </div>
    </div>
  );
}
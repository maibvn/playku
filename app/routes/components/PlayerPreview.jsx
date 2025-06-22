import { useEffect, useRef, useState } from "react";

const AUDIO_URL =
  "https://dl.dropboxusercontent.com/s/cvl7pvjvlzt0i7bhko3iu/DMPAuth-Cajon-Cajon-9.mp3?rlkey=vszq7fflb7tomuqf3xz7ngt00&st=euobgg5j";

export function PlayerPreview({ settings, elements }) {
  const waveformRef = useRef(null);
  const wavesurfer = useRef(null);
  const [isPlaying, setIsPlaying] = useState(false);

  // Parse icons
  const [playIcon, pauseIcon] = settings.playPauseIcons.split(",");
  const [prevIcon, nextIcon] = settings.nextPrevIcons.split(",");
  const visibleElements = elements.filter((el) => el.visible);

  // Setup WaveSurfer (always render waveform, never duplicate)
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
      ws.load(AUDIO_URL);

      ws.on("play", () => setIsPlaying(true));
      ws.on("pause", () => setIsPlaying(false));
      ws.on("finish", () => setIsPlaying(false));

      wavesurfer.current = ws;
    }

    if (waveformRef.current) {
      setup();
    }

    return () => {
      if (wavesurfer.current) {
        wavesurfer.current.destroy();
        wavesurfer.current = null;
      }
    };
    // Only rerun when these settings change
  }, [
    settings.waveColor,
    settings.progressColor,
    settings.waveformHeight,
    settings.waveformBarWidth,
    settings.iconColor,
  ]);

  // Controls
  const handlePlayPause = () => {
    if (wavesurfer.current) {
      wavesurfer.current.playPause();
    }
  };

  return (
    <div style={{ marginTop: 32 }}>
      {/* Product image with play icon */}
      <div style={{ position: "relative", width: 120, margin: "0 auto" }}>
        <img
          src="https://maibuivn.myshopify.com/cdn/shop/files/dirtykick_new.webp?v=1739400793"
          alt="Product"
          style={{
            width: 120,
            height: 120,
            objectFit: "cover",
            borderRadius: 8,
            boxShadow: "0 2px 8px #0006",
          }}
        />
        {settings.showPlayIconOnImage && (
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
            onClick={handlePlayPause}
          >
            {isPlaying ? (pauseIcon || "⏸️") : (playIcon || "▶️")}
          </button>
        )}
      </div>

      {/* Sticky player */}
      <div
        style={{
          margin: "32px 0 0 0",
          background: settings.playerBgColor,
          color: settings.iconColor,
          borderRadius: 12,
          boxShadow: "0 -2px 12px #0008",
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
                  src="https://maibuivn.myshopify.com/cdn/shop/files/dirtykick_new.webp?v=1739400793"
                  alt="Product"
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
                  Dirty Kick - Sample Pack
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
                    onClick={() => {
                      if (wavesurfer.current) wavesurfer.current.seekTo(0);
                    }}
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
                    {isPlaying ? (pauseIcon || "⏸️") : (playIcon || "▶️")}
                  </button>
                  <button
                    style={{
                      background: "none",
                      border: "none",
                      color: settings.iconColor,
                      fontSize: 20,
                      cursor: "pointer",
                    }}
                    onClick={() => {
                      if (wavesurfer.current) wavesurfer.current.seekTo(1);
                    }}
                  >
                    {nextIcon || "⏭️"}
                  </button>
                </span>
              );
            case "waveform":
              // Always render waveform
              return (
                <div
                  key="preview-waveform"
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
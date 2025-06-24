import { useCallback, useEffect, useRef, useState } from "react";
import StickyWaveform from "./StickyWaveform";
import IconParser from "../shared/IconParser";
import "../shared/PlayerPreview.css";

function WaveformPreview({ settings, elements, demoProducts }) {

  const [currentIdx, setCurrentIdx] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [playerVisible, setPlayerVisible] = useState(true);

  const autoLoopRef = useRef(settings.autoLoop);
  useEffect(() => {
    autoLoopRef.current = settings.autoLoop;
  }, [settings.autoLoop]);

  const [iconPlayOnProduct, iconPauseOnProduct] = settings.iconOnProduct.split(",");
  const [playIconKey, pauseIconKey] = settings.playPauseIcons.split(",");
  const [prevIconKey, nextIconKey] = settings.nextPrevIcons.split(",");
  const closeIconKey = settings.closeIcon;

  const visibleElements = elements.filter((el) => el.visible);
  // Handle auto-play next
  const handleEnded = useCallback(() => {
    if (currentIdx < demoProducts.length - 1) {
      setCurrentIdx(currentIdx + 1);
      setIsPlaying(true);
    } else if (autoLoopRef.current) {
      setCurrentIdx(0);
      setIsPlaying(true);
    } else {
      setIsPlaying(false);
    }
  }, [currentIdx, demoProducts.length]);

  // Play selected product
  const handlePlayProduct = (idx) => {
    setCurrentIdx(idx);
    setIsPlaying(false);
    setPlayerVisible(true); // Show player with slide up when a song is selected
  };

  // Play/pause button handler
  const handlePlayPause = () => {
    setIsPlaying((prev) => !prev);
    setPlayerVisible(true); // Show player with slide up when play is pressed
  };

  // Show player when play is triggered externally
  useEffect(() => {
    if (isPlaying) setPlayerVisible(true);
  }, [isPlaying]);

  const handleClosePlayer = () => {
    setPlayerVisible(false); // Hide player with slide down
    setIsPlaying(false);
  };

  const currentProduct = demoProducts[currentIdx];

  return (
    <div>      {/* Product images grid */}
      <div className="playku-product-grid">
        {demoProducts.map((product, idx) => (
          <div key={product.audioUrl} className="playku-product-item">
            <div
              className={
                "playku-product-img-wrap" +
                (settings.showPlayIconOnImage ? "" : " playku-img-hover-group")
              }
            >
              <img
                src={product.image}
                alt={product.title}
                className="playku-product-img"
              />
              <span
                className="playku-product-img-icon"
                style={{
                  ...getIconPositionStyle(settings.iconPosition),
                  backgroundColor: settings.iconOnProductBgColor,
                  display: settings.showPlayIconOnImage ||
                    (idx === currentIdx && isPlaying) ? "flex" : "none",
                  opacity: settings.playerBgOpacity,
                  width: settings.iconOnProductSize,
                  height: settings.iconOnProductSize,
                }}
                onClick={() => {
                  if (idx === currentIdx) {
                    setIsPlaying((prev) => !prev);
                    setPlayerVisible(true);
                  } else {
                    handlePlayProduct(idx);
                    setIsPlaying(true);
                  }
                }}
              >
                {idx === currentIdx && isPlaying ? (
                  <IconParser
                    iconKey={iconPauseOnProduct}
                    color={settings.iconOnProductColor}
                    size={settings.iconOnProductSize - 10}
                  />
                ) : (
                  <IconParser
                    iconKey={iconPlayOnProduct}
                    color={settings.iconOnProductColor}
                    size={settings.iconOnProductSize - 10}
                  />
                )}
              </span>
            </div>
            <div className="playku-product-title">{product.title}</div>
          </div>
        ))}
      </div>

      {/* Sticky player (one only) */}
      <div
        className={
          "playku-sticky-player" +
          (playerVisible
            ? " playku-sticky-slide-up"
            : " playku-sticky-slide-down")
        }
        style={{
          background: settings.playerBgColor,
          opacity: settings.playerBgOpacity,
          color: settings.iconColor,
          minHeight: settings.playerHeight,
          height: settings.playerHeight,
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
                  className="playku-sticky-img"
                  style={{
                    height: settings.playerHeight - 16,
                    maxHeight: settings.playerHeight - 16,
                  }}
                />
              ) : null;
            case "title":
              return settings.showTitle ? (
                <span key="preview-title" className="playku-sticky-title">
                  {currentProduct.title}
                </span>
              ) : null;
            case "controls":
              return (
                <span key="preview-controls" className="playku-sticky-controls">                  <span
                    className="playku-sticky-btn"
                    onClick={() =>
                      setCurrentIdx(
                        (currentIdx - 1 + demoProducts.length) %
                          demoProducts.length
                      )
                    }
                  >
                    <IconParser
                      iconKey={prevIconKey}
                      color={settings.iconColor}
                      size={20}
                    />
                  </span>
                  <span
                    className="playku-sticky-btn"
                    onClick={handlePlayPause}
                  >
                    {isPlaying ? (
                      <IconParser
                        iconKey={pauseIconKey}
                        color={settings.iconColor}
                        size={32}
                      />
                    ) : (
                      <IconParser
                        iconKey={playIconKey}
                        color={settings.iconColor}
                        size={32}
                      />
                    )}
                  </span>                  <span
                    className="playku-sticky-btn"
                    onClick={() =>
                      setCurrentIdx((currentIdx + 1) % demoProducts.length)
                    }
                  >
                    <IconParser
                      iconKey={nextIconKey}
                      color={settings.iconColor}
                      size={20}
                    />
                  </span>
                </span>
              );
            default:
              return null;
          }
        })}
        <div className="playku-sticky-waveform">
          <StickyWaveform
            audioUrl={currentProduct.audioUrl}
            settings={settings}
            isPlaying={isPlaying}
            onEnded={handleEnded}
          />
        </div>
        <span
          key="preview-close"
          className="playku-sticky-close"
          title="This will close the player"
          onClick={handleClosePlayer}
        >
          <IconParser
            iconKey={closeIconKey}
            color={settings.iconColor}
            size={20}
          />
        </span>
      </div>
    </div>
  );
}

function getIconPositionStyle(position) {
  switch (position) {
    case "center":
      return {
        top: "50%",
        left: "50%",
        transform: "translate(-50%, -50%)",
        right: "auto",
        bottom: "auto",
      };
    case "top-left":
      return { top: 8, left: 8, right: "auto", bottom: "auto", transform: "none" };
    case "top-right":
      return { top: 8, right: 8, left: "auto", bottom: "auto", transform: "none" };
    case "bottom-left":
      return { bottom: 8, left: 8, top: "auto", right: "auto", transform: "none" };
    case "bottom-right":
      return { bottom: 8, right: 8, top: "auto", left: "auto", transform: "none" };
    default:
      return { top: 8, left: 8, right: "auto", bottom: "auto", transform: "none" };
  }
}

export default WaveformPreview;

import { useState, useCallback, useEffect, useRef } from "react";
import { Card, Text, BlockStack } from "@shopify/polaris";
import ProductGrid from "../shared/ProductGrid";
import SpectrumAnalyzer from "../shared/SpectrumAnalyzer";
import IconParser from "../shared/IconParser";
import "../shared/PlayerPreview.css";

export default function SpectrumPreview({ settings, elements, demoProducts, previewVisible = true }) {
  const [currentIdx, setCurrentIdx] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [playerVisible, setPlayerVisible] = useState(true);
  const visibleElements = elements?.filter(el => el.visible) || [];

  const autoLoopRef = useRef(settings.autoLoop);
  useEffect(() => {
    autoLoopRef.current = settings.autoLoop;
  }, [settings.autoLoop]);

  // Handle product click from grid
  const handleProductClick = (idx) => {
    setCurrentIdx(idx);
    setIsPlaying(true);
    setPlayerVisible(true);
  };

  // Handle play/pause click from grid
  const handlePlayPauseClick = () => {
    setIsPlaying((prev) => !prev);
    setPlayerVisible(true);
  };

  const handleClosePlayer = () => {
    // Disabled for preview - no action taken
  };

  // Handle previous track
  const handlePrevious = () => {
    if (currentIdx > 0) {
      setCurrentIdx(currentIdx - 1);
    } else if (autoLoopRef.current) {
      setCurrentIdx(demoProducts.length - 1);
    }
    // If autoLoop is off and we're at first track, do nothing
  };

  // Handle next track
  const handleNext = () => {
    if (currentIdx < demoProducts.length - 1) {
      setCurrentIdx(currentIdx + 1);
    } else if (autoLoopRef.current) {
      setCurrentIdx(0);
    }
    // If autoLoop is off and we're at last track, do nothing
  };

  // Handle audio ended with autoLoop logic
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

  const currentProduct = demoProducts[currentIdx];

  // Parse icon settings like WaveformPreview
  const [iconPlayOnProduct, iconPauseOnProduct] = settings.iconOnProduct.split(",");
  const [playIconKey, pauseIconKey] = settings.playPauseIcons.split(",");
  const [prevIconKey, nextIconKey] = settings.nextPrevIcons.split(",");
  const closeIconKey = settings.closeIcon;

  return (
    <div className={`playku-fixed-section ${previewVisible ? 'playku-preview-visible' : 'playku-preview-hidden'}`}>
      {/* Product images grid */}
      <div className="playku-product-grid-container">
        <ProductGrid
          demoProducts={demoProducts}
          settings={settings}
          currentIdx={currentIdx}
          isPlaying={isPlaying}
          onProductClick={handleProductClick}
          onPlayPauseClick={handlePlayPauseClick}
        />
      </div>

      {/* Sticky player (same style as WaveformPreview) */}
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
        {/* Image Section */}
        {settings.showImage && (
          <div className="playku-player-image-section">
            <img
              src={currentProduct.image}
              alt={currentProduct.title}
              className="playku-sticky-img"
              style={{
                height: settings.playerHeight - 16,
                maxHeight: settings.playerHeight - 16,
              }}
            />
          </div>
        )}

        {/* Title and Controls Section */}
        <div className="playku-player-info-section">
          {/* Title */}
          {settings.showTitle && (
            <div className="playku-player-title">
              {currentProduct.title}
            </div>
          )}
          
          {/* Controls */}
          <div className="playku-player-controls">
            <span
              className="playku-sticky-btn"
              onClick={handlePrevious}
            >
              <IconParser
                iconKey={prevIconKey}
                color={settings.iconColor}
                size={16}
              />
            </span>
            <span
              className="playku-sticky-btn"
              onClick={handlePlayPauseClick}
            >
              {isPlaying ? (
                <IconParser
                  iconKey={pauseIconKey}
                  color={settings.iconColor}
                  size={24}
                />
              ) : (
                <IconParser
                  iconKey={playIconKey}
                  color={settings.iconColor}
                  size={24}
                />
              )}
            </span>
            <span
              className="playku-sticky-btn"
              onClick={handleNext}
            >
              <IconParser
                iconKey={nextIconKey}
                color={settings.iconColor}
                size={16}
              />
            </span>
          </div>
        </div>

        {/* Spectrum Section */}
        <div className="playku-player-waveform-section">
          <SpectrumAnalyzer
            audioUrl={currentProduct.audioUrl}
            isPlaying={isPlaying}
            barCount={settings.barCount}
            barColor={settings.barColor}
            height={60} // Increased height to accommodate spectrum + mirror
            onEnded={handleEnded}
            fallbackMode={false}
          />
        </div>

        {/* Close Button */}
        <div className="playku-player-close-section">
          <span
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
    </div>
  );
}

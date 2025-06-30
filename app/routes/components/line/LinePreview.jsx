import { useState, useRef, useEffect, useCallback } from "react";
import { Card, Text, BlockStack } from "@shopify/polaris";
import ProductGrid from "../shared/ProductGrid";
import IconParser from "../shared/IconParser";
import "../shared/PlayerPreview.css";

export default function LinePreview({ settings, elements, demoProducts, previewVisible = true }) {
  const [currentIdx, setCurrentIdx] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [playerVisible, setPlayerVisible] = useState(true);
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);
  const audioRef = useRef(null);
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
    const wasPlaying = isPlaying;
    if (currentIdx > 0) {
      setCurrentIdx(currentIdx - 1);
      if (wasPlaying) {
        setIsPlaying(true);
      }
    } else if (autoLoopRef.current) {
      setCurrentIdx(demoProducts.length - 1);
      if (wasPlaying) {
        setIsPlaying(true);
      }
    }
    // If autoLoop is off and we're at first track, do nothing
  };

  // Handle next track
  const handleNext = () => {
    const wasPlaying = isPlaying;
    if (currentIdx < demoProducts.length - 1) {
      setCurrentIdx(currentIdx + 1);
      if (wasPlaying) {
        setIsPlaying(true);
      }
    } else if (autoLoopRef.current) {
      setCurrentIdx(0);
      if (wasPlaying) {
        setIsPlaying(true);
      }
    }
    // If autoLoop is off and we're at last track, do nothing
  };

  // Audio event handlers
  const handleAudioEnded = useCallback(() => {
    setProgress(0);
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

  const handleTimeUpdate = () => {
    if (audioRef.current) {
      const currentTime = audioRef.current.currentTime;
      const duration = audioRef.current.duration;
      if (duration > 0) {
        setProgress((currentTime / duration) * 100);
      }
    }
  };

  const handleLoadedMetadata = () => {
    if (audioRef.current) {
      setDuration(audioRef.current.duration);
    }
  };

  // Effect to handle play/pause
  useEffect(() => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.play().catch(console.error);
      } else {
        audioRef.current.pause();
      }
    }
  }, [isPlaying]);

  // Handle clicking on progress bar to seek
  const handleProgressClick = (e) => {
    if (audioRef.current && duration > 0) {
      const rect = e.currentTarget.getBoundingClientRect();
      const clickX = e.clientX - rect.left;
      const width = rect.width;
      const clickRatio = clickX / width;
      const seekTime = clickRatio * duration;
      
      audioRef.current.currentTime = seekTime;
      setProgress(clickRatio * 100);
    }
  };

  // Effect to change audio source when track changes
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
      setProgress(0);
      
      // Auto-play if isPlaying is true (for auto-advance and navigation)
      if (isPlaying) {
        const playAudio = () => {
          audioRef.current.play().catch(console.error);
        };
        
        // Wait for the audio to load before playing
        if (audioRef.current.readyState >= 2) {
          playAudio();
        } else {
          audioRef.current.addEventListener('canplay', playAudio, { once: true });
        }
      }
    }
  }, [currentIdx, isPlaying]);

  const currentProduct = demoProducts[currentIdx];

  // Parse icon settings like WaveformPreview
  const [iconPlayOnProduct, iconPauseOnProduct] = settings.iconOnProduct.split(",");
  const [playIconKey, pauseIconKey] = settings.playPauseIcons.split(",");
  const [prevIconKey, nextIconKey] = settings.nextPrevIcons.split(",");
  const closeIconKey = settings.closeIcon;

  const progressBarStyle = {
    flex: 1,
    height: `${settings.height}px`,
    backgroundColor: settings.trackColor,
    borderRadius: `${settings.height / 2}px`,
    position: 'relative',
    overflow: 'hidden',
    cursor: 'pointer',
  };

  const progressFillStyle = {
    width: `${progress}%`, // Dynamic progress based on audio
    height: '100%',
    backgroundColor: settings.progressColor,
    borderRadius: `${settings.height / 2}px`,
    transition: 'width 0.1s ease',
  };

  return (
    <div className={`playku-fixed-section ${previewVisible ? 'playku-preview-visible' : 'playku-preview-hidden'}`}>
      {/* Hidden audio element */}
      <audio
        ref={audioRef}
        key={currentIdx} // Force re-render when track changes
        src={currentProduct.audioUrl}
        onEnded={handleAudioEnded}
        onTimeUpdate={handleTimeUpdate}
        onLoadedMetadata={handleLoadedMetadata}
        preload="metadata"
      />

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

      {/* Sticky player with new layout */}
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

        {/* Line Progress Section */}
        <div className="playku-player-waveform-section">
          <div 
            className="playku-sticky-waveform" 
            style={progressBarStyle}
            onClick={handleProgressClick}
          >
            <div style={progressFillStyle}></div>
          </div>
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

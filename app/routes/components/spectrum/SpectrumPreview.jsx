import { useState } from "react";
import { Card, Text, BlockStack } from "@shopify/polaris";
import ProductGrid from "../shared/ProductGrid";
import "../shared/PlayerPreview.css";

export default function SpectrumPreview({ settings, elements, demoProducts }) {
  const [currentIdx, setCurrentIdx] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [playerVisible, setPlayerVisible] = useState(true);
  const visibleElements = elements?.filter(el => el.visible) || [];

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
    setPlayerVisible(false);
    setIsPlaying(false);
  };

  const currentProduct = demoProducts[currentIdx];

  const spectrumStyle = {
    flex: 1,
    height: '40px',
    display: 'flex',
    alignItems: 'end',
    gap: '2px',
    justifyContent: 'center',
  };

  // Generate mock spectrum bars
  const generateSpectrumBars = () => {
    const bars = [];
    for (let i = 0; i < settings.barCount; i++) {
      const height = Math.random() * 35 + 5;
      bars.push(
        <div
          key={i}
          style={{
            width: `${Math.max(1, 100 / settings.barCount - 1)}px`,
            height: `${height}px`,
            backgroundColor: settings.barColor,
            borderRadius: '1px',
          }}
        />
      );
    }
    return bars;
  };  return (
    <div>
      {/* Product images grid */}
      <ProductGrid
        demoProducts={demoProducts}
        settings={settings}
        currentIdx={currentIdx}
        isPlaying={isPlaying}
        onProductClick={handleProductClick}
        onPlayPauseClick={handlePlayPauseClick}
      />

      {/* Spectrum Player Preview Info */}
      <Card sectioned>
        <BlockStack gap="300">
          <Text variant="headingMd">Spectrum Player Preview</Text>
          <Text variant="bodyMd" tone="subdued">
            Bar Count: {settings.barCount} | Bar Color: {settings.barColor}
          </Text>
        </BlockStack>
      </Card>

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
                <span key="preview-controls" className="playku-sticky-controls">
                  <span
                    className="playku-sticky-btn"
                    onClick={() =>
                      setCurrentIdx(
                        (currentIdx - 1 + demoProducts.length) %
                          demoProducts.length
                      )
                    }
                  >
                    ⏮
                  </span>
                  <span
                    className="playku-sticky-btn"
                    onClick={handlePlayPauseClick}
                  >
                    {isPlaying ? '⏸' : '▶'}
                  </span>
                  <span
                    className="playku-sticky-btn"
                    onClick={() =>
                      setCurrentIdx((currentIdx + 1) % demoProducts.length)
                    }
                  >
                    ⏭
                  </span>
                </span>
              );
            default:
              return null;
          }
        })}
        <div className="playku-sticky-waveform" style={spectrumStyle}>
          {generateSpectrumBars()}
        </div>
        <span
          key="preview-close"
          className="playku-sticky-close"
          title="This will close the player"
          onClick={handleClosePlayer}
        >
          ✕
        </span>
      </div>
    </div>
  );
}

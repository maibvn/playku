import { Card, Text, BlockStack } from "@shopify/polaris";
import "../shared/PlayerPreview.css";

export default function SpectrumPreview({ settings, elements }) {
  const visibleElements = elements?.filter(el => el.visible) || [];

  const previewStyle = {
    backgroundColor: settings.playerBgColor,
    opacity: settings.playerBgOpacity,
    height: `${settings.playerHeight}px`,
    padding: '12px',
    borderRadius: '8px',
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    color: settings.iconColor,
    position: 'relative',
  };

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
  };

  return (
    <Card sectioned>
      <BlockStack gap="300">
        <Text variant="headingMd">Spectrum Player Preview</Text>
        <div style={previewStyle}>
          {visibleElements.some(el => el.key === 'image') && (
            <div style={{
              width: '40px',
              height: '40px',
              backgroundColor: '#ddd',
              borderRadius: '4px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '12px',
            }}>
              IMG
            </div>
          )}
          
          <div style={{ flex: 1 }}>
            {visibleElements.some(el => el.key === 'title') && (
              <div style={{ 
                fontSize: '14px', 
                fontWeight: 'bold', 
                marginBottom: '4px',
                color: settings.iconColor,
              }}>
                Song Title
              </div>
            )}
            
            {visibleElements.some(el => el.key === 'waveform') && (
              <div style={spectrumStyle}>
                {generateSpectrumBars()}
              </div>
            )}
          </div>
          
          {visibleElements.some(el => el.key === 'controls') && (
            <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
              <button style={{
                background: 'none',
                border: 'none',
                color: settings.iconColor,
                fontSize: '16px',
                cursor: 'pointer',
              }}>
                ⏮
              </button>
              <button style={{
                background: 'none',
                border: 'none',
                color: settings.iconColor,
                fontSize: '18px',
                cursor: 'pointer',
              }}>
                ▶
              </button>
              <button style={{
                background: 'none',
                border: 'none',
                color: settings.iconColor,
                fontSize: '16px',
                cursor: 'pointer',
              }}>
                ⏭
              </button>
            </div>
          )}
          
          {visibleElements.some(el => el.key === 'close') && (
            <button style={{
              background: 'none',
              border: 'none',
              color: settings.iconColor,
              fontSize: '16px',
              cursor: 'pointer',
            }}>
              ✕
            </button>
          )}
        </div>
        
        <Text variant="bodyMd" tone="subdued">
          Bar Count: {settings.barCount} | Bar Color: {settings.barColor}
        </Text>
      </BlockStack>
    </Card>
  );
}

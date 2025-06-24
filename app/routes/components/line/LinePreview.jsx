import { Card, Text, BlockStack } from "@shopify/polaris";
import "../shared/PlayerPreview.css";

export default function LinePreview({ settings, elements }) {
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

  const progressBarStyle = {
    flex: 1,
    height: `${settings.height}px`,
    backgroundColor: settings.trackColor,
    borderRadius: `${settings.height / 2}px`,
    position: 'relative',
    overflow: 'hidden',
  };

  const progressFillStyle = {
    width: '30%', // 30% progress
    height: '100%',
    backgroundColor: settings.progressColor,
    borderRadius: `${settings.height / 2}px`,
  };

  return (
    <Card sectioned>
      <BlockStack gap="300">
        <Text variant="headingMd">Line Player Preview</Text>
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
                marginBottom: '8px',
                color: settings.iconColor,
              }}>
                Song Title
              </div>
            )}
            
            {visibleElements.some(el => el.key === 'waveform') && (
              <div style={progressBarStyle}>
                <div style={progressFillStyle}></div>
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
          Progress Color: {settings.progressColor} | Track Color: {settings.trackColor} | Height: {settings.height}px
        </Text>
      </BlockStack>
    </Card>
  );
}

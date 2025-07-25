import {
  Card,
  Layout,
  Page,
  Text,
  BlockStack,
  Modal,
  TextContainer,
  Button,
  InlineStack,
} from "@shopify/polaris";
import { ViewIcon, HideIcon, CheckIcon } from "@shopify/polaris-icons";
import { TitleBar } from "@shopify/app-bridge-react";
import { useState, useCallback } from "react";
import { WaveformForm, WaveformPreview } from "./components/waveform";
import { SpectrumForm, SpectrumPreview } from "./components/spectrum";
import { LineForm, LinePreview } from "./components/line";
import StyleSelect from "./components/shared/StyleSelect";

// Demo products used across all player styles
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

// Base settings shared across all styles
const BASE_SETTINGS = {
  playerHeight: 75,
  playerBgColor: "#181818",
  playerBgOpacity: 1,
  iconPosition: "bottom-left",
  iconColor: "#ffffff",
  iconOnProduct: "bi-play, bi-pause",
  iconOnProductColor: "#ffffff",
  iconOnProductBgColor: "#000000",
  iconOnProductSize: 32,
  playPauseIcons: "bi-play, bi-pause",
  nextPrevIcons: "bi-skip-backward, bi-skip-forward",
  closeIcon: "bi-x",
  autoLoop: true,
  showPlayIconOnImage: true,
  showTitle: true,
  showImage: true,
};

// Default settings for each player style
const WAVEFORM_SETTINGS = {
  ...BASE_SETTINGS,
  waveColor: "#888888",
  progressColor: "#ffffff",
  waveformBarWidth: 2,
};

const SPECTRUM_SETTINGS = {
  ...BASE_SETTINGS,
  barCount: 64, // More reasonable bar count for better performance and visual clarity
  barColor: "#888888",
};

const LINE_SETTINGS = {
  ...BASE_SETTINGS,
  progressColor: "#1db954",
  trackColor: "#dddddd",
  height: 4,
};

const DEFAULT_ELEMENTS = [
  { key: "image", label: "Product Image", visible: true },
  { key: "title", label: "Title", visible: true },
  { key: "controls", label: "Audio Controls", visible: true },
  { key: "waveform", label: "Waveform", visible: true },
  { key: "close", label: "Close Button", visible: true },
];

// --- Main Page ---
export default function PlayerStyleSettingsPage() {
  /*
   * Data Structure according to Prisma Schema:
   * 
   * PlaykuSettings Table:
   * - id: Auto-generated CUID
   * - shop: String (required) - Shop domain identifier
   * - playerStyle: String ('waveform', 'line', 'spectrum')
   * - playerHeight: Int
   * - playerBgColor: String
   * - playerBgOpacity: Float (default: 1)
   * - iconPosition: String
   * - iconColor: String
   * - iconOnProduct: String
   * - iconOnProductColor: String
   * - iconOnProductBgColor: String
   * - iconOnProductSize: Int
   * - playPauseIcons: String
   * - nextPrevIcons: String
   * - closeIcon: String
   * - autoLoop: Boolean (default: true)
   * - showPlayIconOnImage: Boolean (default: true)
   * - showTitle: Boolean (default: true)
   * - showImage: Boolean (default: true)
   * - styleSettings: Json? (nullable)
   *   - For waveform: { "waveColor": "#ffffff", "progressColor": "#1db954", "waveformBarWidth": 2 }
   *   - For spectrum: { "barCount": 32, "barColor": "#ff00cc" }
   *   - For line: { "progressColor": "#1db954", "trackColor": "#dddddd", "height": 4 }
   */
  
  const [selectedStyleTab, setSelectedStyleTab] = useState(0);
  const [waveformSettings, setWaveformSettings] = useState(WAVEFORM_SETTINGS);
  const [spectrumSettings, setSpectrumSettings] = useState(SPECTRUM_SETTINGS);
  const [lineSettings, setLineSettings] = useState(LINE_SETTINGS);
  const [elements, setElements] = useState(DEFAULT_ELEMENTS);
  const [previewVisible, setPreviewVisible] = useState(true);
  
  // Modal state for save confirmation
  const [showSaveModal, setShowSaveModal] = useState(false);
  const [pendingSaveData, setPendingSaveData] = useState(null);
  const [currentPlayerType, setCurrentPlayerType] = useState('');
  
  // Add state to track if settings have changed
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

  // Style options for mapping
  const styleOptions = ['waveform', 'spectrum', 'line'];
  const currentPlayerStyle = styleOptions[selectedStyleTab];

  // Handle style dropdown change
  const handleStyleChange = useCallback((selectedValue) => {
    const newTabIndex = styleOptions.findIndex(style => style === selectedValue);
    if (newTabIndex !== -1) {
      setSelectedStyleTab(newTabIndex);
    }
  }, []);

  // Helper function to format settings data according to Prisma schema
  const formatSettingsForDatabase = (settingsData, playerStyle) => {
    /*
     * Example usage with Prisma:
     * 
     * const formattedData = formatSettingsForDatabase(settingsData, 'waveform');
     * 
     * // Create new settings
     * await prisma.playkuSettings.create({
     *   data: {
     *     shop: 'example-shop.myshopify.com',
     *     ...formattedData
     *   }
     * });
     * 
     * // Or update existing settings
     * await prisma.playkuSettings.update({
     *   where: { shop: 'example-shop.myshopify.com' },
     *   data: formattedData
     * });
     */
    
    // Define which fields are style-specific for each player type
    const styleSpecificFields = {
      waveform: ['waveColor', 'progressColor', 'waveformBarWidth'],
      spectrum: ['barCount', 'barColor'],
      line: ['progressColor', 'trackColor', 'height']
    };

    const styleFields = styleSpecificFields[playerStyle] || [];
    const styleSettings = {};
    const generalSettings = { ...settingsData };

    // Extract style-specific fields
    styleFields.forEach(field => {
      if (field in settingsData) {
        styleSettings[field] = settingsData[field];
        delete generalSettings[field];
      }
    });

    return {
      // Required fields for PlaykuSettings table
      // shop: 'shop-domain-here', // This should come from the actual shop context
      playerStyle,
      playerHeight: generalSettings.playerHeight,
      playerBgColor: generalSettings.playerBgColor,
      playerBgOpacity: generalSettings.playerBgOpacity,
      iconPosition: generalSettings.iconPosition,
      iconColor: generalSettings.iconColor,
      iconOnProduct: generalSettings.iconOnProduct,
      iconOnProductColor: generalSettings.iconOnProductColor,
      iconOnProductBgColor: generalSettings.iconOnProductBgColor,
      iconOnProductSize: generalSettings.iconOnProductSize,
      playPauseIcons: generalSettings.playPauseIcons,
      nextPrevIcons: generalSettings.nextPrevIcons,
      closeIcon: generalSettings.closeIcon,
      autoLoop: generalSettings.autoLoop,
      showPlayIconOnImage: generalSettings.showPlayIconOnImage,
      showTitle: generalSettings.showTitle,
      showImage: generalSettings.showImage,
      
      // Style-specific settings as JSON
      styleSettings: Object.keys(styleSettings).length > 0 ? styleSettings : null
    };
  };

  const togglePreview = useCallback(() => {
    setPreviewVisible(prev => !prev);
  }, []);

  // Centralized handlers for form submissions
  const handleSaveSettings = () => {
    let settingsData;
    let playerType;

    switch (selectedStyleTab) {
      case 0:
        settingsData = waveformSettings;
        playerType = 'waveform';
        break;
      case 1:
        settingsData = spectrumSettings;
        playerType = 'spectrum';
        break;
      case 2:
        settingsData = lineSettings;
        playerType = 'line';
        break;
      default:
        return;
    }

    const formattedData = formatSettingsForDatabase(settingsData, playerType);
    
    // Show confirmation modal
    setPendingSaveData(formattedData);
    setCurrentPlayerType(playerType.charAt(0).toUpperCase() + playerType.slice(1));
    setShowSaveModal(true);
  };

  // Updated form change handlers to track unsaved changes
  const handleWaveformChange = (newSettings) => {
    setWaveformSettings(newSettings);
    setHasUnsavedChanges(true);
  };

  const handleSpectrumChange = (newSettings) => {
    setSpectrumSettings(newSettings);
    setHasUnsavedChanges(true);
  };

  const handleLineChange = (newSettings) => {
    setLineSettings(newSettings);
    setHasUnsavedChanges(true);
  };

  // Centralized database update function
  const saveSettingsToDatabase = async (formattedData, playerType) => {
    try {
      console.log(`Saving ${playerType} settings to database:`, formattedData);
      
      // TODO: Replace with actual database save operation
      // Example: 
      // await prisma.playkuSettings.upsert({
      //   where: { shop: 'your-shop-domain.myshopify.com' },
      //   update: formattedData,
      //   create: {
      //     shop: 'your-shop-domain.myshopify.com',
      //     ...formattedData
      //   }
      // });
      
      // Simulate save delay
      await new Promise(resolve => setTimeout(resolve, 500));
      
      console.log(`✅ ${playerType} settings saved successfully to database`);
      
      return { success: true };
    } catch (error) {
      console.error(`❌ Error saving ${playerType} settings:`, error);
      throw error;
    }
  };

  // Modal handlers
  const handleModalCancel = () => {
    setShowSaveModal(false);
    setPendingSaveData(null);
    setCurrentPlayerType('');
  };

  const handleModalConfirm = async () => {
    if (pendingSaveData) {
      try {
        await saveSettingsToDatabase(pendingSaveData, currentPlayerType);
        
        // Close modal and reset state
        setShowSaveModal(false);
        setPendingSaveData(null);
        setCurrentPlayerType('');
        setHasUnsavedChanges(false);
        
      } catch (error) {
        // Error already logged in saveSettingsToDatabase
        alert('Error saving settings. Please try again.');
      }
    }
  };

  const renderCurrentForm = () => {
    switch (selectedStyleTab) {
      case 0:
        return (
          <WaveformForm
            initialSettings={WAVEFORM_SETTINGS}
            onSettingsChange={handleWaveformChange}
          />
        );
      case 1:
        return (
          <SpectrumForm
            initialSettings={SPECTRUM_SETTINGS}
            onSettingsChange={handleSpectrumChange}
          />
        );
      case 2:
        return (
          <LineForm
            initialSettings={LINE_SETTINGS}
            onSettingsChange={handleLineChange}
          />
        );
      default:
        return null;
    }
  };

  const renderCurrentPreview = () => {
    switch (selectedStyleTab) {
      case 0:
        return <WaveformPreview settings={waveformSettings} elements={elements} demoProducts={DEMO_PRODUCTS} previewVisible={previewVisible} />;
      case 1:
        return <SpectrumPreview settings={spectrumSettings} elements={elements} demoProducts={DEMO_PRODUCTS} previewVisible={previewVisible} />;
      case 2:
        return <LinePreview settings={lineSettings} elements={elements} demoProducts={DEMO_PRODUCTS} previewVisible={previewVisible} />;
      default:
        return null;
    }
  };

  return (
    <Page fullWidth>
      <TitleBar title="Audio Player Designer" />
      <Layout>
        <Layout.Section>
          <div className={`playku-page-content ${previewVisible ? 'preview-visible' : ''}`}>
            <Card>
              <BlockStack gap="500">
                {/* Style selector and action buttons */}
                <InlineStack gap="300" align="end">
                  <StyleSelect
                    label="Player Style"
                    value={currentPlayerStyle}
                    onChange={handleStyleChange}
                  />
                  <Button
                    onClick={togglePreview}
                    variant={previewVisible ? "primary" : "secondary"}
                    icon={previewVisible ? HideIcon : ViewIcon}
                  >
                    {previewVisible ? "Hide Preview" : "Show Preview"}
                  </Button>
                  <Button
                    variant="primary"
                    onClick={handleSaveSettings}
                    disabled={!hasUnsavedChanges}
                    icon={CheckIcon}
                  >
                    Save Settings
                  </Button>
                </InlineStack>
                
                {renderCurrentForm()}
                
                {renderCurrentPreview()}
              </BlockStack>
            </Card>
          </div>
        </Layout.Section>
      </Layout>

      {/* Save confirmation modal */}
      <Modal
        open={showSaveModal}
        onClose={handleModalCancel}
        title={`Save ${currentPlayerType} Settings`}
        primaryAction={{
          content: 'Save Settings',
          onAction: handleModalConfirm,
        }}
        secondaryActions={[
          {
            content: 'Cancel',
            onAction: handleModalCancel,
          },
        ]}
      >
        <Modal.Section>
          <TextContainer>
            <Text variant="bodyMd">
              Are you sure you want to save these {currentPlayerType} player settings?
            </Text>
          </TextContainer>
        </Modal.Section>
      </Modal>
    </Page>
  );
}
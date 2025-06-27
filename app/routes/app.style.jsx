import {
  Card,
  Layout,
  Page,
  Text,
  BlockStack,
  Tabs,
} from "@shopify/polaris";
import { TitleBar } from "@shopify/app-bridge-react";
import { useState, useCallback } from "react";
import { WaveformForm, WaveformPreview } from "./components/waveform";
import { SpectrumForm, SpectrumPreview } from "./components/spectrum";
import { LineForm, LinePreview } from "./components/line";

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
  barColor: "#ff00cc",
};

const LINE_SETTINGS = {
  ...BASE_SETTINGS,
  progressColor: "#1db954",
  trackColor: "#dddddd",
  height: 4,
};

const PLAYER_STYLES = [
  { id: 'waveform', content: 'Waveform' },
  { id: 'spectrum', content: 'Spectrum' },
  { id: 'line', content: 'Line' },
];

const DEFAULT_ELEMENTS = [
  { key: "image", label: "Product Image", visible: true },
  { key: "title", label: "Title", visible: true },
  { key: "controls", label: "Audio Controls", visible: true },
  { key: "waveform", label: "Waveform", visible: true },
  { key: "close", label: "Close Button", visible: true },
];

// --- Main Page ---
export default function PlayerStyleSettingsPage() {
  const [selectedStyleTab, setSelectedStyleTab] = useState(0);
  const [waveformSettings, setWaveformSettings] = useState(WAVEFORM_SETTINGS);
  const [spectrumSettings, setSpectrumSettings] = useState(SPECTRUM_SETTINGS);
  const [lineSettings, setLineSettings] = useState(LINE_SETTINGS);
  const [elements, setElements] = useState(DEFAULT_ELEMENTS);

  const currentPlayerStyle = PLAYER_STYLES[selectedStyleTab].id;

  const handleStyleTabChange = useCallback((selectedTabIndex) => {
    setSelectedStyleTab(selectedTabIndex);
  }, []);

  const handleWaveformSubmit = (settingsData) => {
    const finalData = {
      ...settingsData,
      playerStyle: 'waveform',
    };
    
    alert(
      "Player Style: waveform" +
      "\nSettings: " +
      JSON.stringify(finalData, null, 2)
    );
  };

  const handleSpectrumSubmit = (settingsData) => {
    const finalData = {
      ...settingsData,
      playerStyle: 'spectrum',
    };
    
    alert(
      "Player Style: spectrum" +
      "\nSettings: " +
      JSON.stringify(finalData, null, 2)
    );
  };

  const handleLineSubmit = (settingsData) => {
    const finalData = {
      ...settingsData,
      playerStyle: 'line',
    };
    
    alert(
      "Player Style: line" +
      "\nSettings: " +
      JSON.stringify(finalData, null, 2)
    );
  };

  const renderCurrentForm = () => {
    switch (selectedStyleTab) {
      case 0:
        return (
          <WaveformForm
            initialSettings={WAVEFORM_SETTINGS}
            onSubmit={handleWaveformSubmit}
            onSettingsChange={setWaveformSettings}
          />
        );
      case 1:
        return (
          <SpectrumForm
            initialSettings={SPECTRUM_SETTINGS}
            onSubmit={handleSpectrumSubmit}
            onSettingsChange={setSpectrumSettings}
          />
        );
      case 2:
        return (
          <LineForm
            initialSettings={LINE_SETTINGS}
            onSubmit={handleLineSubmit}
            onSettingsChange={setLineSettings}
          />
        );
      default:
        return null;
    }
  };
  const renderCurrentPreview = () => {
    switch (selectedStyleTab) {
      case 0:
        return <WaveformPreview settings={waveformSettings} elements={elements} demoProducts={DEMO_PRODUCTS} />;
      case 1:
        return <SpectrumPreview settings={spectrumSettings} elements={elements} demoProducts={DEMO_PRODUCTS} />;
      case 2:
        return <LinePreview settings={lineSettings} elements={elements} demoProducts={DEMO_PRODUCTS} />;
      default:
        return null;
    }
  };return (
    <Page>
      <TitleBar title="Audio Player Designer" />
      <Layout>
        <Layout.Section>
          <Card>
            <BlockStack gap="500">
              <Tabs
                tabs={PLAYER_STYLES}
                selected={selectedStyleTab}
                onSelect={handleStyleTabChange}
                fitted
              />
              
              {renderCurrentForm()}
              
              <BlockStack gap="300">
                <Text variant="headingMd" as="h2">
                  Preview
                </Text>
                {renderCurrentPreview()}
              </BlockStack>
            </BlockStack>
          </Card>
        </Layout.Section>
      </Layout>
    </Page>
  );
}
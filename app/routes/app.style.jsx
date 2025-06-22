import {
  Card,
  Layout,
  Page,
  Text,
  BlockStack,
  Button,
  Checkbox,
  TextField,
  FormLayout,
} from "@shopify/polaris";
import { TitleBar } from "@shopify/app-bridge-react";
import { useState } from "react";
import { PlayerPreview } from "./components/PlayerPreview";

// All schema keys with defaults
const DEFAULT_SETTINGS = {
  playerHeight: 72,
  playerBgColor: "#181818",
  iconColor: "#fff",
  waveColor: "#888",
  progressColor: "#fff",
  waveformHeight: 48,
  waveformBarWidth: 2,
  playPauseIcons: "▶️,⏸️",
  nextPrevIcons: "⏮️,⏭️",
  closeIcon: "✖",
  autoLoop: true,
  showPlayIconOnImage: true,
  showTitle: true,
  showImage: true,
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
  const [settings, setSettings] = useState(DEFAULT_SETTINGS);
  const [elements, setElements] = useState(DEFAULT_ELEMENTS);

  // --- Drag & Drop ---
  const onDragEnd = (result) => {
    if (!result.destination) return;
    const reordered = Array.from(elements);
    const [removed] = reordered.splice(result.source.index, 1);
    reordered.splice(result.destination.index, 0, removed);
    setElements(reordered);
  };

  // --- Toggle element visibility ---
  const handleToggle = (index) => (checked) => {
    setElements((prev) =>
      prev.map((el, i) =>
        i === index ? { ...el, visible: checked } : el
      )
    );
  };

  // --- Handle settings change ---
  const handleSettingChange = (field) => (value) => {
    setSettings((prev) => ({
      ...prev,
      [field]: typeof prev[field] === "number" ? Number(value) : value,
    }));
  };

  const handleCheckbox = (field) => (checked) => {
    setSettings((prev) => ({
      ...prev,
      [field]: checked,
    }));
  };

  const handleSubmit = () => {
    // TODO: Save settings and layout to backend
    alert(
      "Order: " +
        elements
          .filter((el) => el.visible)
          .map((el) => el.key)
          .join(", ") +
        "\nSettings: " +
        JSON.stringify(settings, null, 2)
    );
  };

  return (
    <Page>
      <TitleBar title="Audio Player Drag & Drop Designer" />
      <Layout>
        <Layout.Section>
          <Card>
            <BlockStack gap="300">
              <Text variant="headingMd" as="h2">
                Player Settings
              </Text>
              <FormLayout>
                <FormLayout.Group>
                  <TextField
                    label="Player Height (px)"
                    type="number"
                    value={String(settings.playerHeight)}
                    onChange={handleSettingChange("playerHeight")}
                  />
                  <TextField
                    label="Waveform Height (px)"
                    type="number"
                    value={String(settings.waveformHeight)}
                    onChange={handleSettingChange("waveformHeight")}
                  />
                  <TextField
                    label="Waveform Bar Width (px)"
                    type="number"
                    value={String(settings.waveformBarWidth)}
                    onChange={handleSettingChange("waveformBarWidth")}
                  />
                </FormLayout.Group>
                <FormLayout.Group>
                  <TextField
                    label="Player Background Color"
                    value={settings.playerBgColor}
                    onChange={handleSettingChange("playerBgColor")}
                    autoComplete="off"
                  />
                  <TextField
                    label="Icon Color"
                    value={settings.iconColor}
                    onChange={handleSettingChange("iconColor")}
                    autoComplete="off"
                  />
                  <TextField
                    label="Waveform Color"
                    value={settings.waveColor}
                    onChange={handleSettingChange("waveColor")}
                    autoComplete="off"
                  />
                  <TextField
                    label="Progress Color"
                    value={settings.progressColor}
                    onChange={handleSettingChange("progressColor")}
                    autoComplete="off"
                  />
                </FormLayout.Group>
                <FormLayout.Group>
                  <TextField
                    label="Play/Pause Icons (comma separated)"
                    value={settings.playPauseIcons}
                    onChange={handleSettingChange("playPauseIcons")}
                  />
                  <TextField
                    label="Next/Prev Icons (comma separated)"
                    value={settings.nextPrevIcons}
                    onChange={handleSettingChange("nextPrevIcons")}
                  />
                  <TextField
                    label="Close Icon"
                    value={settings.closeIcon}
                    onChange={handleSettingChange("closeIcon")}
                  />
                </FormLayout.Group>
                <FormLayout.Group condensed>
                  <Checkbox
                    label="Auto Loop"
                    checked={settings.autoLoop}
                    onChange={handleCheckbox("autoLoop")}
                  />
                  <Checkbox
                    label="Show Play Icon On Product Image"
                    checked={settings.showPlayIconOnImage}
                    onChange={handleCheckbox("showPlayIconOnImage")}
                  />
                  <Checkbox
                    label="Show Title"
                    checked={settings.showTitle}
                    onChange={handleCheckbox("showTitle")}
                  />
                  <Checkbox
                    label="Show Image"
                    checked={settings.showImage}
                    onChange={handleCheckbox("showImage")}
                  />
                </FormLayout.Group>
              </FormLayout>
              <Button primary onClick={handleSubmit}>
                Save Layout & Settings
              </Button>
              <Text variant="headingMd" as="h2" style={{ marginTop: 32 }}>
                Live Preview
              </Text>
              <PlayerPreview settings={settings} elements={elements} />
            </BlockStack>
          </Card>
        </Layout.Section>
      </Layout>
    </Page>
  );
}
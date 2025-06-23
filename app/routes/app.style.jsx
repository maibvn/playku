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
  Select,
} from "@shopify/polaris";
import { TitleBar } from "@shopify/app-bridge-react";
import { useState } from "react";
import PlayerPreview from "./components/PlayerPreview";
import IconSelect from "./components/IconSelect";

// All schema keys with defaults
const DEFAULT_SETTINGS = {
  playerHeight: 75,
  playerBgColor: "#181818",
  playerBgOpacity: 1,

  iconPosition: "bottom-left",
  iconColor: "#ffffff",
  waveColor: "#888888",
  progressColor: "#ffffff",
  waveformBarWidth: 2,

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

const DEFAULT_ELEMENTS = [
  { key: "image", label: "Product Image", visible: true },
  { key: "title", label: "Title", visible: true },
  { key: "controls", label: "Audio Controls", visible: true },
  { key: "waveform", label: "Waveform", visible: true },
  { key: "close", label: "Close Button", visible: true },
];

const PLAYER_HEIGHT_OPTIONS = [
  { label: "Small", value: "small" },
  { label: "Medium", value: "medium" },
  { label: "Large", value: "large" },
];

const PLAYER_HEIGHT_VALUES = {
  small: 64,
  medium: 75,
  large: 82,
};
const ICON_PRODUCT_SIZE_OPTIONS = [
  { label: "Small", value: "small" },
  { label: "Medium", value: "medium" },
  { label: "Large", value: "large" },
];

const ICON_PRODUCT_SIZE_VALUES = {
  small: 32,
  medium: 42,
  large: 52,
};

const ICON_POSITION_OPTIONS = [
  { label: "Center", value: "center" },
  { label: "Top Left", value: "top-left" },
  { label: "Top Right", value: "top-right" },
  { label: "Bottom Left", value: "bottom-left" },
  { label: "Bottom Right", value: "bottom-right" },
];

// --- Main Page ---
export default function PlayerStyleSettingsPage() {
  const [settings, setSettings] = useState(DEFAULT_SETTINGS);
  const [elements, setElements] = useState(DEFAULT_ELEMENTS);



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

  // For playerHeight select
  const handlePlayerHeightChange = (val) => {
    setSettings((prev) => ({
      ...prev,
      playerHeight: PLAYER_HEIGHT_VALUES[val],
      playerHeightOption: val,
    }));
  };

  // For icon position select
  const handleIconPositionChange = (val) => {
    setSettings((prev) => ({
      ...prev,
      iconPosition: val,
    }));
  };

  // Determine which option is currently selected for playerHeight
  const playerHeightOption =
    Object.entries(PLAYER_HEIGHT_VALUES).find(
      ([, v]) => v === settings.playerHeight
    )?.[0] || "medium";

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
      <TitleBar title="Audio Player Designer" />
      <Layout>
        <Layout.Section>
          <Card>
            <BlockStack gap="300">
              <Text variant="headingMd" as="h2">
                Player Settings
              </Text>
              <FormLayout>
                <FormLayout.Group condensed>
                  <Select
                    label="Player Height"
                    options={PLAYER_HEIGHT_OPTIONS}
                    value={playerHeightOption}
                    onChange={handlePlayerHeightChange}
                  />
                  <TextField
                    label="Background Color"
                    type="color"
                    value={settings.playerBgColor}
                    onChange={handleSettingChange("playerBgColor")}
                    autoComplete="off"
                  />
                  <TextField
                    label="Opacity"
                    type="number"
                    min={0}
                    max={1}
                    step={0.05}
                    value={String(settings.playerBgOpacity ?? 1)}
                    onChange={handleSettingChange("playerBgOpacity")}
                    autoComplete="off"
                  />
                  <TextField
                    label="Waveform Bar Width"
                    type="number"
                    value={String(settings.waveformBarWidth)}
                    onChange={handleSettingChange("waveformBarWidth")}
                    min={0}
                    step={1}
                  />
                   <TextField
                    label="Waveform Color"
                    type="color"
                    value={settings.waveColor}
                    onChange={handleSettingChange("waveColor")}
                    autoComplete="off"
                  />
                  <TextField
                    label="Progress Color"
                    type="color"
                    value={settings.progressColor}
                    onChange={handleSettingChange("progressColor")}
                    autoComplete="off"
                  />
                  <TextField
                    label="Icon Color"
                    type="color"
                    value={settings.iconColor}
                    onChange={handleSettingChange("iconColor")}
                    autoComplete="off"
                  />
                </FormLayout.Group>
                <FormLayout.Group condensed>
                  <IconSelect
                    label="Icon On Product"
                    type="icononproduct"
                    value={settings.iconOnProduct.replace(/bi-/g, '').replace(/, /g, ' ')}
                    onChange={(val) =>
                      setSettings((prev) => ({
                        ...prev,
                        iconOnProduct: val
                          .split(' ')
                          .map((k) => `bi-${k}`)
                          .join(', ')
                      }))
                    }
                  />

                   <Select
                      label="Size"
                      options={ICON_PRODUCT_SIZE_OPTIONS}
                      value={
                        Object.entries(ICON_PRODUCT_SIZE_VALUES).find(
                          ([, v]) => v === settings.iconOnProductSize
                        )?.[0] || "medium"
                      }
                      onChange={(val) =>
                        setSettings((prev) => ({
                          ...prev,
                          iconOnProductSize: ICON_PRODUCT_SIZE_VALUES[val],
                        }))
                      }
                    />
 <Select
                    label="Position"
                    options={ICON_POSITION_OPTIONS}
                    value={settings.iconPosition}
                    onChange={handleIconPositionChange}
                  />
                <TextField
                  label="Background"
                  type="color"
                  value={settings.iconOnProductBgColor}
                  onChange={handleSettingChange("iconOnProductBgColor")}
                  autoComplete="off"
                />
                  <TextField
                    label="Color"
                    type="color"
                    value={settings.iconOnProductColor}
                    onChange={handleSettingChange("iconOnProductColor")}
                    autoComplete="off"
                  />

                 
                  <IconSelect
                    label="Play/Pause Icons"
                    type="playpause"
                    value={settings.playPauseIcons.replace(/bi-/g, '').replace(/, /g, ' ')}
                    onChange={(val) =>
                      setSettings((prev) => ({
                        ...prev,
                        playPauseIcons: val
                          .split(' ')
                          .map((k) => `bi-${k}`)
                          .join(', ')
                      }))
                    }
                  />
                  <IconSelect
                    label="Next/Prev Icons"
                    type="prevnext"
                    value={settings.nextPrevIcons.replace(/bi-/g, '').replace(/, /g, ' ')}
                    onChange={(val) =>
                      setSettings((prev) => ({
                        ...prev,
                        nextPrevIcons: val
                          .split(' ')
                          .map((k) => `bi-${k}`)
                          .join(', ')
                      }))
                    }
                  />
                  <IconSelect
                    label="Close Icon"
                    type="close"
                    value={settings.closeIcon.replace(/bi-/g, '')}
                    onChange={(val) =>
                      setSettings((prev) => ({
                        ...prev,
                        closeIcon: `bi-${val}`
                      }))
                    }
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
                Preview
              </Text>
              <PlayerPreview settings={settings} elements={elements} />
            </BlockStack>
          </Card>
        </Layout.Section>
      </Layout>
    </Page>
  );
}
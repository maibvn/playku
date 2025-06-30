import {
  BlockStack,
  Button,
  Checkbox,
  TextField,
  FormLayout,
  Select,
  Text,
  InlineStack,
  Icon,
} from "@shopify/polaris";
import { ViewIcon, HideIcon } from "@shopify/polaris-icons";
import { useState } from "react";
import IconSelect from "../shared/IconSelect";

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

export default function SpectrumForm({ 
  initialSettings, 
  onSubmit, 
  onSettingsChange, 
  previewVisible = true, 
  onTogglePreview 
}) {
  const [settings, setSettings] = useState(initialSettings);

  // --- Handle settings change ---
  const handleSettingChange = (field) => (value) => {
    const newSettings = {
      ...settings,
      [field]: typeof settings[field] === "number" ? Number(value) : value,
    };
    setSettings(newSettings);
    if (onSettingsChange) {
      onSettingsChange(newSettings);
    }
  };

  const handleCheckbox = (field) => (checked) => {
    const newSettings = {
      ...settings,
      [field]: checked,
    };
    setSettings(newSettings);
    if (onSettingsChange) {
      onSettingsChange(newSettings);
    }
  };

  // For playerHeight select
  const handlePlayerHeightChange = (val) => {
    const newSettings = {
      ...settings,
      playerHeight: PLAYER_HEIGHT_VALUES[val],
    };
    setSettings(newSettings);
    if (onSettingsChange) {
      onSettingsChange(newSettings);
    }
  };

  // For icon position select
  const handleIconPositionChange = (val) => {
    const newSettings = {
      ...settings,
      iconPosition: val,
    };
    setSettings(newSettings);
    if (onSettingsChange) {
      onSettingsChange(newSettings);
    }
  };

  // Determine which option is currently selected for playerHeight
  const playerHeightOption =
    Object.entries(PLAYER_HEIGHT_VALUES).find(
      ([, v]) => v === settings.playerHeight
    )?.[0] || "medium";

  const handleSubmit = () => {
    if (onSubmit) {
      onSubmit(settings);
    }
  };

  const handleIconOnProductChange = (val) => {
    const newSettings = {
      ...settings,
      iconOnProduct: val
        .split(' ')
        .map((k) => `bi-${k}`)
        .join(', ')
    };
    setSettings(newSettings);
    if (onSettingsChange) {
      onSettingsChange(newSettings);
    }
  };

  const handleIconOnProductSizeChange = (val) => {
    const newSettings = {
      ...settings,
      iconOnProductSize: ICON_PRODUCT_SIZE_VALUES[val],
    };
    setSettings(newSettings);
    if (onSettingsChange) {
      onSettingsChange(newSettings);
    }
  };

  const handlePlayPauseIconsChange = (val) => {
    const newSettings = {
      ...settings,
      playPauseIcons: val
        .split(' ')
        .map((k) => `bi-${k}`)
        .join(', ')
    };
    setSettings(newSettings);
    if (onSettingsChange) {
      onSettingsChange(newSettings);
    }
  };

  const handleNextPrevIconsChange = (val) => {
    const newSettings = {
      ...settings,
      nextPrevIcons: val
        .split(' ')
        .map((k) => `bi-${k}`)
        .join(', ')
    };
    setSettings(newSettings);
    if (onSettingsChange) {
      onSettingsChange(newSettings);
    }
  };

  const handleCloseIconChange = (val) => {
    const newSettings = {
      ...settings,
      closeIcon: `bi-${val}`
    };
    setSettings(newSettings);
    if (onSettingsChange) {
      onSettingsChange(newSettings);
    }
  };

  return (
    <BlockStack gap="300">
      <InlineStack align="space-between">
        <Text variant="headingLg" as="h2">
          Sticky Player 
        </Text>
        <Button
          variant="primary"
          tone="success"
          onClick={onTogglePreview}
          size="medium"
          icon={<Icon source={previewVisible ? HideIcon : ViewIcon} />}
        >
          {previewVisible ? "Hide Preview" : "Show Preview"}
        </Button>
      </InlineStack>
      <FormLayout>
        <FormLayout.Group condensed>
          <Select
            label="Player Height"
            options={PLAYER_HEIGHT_OPTIONS}
            value={playerHeightOption}
            onChange={handlePlayerHeightChange}
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

            <IconSelect
  label="Next/Prev Icons"
  type="prevnext"
  value={settings.nextPrevIcons.replace(/bi-/g, '').replace(/, /g, ' ')}
  onChange={handleNextPrevIconsChange}
/>
          <IconSelect
            label="Play/Pause Icons"
            type="playpause"
            value={settings.playPauseIcons.replace(/bi-/g, '').replace(/, /g, ' ')}
            onChange={handlePlayPauseIconsChange}
          />
          <IconSelect
            label="Close Icon"
            type="close"
            value={settings.closeIcon.replace(/bi-/g, '')}
            onChange={handleCloseIconChange}
          />

        </FormLayout.Group>
        
        {/* Spectrum-specific fields */}
        <FormLayout.Group condensed>
          <TextField
            label="Background Color"
            type="color"
            value={settings.playerBgColor}
            onChange={handleSettingChange("playerBgColor")}
            autoComplete="off"
          />
          <TextField
            label="Icon Color"
            type="color"
            value={settings.iconColor}
            onChange={handleSettingChange("iconColor")}
            autoComplete="off"
          />
          <TextField
            label="Bar Color"
            type="color"
            value={settings.barColor}
            onChange={handleSettingChange("barColor")}
            autoComplete="off"
          />
          <TextField
            label="Bar Count"
            type="number"
            value={String(settings.barCount)}
            onChange={handleSettingChange("barCount")}
            min={8}
            max={128}
            step={1}
          />
        </FormLayout.Group>
        <FormLayout.Group condensed>
          <Checkbox
            label="Auto Loop"
            checked={settings.autoLoop}
            onChange={handleCheckbox("autoLoop")}
          />
          <Checkbox
            label="Icon On Product"
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
        
          <Text variant="headingLg" as="h2">
        Icon on Product 
      </Text>
        <FormLayout.Group condensed>

          <IconSelect
            label="Icon"
            type="icononproduct"
            value={settings.iconOnProduct.replace(/bi-/g, '').replace(/, /g, ' ')}
            onChange={handleIconOnProductChange}
          />

          <Select
            label="Size"
            options={ICON_PRODUCT_SIZE_OPTIONS}
            value={
              Object.entries(ICON_PRODUCT_SIZE_VALUES).find(
                ([, v]) => v === settings.iconOnProductSize
              )?.[0] || "medium"
            }
            onChange={handleIconOnProductSizeChange}
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


        </FormLayout.Group>
        
      </FormLayout>
      <Button variant="primary" onClick={handleSubmit}>
        Save Spectrum Settings
      </Button>
    </BlockStack>
  );
}

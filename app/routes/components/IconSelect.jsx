import { Button, Popover, ActionList, Label } from "@shopify/polaris";
import { useState, useCallback } from "react";
import {
  Play, PlayFill, PlayCircle, PlayCircleFill, PlayBtn,
  Pause, PauseFill, PauseCircle, PauseCircleFill, PauseBtn,
  SkipForward, SkipBackward, FastForward, Rewind,
  CaretLeft, CaretRight, X, XCircle, XCircleFill, XOctagon, XOctagonFill, CaretDown,
  ArrowRightCircle, ArrowLeftCircle, ChevronDown
} from "react-bootstrap-icons";

// Icon key sets for each type
const playPausePairs = [
  { label: <span><PlayFill /> / <PauseFill /></span>, value: 'play-fill pause-fill' },
  { label: <span><PlayCircle /> / <PauseCircle /></span>, value: 'play-circle pause-circle' },
  { label: <span><Play /> / <Pause /></span>, value: 'play pause' },
  { label: <span><PlayCircleFill /> / <PauseCircleFill /></span>, value: 'play-circle-fill pause-circle-fill' },
  { label: <span><PlayBtn /> / <PauseBtn /></span>, value: 'play-btn pause-btn' },
];

const prevNextPairs = [
  { label: <span><SkipBackward /> / <SkipForward /></span>, value: 'skip-backward skip-forward' },
  { label: <span><CaretLeft /> / <CaretRight /></span>, value: 'caret-left caret-right' },
  { label: <span><Rewind /> / <FastForward /></span>, value: 'rewind fast-forward' },
  { label: <span><ArrowLeftCircle /> / <ArrowRightCircle /></span>, value: 'arrow-left-circle arrow-right-circle' },
];

const closeIcons = [
  { label: <X />, value: 'x' },
  { label: <CaretDown />, value: 'caret-down' },
  { label: <ChevronDown />, value: 'chevron-down' },
  { label: <XCircle />, value: 'x-circle' },
  { label: <XCircleFill />, value: 'x-circle-fill' },
  { label: <XOctagon />, value: 'x-octagon' },
  { label: <XOctagonFill />, value: 'x-octagon-fill' },
];

const iconOnProductPairs = [
  { label: <span><Play /> / <Pause /></span>, value: 'play pause' },
  { label: <span><PlayFill /> / <PauseFill /></span>, value: 'play-fill pause-fill' },
];

export default function IconSelect({ label = "Icon", value, onChange, type = "playpause" }) {
  const [active, setActive] = useState(false);
  const toggleActive = useCallback(() => setActive((a) => !a), []);

  let iconOptions;
  if (type === "playpause") iconOptions = playPausePairs;
  else if (type === "prevnext") iconOptions = prevNextPairs;
  else if (type === "close") iconOptions = closeIcons;
  else if (type === "icononproduct") iconOptions = iconOnProductPairs;
  else iconOptions = [];

  const selected = iconOptions.find((opt) => opt.value === value);

  return (
    <div>
      <div style={{ marginBottom: 4 }}>
        <Label id="icon-select-label">{label}</Label>
      </div>
      <Popover
        active={active}
        activator={
          <Button onClick={toggleActive} disclosure fullWidth size="large" id="icon-select-button">
            {selected?.label || "Select Icon"}
          </Button>
        }
        onClose={toggleActive}
      >
        <div style={{ width: "7rem", justifyContent: "center", alignItems: "center", display: "flex" }}>
          <ActionList
            items={iconOptions.map((opt) => ({
              content: opt.label,
              onAction: () => {
                onChange(opt.value);
                toggleActive();
              },
            }))}
          />
        </div>
      </Popover>
    </div>
  );
}

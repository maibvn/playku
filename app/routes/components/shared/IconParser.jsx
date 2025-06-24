// ...existing imports...
import {
  Play,
  PlayFill,
  PlayCircle,
  PlayCircleFill,
  PlayBtn,
  Pause,
  PauseFill,
  PauseCircle,
  PauseCircleFill,
  PauseBtn,
  SkipForward,
  SkipBackward,
  FastForward,
  Rewind,
  CaretLeft,
  CaretRight,
  CaretDown,
  ArrowRightCircle,
  ArrowLeftCircle,
  X,
  XCircle,
  XCircleFill,
  XOctagon,
  XOctagonFill,
  ChevronDown, // <-- add this import
} from "react-bootstrap-icons";

// IconParser component
function IconParser({ iconKey, size = 20, color = "black", ...extraProps }) {
  const iconMap = {
    // Play icons
    "bi-play": Play,
    "bi-play-fill": PlayFill,
    "bi-play-circle": PlayCircle,
    "bi-play-circle-fill": PlayCircleFill,
    "bi-play-btn": PlayBtn,

    // Pause icons
    "bi-pause": Pause,
    "bi-pause-fill": PauseFill,
    "bi-pause-circle": PauseCircle,
    "bi-pause-circle-fill": PauseCircleFill,
    "bi-pause-btn": PauseBtn,

    // Next / Forward
    "bi-skip-forward": SkipForward,
    "bi-fast-forward": FastForward,
    "bi-caret-right": CaretRight,
    "bi-arrow-right-circle": ArrowRightCircle,

    // Previous / Backward
    "bi-skip-backward": SkipBackward,
    "bi-rewind": Rewind,
    "bi-caret-left": CaretLeft,
    "bi-arrow-left-circle": ArrowLeftCircle,

    // Close icons
    "bi-x": X,
    "bi-x-circle": XCircle,
    "bi-x-circle-fill": XCircleFill,
    "bi-x-octagon": XOctagon,
    "bi-x-octagon-fill": XOctagonFill,

    // Dropdown caret
    "bi-caret-down": CaretDown,
    "bi-chevron-down": ChevronDown, // <--
  };

  const IconComponent = iconMap[iconKey?.trim()];
  if (!IconComponent) return null;

  return <IconComponent size={size} color={color} {...extraProps} />;
}

export default IconParser;

// ...existing imports...
import {
  PlayFill,
  PauseFill,
  PlayCircleFill,
  PauseCircleFill,
  PlayCircle,
  PauseCircle,
  Play,
  Pause,
  PlayBtn,
  PauseBtn,
  SkipForward,
  SkipBackward,
  X,
  CaretLeft,
  CaretRight,
} from "react-bootstrap-icons";

// IconParser component with its own iconMap
function IconParser({ iconKey, size = 20, color, ...extraProps }) {
  const iconMap = {
    "bi-play": Play,
    "bi-pause": Pause,
    "bi-play-fill": PlayFill,
    "bi-pause-fill": PauseFill,
    "bi-play-circle": PlayCircle,
    "bi-pause-circle": PauseCircle,
    "bi-play-circle-fill": PlayCircleFill,
    "bi-pause-circle-fill": PauseCircleFill,
    "bi-play-btn": PlayBtn,
    "bi-pause-btn": PauseBtn,
    "bi-skip-forward": SkipForward,
    "bi-skip-backward": SkipBackward,
    "bi-caret-left": CaretLeft,
    "bi-caret-right": CaretRight,
    "bi-x": X,
    // Add more as needed
  };
  const IconComponent = iconMap[iconKey?.trim()];
  if (!IconComponent) return null;
  return <IconComponent size={size} color={color} {...extraProps} />;
}
import { Button, Popover, ActionList, Label, Select } from "@shopify/polaris";
import { useState, useCallback, useEffect } from "react";
import {
  PlayFill,
  PauseFill,
  PlayCircle,
  PauseCircle,
  Play,
  Pause,
  PlayCircleFill,
  PauseCircleFill,
  PlayBtn,
  PauseBtn,
  
} from "react-bootstrap-icons";

const iconOptions = [
  { label: <span><PlayFill /> / <PauseFill /></span>, value: 'play-fill pause-fill' },
  { label: <span><PlayCircle /> / <PauseCircle /></span>, value: 'play-circle pause-circle' },
  { label: <span><Play /> / <Pause /></span>, value: 'play pause' },
  { label: <span><PlayCircleFill /> / <PauseCircleFill /></span>, value: 'play-circle-fill pause-circle-fill' },
  { label: <span><PlayBtn /> / <PauseBtn /></span>, value: 'play-btn pause-btn' },
];

export  function IconSelect({ label = "Icon Pair", value, onChange }) {
  const [active, setActive] = useState(false);
  const toggleActive = useCallback(() => setActive((a) => !a), []);
  const selected = iconOptions.find((opt) => opt.value === value);

  return (
    <div >
       <div style={{ marginBottom: 4}}>

      <Label id="icon-select-label"> {label}</Label>
       </div>
      
      <Popover
        active={active}
        activator={
            <Button onClick={toggleActive} disclosure fullWidth size="large" id="icon-select-button">
              {selected?.label || "Select Icons"}
            </Button>
        }
        onClose={toggleActive}
        >

        <div style={{ width: "5rem", justifyContent: "center", alignItems: "center", display: "flex" }}>
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

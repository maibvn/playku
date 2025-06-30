import { Button, Popover, ActionList, Label } from "@shopify/polaris";
import { useState, useCallback } from "react";
import { Activity, BarChart, Dash } from "react-bootstrap-icons";

// Style options with icons and labels
const styleOptions = [
  {
    label: (
      <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        <Activity size={16} />
        Waveform Player
      </span>
    ),
    value: 'waveform',
    icon: <Activity size={16} />
  },
  {
    label: (
      <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        <BarChart size={16} />
        Spectrum Player
      </span>
    ),
    value: 'spectrum',
    icon: <BarChart size={16} />
  },
  {
    label: (
      <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        <Dash size={16} />
        Line Player
      </span>
    ),
    value: 'line',
    icon: <Dash size={16} />
  },
];

export default function StyleSelect({ label = "Player Style", value, onChange }) {
  const [active, setActive] = useState(false);
  const toggleActive = useCallback(() => setActive((a) => !a), []);

  const selected = styleOptions.find((opt) => opt.value === value);

  return (
    <div>
     
      <Popover
        active={active}
        activator={
          <Button 
            onClick={toggleActive} 
            disclosure 
            fullWidth 
            size="large" 
            id="style-select-button"
            textAlign="left"
          >
            <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              {selected?.icon}
              {selected ? selected.value.charAt(0).toUpperCase() + selected.value.slice(1) + ' Player' : "Select Style"}
            </span>
          </Button>
        }
        onClose={toggleActive}
      >
        <div style={{ minWidth: "200px" }}>
          <ActionList
            items={styleOptions.map((opt) => ({
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

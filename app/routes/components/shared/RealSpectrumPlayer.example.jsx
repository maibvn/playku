// Example usage of SpectrumAnalyzer with real Web Audio API

import SpectrumAnalyzer from "../shared/SpectrumAnalyzer";

function RealSpectrumPlayer({ audioUrl, settings }) {
  const [isPlaying, setIsPlaying] = useState(false);

  const handleEnded = () => {
    setIsPlaying(false);
  };

  return (
    <div>
      <button onClick={() => setIsPlaying(!isPlaying)}>
        {isPlaying ? 'Pause' : 'Play'}
      </button>
      
      <SpectrumAnalyzer
        audioUrl={audioUrl}
        isPlaying={isPlaying}
        barCount={settings.barCount || 32}
        barColor={settings.barColor || "#00ff00"}
        height={settings.height || 60}
        onEnded={handleEnded}
        fallbackMode={false} // This enables real audio analysis
      />
    </div>
  );
}

export default RealSpectrumPlayer;

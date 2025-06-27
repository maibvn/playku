import { useEffect, useRef, useState } from "react";

export default function SpectrumAnalyzer({ 
  audioUrl, 
  isPlaying, 
  barCount = 32, 
  barColor = "#00ff00",
  height = 40,
  onEnded,
  fallbackMode = false // For preview mode without actual audio processing
}) {
  const canvasRef = useRef(null);
  const audioRef = useRef(null);
  const audioContextRef = useRef(null);
  const analyserRef = useRef(null);
  const dataArrayRef = useRef(null);
  const sourceRef = useRef(null);
  const animationRef = useRef(null);
  const [isReady, setIsReady] = useState(false);
  const [hasError, setHasError] = useState(false);
  const [hasInitialDraw, setHasInitialDraw] = useState(false);

  // Helper function to convert hex color to rgba
  const hexToRgba = (hex, alpha) => {
    const hexColor = hex.replace('#', '');
    const r = parseInt(hexColor.substr(0, 2), 16);
    const g = parseInt(hexColor.substr(2, 2), 16);
    const b = parseInt(hexColor.substr(4, 2), 16);
    return `rgba(${r}, ${g}, ${b}, ${alpha})`;
  };

  // Draw static bars (initial state) - simulates first frame of real spectrum
  const drawStaticBars = () => {
    if (!canvasRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    const width = canvas.width;
    const canvasHeight = canvas.height;

    ctx.clearRect(0, 0, width, canvasHeight);

    // Calculate dimensions - main spectrum takes 60%, shadow takes 40% of total height
    const mainSpectrumHeight = Math.floor(height * 0.6);
    const shadowAreaHeight = height - mainSpectrumHeight;

    // Calculate bar width (same as real visualization)
    const barWidth = width / barCount;
    
    // Simulate the same data mapping as real analyzer
    // Real analyzer typically has 1024 or 2048 frequency bins
    const simulatedDataLength = 1024; // Typical FFT size
    const dataStep = Math.floor(simulatedDataLength / barCount);

    // Simulate initial frequency data that matches real audio analyzer output
    const simulatedFrequencyData = new Array(simulatedDataLength).fill(0);
    
    // Fill with realistic frequency distribution
    for (let i = 0; i < simulatedDataLength; i++) {
      const normalizedFreq = i / (simulatedDataLength - 1);
      let baseEnergy;
      
      if (normalizedFreq < 0.1) {
        // Sub-bass - strong energy
        baseEnergy = 55 + Math.sin(i * 0.02) * 20;
      } else if (normalizedFreq < 0.25) {
        // Bass - good energy  
        baseEnergy = 45 + Math.sin(i * 0.03 + 1) * 15;
      } else if (normalizedFreq < 0.5) {
        // Mid frequencies - moderate energy
        baseEnergy = 35 + Math.sin(i * 0.04 + 2) * 12;
      } else if (normalizedFreq < 0.75) {
        // High-mid - decreasing energy
        const falloff = 1 - (normalizedFreq - 0.5) / 0.25;
        baseEnergy = (25 + Math.sin(i * 0.05 + 3) * 8) * falloff;
      } else {
        // High frequencies - minimal energy
        const falloff = 1 - (normalizedFreq - 0.75) / 0.25;
        baseEnergy = (15 + Math.sin(i * 0.06 + 4) * 5) * Math.pow(falloff, 1.5);
      }
      
      simulatedFrequencyData[i] = Math.max(2, Math.min(baseEnergy, 85));
    }

    // Draw bars using the same logic as real visualization
    for (let i = 0; i < barCount; i++) {
      // Average frequency data for this bar (same as real analyzer)
      let sum = 0;
      const start = i * dataStep;
      const end = Math.min(start + dataStep, simulatedDataLength);
      
      for (let j = start; j < end; j++) {
        sum += simulatedFrequencyData[j];
      }
      
      const average = sum / (end - start);
      const barHeight = (average / 255) * mainSpectrumHeight; // Use main spectrum height

      const x = i * barWidth;
      const y = mainSpectrumHeight - barHeight;

      // Draw main spectrum bar
      ctx.fillStyle = barColor;
      ctx.fillRect(x, y, barWidth - 1, barHeight);

      // Draw shadow/reflection below - make it half the bar height but use full shadow area
      const shadowHeight = Math.min(barHeight * 0.7, shadowAreaHeight); // Use 70% of bar height or max shadow area
      const shadowY = mainSpectrumHeight;
      const shadowGradient = ctx.createLinearGradient(0, shadowY, 0, shadowY + shadowHeight);
      shadowGradient.addColorStop(0, hexToRgba(barColor, 0.6)); // Brighter - 60% opacity at top
      shadowGradient.addColorStop(1, hexToRgba(barColor, 0)); // 0% opacity at bottom
      
      ctx.fillStyle = shadowGradient;
      ctx.fillRect(x, shadowY, barWidth - 1, shadowHeight);
    }
    setHasInitialDraw(true);
  };

  // Fallback animated bars for preview mode
  const drawFallbackBars = () => {
    if (!canvasRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    const width = canvas.width;
    const canvasHeight = canvas.height;

    const barWidth = width / barCount;
    const time = Date.now() * 0.005;

    ctx.clearRect(0, 0, width, canvasHeight);

    // Calculate dimensions - main spectrum takes 60%, shadow takes 40% of total height
    const mainSpectrumHeight = Math.floor(height * 0.6);
    const shadowAreaHeight = height - mainSpectrumHeight;

    for (let i = 0; i < barCount; i++) {
      // Create animated sine wave pattern
      const frequency = (i / barCount) * 4 + 1;
      const amplitude = Math.sin(time * frequency + i * 0.5) * 0.5 + 0.5;
      const barHeight = amplitude * mainSpectrumHeight * 0.8;

      const x = i * barWidth;
      const y = mainSpectrumHeight - barHeight;

      // Draw main spectrum bar
      ctx.fillStyle = barColor;
      ctx.fillRect(x, y, barWidth - 1, barHeight);

      // Draw shadow/reflection below - make it half the bar height but use full shadow area
      const shadowHeight = Math.min(barHeight * 0.7, shadowAreaHeight); // Use 70% of bar height or max shadow area
      const shadowY = mainSpectrumHeight;
      const shadowGradient = ctx.createLinearGradient(0, shadowY, 0, shadowY + shadowHeight);
      shadowGradient.addColorStop(0, hexToRgba(barColor, 0.6)); // Brighter - 60% opacity at top
      shadowGradient.addColorStop(1, hexToRgba(barColor, 0)); // 0% opacity at bottom
      
      ctx.fillStyle = shadowGradient;
      ctx.fillRect(x, shadowY, barWidth - 1, shadowHeight);
    }

    if (isPlaying) {
      animationRef.current = requestAnimationFrame(drawFallbackBars);
    }
  };

  // Initialize audio context and analyzer
  useEffect(() => {
    if (fallbackMode) {
      setIsReady(true);
      return;
    }

    let cleanup = false;

    async function setupAudio() {
      try {
        if (cleanup) return;

        // Clean up previous setup
        if (animationRef.current) {
          cancelAnimationFrame(animationRef.current);
        }
        if (sourceRef.current) {
          sourceRef.current.disconnect();
        }
        if (audioContextRef.current && audioContextRef.current.state !== 'closed') {
          await audioContextRef.current.close();
        }

        // Create new audio context
        audioContextRef.current = new (window.AudioContext || window.webkitAudioContext)();
        analyserRef.current = audioContextRef.current.createAnalyser();
        
        // Configure analyzer
        analyserRef.current.fftSize = Math.pow(2, Math.ceil(Math.log2(barCount * 2)));
        analyserRef.current.smoothingTimeConstant = 0.8;
        
        const bufferLength = analyserRef.current.frequencyBinCount;
        dataArrayRef.current = new Uint8Array(bufferLength);

        // Create audio element
        if (audioRef.current) {
          audioRef.current.pause();
          audioRef.current.removeEventListener('ended', () => {});
          audioRef.current.removeEventListener('canplaythrough', () => {});
          audioRef.current.removeEventListener('error', () => {});
          audioRef.current.remove();
        }
        
        audioRef.current = new Audio();
        audioRef.current.crossOrigin = "anonymous";
        audioRef.current.preload = "auto"; // Changed from "metadata" to "auto"
        audioRef.current.volume = 1;
        
        // Set up event listeners
        audioRef.current.addEventListener('ended', () => {
          if (typeof onEnded === 'function') onEnded();
        });

        audioRef.current.addEventListener('canplaythrough', () => {
          if (cleanup) return;
          
          try {
            // Create source node
            sourceRef.current = audioContextRef.current.createMediaElementSource(audioRef.current);
            sourceRef.current.connect(analyserRef.current);
            analyserRef.current.connect(audioContextRef.current.destination);
            
            setIsReady(true);
            setHasError(false);
          } catch (error) {
            console.error('Error connecting audio source:', error);
            setHasError(true);
          }
        });

        audioRef.current.addEventListener('error', () => {
          console.error('Audio loading error');
          setHasError(true);
        });

        // Load audio
        audioRef.current.src = audioUrl;
        
      } catch (error) {
        console.error('Error setting up audio:', error);
        setHasError(true);
      }
    }

    setupAudio();

    return () => {
      cleanup = true;
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
      if (sourceRef.current) {
        sourceRef.current.disconnect();
      }
      if (audioContextRef.current && audioContextRef.current.state !== 'closed') {
        audioContextRef.current.close();
      }
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.remove();
      }
      setIsReady(false);
      setHasError(false);
      setHasInitialDraw(false);
    };
  }, [audioUrl, barCount, onEnded, fallbackMode]);

  // Handle play/pause
  useEffect(() => {
    if (!isReady) return;

    if (fallbackMode) {
      // Use fallback animation
      if (isPlaying) {
        drawFallbackBars();
      } else {
        if (animationRef.current) {
          cancelAnimationFrame(animationRef.current);
        }
        // Draw static bars when not playing
        if (!hasInitialDraw) {
          drawStaticBars();
        }
      }
      return;
    }

    // Real audio mode
    if (!audioRef.current) return;

    if (isPlaying) {
      // Resume audio context if suspended
      if (audioContextRef.current?.state === 'suspended') {
        audioContextRef.current.resume();
      }
      
      // Ensure audio is loaded before playing
      if (audioRef.current.readyState >= 2) { // HAVE_CURRENT_DATA
        audioRef.current.currentTime = 0; // Start from beginning
        audioRef.current.play().catch(error => {
          console.error('Audio play failed:', error);
          setHasError(true);
        });
        startVisualization();
      } else {
        // Wait for audio to load
        const handleCanPlay = () => {
          audioRef.current.currentTime = 0;
          audioRef.current.play().catch(error => {
            console.error('Audio play failed:', error);
            setHasError(true);
          });
          startVisualization();
          audioRef.current.removeEventListener('canplay', handleCanPlay);
        };
        audioRef.current.addEventListener('canplay', handleCanPlay);
      }
    } else {
      if (audioRef.current) {
        audioRef.current.pause();
      }
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
      // Draw static bars when not playing
      if (!hasInitialDraw) {
        drawStaticBars();
      }
    }
  }, [isPlaying, isReady, fallbackMode, hasInitialDraw]);

  // Visualization loop
  const startVisualization = () => {
    if (!analyserRef.current || !dataArrayRef.current || !canvasRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    const width = canvas.width;
    const canvasHeight = canvas.height;

    const draw = () => {
      // Check if we should continue drawing
      if (!isPlaying || !audioRef.current || audioRef.current.paused) {
        return;
      }

      // Get frequency data
      analyserRef.current.getByteFrequencyData(dataArrayRef.current);

      // Clear canvas
      ctx.clearRect(0, 0, width, canvasHeight);

      // Calculate dimensions - main spectrum takes 60%, shadow takes 40% of total height
      const mainSpectrumHeight = Math.floor(height * 0.6);
      const shadowAreaHeight = height - mainSpectrumHeight;

      // Calculate bar width
      const barWidth = width / barCount;
      const dataStep = Math.floor(dataArrayRef.current.length / barCount);

      // Draw bars
      for (let i = 0; i < barCount; i++) {
        // Average frequency data for this bar
        let sum = 0;
        const start = i * dataStep;
        const end = Math.min(start + dataStep, dataArrayRef.current.length);
        
        for (let j = start; j < end; j++) {
          sum += dataArrayRef.current[j];
        }
        
        const average = sum / (end - start);
        const barHeight = (average / 255) * mainSpectrumHeight;

        const x = i * barWidth;
        const y = mainSpectrumHeight - barHeight;

        // Draw main spectrum bar
        ctx.fillStyle = barColor;
        ctx.fillRect(x, y, barWidth - 1, barHeight);

        // Draw shadow/reflection below - make it half the bar height but use full shadow area
        const shadowHeight = Math.min(barHeight * 0.7, shadowAreaHeight); // Use 70% of bar height or max shadow area
        const shadowY = mainSpectrumHeight;
        const shadowGradient = ctx.createLinearGradient(0, shadowY, 0, shadowY + shadowHeight);
        shadowGradient.addColorStop(0, hexToRgba(barColor, 0.6)); // Brighter - 60% opacity at top
        shadowGradient.addColorStop(1, hexToRgba(barColor, 0)); // 0% opacity at bottom
        
        ctx.fillStyle = shadowGradient;
        ctx.fillRect(x, shadowY, barWidth - 1, shadowHeight);
      }

      // Continue animation loop
      animationRef.current = requestAnimationFrame(draw);
    };

    draw();
  };

  // Set canvas size when component mounts and draw initial static bars
  useEffect(() => {
    if (canvasRef.current) {
      const canvas = canvasRef.current;
      const rect = canvas.getBoundingClientRect();
      canvas.width = rect.width;
      canvas.height = height; // Use original height, not 1.5x
      
      // Reset the initial draw state when canvas dimensions or bar count changes
      setHasInitialDraw(false);
      
      // Draw initial static bars
      setTimeout(() => {
        if (!isPlaying) {
          drawStaticBars();
        }
      }, 100); // Small delay to ensure canvas is ready
    }
  }, [height, barColor, barCount]);

  return (
    <canvas
      ref={canvasRef}
      style={{
        width: '100%',
        height: `${height}px`, // Use original height
        backgroundColor: 'transparent',
      }}
    />
  );
}

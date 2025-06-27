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

  // Draw static bars (initial state) - simulates typical audio spectrum first frame
  const drawStaticBars = () => {
    if (!canvasRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    const width = canvas.width;
    const height = canvas.height;

    const barWidth = width / barCount;

    ctx.clearRect(0, 0, width, height);

    for (let i = 0; i < barCount; i++) {
      // Create a realistic spectrum pattern - lower frequencies have more energy
      const normalizedPosition = i / (barCount - 1);
      
      // Bass frequencies (left side) typically have more energy
      let energyLevel;
      if (normalizedPosition < 0.2) {
        // Bass range - higher energy
        energyLevel = 0.3 + Math.random() * 0.2;
      } else if (normalizedPosition < 0.5) {
        // Mid range - moderate energy
        energyLevel = 0.2 + Math.random() * 0.15;
      } else {
        // High frequencies - lower energy, gradually decreasing
        const highFreqFactor = 1 - (normalizedPosition - 0.5) * 2;
        energyLevel = (0.1 + Math.random() * 0.1) * highFreqFactor;
      }
      
      // Add minimum noise floor
      const noiseFloor = height * 0.02;
      const barHeight = Math.max(noiseFloor, energyLevel * height * 0.6);

      const x = i * barWidth;
      const y = height - barHeight;

      ctx.fillStyle = barColor;
      ctx.globalAlpha = 0.4; // Slightly more visible than before
      ctx.fillRect(x, y, barWidth - 1, barHeight);
    }
    
    ctx.globalAlpha = 1; // Reset alpha
    setHasInitialDraw(true);
  };

  // Fallback animated bars for preview mode
  const drawFallbackBars = () => {
    if (!canvasRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    const width = canvas.width;
    const height = canvas.height;

    const barWidth = width / barCount;
    const time = Date.now() * 0.005;

    ctx.clearRect(0, 0, width, height);

    for (let i = 0; i < barCount; i++) {
      // Create animated sine wave pattern
      const frequency = (i / barCount) * 4 + 1;
      const amplitude = Math.sin(time * frequency + i * 0.5) * 0.5 + 0.5;
      const barHeight = amplitude * height * 0.8;

      const x = i * barWidth;
      const y = height - barHeight;

      ctx.fillStyle = barColor;
      ctx.fillRect(x, y, barWidth - 1, barHeight);
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
    const height = canvas.height;

    const draw = () => {
      // Check if we should continue drawing
      if (!isPlaying || !audioRef.current || audioRef.current.paused) {
        return;
      }

      // Get frequency data
      analyserRef.current.getByteFrequencyData(dataArrayRef.current);

      // Clear canvas
      ctx.clearRect(0, 0, width, height);

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
        const barHeight = (average / 255) * height;

        const x = i * barWidth;
        const y = height - barHeight;

        ctx.fillStyle = barColor;
        ctx.fillRect(x, y, barWidth - 1, barHeight);
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
      canvas.height = height;
      
      // Draw initial static bars
      setTimeout(() => {
        if (!isPlaying && !hasInitialDraw) {
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
        height: `${height}px`,
        backgroundColor: 'transparent',
      }}
    />
  );
}

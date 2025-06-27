import { useEffect, useRef } from "react";

export default function StickyWaveform({ audioUrl, settings, isPlaying, onEnded }) {
  const waveformRef = useRef(null);
  const wavesurfer = useRef(null);
  const readyRef = useRef(false);
  const setupTimeoutRef = useRef(null);
  const isSettingUpRef = useRef(false);

  useEffect(() => {
    // Clear any pending setup
    if (setupTimeoutRef.current) {
      clearTimeout(setupTimeoutRef.current);
    }

    // Debounce rapid changes
    setupTimeoutRef.current = setTimeout(async () => {
      // Prevent multiple simultaneous setups
      if (isSettingUpRef.current) {
        return;
      }
      
      isSettingUpRef.current = true;
      
      try {
        // Clear previous waveform DOM and instance
        if (waveformRef.current) {
          waveformRef.current.innerHTML = "";
        }
        if (wavesurfer.current) {
          wavesurfer.current.destroy();
          wavesurfer.current = null;
        }
        readyRef.current = false;

        if (!waveformRef.current) {
          return;
        }

        const WaveSurfer = (await import("wavesurfer.js")).default;
        const ws = WaveSurfer.create({
          container: waveformRef.current,
          waveColor: settings.waveColor,
          progressColor: settings.progressColor,
          height: settings.playerHeight - 32,
          barWidth: settings.waveformBarWidth,
          responsive: true,
          cursorColor: settings.iconColor,
          interact: true,
        });

        ws.load(audioUrl);

        ws.on("finish", () => {
          if (typeof onEnded === "function") onEnded();
        });

        ws.on("ready", () => {
          readyRef.current = true;
          if (isPlaying) {
            ws.play();
          }
        });

        wavesurfer.current = ws;
      } catch (error) {
        console.error("Error setting up waveform:", error);
      } finally {
        isSettingUpRef.current = false;
      }
    }, 100); // 100ms debounce

    return () => {
      if (setupTimeoutRef.current) {
        clearTimeout(setupTimeoutRef.current);
      }
      if (wavesurfer.current) {
        wavesurfer.current.destroy();
        wavesurfer.current = null;
      }
      if (waveformRef.current) {
        waveformRef.current.innerHTML = "";
      }
      readyRef.current = false;
      isSettingUpRef.current = false;
    };
  // Only depend on audioUrl and settings
  }, [
    audioUrl,
    settings.waveColor,
    settings.progressColor,
    settings.playerHeight,
    settings.waveformBarWidth,
    settings.iconColor,
  ]);

  useEffect(() => {
    if (wavesurfer.current && readyRef.current) {
      if (isPlaying) {
        wavesurfer.current.play();
      } else {
        wavesurfer.current.pause();
      }
    }
  }, [isPlaying]);

  return (
    <div
      ref={waveformRef}
      style={{
        flex: 1,
        minWidth: 80,
        // margin: "0 16px",
      }}
    />
  );
}
import { useEffect, useRef } from "react";

export default function StickyWaveform({ audioUrl, settings, isPlaying, onEnded }) {
  const waveformRef = useRef(null);
  const wavesurfer = useRef(null);
  const readyRef = useRef(false);

  useEffect(() => {
    let WaveSurfer;
    let ws;

    async function setup() {
      // Clear previous waveform DOM
      if (waveformRef.current) {
        waveformRef.current.innerHTML = "";
      }
      if (wavesurfer.current) {
        wavesurfer.current.destroy();
        wavesurfer.current = null;
      }
      readyRef.current = false;
      WaveSurfer = (await import("wavesurfer.js")).default;
      ws = WaveSurfer.create({
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
    }

    if (waveformRef.current) {
      setup();
    }

    return () => {
      if (wavesurfer.current) {
        wavesurfer.current.destroy();
        wavesurfer.current = null;
      }
      if (waveformRef.current) {
        waveformRef.current.innerHTML = "";
      }
      readyRef.current = false;
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
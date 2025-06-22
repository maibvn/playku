(function () {
  console.log("trying hard 6");

  if (window.PlayKuInjected) return;
  window.PlayKuInjected = true;

  let currentHandle = null;
  let playIcons = {};
  let audioHandles = [];
  let audioDataRef = {};
  let waveSurferInstance = null;
  let playbackTrackerInterval = null;
  let restoreState = null;

  const ICON_CLASS = "playku-play-icon";

  const preloadAudioBlob = async (url) => {
    try {
      const res = await fetch(url, { cache: "force-cache" });
      return await res.blob();
    } catch (e) {
      console.warn("[PlayKu] Failed to preload blob", e);
      return null;
    }
  };

  const createIcon = (handle, title, audioUrl) => {
    const btn = document.createElement("button");
    btn.className = ICON_CLASS;
    btn.textContent = "▶️";
    Object.assign(btn.style, {
      position: "absolute",
      top: "8px",
      left: "8px",
      background: "rgba(0,0,0,0.5)",
      color: "#fff",
      border: "none",
      borderRadius: "50%",
      width: "32px",
      height: "32px",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      cursor: "pointer",
      zIndex: "10",
    });
    btn.onclick = (e) => {
      e.stopPropagation();
      if (currentHandle === handle && waveSurferInstance) {
        waveSurferInstance.playPause();
        return;
      }
      playAudioByHandle(handle, true);
    };
    playIcons[handle] = btn;
    return btn;
  };

  function updateIconStates() {
    Object.entries(playIcons).forEach(([handle, btn]) => {
      if (handle === currentHandle && waveSurferInstance && waveSurferInstance.isPlaying()) {
        btn.textContent = "⏸️";
      } else {
        btn.textContent = "▶️";
      }
    });
  }

  function savePlayerState() {
    if (!waveSurferInstance) return;
    localStorage.setItem("playku-player-state", JSON.stringify({
      currentHandle,
      title: audioDataRef[currentHandle]?.title || "",
      audioUrl: audioDataRef[currentHandle]?.audioUrl || "",
      imgSrc: document.querySelector('#playku-sticky-player img')?.src || "",
      playbackTime: waveSurferInstance.getCurrentTime?.() || 0,
      wasPlaying: waveSurferInstance.isPlaying()
    }));
  }

  function playAudioByHandle(handle, autoplay = false) {
    const info = audioDataRef[handle];
    if (!info) return;
    currentHandle = handle;
    updateIconStates();

    let imgSrc = "";
    const btn = playIcons[handle];
    if (btn) {
      const wrapper = btn.closest('.card-wrapper, .product-card-wrapper, .product-card, .grid__item');
      const img = wrapper?.querySelector('img');
      if (img) imgSrc = img.src;
    }

    createStickyPlayer({
      imgSrc,
      title: info.title,
      audioUrl: info.audioUrl,
      autoplay,
      blob: restoreState?.audioUrl === info.audioUrl ? restoreState.blob : null
    });
  }

  function getNextHandle() {
    if (!currentHandle) return audioHandles[0];
    const idx = audioHandles.indexOf(currentHandle);
    return (idx === -1 || idx === audioHandles.length - 1) ? audioHandles[0] : audioHandles[idx + 1];
  }

  function getPrevHandle() {
    if (!currentHandle) return audioHandles[0];
    const idx = audioHandles.indexOf(currentHandle);
    return idx <= 0 ? audioHandles[audioHandles.length - 1] : audioHandles[idx - 1];
  }

  function createStickyPlayer({ imgSrc, title, audioUrl, autoplay, blob }) {
    document.getElementById('playku-sticky-player')?.remove();

    const player = document.createElement('div');
    player.id = 'playku-sticky-player';
    player.style = `
      position:fixed;left:0;right:0;bottom:0;z-index:9999;
      background:#181818;color:#fff;display:flex;align-items:center;
      gap:16px;padding:12px 24px;box-shadow:0 -2px 12px #0008;
      font-family:sans-serif;min-height:72px;width:100%;
    `;

    // 1. Image
    const img = document.createElement('img');
    img.src = imgSrc;
    img.alt = title;
    img.style = 'width:56px;height:56px;object-fit:cover;border-radius:8px;box-shadow:0 2px 8px #0006;';
    player.appendChild(img);

    // 2. Title + Controls cell
    const infoControls = document.createElement('div');
    infoControls.style = 'display:flex;flex-direction:column;justify-content:center;min-width:180px;max-width:260px;';

    const info = document.createElement('div');
    info.style = 'font-weight:bold;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;margin-bottom:4px;';
    info.textContent = title;
    infoControls.appendChild(info);

    const controls = document.createElement('div');
    controls.style = 'display:flex;align-items:center;gap:8px;';
    controls.innerHTML = `
      <button id="playku-prev" style="font-size:20px;background:none;border:none;color:#fff;cursor:pointer;">⏮️</button>
      <button id="playku-play" style="font-size:24px;background:none;border:none;color:#fff;cursor:pointer;">▶️</button>
      <button id="playku-next" style="font-size:20px;background:none;border:none;color:#fff;cursor:pointer;">⏭️</button>
    `;
    infoControls.appendChild(controls);

    player.appendChild(infoControls);

    // 3. Waveform (expands)
    const waveform = document.createElement('div');
    waveform.id = 'playku-waveform';
    waveform.style = 'flex:1 1 0;width:100%;height:48px;background:#222;border-radius:4px;margin:0 16px;';
    player.appendChild(waveform);

    // 4. Close button
    const closeBtn = document.createElement('button');
    closeBtn.textContent = '✖';
    closeBtn.title = 'Close';
    closeBtn.style = 'margin-left:16px;font-size:20px;background:none;border:none;color:#fff;cursor:pointer;';
    closeBtn.onclick = () => {
      player.remove();
      if (waveSurferInstance) waveSurferInstance.destroy();
      waveSurferInstance = null;
      currentHandle = null;
      localStorage.removeItem("playku-player-state");
      if (playbackTrackerInterval) clearInterval(playbackTrackerInterval);
      playbackTrackerInterval = null;
      updateIconStates();
    };
    player.appendChild(closeBtn);

    document.body.appendChild(player);

    ensureWavesurferLoaded(async () => {
      if (waveSurferInstance) waveSurferInstance.destroy();

      waveSurferInstance = window.WaveSurfer.create({
        container: '#playku-waveform',
        waveColor: '#888',
        progressColor: '#fff',
        height: 48,
        barWidth: 2,
        responsive: true,
        draw: false
      });

      if (blob) {
        waveSurferInstance.loadBlob(blob);
      } else {
        waveSurferInstance.load(audioUrl);
      }

      const playBtn = document.getElementById('playku-play');
      playBtn.onclick = () => waveSurferInstance.playPause();
      document.getElementById('playku-prev').onclick = () => playAudioByHandle(getPrevHandle(), true);
      document.getElementById('playku-next').onclick = () => playAudioByHandle(getNextHandle(), true);

      waveSurferInstance.on('play', () => {
        playBtn.textContent = '⏸️';
        updateIconStates();
        savePlayerState();
        if (playbackTrackerInterval) clearInterval(playbackTrackerInterval);
        playbackTrackerInterval = setInterval(savePlayerState, 1000);
      });

      waveSurferInstance.on('pause', () => {
        playBtn.textContent = '▶️';
        updateIconStates();
        savePlayerState();
        if (playbackTrackerInterval) clearInterval(playbackTrackerInterval);
        playbackTrackerInterval = null;
      });

      waveSurferInstance.on('finish', () => {
        savePlayerState();
        if (playbackTrackerInterval) clearInterval(playbackTrackerInterval);
        playbackTrackerInterval = null;
        playAudioByHandle(getNextHandle(), true);
      });

      waveSurferInstance.once('ready', () => {
        waveSurferInstance.drawBuffer();
        if (restoreState?.audioUrl === audioUrl && typeof restoreState.playbackTime === 'number') {
          const time = restoreState.playbackTime;
          const shouldPlay = restoreState.wasPlaying;
          const trySeek = () => {
            const dur = waveSurferInstance.getDuration();
            if (dur && dur > 0) {
              waveSurferInstance.seekTo(time / dur);
              if (shouldPlay) waveSurferInstance.play();
              restoreState = null;
            } else {
              requestAnimationFrame(trySeek);
            }
          };
          requestAnimationFrame(trySeek);
        } else if (autoplay) {
          waveSurferInstance.play();
        }
      });
    });
  }

  function getThemeNameFromScript() {
    const script = document.querySelector('script[data-theme-name]');
    return script ? script.getAttribute('data-theme-name') : null;
  }

  async function init() {
    try {
      const themeName = getThemeNameFromScript();
      if (!themeName) return;

      const res = await fetch("/apps/playku", {
        method: "POST",
        headers: { "Content-Type": "application/json", Accept: "application/json" },
        body: JSON.stringify({ theme: themeName })
      });

      const { themeConfig, audioData } = await res.json();
      
      console.log("[PlayKu] Theme config and audio data fetched", themeConfig, audioData);

      audioDataRef = audioData || {};
      audioHandles = Object.keys(audioDataRef);

      let selectors = [];
      try { selectors = JSON.parse(themeConfig.productImageSelectors); } catch {}

      const seen = new Set();
      selectors.forEach(selector => {
        document.querySelectorAll(selector).forEach(img => {
          const wrapper = img.closest(".card-wrapper, .product-card-wrapper, .product-card, .grid__item") || img.parentElement;
          if (!wrapper || wrapper.querySelector(`.${ICON_CLASS}`)) return;
          const link = wrapper.querySelector("a[href*='/products/']");
          const match = link?.getAttribute("href")?.match(/\/products\/([^/?#]+)/);
          const handle = match?.[1];
          if (!handle || seen.has(handle)) return;
          const audioInfo = audioData?.[handle];
          if (!audioInfo?.audioUrl) return;
          if (getComputedStyle(wrapper).position === "static") wrapper.style.position = "relative";
          wrapper.appendChild(createIcon(handle, audioInfo.title, audioInfo.audioUrl));
          seen.add(handle);
        });
      });

      const saved = localStorage.getItem("playku-player-state");
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.audioUrl && audioHandles.includes(parsed.currentHandle)) {
          preloadAudioBlob(parsed.audioUrl).then(blob => {
            restoreState = { ...parsed, blob };
            currentHandle = parsed.currentHandle;
            createStickyPlayer({
              imgSrc: parsed.imgSrc,
              title: parsed.title,
              audioUrl: parsed.audioUrl,
              autoplay: false,
              blob
            });
          });
        }
      }

    } catch (err) {
      console.warn("[PlayKu] Failed to fetch or inject play icons", err);
    }
  }

  function ensureWavesurferLoaded(cb) {
    if (window.WaveSurfer) return cb();
    const script = document.createElement('script');
    script.src = 'https://unpkg.com/wavesurfer.js';
    script.onload = cb;
    document.head.appendChild(script);
  }

  init();
})();

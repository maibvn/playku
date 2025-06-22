(function () {
  console.log("trying hard 6");

  if (window.PlayKuInjected) return;
  window.PlayKuInjected = true;

  let currentHandle = null;
let playIcons = {};
let audioHandles = [];
let audioDataRef = {};
let waveSurferInstance = null;

const ICON_CLASS = "playku-play-icon";

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
      // Toggle pause/play
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

function playAudioByHandle(handle, autoplay = false) {
  const info = audioDataRef[handle];
  if (!info) return;
  currentHandle = handle;
  updateIconStates();

  // Find the product image src for this handle
  let imgSrc = "";
  const btn = playIcons[handle];
  if (btn) {
    const wrapper = btn.closest('.card-wrapper, .product-card-wrapper, .product-card, .grid__item');
    const img = wrapper?.querySelector('img');
    if (img) imgSrc = img.src;
  }

  createStickyPlayer({ imgSrc, title: info.title, audioUrl: info.audioUrl, autoplay });
}

function getNextHandle() {
  if (!currentHandle) return audioHandles[0];
  const idx = audioHandles.indexOf(currentHandle);
  if (idx === -1 || idx === audioHandles.length - 1) return audioHandles[0];
  return audioHandles[idx + 1];
}

function getPrevHandle() {
  if (!currentHandle) return audioHandles[0];
  const idx = audioHandles.indexOf(currentHandle);
  if (idx <= 0) return audioHandles[audioHandles.length - 1];
  return audioHandles[idx - 1];
}

function createStickyPlayer({ imgSrc, title, audioUrl, autoplay }) {
  document.getElementById('playku-sticky-player')?.remove();

  const player = document.createElement('div');
  player.id = 'playku-sticky-player';
  player.style = `
    position:fixed; left:0; right:0; bottom:0; z-index:9999; background:#181818; color:#fff;
    display:flex; align-items:center; gap:16px; padding:12px 24px; box-shadow:0 -2px 12px #0008;
    font-family:sans-serif; min-height:72px;
  `;

  const img = document.createElement('img');
  img.src = imgSrc;
  img.alt = title;
  img.style = 'width:56px;height:56px;object-fit:cover;border-radius:8px;box-shadow:0 2px 8px #0006;';
  player.appendChild(img);

  const info = document.createElement('div');
  info.style = 'flex:1 1 0; min-width:0;';
  info.innerHTML = `<div style="font-weight:bold;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">${title}</div>`;
  player.appendChild(info);

  const controls = document.createElement('div');
  controls.style = 'display:flex;align-items:center;gap:8px;';
  controls.innerHTML = `
    <button id="playku-prev" style="font-size:20px;background:none;border:none;color:#fff;cursor:pointer;">⏮️</button>
    <button id="playku-play" style="font-size:24px;background:none;border:none;color:#fff;cursor:pointer;">▶️</button>
    <button id="playku-next" style="font-size:20px;background:none;border:none;color:#fff;cursor:pointer;">⏭️</button>
  `;
  player.appendChild(controls);

  const waveform = document.createElement('div');
  waveform.id = 'playku-waveform';
  waveform.style = 'width:240px;height:48px;background:#222;border-radius:4px;';
  player.appendChild(waveform);

  const closeBtn = document.createElement('button');
  closeBtn.textContent = '✖';
  closeBtn.title = 'Close';
  closeBtn.style = 'margin-left:16px;font-size:20px;background:none;border:none;color:#fff;cursor:pointer;';
  closeBtn.onclick = () => {
    player.remove();
    if (waveSurferInstance) {
      waveSurferInstance.destroy();
      waveSurferInstance = null;
    }
    currentHandle = null;
    updateIconStates();
  };
  player.appendChild(closeBtn);

  document.body.appendChild(player);

  ensureWavesurferLoaded(() => {
    if (waveSurferInstance) {
      waveSurferInstance.destroy();
      waveSurferInstance = null;
    }
    waveSurferInstance = window.WaveSurfer.create({
      container: '#playku-waveform',
      waveColor: '#888',
      progressColor: '#fff',
      height: 48,
      barWidth: 2,
      responsive: true,
    });
    waveSurferInstance.load(audioUrl);

    const playBtn = document.getElementById('playku-play');
    playBtn.onclick = () => {
      waveSurferInstance.playPause();
    };
    document.getElementById('playku-prev').onclick = () => {
      playAudioByHandle(getPrevHandle(), true);
    };
    document.getElementById('playku-next').onclick = () => {
      playAudioByHandle(getNextHandle(), true);
    };

    waveSurferInstance.on('play', () => {
      playBtn.textContent = '⏸️';
      updateIconStates();
    });
    waveSurferInstance.on('pause', () => {
      playBtn.textContent = '▶️';
      updateIconStates();
    });
    waveSurferInstance.on('finish', () => {
      // Auto play next, loop if at end
      playAudioByHandle(getNextHandle(), true);
    });

    // Auto play if requested
    if (autoplay) {
      waveSurferInstance.once('ready', () => {
        waveSurferInstance.play();
      });
    } else {
      playBtn.textContent = '▶️';
      updateIconStates();
    }
  });
}

function getThemeNameFromScript() {
    // Look for the script tag with data-theme-name
    const script = document.querySelector('script[data-theme-name]');
    
    return script ? script.getAttribute('data-theme-name') : null;
  }

  async function init() {
    try {
      const themeName = getThemeNameFromScript();
      if (!themeName) {
        console.warn("[PlayKu] Could not find theme name on page.");
        return;
      }

      // POST to proxy with theme name
      const res = await fetch("/apps/playku", {
        method: "POST",
        headers: { "Content-Type": "application/json", Accept: "application/json" },
        body: JSON.stringify({ theme: themeName }),
      });
      
      const { themeConfig, audioData } = await res.json();

      // Save audioData and handles for playlist logic
      audioDataRef = audioData || {};
      audioHandles = Object.keys(audioDataRef);

      // Use selectors from themeConfig
      let selectors = [];
      try {
        selectors = JSON.parse(themeConfig.productImageSelectors);
      } catch {
        selectors = [];
      }
      
      const seen = new Set();

      selectors.forEach(selector => {
        document.querySelectorAll(selector).forEach(img => {
          const wrapper =
            img.closest(".card-wrapper, .product-card-wrapper, .product-card, .grid__item") || img.parentElement;
          if (!wrapper || wrapper.querySelector(`.${ICON_CLASS}`)) return;

          // Try to find product handle via closest anchor tag
          const link = wrapper.querySelector("a[href*='/products/']");
          if (!link) return;

          const match = link.getAttribute("href").match(/\/products\/([^/?#]+)/);
          const handle = match?.[1];
          if (!handle || seen.has(handle)) return;

          const audioInfo = audioData?.[handle];
          if (!audioInfo || !audioInfo.audioUrl) return;

          if (getComputedStyle(wrapper).position === "static") {
            wrapper.style.position = "relative";
          }

          wrapper.appendChild(createIcon(handle, audioInfo.title, audioInfo.audioUrl));
          seen.add(handle);
        });
      });
    } catch (err) {
      console.warn("[PlayKu] Failed to fetch or inject play icons", err);
    }
  }

  // Inject wavesurfer.js if not present
  function ensureWavesurferLoaded(cb) {
    if (window.WaveSurfer) return cb();
    const script = document.createElement('script');
    script.src = 'https://unpkg.com/wavesurfer.js';
    script.onload = cb;
    document.head.appendChild(script);
  }

  init();
})();

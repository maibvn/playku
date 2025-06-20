(function () {
  if (window.PlayKuInjected) return;
  window.PlayKuInjected = true;

  const ICON_CLASS = "playku-play-icon";
  const PLAYLIST_KEY = "playku:playlist";
  const CURRENT_HANDLE_KEY = "playku:currentHandle";
  const CURRENT_TIME_KEY = "playku:currentTime";

  const SELECTORS = [
    "a[href*='/products/'] img",
    "div[data-product-id] img",
    ".product-card-wrapper img",
    "img[data-src*='/products/']",
    "img[src*='/products/']",
  ];

  const findProductHandle = (el) => {
    const link =
      el.closest("a[href*='/products/']") ||
      Array.from(el.parentNode?.querySelectorAll("a[href*='/products/']") || []).find(
        (a) => a.contains(el) || el.contains(a) || a === el.nextElementSibling || a === el.previousElementSibling
      );
    return link?.href?.split("/products/")[1]?.split("?")[0]?.replace("/", "") || null;
  };

  const createIcon = (handle) => {
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
      window.PlayKuPlayer.playByHandle(handle);
    };
    return btn;
  };

  async function addPlayIcons() {
  const images = new Set();
  const seenHandles = new Set();
  const handleToWrapper = new Map();

  SELECTORS.forEach((selector) => {
    document.querySelectorAll(selector).forEach((img) => {
      if (img instanceof HTMLImageElement) images.add(img);
    });
  });

  for (const img of images) {
    const wrapper =
      img.closest("a[href*='/products/'], .card, .product-card, .product-grid-item, .grid__item") || img.parentNode;
    if (!wrapper || wrapper.querySelector("." + ICON_CLASS)) continue;

    const handle = findProductHandle(wrapper);
    if (!handle || seenHandles.has(handle)) continue;

    seenHandles.add(handle);
    handleToWrapper.set(handle, wrapper);
  }

  // Parallel fetch all audio URLs
  const results = await Promise.all(
    Array.from(handleToWrapper.keys()).map(async (handle) => {
      try {
        const res = await fetch(`/apps/playku/${handle}`);
        const data = await res.json();
        return { handle, audioUrl: data.audioUrl };
      } catch {
        return { handle, audioUrl: null };
      }
    })
  );

  results.forEach(({ handle, audioUrl }) => {
    if (!audioUrl) return;
    const wrapper = handleToWrapper.get(handle);
    if (!wrapper) return;

    if (getComputedStyle(wrapper).position === "static") {
      wrapper.style.position = "relative";
    }

    wrapper.appendChild(createIcon(handle));
  });

  buildPlaylistFromIcons();
}


  const buildPlaylistFromIcons = () => {
    const icons = document.querySelectorAll(`.${ICON_CLASS}`);
    const playlist = [];

    icons.forEach((icon) => {
      const wrapper =
        icon.closest("a[href*='/products/'], .card, .product-card, .product-grid-item, .grid__item") || icon.parentNode;
      const handle = findProductHandle(wrapper);
      if (handle && !playlist.some((p) => p.handle === handle)) {
        playlist.push({ handle });
      }
    });

    window.PlayKuPlaylist.setPlaylist(playlist);
  };

  const loadWaveSurferScript = (cb) => {
    if (window.WaveSurfer) return cb();
    const s = document.createElement("script");
    s.src = "https://unpkg.com/wavesurfer.js";
    s.onload = cb;
    document.head.appendChild(s);
  };

  const ensureStickyPlayer = () => {
    let el = document.getElementById("playku-sticky-player");
    if (!el) {
      el = document.createElement("div");
      el.id = "playku-sticky-player";
      Object.assign(el.style, {
        position: "fixed",
        left: 0,
        right: 0,
        bottom: 0,
        zIndex: 9999,
        background: "#181818",
        color: "#fff",
        padding: "12px 24px",
        display: "flex",
        alignItems: "center",
        gap: "12px",
        boxShadow: "0 -2px 8px rgba(0,0,0,0.2)",
        overflow: "hidden",
      });
      el.innerHTML = `
        <button id="playku-player-prev">⏮️</button>
        <button id="playku-player-playpause">⏸️</button>
        <button id="playku-player-next">⏭️</button>
        <span id="playku-player-title" style="min-width: 100px; flex: 0 0 auto;"></span>
        <div id="playku-player-waveform" style="flex: 0 0 60%; min-width: 200px;"></div>
      `;
      document.body.appendChild(el);
    }
    return el;
  };

  const playAudioInStickyPlayer = (url, title, handle) => {
    loadWaveSurferScript(() => {
      ensureStickyPlayer();
      document.getElementById("playku-player-title").textContent = title || handle;

      if (window._playkuWaveSurfer) window._playkuWaveSurfer.destroy();

      window._playkuWaveSurfer = WaveSurfer.create({
        container: "#playku-player-waveform",
        waveColor: "#fff",
        progressColor: "#1db954",
        height: 48,
        barWidth: 2,
        responsive: true,
        cursorColor: "#1db954",
      });

      window._playkuWaveSurfer.load(url);
      window._playkuWaveSurfer.once("ready", () => {
        const savedHandle = localStorage.getItem(CURRENT_HANDLE_KEY);
        const savedTime = parseFloat(localStorage.getItem(CURRENT_TIME_KEY) || "0");

        if (savedHandle === handle && savedTime > 0) {
          window._playkuWaveSurfer.setTime(savedTime);
          setTimeout(() => window._playkuWaveSurfer.play(), 300);
        } else {
          localStorage.removeItem(CURRENT_TIME_KEY);
          window._playkuWaveSurfer.play();
        }
      });

      const pp = document.getElementById("playku-player-playpause");
      pp.onclick = () => window._playkuWaveSurfer.playPause();
      window._playkuWaveSurfer.on("play", () => (pp.textContent = "⏸️"));
      window._playkuWaveSurfer.on("pause", () => (pp.textContent = "▶️"));
      window._playkuWaveSurfer.on("audioprocess", () =>
        localStorage.setItem(CURRENT_TIME_KEY, window._playkuWaveSurfer.getCurrentTime())
      );
      window._playkuWaveSurfer.on("finish", () => {
        localStorage.removeItem(CURRENT_TIME_KEY);
        window.PlayKuPlaylist.playNext();
      });

      document.getElementById("playku-player-prev").onclick = () => window.PlayKuPlaylist.playPrev();
      document.getElementById("playku-player-next").onclick = () => window.PlayKuPlaylist.playNext();
    });
  };

  window.PlayKuPlaylist = {
    items: [],
    currentIndex: -1,
    setPlaylist(arr) {
      this.items = arr;
    },
    playByIndex(i) {
      if (i < 0 || i >= this.items.length) return;
      this.currentIndex = i;
      const { handle } = this.items[i];
      window.PlayKuPlayer.playByHandle(handle);
    },
    playNext() {
      this.playByIndex(this.currentIndex + 1);
    },
    playPrev() {
      this.playByIndex(this.currentIndex - 1);
    },
    findIndexByHandle(h) {
      return this.items.findIndex((x) => x.handle === h);
    },
  };

  window.PlayKuPlayer = {
    async playByHandle(handle) {
      const idx = window.PlayKuPlaylist.findIndexByHandle(handle);
      if (idx !== -1) window.PlayKuPlaylist.currentIndex = idx;

      try {
        const res = await fetch(`/apps/playku/${handle}`);
        const data = await res.json();
        if (data.audioUrl) {
          localStorage.setItem(CURRENT_HANDLE_KEY, handle);
          playAudioInStickyPlayer(data.audioUrl, data.title || handle, handle);

          document.querySelectorAll("." + ICON_CLASS).forEach((icon) => {
            const wrapper =
              icon.closest("a[href*='/products/'], .card, .product-card, .product-grid-item, .grid__item") ||
              icon.parentNode;
            const h = findProductHandle(wrapper);
            icon.textContent = h === handle ? "⏸️" : "▶️";
          });
        }
      } catch (e) {
        console.warn("PlayKu: failed to play by handle", e);
      }
    },
  };

  const debounce = (fn, wait) => {
    let timeout;
    return (...args) => {
      clearTimeout(timeout);
      timeout = setTimeout(() => fn(...args), wait);
    };
  };

 const handleRouteChange = debounce(async () => {
  ensureStickyPlayer();
  document.querySelectorAll("." + ICON_CLASS).forEach((el) => el.remove());
  await addPlayIcons();

  const handle = localStorage.getItem(CURRENT_HANDLE_KEY);
  if (handle) {
    // Force play again to ensure sticky player is shown and synced
    window._playkuWaveSurfer?.destroy(); // Remove existing instance
    window._playkuWaveSurfer = null;
    window.PlayKuPlayer.playByHandle(handle);
  }
}, 250);


  window.addEventListener("popstate", handleRouteChange);
  window.addEventListener("pushState", handleRouteChange);
  window.addEventListener("PlayKu:forceReload", handleRouteChange);

  (function (history) {
    const pushState = history.pushState;
    history.pushState = function () {
      const result = pushState.apply(history, arguments);
      window.dispatchEvent(new Event("pushState"));
      return result;
    };
  })(window.history);

  const observer = new MutationObserver(() => addPlayIcons());
  observer.observe(document.body, { childList: true, subtree: true });

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", addPlayIcons);
  } else {
    addPlayIcons();
  }
})();

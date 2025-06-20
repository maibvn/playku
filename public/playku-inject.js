(function () {
  if (window.PlayKuInjected) return;
  window.PlayKuInjected = true;

  const ICON_CLASS = "playku-play-icon";

  function extractHandle(url) {
    return url?.split("/products/")[1]?.split("?")[0]?.replace("/", "") || null;
  }

  function findProductHandle(wrapper) {
    const link =
      wrapper.closest("a[href*='/products/']") ||
      Array.from(wrapper.parentNode?.querySelectorAll("a[href*='/products/']") || []).find(
        a => a.contains(wrapper) || wrapper.contains(a) || a === wrapper.nextElementSibling || a === wrapper.previousElementSibling
      );
    return link ? extractHandle(link.href) : null;
  }

  async function addPlayIcons() {
    const SELECTORS = [
      "a[href*='/products/'] img",
      "div[data-product-id] img",
      ".product-card-wrapper img",
      "img[data-src*='/products/']",
      "img[src*='/products/']",
    ];

    const images = new Set();
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
      if (!handle) continue;

      let audioUrl = null;
      try {
        const res = await fetch(`/apps/playku/${handle}`);
        const data = await res.json();
        audioUrl = data.audioUrl;
      } catch {
        continue;
      }

      if (!audioUrl) continue;

      const icon = document.createElement("button");
      icon.className = ICON_CLASS;
      icon.innerHTML = "▶️";
      Object.assign(icon.style, {
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

      icon.onclick = (e) => {
        e.stopPropagation();
        window.PlayKuPlayer.playByHandle(handle);
      };

      if (window.getComputedStyle(wrapper).position === "static") {
        wrapper.style.position = "relative";
      }

      wrapper.appendChild(icon);
    }

    buildPlaylistFromDOM();
  }

  function buildPlaylistFromDOM() {
    const icons = document.querySelectorAll(`.${ICON_CLASS}`);
    const playlist = [];

    icons.forEach((icon) => {
      const wrapper =
        icon.closest("a[href*='/products/'], .card, .product-card, .product-grid-item, .grid__item") || icon.parentNode;
      const handle = findProductHandle(wrapper);
      if (handle && !playlist.find((p) => p.handle === handle)) {
        playlist.push({ handle });
      }
    });

    window.PlayKuPlaylist.setPlaylist(playlist);
  }

  const observer = new MutationObserver(addPlayIcons);
  observer.observe(document.body, { childList: true, subtree: true });

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", addPlayIcons);
  } else {
    addPlayIcons();
  }

  function loadWaveSurferScript(callback) {
    if (window.WaveSurfer) return callback();
    const script = document.createElement("script");
    script.src = "https://unpkg.com/wavesurfer.js";
    script.onload = callback;
    document.head.appendChild(script);
  }

  function ensureStickyPlayer() {
    let player = document.getElementById("playku-sticky-player");
    if (!player) {
      player = document.createElement("div");
      player.id = "playku-sticky-player";
      Object.assign(player.style, {
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
      player.innerHTML = `
        <button id="playku-player-prev">⏮️</button>
        <button id="playku-player-playpause">⏸️</button>
        <button id="playku-player-next">⏭️</button>
        <span id="playku-player-title" style="min-width: 100px; flex: 0 0 auto;"></span>
        <div id="playku-player-waveform" style="flex: 0 0 60%; min-width: 200px;"></div>
      `;
      document.body.appendChild(player);
    }
    return player;
  }

  window.playAudioInStickyPlayer = function (audioUrl, title, handle) {
    loadWaveSurferScript(() => {
      const player = ensureStickyPlayer();
      document.getElementById("playku-player-title").textContent = title || "";

      if (window._playkuWaveSurfer) {
        window._playkuWaveSurfer.destroy();
      }

      window._playkuWaveSurfer = WaveSurfer.create({
        container: "#playku-player-waveform",
        waveColor: "#fff",
        progressColor: "#1db954",
        height: 48,
        barWidth: 2,
        responsive: true,
        cursorColor: "#1db954",
      });

      window._playkuWaveSurfer.load(audioUrl);
      window._playkuWaveSurfer.once("ready", () => {
        const savedHandle = localStorage.getItem("playku:currentHandle");
        const savedTime = parseFloat(localStorage.getItem("playku:currentTime") || "0");
        if (savedHandle === handle && savedTime > 0) {
          window._playkuWaveSurfer.setTime(savedTime);
          // Play after seek, but also set a fallback in case "seek" doesn't fire
          let played = false;
          const playNow = () => {
            if (!played) {
              played = true;
              window._playkuWaveSurfer.play();
            }
          };
          window._playkuWaveSurfer.once("seek", playNow);
          setTimeout(playNow, 300); // fallback if "seek" doesn't fire
        } else {
          localStorage.removeItem("playku:currentTime");
          window._playkuWaveSurfer.play();
        }
      });

      const pp = document.getElementById("playku-player-playpause");
      pp.onclick = () => window._playkuWaveSurfer.playPause();
      window._playkuWaveSurfer.on("play", () => { pp.textContent = "⏸️"; });
      window._playkuWaveSurfer.on("pause", () => { pp.textContent = "▶️"; });
      window._playkuWaveSurfer.on("audioprocess", () => {
        localStorage.setItem("playku:currentTime", window._playkuWaveSurfer.getCurrentTime());
      });
      window._playkuWaveSurfer.on("finish", () => {
        localStorage.removeItem("playku:currentTime");
        window.PlayKuPlaylist.playNext();
      });

      document.getElementById("playku-player-prev").onclick = () => window.PlayKuPlaylist.playPrev();
      document.getElementById("playku-player-next").onclick = () => window.PlayKuPlaylist.playNext();
    });
  };

  window.PlayKuPlaylist = {
    items: [],
    currentIndex: -1,
    setPlaylist(products) {
      this.items = products;
    },
    playByIndex(idx) {
      if (idx < 0 || idx >= this.items.length) return;
      this.currentIndex = idx;
      const { handle } = this.items[idx];
      window.PlayKuPlayer.playByHandle(handle);
    },
    playNext() {
      this.playByIndex(this.currentIndex + 1);
    },
    playPrev() {
      this.playByIndex(this.currentIndex - 1);
    },
    findIndexByHandle(handle) {
      return this.items.findIndex((item) => item.handle === handle);
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
          localStorage.setItem("playku:currentHandle", handle);
          playAudioInStickyPlayer(data.audioUrl, data.title || handle, handle);

          document.querySelectorAll(".playku-play-icon").forEach((icon) => {
            const wrapper = icon.closest("a[href*='/products/'], .card, .product-card, .product-grid-item, .grid__item") || icon.parentNode;
            const h = findProductHandle(wrapper);
            icon.innerHTML = h === handle ? "⏸️" : "▶️";
          });
        }
      } catch (e) {
        console.warn("PlayKu error", e);
      }
    }
  };

  // Detect route change and re-run
  async function handleRouteChange() {
    setTimeout(async () => {
      // Always ensure sticky player exists
      ensureStickyPlayer();

      // Remove old play icons and rebuild playlist
      document.querySelectorAll(".playku-play-icon").forEach((el) => el.remove());
      await addPlayIcons(); // This will also rebuild the playlist

      // Resume playback if there was a track playing
      const handle = localStorage.getItem("playku:currentHandle");
      if (handle) window.PlayKuPlayer.playByHandle(handle);
    }, 300);
  }

  window.addEventListener("popstate", handleRouteChange);
  window.addEventListener("pushState", handleRouteChange);
  window.addEventListener("PlayKu:forceReload", handleRouteChange);

  (function (history) {
    const pushState = history.pushState;
    history.pushState = function (state) {
      if (typeof history.onpushstate === "function") {
        history.onpushstate({ state });
      }
      const result = pushState.apply(history, arguments);
      window.dispatchEvent(new Event("pushState"));
      return result;
    };
  })(window.history);
})();
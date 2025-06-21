(function () {
  console.log("trying hard 5");

  if (window.PlayKuInjected) return;
  window.PlayKuInjected = true;

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
      alert(`Play "${title}" from: ${audioUrl}`);
    };
    return btn;
  };

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

      // Use selectors from themeConfig
      let selectors = [];
      try {
        selectors = JSON.parse(themeConfig.productImageSelectors);
      } catch {
        selectors = [];
      }
      console.log("[PlayKu] Fetched audio data", audioData, "with selectors", selectors);
      
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

  init();
})();

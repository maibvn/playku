(function () {
  if (window.PlayKuInjected) return;
  window.PlayKuInjected = true;

  const ICON_CLASS = "playku-play-icon";

  function addPlayIcons() {
    const SELECTORS = [
      "a[href*='/products/'] img",              // Most common
      "div[data-product-id] img",              // Modern theme cards
      ".product-card-wrapper img",             // Dawn/Impulse
      "img[data-src*='/products/']",
      "img[src*='/products/']"
    ];

    const found = new Set();
    SELECTORS.forEach((selector) => {
      document.querySelectorAll(selector).forEach((img) => found.add(img));
    });

    console.log("PlayKu: Found", found.size, "images");

    found.forEach((img) => {
      if (!(img instanceof HTMLImageElement)) return;

      // Find the best wrapper (product link or card)
      const wrapper = img.closest("a[href*='/products/'], .card, .product-card, .product-grid-item, .grid__item") || img.parentNode;
      if (!wrapper || wrapper.querySelector("." + ICON_CLASS)) return;

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

        // Try to find the product link: first look for a parent, then for a sibling
        let link = wrapper.closest("a[href*='/products/']");
        
        if (!link) {
          // Try to find a sibling link in the same parent node
          link = Array.from(wrapper.parentNode.querySelectorAll("a[href*='/products/']")).find(
            a => a.contains(wrapper) || wrapper.contains(a) || a === wrapper.nextElementSibling || a === wrapper.previousElementSibling
          );
        }
        // console.log("PlayKu: Found link", link);
        console.log(123, link.href.split("/products/")[1]?.split("?")[0]?.replace("/", ""))

        let productHandle = null;
        if (link) {
          productHandle = link.href.split("/products/")[1]?.split("?")[0]?.replace("/", "");
        }

        if (window.PlayKuPlayer && productHandle) {
          window.PlayKuPlayer.playByHandle(productHandle);
        } else {
          console.warn("PlayKu: Could not extract product handle", { wrapper, link });
        }
      };

      // Ensure wrapper has position relative
      if (window.getComputedStyle(wrapper).position === "static") {
        wrapper.style.position = "relative";
      }

      wrapper.appendChild(icon);
    });
  }

  // Wait for DOM
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", addPlayIcons);
  } else {
    addPlayIcons();
  }

  // Watch DOM changes (AJAX, filtering, lazy load, infinite scroll)
  const observer = new MutationObserver(() => {
    addPlayIcons();
  });

  observer.observe(document.body, {
    childList: true,
    subtree: true,
  });
})();

window.PlayKuPlayer = {
  async playByHandle(handle) {
    // Call your app proxy endpoint
    const res = await fetch(`/apps/playku/${handle}`);
    const data = await res.json();
    console.log(123, data);
    if (data.audioUrl) {
      // Load and play the audio using your sticky player logic
      playAudioInStickyPlayer(data.audioUrl, handle);
    } else {
      alert("Audio not found for this product.");
    }
  }
};

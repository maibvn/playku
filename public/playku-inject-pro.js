// (function () {
//   if (window.PlayKuInjected) return;
//   window.PlayKuInjected = true;

//   const ICON_CLASS = "playku-play-icon";
//   const SELECTORS = [
//     "a[href*='/products/'] img",
//     "div[data-product-id] img",
//     ".product-card-wrapper img",
//     "img[data-src*='/products/']",
//     "img[src*='/products/']",
//   ];

//   const getProductHandle = (el) => {
//     const anchor =
//       el.closest("a[href*='/products/']") ||
//       Array.from(el.parentNode?.querySelectorAll("a[href*='/products/']") || []).find(
//         (a) =>
//           a.contains(el) ||
//           el.contains(a) ||
//           a === el.nextElementSibling ||
//           a === el.previousElementSibling
//       );

//     const href = anchor?.getAttribute("href");
//     return href?.match(/\/products\/([^/?#]+)/)?.[1] || null;
//   };

//   const createIcon = (handle, title, audioUrl) => {
//     const btn = document.createElement("button");
//     btn.className = ICON_CLASS;
//     btn.textContent = "▶️";
//     Object.assign(btn.style, {
//       position: "absolute",
//       top: "8px",
//       left: "8px",
//       background: "rgba(0,0,0,0.5)",
//       color: "#fff",
//       border: "none",
//       borderRadius: "50%",
//       width: "32px",
//       height: "32px",
//       display: "flex",
//       alignItems: "center",
//       justifyContent: "center",
//       cursor: "pointer",
//       zIndex: "10",
//     });
//     btn.onclick = (e) => {
//       e.stopPropagation();
//       console.log("should play the song");
//       alert(`Play "${title}" from: ${audioUrl}`);
//     };
//     return btn;
//   };

//   async function init() {
//     try {
//       const res = await fetch("/apps/playku", {
//         headers: { Accept: "application/json" },
//       });
//       const audioData = await res.json();
//       console.log("PlayKu: fetched audio data", audioData);

//       const allImages = new Set();
//       SELECTORS.forEach((selector) => {
//         document.querySelectorAll(selector).forEach((img) => {
//           if (img instanceof HTMLImageElement) allImages.add(img);
//         });
//       });

//       const seenHandles = new Set();

//       for (const handle of Object.keys(audioData)) {
//         const { audioUrl, title } = audioData[handle];
//         if (!audioUrl) continue;

//         for (const img of allImages) {
//           const imgHandle = getProductHandle(img);
//           if (imgHandle !== handle || seenHandles.has(handle)) continue;

//           const wrapper =
//             img.closest("a[href*='/products/'], .card, .product-card, .product-grid-item, .grid__item") ||
//             img.parentNode;
//           if (!wrapper || wrapper.querySelector("." + ICON_CLASS)) continue;

//           if (getComputedStyle(wrapper).position === "static") {
//             wrapper.style.position = "relative";
//           }

//           wrapper.appendChild(createIcon(handle, title, audioUrl));
//           seenHandles.add(handle);
//           break; // only once per handle
//         }
//       }
//     } catch (e) {
//       console.warn("PlayKu: failed to fetch or inject icons", e);
//     }
//   }

//   init();
// })();

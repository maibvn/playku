# 📦 PlayKu Shopify App - Requirements

## 🎯 Overview

**PlayKu** is a Shopify embedded app that enhances storefronts selling sound kits, sample packs, or audio-based products. It provides an audio preview experience by integrating a play icon directly on product images and offering a sticky, persistent audio player with waveform visualization and playlist support.

---

## 🧩 Features

### 1. **Play Icon Overlay**

- Automatically adds a play icon on top of all product images.
- Clicking the icon:
  - Plays the associated product audio.
  - Opens a **sticky bottom player**.
  - Adds the product to the playlist (if not already there).

### 2. **Sticky Audio Player**

- Fixed at the bottom of the page.
- Displays current track details and waveform using **WaveSurfer.js**.
- Controls: play/pause, next/previous, seek.
- Auto-plays the next product audio after the current one ends.

### 3. **Playlist Drawer**

- Toggle button to open/close playlist.
- Playlist auto-generated from **all currently visible products** on the page.
- User can select any track to play from the list.

### 4. **Audio Management for Store Owners**

- Admin UI to upload or set audio preview URLs for products.
- Audio data stored in **app-owned metafields** and mirrored in local SQL via **Prisma**.

### 5. **State Persistence**

- Playback state, current track, and playlist stored in **`localStorage`**.
- Restores session after navigation or page refresh.

### 6. **Theme Compatibility**

- Works with **all Shopify themes**, including Dawn.
- Injected JS and styles are scoped to avoid conflicts.

---

## 🧰 Tech Stack

| Area             | Tool / Library                  |
| ---------------- | ------------------------------- |
| Framework        | Remix                           |
| Authentication   | Shopify App Bridge              |
| Database         | Prisma + local SQL (SQLite/dev) |
| API              | Shopify Admin GraphQL API       |
| Audio Player     | WaveSurfer.js                   |
| Frontend Storage | `localStorage`                  |
| Injection        | ScriptTag API                   |

---

## 🛠️ Architecture & Flow

### Merchant Side (Admin)

- Embedded Remix interface.
- Product table with audio preview management.
- GraphQL used to fetch products and update metafields.
- Audio URLs stored in:
  - Shopify Files or external host
  - App-owned metafield: `namespace: app--{appId}`, `key: audio_url`
  - Local SQL via Prisma

### Storefront Side (Injected Script)

- ScriptTag injects a `playku.js` script into the storefront.
- Script finds all product images and overlays a play icon.
- When clicked:
  - Initializes sticky player and WaveSurfer.
  - Loads product audio.
  - Adds it to the session playlist.
- Sticky player component is appended to `<body>` and persists across page views via `localStorage`.

---

## 🧪 Testing & Compatibility

- Test with:
  - Dawn theme
  - At least one third-party popular theme
- Ensure:
  - No DOM clashes with existing theme elements
  - All product audio plays correctly
  - Playlist works and advances automatically

---

## 🚀 Deployment Notes

- Use Shopify CLI with Remix template.
- Ensure `app_proxy` or `script_tag` permissions are included.
- Handle GraphQL metafield permissions explicitly in `shopify.app.toml`.

---

## 📝 Future Enhancements (Optional)

- Volume control
- Custom waveform color per theme
- Drag-n-drop playlist sorting
- Support for variants with separate audios

---

## 🧾 Author Notes

This document ensures Copilot and contributors always understand the scope and responsibilities of the PlayKu app. Keep this file updated as features grow.

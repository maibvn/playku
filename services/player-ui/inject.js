// Example logic in inject.js
document.querySelectorAll(".product-card img").forEach((img) => {
  const icon = document.createElement("button");
  icon.className = "playku-play-icon";
  icon.onclick = () => window.PlayKuPlayer.play(img.dataset.productId);
  img.parentNode.appendChild(icon);
});

import { useState } from "react";
import IconParser from "./IconParser";
import "./PlayerPreview.css";

export default function ProductGrid({ 
  demoProducts, 
  settings, 
  currentIdx, 
  isPlaying, 
  onProductClick,
  onPlayPauseClick 
}) {
  const [iconPlayOnProduct, iconPauseOnProduct] = settings.iconOnProduct.split(",");

  return (
    <div className="playku-product-grid">
      {demoProducts.map((product, idx) => (
        <div key={product.audioUrl} className="playku-product-item">
          <div
            className={
              "playku-product-img-wrap" +
              (settings.showPlayIconOnImage ? "" : " playku-img-hover-group")
            }
          >
            <img
              src={product.image}
              alt={product.title}
              className="playku-product-img"
            />
            <span
              className="playku-product-img-icon"
              style={{
                ...getIconPositionStyle(settings.iconPosition),
                backgroundColor: settings.iconOnProductBgColor,
                display: settings.showPlayIconOnImage ||
                  (idx === currentIdx && isPlaying) ? "flex" : "none",
                opacity: settings.playerBgOpacity,
                width: settings.iconOnProductSize,
                height: settings.iconOnProductSize,
              }}
              onClick={() => {
                if (idx === currentIdx) {
                  onPlayPauseClick();
                } else {
                  onProductClick(idx);
                }
              }}
            >
              {idx === currentIdx && isPlaying ? (
                <IconParser
                  iconKey={iconPauseOnProduct}
                  color={settings.iconOnProductColor}
                  size={settings.iconOnProductSize - 10}
                />
              ) : (
                <IconParser
                  iconKey={iconPlayOnProduct}
                  color={settings.iconOnProductColor}
                  size={settings.iconOnProductSize - 10}
                />
              )}
            </span>
          </div>
          <div className="playku-product-title">{product.title}</div>
        </div>
      ))}
    </div>
  );
}

function getIconPositionStyle(position) {
  switch (position) {
    case "center":
      return {
        top: "50%",
        left: "50%",
        transform: "translate(-50%, -50%)",
        right: "auto",
        bottom: "auto",
      };
    case "top-left":
      return { top: 8, left: 8, right: "auto", bottom: "auto", transform: "none" };
    case "top-right":
      return { top: 8, right: 8, left: "auto", bottom: "auto", transform: "none" };
    case "bottom-left":
      return { bottom: 8, left: 8, top: "auto", right: "auto", transform: "none" };
    case "bottom-right":
      return { bottom: 8, right: 8, top: "auto", left: "auto", transform: "none" };
    default:
      return { top: 8, left: 8, right: "auto", bottom: "auto", transform: "none" };
  }
}

"use client";

import { useRef, useState } from "react";
import CmsImage from "./CmsImage";
import { nextSlideIndex } from "@/lib/case-study-showcase";
import type { CmsImage as CmsImageData } from "@/lib/cms-types";

export default function PhotoSlider({
  heading,
  images,
}: {
  heading: string;
  images: CmsImageData[];
}) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const touchStartX = useRef<number | null>(null);
  const currentImage = images[currentIndex];

  function move(direction: -1 | 1) {
    setCurrentIndex((index) => nextSlideIndex(index, images.length, direction));
  }

  if (!currentImage) return null;

  return (
    <section
      className="case-study-showcase-block showcase-photo-slider"
      aria-label={heading || "Photo slider"}
      tabIndex={0}
      onKeyDown={(event) => {
        if (event.key === "ArrowLeft") {
          event.preventDefault();
          move(-1);
        }
        if (event.key === "ArrowRight") {
          event.preventDefault();
          move(1);
        }
      }}
      onTouchStart={(event) => {
        touchStartX.current = event.touches[0]?.clientX ?? null;
      }}
      onTouchEnd={(event) => {
        if (touchStartX.current === null) return;
        const endX = event.changedTouches[0]?.clientX ?? touchStartX.current;
        const distance = endX - touchStartX.current;
        touchStartX.current = null;
        if (Math.abs(distance) < 40) return;
        move(distance > 0 ? -1 : 1);
      }}
    >
      <div className="case-study-showcase-inner">
        {heading && <h2 className="showcase-heading">{heading}</h2>}
        <figure className="showcase-slider-figure">
          <div className="showcase-slider-media">
            <CmsImage
              image={currentImage}
              sizes="(max-width: 900px) 100vw, calc(100vw - 360px)"
            />
            <div className="showcase-slider-controls">
              <button type="button" onClick={() => move(-1)} aria-label="Previous image">
                <span aria-hidden="true">←</span>
              </button>
              <button type="button" onClick={() => move(1)} aria-label="Next image">
                <span aria-hidden="true">→</span>
              </button>
            </div>
          </div>
          {currentImage.caption && <figcaption>{currentImage.caption}</figcaption>}
        </figure>
        <p className="showcase-slider-counter" aria-live="polite">
          {currentIndex + 1} / {images.length}
        </p>
      </div>
    </section>
  );
}

"use client";

import Image from "next/image";
import { useRef, useState } from "react";
import CmsImage from "./CmsImage";
import type { CmsImage as CmsImageData } from "@/lib/cms-types";

export default function ShowcaseImage({ image, sizes }: { image: CmsImageData; sizes: string }) {
  const dialog = useRef<HTMLDialogElement>(null);
  const [opened, setOpened] = useState(false);

  return (
    <>
      <button
        type="button"
        className="showcase-image-trigger"
        aria-label={`Enlarge image: ${image.alt || "Project image"}`}
        onClick={() => {
          setOpened(true);
          dialog.current?.showModal();
        }}
      >
        <CmsImage image={image} sizes={sizes} loading="eager" />
      </button>
      <dialog
        ref={dialog}
        className="showcase-lightbox"
        aria-label={image.alt || "Enlarged project image"}
        onClose={() => setOpened(false)}
        onClick={(event) => {
          event.stopPropagation();
          if (event.target === event.currentTarget) dialog.current?.close();
        }}
        onKeyDown={(event) => event.stopPropagation()}
        onTouchStart={(event) => event.stopPropagation()}
        onTouchEnd={(event) => event.stopPropagation()}
      >
        <button type="button" className="showcase-lightbox-close" onClick={() => dialog.current?.close()}>
          Close <span aria-hidden="true">×</span>
        </button>
        {opened && (
          <Image
            src={image.url}
            alt={image.alt}
            width={image.width}
            height={image.height}
            unoptimized
          />
        )}
        <a href={image.url} target="_blank" rel="noopener noreferrer">Open original image ↗</a>
      </dialog>
    </>
  );
}

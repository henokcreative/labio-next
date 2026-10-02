import type { ComponentProps } from "react";
import BrandName from "./BrandName";
import CmsImage from "./CmsImage";

type BrandedCmsImageProps = Omit<ComponentProps<typeof CmsImage>, "className"> & {
  /** Applied to the image wrapper; use imageClassName for the image itself. */
  className?: string;
  imageClassName?: string;
  brandMark?: "light" | "dark" | false;
  watermarkPosition?: "bottom-left" | "bottom-right";
};

export default function BrandedCmsImage({
  className = "",
  imageClassName,
  brandMark = false,
  watermarkPosition = "bottom-left",
  ...imageProps
}: BrandedCmsImageProps) {
  return (
    <div className={`branded-cms-image ${className}`.trim()}>
      <CmsImage {...imageProps} className={imageClassName} />
      {brandMark && (
        <div className={`branded-cms-image-mark branded-cms-image-mark-${watermarkPosition}`} aria-hidden="true">
          <BrandName variant={brandMark} />
        </div>
      )}
    </div>
  );
}

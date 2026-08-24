import Image from "next/image";
import type { CmsImage as CmsImageData } from "@/lib/cms-types";

type CmsImageProps = {
  image: CmsImageData;
  className?: string;
  priority?: boolean;
  sizes?: string;
  loading?: "eager" | "lazy";
};

export default function CmsImage({
  image,
  className,
  priority = false,
  sizes,
  loading,
}: CmsImageProps) {
  return (
    <Image
      src={image.url}
      alt={image.alt}
      width={image.width}
      height={image.height}
      className={className}
      priority={priority}
      sizes={sizes}
      loading={loading}
    />
  );
}

import Image from "next/image";

// next/image wrapper: SVG placeholders are served as-is (the optimizer
// doesn't process SVG), real JPG/WebP thumbnails get optimized.
export default function Thumb({ src, alt = "", className, sizes = "(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw", priority }) {
  return (
    <Image
      src={src}
      alt={alt}
      fill
      sizes={sizes}
      priority={priority}
      unoptimized={src.endsWith(".svg")}
      className={className}
    />
  );
}

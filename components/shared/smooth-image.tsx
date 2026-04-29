"use client";

import { useMemo, useState, type SyntheticEvent } from "react";
import Image, { type ImageProps } from "next/image";
import { cn } from "@/lib/utils";

const DEFAULT_BLUR_DATA_URL = `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" preserveAspectRatio="none">
    <defs>
      <linearGradient id="g" x1="0" y1="0" x2="1" y2="1">
        <stop stop-color="#f8fafc" />
        <stop offset="1" stop-color="#e7ede9" />
      </linearGradient>
    </defs>
    <rect width="64" height="64" fill="url(#g)" />
  </svg>`
)}`;

type SmoothImageProps = ImageProps & {
  fadeDurationMs?: number;
};

export function SmoothImage({
  alt,
  blurDataURL,
  className,
  fadeDurationMs = 320,
  onLoad,
  placeholder,
  quality = 75,
  style,
  ...props
}: SmoothImageProps) {
  const [isLoaded, setIsLoaded] = useState(false);
  const [hasError, setHasError] = useState(false);

  const isRemoteUrl = useMemo(() => {
    if (typeof props.src !== "string") {
      return false;
    }

    return props.src.startsWith("http://") || props.src.startsWith("https://");
  }, [props.src]);

  const handleLoad = (event: SyntheticEvent<HTMLImageElement, Event>) => {
    setIsLoaded(true);
    onLoad?.(event);
  };

  if (hasError) {
    return (
      <span
        aria-hidden="true"
        className={cn("block bg-muted/70", className)}
        style={style}
      />
    );
  }

  return (
    <Image
      {...props}
      alt={alt}
      blurDataURL={blurDataURL ?? DEFAULT_BLUR_DATA_URL}
      className={cn(
        "transform-gpu transition-[opacity,transform,filter] ease-[cubic-bezier(0.22,1,0.36,1)] will-change-transform",
        isLoaded ? "scale-100 opacity-100 blur-0" : "scale-[1.01] opacity-0 blur-[1px]",
        className
      )}
      onLoad={handleLoad}
      onError={() => setHasError(true)}
      placeholder={placeholder ?? "blur"}
      quality={quality}
      unoptimized={props.unoptimized ?? isRemoteUrl}
      style={{ ...style, transitionDuration: `${fadeDurationMs}ms` }}
    />
  );
}

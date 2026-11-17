import type { CSSProperties } from "react";
import { getImageProps, type ImageProps } from "next/image";
import { preload } from "react-dom";

function escapeAttribute(value: string) {
  return value.replace(/&/g, "&amp;").replace(/"/g, "&quot;").replace(/</g, "&lt;");
}

function cssText(style: CSSProperties | undefined) {
  if (!style) return "";
  return Object.entries(style)
    .filter(([, value]) => value !== undefined && value !== null)
    .map(([key, value]) => `${key.replace(/[A-Z]/g, (letter) => `-${letter.toLowerCase()}`)}:${value}`)
    .join(";");
}

type PriorityImageProps = Omit<ImageProps, "preload" | "priority" | "loading"> & {
  className?: string;
  wrapperClassName?: string;
};

/** Renders the LCP image with a literal fetchpriority attribute. React 19 serializes the fetchPriority prop as camelCase, which Lighthouse does not treat as the HTML attribute. */
export function PriorityImage({ className, wrapperClassName, alt, ...props }: PriorityImageProps) {
  const { props: image } = getImageProps({ ...props, alt, preload: true, loading: "eager", fetchPriority: "high" });
  if (typeof window === "undefined" && image.src) {
    preload(image.src, {
      as: "image",
      fetchPriority: "high",
      imageSrcSet: image.srcSet,
      imageSizes: image.sizes,
    });
  }
  const attributes = [
    `alt="${escapeAttribute(String(image.alt ?? ""))}"`,
    image.src ? `src="${escapeAttribute(String(image.src))}"` : "",
    image.srcSet ? `srcset="${escapeAttribute(String(image.srcSet))}"` : "",
    image.sizes ? `sizes="${escapeAttribute(String(image.sizes))}"` : "",
    image.width ? `width="${image.width}"` : "",
    image.height ? `height="${image.height}"` : "",
    className ? `class="${escapeAttribute(className)}"` : "",
    `fetchpriority="high"`,
    `loading="eager"`,
    `decoding="async"`,
    image.style ? `style="${escapeAttribute(cssText(image.style))}"` : "",
  ].filter(Boolean);
  const markup = `<img ${attributes.join(" ")} />`;
  if (!wrapperClassName) return <span className="priority-image" dangerouslySetInnerHTML={{ __html: markup }} />;
  return <div className={wrapperClassName} dangerouslySetInnerHTML={{ __html: markup }} />;
}

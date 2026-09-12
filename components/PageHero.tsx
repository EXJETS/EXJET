import Image from "next/image";
import type { CSSProperties } from "react";

type PageHeroProps = {
  eyebrow: string;
  title: React.ReactNode;
  copy: string;
  image?: string;
  imageAlt?: string;
  imageWidth?: number;
  imageHeight?: number;
  imagePosition?: string;
  mobileImagePosition?: string;
  dark?: boolean;
  children?: React.ReactNode;
};

export function PageHero({
  eyebrow,
  title,
  copy,
  image,
  imageAlt = "",
  imageWidth = 1920,
  imageHeight = 1280,
  imagePosition = "center",
  mobileImagePosition,
  dark = false,
  children,
}: PageHeroProps) {
  const heroStyle = image
    ? ({
        "--page-hero-position": imagePosition,
        "--page-hero-position-mobile": mobileImagePosition ?? imagePosition,
        "--page-hero-photo-width": `${imageWidth}px`,
      } as CSSProperties)
    : undefined;

  return (
    <section
      className={`page-hero${dark ? " page-hero--dark" : ""}${image ? " page-hero--image" : ""}`}
      style={heroStyle}
    >
      <div className="shell page-hero__inner">
        <p className={`eyebrow${dark ? " eyebrow--light" : ""}`}>{eyebrow}</p>
        <h1>{title}</h1>
        <p className="page-hero__copy">{copy}</p>
        {children}
      </div>
      {image ? <div className="page-hero__photograph"><Image src={image} alt={imageAlt} width={imageWidth} height={imageHeight} priority sizes="(max-width: 1400px) 100vw, 1400px" /></div> : null}
    </section>
  );
}

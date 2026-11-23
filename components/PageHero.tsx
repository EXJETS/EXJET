import Image from "next/image";
import Link from "next/link";
import { ArrowUpRightIcon } from "@phosphor-icons/react/dist/ssr";
import type { CSSProperties } from "react";
import styles from "./PageHero.module.css";

type PageHeroProps = {
  eyebrow: string;
  heading?: string;
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
  eyebrow, heading, title, copy, image, imageAlt = "", imageWidth = 1920, imageHeight = 1280,
  imagePosition = "center", mobileImagePosition, dark = false, children,
}: PageHeroProps) {
  const visualStyle = { "--image-position": imagePosition, "--mobile-image-position": mobileImagePosition ?? imagePosition } as CSSProperties;
  return (
    <section className={`${styles.hero} ${dark ? styles.dark : ""}`}>
      <div className={styles.inner}>
        <div className={styles.copy}>
          <p className={styles.kicker}><span aria-hidden="true" />{eyebrow}</p>
          <h1>{heading || title}</h1>
          <p className={styles.summary}>{copy}</p>
        </div>
        {image ? <div className={styles.visual} style={visualStyle}><Image src={image} alt={imageAlt} width={imageWidth} height={imageHeight} priority sizes="(min-width: 900px) 45vw, 100vw" /></div> : null}
        <div className={styles.actions}>
          {children || <nav aria-label="Explore related options">
            <Link href="/charter/">Plan a charter <ArrowUpRightIcon size={16} aria-hidden="true" /></Link>
            <Link href="/routes/">Browse charter routes <ArrowUpRightIcon size={16} aria-hidden="true" /></Link>
          </nav>}
        </div>
      </div>
    </section>
  );
}

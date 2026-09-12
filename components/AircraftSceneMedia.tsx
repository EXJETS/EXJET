"use client";

import { TouchEvent, useEffect, useMemo, useState } from "react";
import { AircraftScene } from "@/data/aircraft";

type AircraftSceneMediaProps = {
  aircraftName: string;
  scene: AircraftScene;
  priority?: boolean;
};

export function hasAircraftSceneMedia(scene?: AircraftScene) {
  return Boolean(scene?.image || scene?.gallery?.length);
}

export function AircraftSceneMedia({ aircraftName, scene, priority = false }: AircraftSceneMediaProps) {
  const media = useMemo(
    () => scene.gallery?.length
      ? scene.gallery
      : scene.image
        ? [{
            image: scene.image,
            portraitImage: scene.portraitImage,
            focalPoint: scene.focalPoint,
          }]
        : [],
    [scene],
  );
  const [activeIndex, setActiveIndex] = useState(0);
  const [touchStart, setTouchStart] = useState<number | null>(null);

  useEffect(() => {
    if (media.length < 2 || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const timer = window.setInterval(() => {
      setActiveIndex((current) => (current + 1) % media.length);
    }, 5200);

    return () => window.clearInterval(timer);
  }, [media.length, scene.id, aircraftName]);

  const previous = () => setActiveIndex((current) => (current - 1 + media.length) % media.length);
  const next = () => setActiveIndex((current) => (current + 1) % media.length);

  const onTouchStart = (event: TouchEvent<HTMLElement>) => {
    setTouchStart(event.changedTouches[0]?.clientX ?? null);
  };

  const onTouchEnd = (event: TouchEvent<HTMLElement>) => {
    if (touchStart === null || media.length < 2) return;
    const end = event.changedTouches[0]?.clientX ?? touchStart;
    const distance = end - touchStart;
    if (Math.abs(distance) > 42) {
      if (distance > 0) previous();
      else next();
    }
    setTouchStart(null);
  };

  const active = media[activeIndex];
  if (!active) return null;

  return (
    <>
      <picture
        className="aircraft-scene-media"
        key={`${aircraftName}-${scene.id}-${active.image}`}
        onTouchStart={onTouchStart}
        onTouchEnd={onTouchEnd}
      >
        {active.portraitImage ? <source media="(max-width: 820px)" srcSet={active.portraitImage} /> : null}
        <img
          src={active.image}
          alt={active.alt ?? `${aircraftName} ${scene.label.toLowerCase()} view`}
          loading={priority ? "eager" : "lazy"}
          fetchPriority={priority ? "high" : "auto"}
          decoding="async"
          style={{
            objectFit: scene.fit ?? "cover",
            objectPosition: active.focalPoint ?? scene.focalPoint ?? "center",
          }}
        />
      </picture>
      {media.length > 1 ? (
        <div className="aircraft-scene-carousel" aria-label={`${scene.label} image controls`}>
          <button type="button" onClick={previous} aria-label={`Previous ${scene.label.toLowerCase()} image`}>←</button>
          <span aria-live="polite">{String(activeIndex + 1).padStart(2, "0")} / {String(media.length).padStart(2, "0")}</span>
          <button type="button" onClick={next} aria-label={`Next ${scene.label.toLowerCase()} image`}>→</button>
        </div>
      ) : null}
    </>
  );
}

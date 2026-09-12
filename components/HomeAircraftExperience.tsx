"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { ArrowIcon } from "@/components/ArrowIcon";
import { AircraftSceneMedia, hasAircraftSceneMedia } from "@/components/AircraftSceneMedia";
import { aircraft } from "@/data/aircraft";

const featuredSlugs = ["citation-x", "challenger-300", "citation-latitude"];

export function HomeAircraftExperience() {
  const options = useMemo(() => featuredSlugs.map((slug) => aircraft.find((item) => item.slug === slug)!), []);
  const [activeSlug, setActiveSlug] = useState(featuredSlugs[0]);
  const [activeScene, setActiveScene] = useState("exterior");
  const [zoomed, setZoomed] = useState(false);
  const selected = options.find((item) => item.slug === activeSlug) ?? options[0];
  const scene = selected.scenes.find((item) => item.id === activeScene) ?? selected.scenes[0];

  const selectAircraft = (slug: string) => {
    setActiveSlug(slug);
    setActiveScene("exterior");
    setZoomed(false);
  };

  return (
    <div className="aircraft-experience">
      <div className="aircraft-experience__rail" role="tablist" aria-label="Featured aircraft">
        {options.map((item, index) => (
          <button
            type="button"
            role="tab"
            aria-selected={item.slug === selected.slug}
            className={item.slug === selected.slug ? "is-active" : ""}
            onClick={() => selectAircraft(item.slug)}
            key={item.slug}
          >
            <span>0{index + 1}</span>
            <strong>{item.name}</strong>
            <small>{item.status === "coming-soon" ? "Coming soon" : item.category}</small>
          </button>
        ))}
      </div>

      <div className={`aircraft-experience__stage${scene.fit === "contain" ? " is-contained" : ""}${zoomed ? " is-zoomed" : ""}`}>
        {hasAircraftSceneMedia(scene) ? (
          <AircraftSceneMedia key={`${selected.slug}-${scene.id}`} aircraftName={selected.name} scene={scene} />
        ) : (
          <div className="aircraft-experience__pending">
            <span>Visual asset in preparation</span>
            <strong>{selected.name}</strong>
            <p>{scene.note}</p>
          </div>
        )}
        <div className="aircraft-experience__shade" />
        <div className="aircraft-experience__meta">
          <p>{selected.maker} · {selected.category}</p>
          <h3>{selected.name}</h3>
          <Link href={`/aircraft/${selected.slug}`}>Explore aircraft <ArrowIcon /></Link>
        </div>
        {hasAircraftSceneMedia(scene) ? (
          <button className="aircraft-experience__zoom" type="button" onClick={() => setZoomed((value) => !value)}>
            {zoomed ? "Reset view" : "Inspect view"}
          </button>
        ) : null}
        <div className="aircraft-experience__scenes" role="tablist" aria-label={`${selected.name} views`}>
          {selected.scenes.map((item) => (
            <button
              type="button"
              role="tab"
              aria-selected={item.id === scene.id}
              className={item.id === scene.id ? "is-active" : ""}
              onClick={() => { setActiveScene(item.id); setZoomed(false); }}
              key={item.id}
            >
              {item.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

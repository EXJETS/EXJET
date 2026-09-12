"use client";

import { useState } from "react";
import { AircraftSceneMedia, hasAircraftSceneMedia } from "@/components/AircraftSceneMedia";
import { Aircraft } from "@/data/aircraft";

export function AircraftDetail({ item }: { item: Aircraft }) {
  const [sceneId, setSceneId] = useState(item.scenes[0]?.id ?? "exterior");
  const scene = item.scenes.find((value) => value.id === sceneId) ?? item.scenes[0];

  return (
    <div className="detail-viewer">
      <header className="detail-viewer__title">
        <p>{item.maker} · {item.category}</p>
        <h1>{item.name}</h1>
        <a className="button button--dark" href={`/contact?aircraft=${item.slug}`}>Enquire about this aircraft</a>
      </header>
      {hasAircraftSceneMedia(scene) ? <>
      <div className={`detail-viewer__visual${scene?.fit === "contain" ? " is-contained" : ""}`}>
        <AircraftSceneMedia key={`${item.slug}-${scene.id}`} aircraftName={item.name} scene={scene} priority />
      </div>
      <div className="detail-viewer__controls" role="group" aria-label={`${item.name} views`}>
        <div>
          {item.scenes.map((value) => (
            <button key={value.id} type="button" aria-pressed={value.id === sceneId} className={value.id === sceneId ? "is-active" : ""} onClick={() => setSceneId(value.id)}>
              {value.label}
            </button>
          ))}
        </div>
      </div>
      <p className="detail-viewer__caption">Representative aircraft. Your advisor confirms the specific aircraft and cabin.</p>
      </> : null}
    </div>
  );
}

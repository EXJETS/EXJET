"use client";

import { useId, useState } from "react";
import styles from "./AircraftRangeMap.module.css";

const origins = [
  ["Dallas", 32.85, -96.85], ["New York", 40.64, -73.78], ["Miami", 25.8, -80.29],
  ["Los Angeles", 33.94, -118.41], ["London", 51.47, -0.45], ["Paris", 49.01, 2.55],
  ["Dubai", 25.25, 55.36], ["Singapore", 1.36, 103.99],
] as const;

const land: number[][][] = [
  [[-168,66],[-153,72],[-126,72],[-100,77],[-74,73],[-58,56],[-61,47],[-80,24],[-90,20],[-86,10],[-99,18],[-113,29],[-125,49],[-139,59],[-168,66]],
  [[-82,11],[-71,12],[-51,3],[-35,-7],[-45,-24],[-56,-39],[-68,-55],[-74,-42],[-73,-22],[-81,-5],[-82,11]],
  [[-73,61],[-59,76],[-35,83],[-18,73],[-31,61],[-47,59],[-73,61]],
  [[-11,37],[-10,54],[9,59],[19,70],[44,73],[74,69],[104,77],[141,73],[172,64],[160,54],[144,45],[127,35],[121,20],[106,6],[97,17],[84,24],[76,8],[68,20],[58,27],[51,13],[44,14],[35,30],[23,37],[9,43],[-2,44],[-11,37]],
  [[-17,33],[4,37],[24,33],[35,30],[43,12],[51,11],[43,-13],[32,-32],[18,-35],[11,-17],[7,4],[-7,4],[-17,14],[-17,33]],
  [[112,-22],[115,-14],[130,-11],[144,-12],[154,-27],[146,-39],[133,-36],[115,-35],[112,-22]],
  [[96,4],[113,7],[124,2],[145,-5],[153,-10],[137,-9],[123,-8],[109,-7],[96,4]],
  [[166,-35],[179,-37],[173,-46],[166,-46],[166,-35]],
];
const rad = Math.PI / 180;
const point = (lon: number, lat: number) => [lon + 180, 90 - lat];
const pathOf = (points: number[][]) => points.map(([x,y],i) => `${i ? "L" : "M"}${x.toFixed(2)},${y.toFixed(2)}`).join(" ");

function ring(lat: number, lon: number, rangeNm: number) {
  const latitude = lat * rad, longitude = lon * rad, distance = rangeNm / 3440.065;
  const parts: number[][][] = [[]];
  let previous: number | undefined;
  for (let n = 0; n <= 240; n++) {
    const b = n * Math.PI / 120;
    const y = Math.asin(Math.sin(latitude) * Math.cos(distance) + Math.cos(latitude) * Math.sin(distance) * Math.cos(b));
    const x = longitude + Math.atan2(Math.sin(b) * Math.sin(distance) * Math.cos(latitude), Math.cos(distance) - Math.sin(latitude) * Math.sin(y));
    const lon = (x / rad + 540) % 360 - 180;
    if (previous !== undefined && Math.abs(lon - previous) > 180) parts.push([]);
    parts[parts.length - 1].push(point(lon, y / rad));
    previous = lon;
  }
  return parts.map(pathOf).join(" ");
}

export function AircraftRangeMap({ profiles }: { profiles: readonly { name: string; slug: string; rangeNm?: number; rangeBasis?: string }[] }) {
  const [originIndex, setOriginIndex] = useState(0);
  const [city, lat, lon] = origins[originIndex];
  const id = useId();
  const colors = ["#175ee8", "#be4a1c", "#087a60"];
  const ranges = profiles.map((p, i) => ({ ...p, color: colors[i % colors.length] })).filter(p => typeof p.rangeNm === "number" && Number.isFinite(p.rangeNm) && p.rangeNm > 0);
  if (!ranges.length) return null;
  return <div className={styles.panel}>
    <div className={styles.header}><div><h3>Illustrative range map</h3><p>Compare published distances from a common departure city.</p></div><label htmlFor={id}>Departure city <select id={id} value={originIndex} onChange={event => setOriginIndex(Number(event.target.value))}>{origins.map(([name], i) => <option key={name} value={i}>{name}</option>)}</select></label></div>
    <svg viewBox="0 0 360 180" role="img" aria-label={`Illustrative great-circle range outlines departing ${city}`} className={styles.map}>
      <title>{`Illustrative great-circle range from ${city}`}</title>
      {[30,60,90,120,150].map(y => <path key={y} d={`M0 ${y}H360`} className={styles.grid} />)}
      {[30,60,90,120,150,180,210,240,270,300,330].map(x => <path key={x} d={`M${x} 0V180`} className={styles.grid} />)}
      {land.map((shape,i) => <path key={i} d={pathOf(shape.map(([x,y]) => point(x,y))) + "Z"} className={styles.land} />)}
      {ranges.map(profile => <path key={profile.slug} d={ring(lat,lon,profile.rangeNm!)} fill="none" stroke={profile.color} strokeWidth="2" vectorEffect="non-scaling-stroke" />)}
      <circle cx={lon + 180} cy={90-lat} r="2.2" fill="#151a22" stroke="white" strokeWidth=".7" />
    </svg>
    <ul className={styles.legend}>{profiles.map(profile => <li key={profile.slug}><span aria-hidden="true" style={{ backgroundColor: ranges.find(p => p.slug === profile.slug)?.color }} />{profile.name}: {profile.rangeNm === undefined ? "range not verified" : `${profile.rangeNm.toLocaleString("en-US")} nm${profile.rangeBasis ? ` (${profile.rangeBasis})` : ""}`}</li>)}</ul>
    <p className={styles.note}>Schematic map. Rings show great-circle distance under each source’s published assumptions, not route or airport availability. Winds, payload, reserves and operating limitations affect actual reach. Not for navigation or dispatch.</p>
  </div>;
}

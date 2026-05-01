"use client";

import { useState, useEffect } from "react";
import { Plane, Radio, MapPin, Gauge, ArrowUp, Clock, RefreshCw, Wifi } from "lucide-react";
import { cn } from "@/lib/utils";
import type { Jet } from "@/types";

interface AircraftPosition {
  lat: number;
  lng: number;
  altitude: number;
  speed: number;
  heading: number;
  lastSeen: string;
  onGround: boolean;
  squawk: string;
  registration: string;
}

// Simulated ADS-B data for demo
function generateMockPosition(jetId: string): AircraftPosition {
  const seed = jetId.split("").reduce((a, c) => a + c.charCodeAt(0), 0);
  const isFlying = seed % 3 !== 0;
  const baseLat = 25 + (seed % 25);
  const baseLng = -120 + (seed % 70);

  return {
    lat: baseLat + Math.random() * 0.1,
    lng: baseLng + Math.random() * 0.1,
    altitude: isFlying ? 30000 + Math.floor(Math.random() * 15000) : 0,
    speed: isFlying ? 380 + Math.floor(Math.random() * 150) : 0,
    heading: Math.floor(Math.random() * 360),
    lastSeen: new Date().toISOString(),
    onGround: !isFlying,
    squawk: `${1200 + Math.floor(Math.random() * 6600)}`,
    registration: `N${100 + (seed % 900)}EX`,
  };
}

interface LiveTrackerProps {
  jet: Jet;
  compact?: boolean;
}

export function LiveTracker({ jet, compact = false }: LiveTrackerProps) {
  const [position, setPosition] = useState<AircraftPosition | null>(null);
  const [loading, setLoading] = useState(true);
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date());
  const [autoRefresh, setAutoRefresh] = useState(true);

  const fetchPosition = () => {
    setLoading(true);
    setTimeout(() => {
      setPosition(generateMockPosition(jet.id));
      setLastUpdate(new Date());
      setLoading(false);
    }, 800);
  };

  useEffect(() => {
    fetchPosition();
  }, [jet.id]);

  useEffect(() => {
    if (!autoRefresh) return;
    const interval = setInterval(fetchPosition, 30000);
    return () => clearInterval(interval);
  }, [autoRefresh, jet.id]);

  if (compact) {
    return (
      <div className="flex items-center gap-3 rounded-xl border border-neutral-200 bg-white px-3 py-2.5">
        <div
          className={cn(
            "flex h-8 w-8 items-center justify-center rounded-full ring-1",
            position?.onGround
              ? "bg-neutral-100 text-neutral-700 ring-neutral-200"
              : "bg-emerald-50 text-emerald-700 ring-emerald-200"
          )}
        >
          {position?.onGround ? (
            <MapPin className="h-4 w-4" strokeWidth={1.75} />
          ) : (
            <Plane className="h-4 w-4" strokeWidth={1.75} />
          )}
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-[12px] font-medium text-neutral-950">
            {loading ? "Locating..." : position?.onGround ? "On Ground" : "In Flight"}
          </p>
          <p className="font-mono text-[10px] uppercase tracking-widest text-neutral-400">
            {position?.registration} · {lastUpdate.toLocaleTimeString()}
          </p>
        </div>
        <div
          className={cn(
            "h-1.5 w-1.5 rounded-full",
            loading ? "bg-amber-300 animate-pulse" : position?.onGround ? "bg-neutral-300" : "bg-emerald-500 animate-pulse"
          )}
        />
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-2xl border border-neutral-200 bg-white backdrop-blur-xl">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-neutral-200 bg-white px-5 py-3">
        <div className="flex items-center gap-2">
          <Radio className="h-3.5 w-3.5 text-emerald-700" strokeWidth={2} />
          <h3 className="text-[13px] font-semibold tracking-tight text-neutral-950">Live Aircraft Tracking</h3>
          <span className="inline-flex items-center rounded-full bg-emerald-50 px-2 py-0.5 font-mono text-[10px] uppercase tracking-widest text-emerald-700 ring-1 ring-emerald-200">
            ADS-B
          </span>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setAutoRefresh(!autoRefresh)}
            className={cn(
              "rounded-full px-2.5 py-1 font-mono text-[10px] uppercase tracking-widest transition-colors",
              autoRefresh
                ? "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200"
                : "bg-neutral-100 text-neutral-500 ring-1 ring-neutral-200"
            )}
          >
            {autoRefresh ? "Auto ON" : "Auto OFF"}
          </button>
          <button
            onClick={fetchPosition}
            disabled={loading}
            className="rounded-lg p-1.5 text-neutral-600 transition-colors hover:bg-neutral-100 hover:text-neutral-950 disabled:opacity-50"
          >
            <RefreshCw className={cn("h-4 w-4", loading && "animate-spin")} strokeWidth={1.75} />
          </button>
        </div>
      </div>

      {/* Map Placeholder */}
      <div className="relative aspect-[2/1] overflow-hidden bg-gradient-to-br from-neutral-50 via-neutral-100 to-neutral-50">
        {/* Grid */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(255,255,255,0.04)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.04)_1px,transparent_1px)] bg-[size:48px_48px]" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(0,0,0,0.04),transparent_70%)]" />

        {/* Aircraft position */}
        {position && !loading && (
          <div
            className="absolute z-10 flex flex-col items-center"
            style={{
              left: `${40 + Math.random() * 20}%`,
              top: `${30 + Math.random() * 30}%`,
              transform: "translate(-50%, -50%)",
            }}
          >
            <div className="relative flex items-center justify-center">
              {!position.onGround && (
                <>
                  <div className="absolute h-12 w-12 animate-ping rounded-full bg-emerald-400/20" />
                  <div className="absolute h-8 w-8 rounded-full bg-emerald-400/30" />
                </>
              )}
              <div
                className={cn(
                  "relative z-10 flex h-6 w-6 items-center justify-center rounded-full ring-1",
                  position.onGround
                    ? "bg-neutral-100 text-neutral-950 ring-neutral-300"
                    : "bg-emerald-500 text-emerald-950 ring-emerald-200"
                )}
              >
                <Plane
                  className="h-3.5 w-3.5"
                  strokeWidth={2}
                  style={{ transform: `rotate(${position.heading}deg)` }}
                />
              </div>
            </div>
            <span className="mt-1 rounded border border-neutral-200 bg-white/80 px-1.5 py-0.5 font-mono text-[10px] uppercase tracking-widest text-neutral-800 backdrop-blur-md">
              {position.registration}
            </span>
          </div>
        )}

        {loading && (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="flex items-center gap-2 rounded-full border border-neutral-200 bg-white/80 px-4 py-2 backdrop-blur-md">
              <Wifi className="h-4 w-4 animate-pulse text-emerald-700" strokeWidth={2} />
              <span className="text-[12px] text-neutral-700">Acquiring signal...</span>
            </div>
          </div>
        )}

        {/* Simulated data notice */}
        <div className="absolute bottom-2 right-2 rounded border border-neutral-200 bg-white/80 px-2 py-0.5 font-mono text-[9px] uppercase tracking-widest text-neutral-400 backdrop-blur-md">
          Simulated Demo Data
        </div>
      </div>

      {/* Position Data */}
      {position && !loading && (
        <div className="grid grid-cols-2 border-t border-neutral-200 sm:grid-cols-4">
          <DataCell
            icon={<ArrowUp className="h-3 w-3" strokeWidth={2} style={{ transform: `rotate(${position.heading}deg)` }} />}
            label="Altitude"
            value={position.onGround ? "Ground" : `${position.altitude.toLocaleString()} ft`}
          />
          <DataCell
            icon={<Gauge className="h-3 w-3" strokeWidth={2} />}
            label="Speed"
            value={`${position.onGround ? 0 : position.speed} kts`}
          />
          <DataCell
            icon={<MapPin className="h-3 w-3" strokeWidth={2} />}
            label="Position"
            value={`${position.lat.toFixed(2)}°N, ${Math.abs(position.lng).toFixed(2)}°W`}
          />
          <DataCell
            icon={<Clock className="h-3 w-3" strokeWidth={2} />}
            label="Updated"
            value={lastUpdate.toLocaleTimeString()}
          />
        </div>
      )}

      {/* Status Bar */}
      <div className="flex items-center justify-between border-t border-neutral-200 bg-white px-5 py-2.5">
        <div className="flex items-center gap-2">
          <div
            className={cn(
              "h-1.5 w-1.5 rounded-full",
              loading ? "bg-amber-300 animate-pulse" : position?.onGround ? "bg-neutral-300" : "bg-emerald-500 animate-pulse"
            )}
          />
          <span className="text-[12px] text-neutral-600">
            {loading
              ? "Acquiring position..."
              : position?.onGround
              ? "Aircraft on ground — available for charter"
              : "Aircraft in flight — tracking live"}
          </span>
        </div>
        <span className="font-mono text-[10px] uppercase tracking-widest text-neutral-400">{position?.registration}</span>
      </div>
    </div>
  );
}

function DataCell({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="flex flex-col items-center border-r border-neutral-200 p-3 last:border-r-0 even:border-r-0 sm:even:border-r sm:last:border-r-0">
      <div className="mb-1 flex items-center gap-1 text-neutral-400">
        {icon}
        <span className="font-mono text-[10px] uppercase tracking-widest">{label}</span>
      </div>
      <span className="text-[12px] font-semibold text-neutral-950">{value}</span>
    </div>
  );
}

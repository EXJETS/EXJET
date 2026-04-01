"use client";

import { useState, useEffect } from "react";
import { Plane, Radio, MapPin, Gauge, ArrowUp, Clock, RefreshCw, Wifi, AlertCircle } from "lucide-react";
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
    // Simulate API call to ADS-B Exchange
    // In production: fetch(`https://adsbexchange.com/api/aircraft/v2/registration/${registration}`)
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
    const interval = setInterval(fetchPosition, 30000); // Refresh every 30s
    return () => clearInterval(interval);
  }, [autoRefresh, jet.id]);

  if (compact) {
    return (
      <div className="flex items-center gap-3 px-3 py-2 rounded-lg bg-gray-50 border border-gray-100">
        <div className={cn(
          "flex items-center justify-center w-8 h-8 rounded-full",
          position?.onGround ? "bg-blue-100" : "bg-green-100"
        )}>
          {position?.onGround ? (
            <MapPin className="w-4 h-4 text-blue-600" />
          ) : (
            <Plane className="w-4 h-4 text-green-600" />
          )}
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-xs font-medium text-gray-900">
            {loading ? "Locating..." : position?.onGround ? "On Ground" : "In Flight"}
          </p>
          <p className="text-[10px] text-gray-500">
            {position?.registration} · Updated {lastUpdate.toLocaleTimeString()}
          </p>
        </div>
        <div className={cn(
          "h-2 w-2 rounded-full",
          loading ? "bg-yellow-400 animate-pulse" : position?.onGround ? "bg-blue-400" : "bg-green-400 animate-pulse"
        )} />
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-gray-200 bg-white overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-5 py-3 border-b border-gray-100 bg-gray-50">
        <div className="flex items-center gap-2">
          <Radio className="w-4 h-4 text-green-500" />
          <h3 className="text-sm font-semibold text-gray-900">Live Aircraft Tracking</h3>
          <span className="text-[10px] px-2 py-0.5 rounded-full bg-green-100 text-green-700 font-medium">ADS-B</span>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setAutoRefresh(!autoRefresh)}
            className={cn(
              "text-[10px] px-2 py-1 rounded-full font-medium transition-colors",
              autoRefresh ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-500"
            )}
          >
            {autoRefresh ? "Auto-refresh ON" : "Auto-refresh OFF"}
          </button>
          <button
            onClick={fetchPosition}
            disabled={loading}
            className="p-1.5 rounded-lg hover:bg-gray-100 transition-colors disabled:opacity-50"
          >
            <RefreshCw className={cn("w-4 h-4 text-gray-500", loading && "animate-spin")} />
          </button>
        </div>
      </div>

      {/* Map Placeholder */}
      <div className="relative aspect-[2/1] bg-gradient-to-br from-slate-100 via-blue-50 to-slate-100">
        {/* Grid lines simulating a map */}
        <div className="absolute inset-0 opacity-20">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={`h-${i}`} className="absolute left-0 right-0 border-t border-slate-300" style={{ top: `${(i + 1) * 12.5}%` }} />
          ))}
          {Array.from({ length: 12 }).map((_, i) => (
            <div key={`v-${i}`} className="absolute top-0 bottom-0 border-l border-slate-300" style={{ left: `${(i + 1) * 8.33}%` }} />
          ))}
        </div>

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
            <div className={cn(
              "relative flex items-center justify-center",
              !position.onGround && "animate-pulse"
            )}>
              {/* Pulse rings */}
              {!position.onGround && (
                <>
                  <div className="absolute w-12 h-12 rounded-full bg-green-400/20 animate-ping" />
                  <div className="absolute w-8 h-8 rounded-full bg-green-400/30" />
                </>
              )}
              <div className={cn(
                "relative w-6 h-6 rounded-full flex items-center justify-center z-10",
                position.onGround ? "bg-blue-500" : "bg-green-500"
              )}>
                <Plane
                  className="w-3.5 h-3.5 text-white"
                  style={{ transform: `rotate(${position.heading}deg)` }}
                />
              </div>
            </div>
            <span className="mt-1 text-[10px] font-semibold text-gray-700 bg-white/80 px-1.5 py-0.5 rounded backdrop-blur-sm">
              {position.registration}
            </span>
          </div>
        )}

        {loading && (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="flex items-center gap-2 bg-white/90 backdrop-blur-sm px-4 py-2 rounded-full shadow-sm">
              <Wifi className="w-4 h-4 text-amber-500 animate-pulse" />
              <span className="text-sm text-gray-600">Acquiring signal...</span>
            </div>
          </div>
        )}

        {/* Map attribution */}
        <div className="absolute bottom-2 right-2 text-[9px] text-gray-400 bg-white/70 px-2 py-0.5 rounded backdrop-blur-sm">
          Data via ADS-B Exchange
        </div>
      </div>

      {/* Position Data */}
      {position && !loading && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-px bg-gray-100">
          <div className="bg-white p-3 flex flex-col items-center">
            <div className="flex items-center gap-1 text-gray-400 mb-1">
              <ArrowUp className="w-3 h-3" style={{ transform: `rotate(${position.heading}deg)` }} />
              <span className="text-[10px] uppercase tracking-wide">Altitude</span>
            </div>
            <span className="text-sm font-semibold text-gray-900">
              {position.onGround ? "Ground" : `${position.altitude.toLocaleString()} ft`}
            </span>
          </div>
          <div className="bg-white p-3 flex flex-col items-center">
            <div className="flex items-center gap-1 text-gray-400 mb-1">
              <Gauge className="w-3 h-3" />
              <span className="text-[10px] uppercase tracking-wide">Speed</span>
            </div>
            <span className="text-sm font-semibold text-gray-900">
              {position.onGround ? "0" : `${position.speed}`} kts
            </span>
          </div>
          <div className="bg-white p-3 flex flex-col items-center">
            <div className="flex items-center gap-1 text-gray-400 mb-1">
              <MapPin className="w-3 h-3" />
              <span className="text-[10px] uppercase tracking-wide">Position</span>
            </div>
            <span className="text-xs font-semibold text-gray-900">
              {position.lat.toFixed(2)}°N, {Math.abs(position.lng).toFixed(2)}°W
            </span>
          </div>
          <div className="bg-white p-3 flex flex-col items-center">
            <div className="flex items-center gap-1 text-gray-400 mb-1">
              <Clock className="w-3 h-3" />
              <span className="text-[10px] uppercase tracking-wide">Updated</span>
            </div>
            <span className="text-xs font-semibold text-gray-900">
              {lastUpdate.toLocaleTimeString()}
            </span>
          </div>
        </div>
      )}

      {/* Status Bar */}
      <div className="px-5 py-2 border-t border-gray-100 bg-gray-50 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className={cn(
            "h-2 w-2 rounded-full",
            loading ? "bg-yellow-400 animate-pulse" : position?.onGround ? "bg-blue-400" : "bg-green-400 animate-pulse"
          )} />
          <span className="text-xs text-gray-500">
            {loading ? "Acquiring position..." : position?.onGround ? "Aircraft on ground — available for charter" : "Aircraft in flight — tracking live"}
          </span>
        </div>
        <span className="text-[10px] text-gray-400">{position?.registration}</span>
      </div>
    </div>
  );
}

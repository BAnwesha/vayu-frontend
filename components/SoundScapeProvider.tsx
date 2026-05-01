"use client";

import React, { createContext, useContext, useEffect, useRef, useState } from "react";

interface AtmosphericData {
  wind_speed?: number;
  wind?: { speed: number };
  rain?: number | { "1h"?: number };
  precipitation?: number;
  weather?: { main: string }[];
}

interface SoundscapeContextType {
  setAtmosphericData: (data: AtmosphericData | null) => void;
}

const SoundscapeContext = createContext<SoundscapeContextType | null>(null);

export function SoundscapeProvider({ children }: { children: React.ReactNode }) {
  const [isSoundEnabled, setIsSoundEnabled] = useState(false);
  const [atmosphericData, setAtmosphericData] = useState<AtmosphericData | null>(null);

  const audioCtx = useRef<AudioContext | null>(null);

  // Wind nodes
  const windGain = useRef<GainNode | null>(null);
  const windFilter = useRef<BiquadFilterNode | null>(null);

  // Rain nodes (persistent looping noise, not intervals)
  const rainSource = useRef<AudioBufferSourceNode | null>(null);
  const rainGain = useRef<GainNode | null>(null);

  // Sunny nodes (birds / gentle hum)
  const sunnyGain = useRef<GainNode | null>(null);
  const sunnyInterval = useRef<NodeJS.Timeout | null>(null);

  // Lightning
  const lightningInterval = useRef<NodeJS.Timeout | null>(null);

  // Shared buffers
  const noiseBuffer = useRef<AudioBuffer | null>(null); // long white noise for rain
  const initialized = useRef(false);

  const getCtx = () => {
    if (audioCtx.current) return audioCtx.current;
    const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
    audioCtx.current = new AudioContextClass();
    return audioCtx.current;
  };

  const buildNoise = (ctx: AudioContext, seconds: number) => {
    const size = ctx.sampleRate * seconds;
    const buf = ctx.createBuffer(1, size, ctx.sampleRate);
    const data = buf.getChannelData(0);
    for (let i = 0; i < size; i++) data[i] = Math.random() * 2 - 1;
    return buf;
  };

  const initNodes = (ctx: AudioContext) => {
    if (initialized.current) return;
    initialized.current = true;

    noiseBuffer.current = buildNoise(ctx, 10); // 10-second noise loop

    // ── WIND ──────────────────────────────────────────────
    const windSrc = ctx.createBufferSource();
    windSrc.buffer = noiseBuffer.current;
    windSrc.loop = true;

    windFilter.current = ctx.createBiquadFilter();
    windFilter.current.type = "lowpass";
    windFilter.current.frequency.value = 400;

    windGain.current = ctx.createGain();
    windGain.current.gain.value = 0;

    windSrc.connect(windFilter.current);
    windFilter.current.connect(windGain.current);
    windGain.current.connect(ctx.destination);
    windSrc.start();

    // ── RAIN (continuous looping noise, gentle aesthetic) ──
    const rainSrc = ctx.createBufferSource();
    rainSrc.buffer = noiseBuffer.current;
    rainSrc.loop = true;
    rainSource.current = rainSrc;

    // Lowpass first to remove harsh high-freq content
    const rainLP = ctx.createBiquadFilter();
    rainLP.type = "lowpass";
    rainLP.frequency.value = 5000; // cut everything above 5kHz (removes harshness)
    rainLP.Q.value = 0.5;

    // Gentle bandpass centered on soft "shhhh" frequency range
    const rainBP1 = ctx.createBiquadFilter();
    rainBP1.type = "bandpass";
    rainBP1.frequency.value = 800;  // lower center = softer, less harsh
    rainBP1.Q.value = 0.15;         // very wide band = smooth blend

    const rainBP2 = ctx.createBiquadFilter();
    rainBP2.type = "bandpass";
    rainBP2.frequency.value = 2000; // gentle upper layer
    rainBP2.Q.value = 0.15;

    // Very subtle high shelf — just a whisper of air, not aggressive
    const rainShelf = ctx.createBiquadFilter();
    rainShelf.type = "highshelf";
    rainShelf.frequency.value = 6000;
    rainShelf.gain.value = 2; // was 8 — much gentler now

    rainGain.current = ctx.createGain();
    rainGain.current.gain.value = 0;

    rainSrc.connect(rainLP);
    rainLP.connect(rainBP1);
    rainBP1.connect(rainBP2);
    rainBP2.connect(rainShelf);
    rainShelf.connect(rainGain.current);
    rainGain.current.connect(ctx.destination);
    rainSrc.start();

    // ── SUNNY (gentle high-freq shimmer simulating birds/air) ─
    sunnyGain.current = ctx.createGain();
    sunnyGain.current.gain.value = 0;
    sunnyGain.current.connect(ctx.destination);
  };

  // Plays a single synthetic "bird chirp" for sunny weather
  const playChirp = (ctx: AudioContext) => {
    if (!sunnyGain.current) return;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = "sine";
    const baseFreq = 1800 + Math.random() * 1200;
    osc.frequency.setValueAtTime(baseFreq, ctx.currentTime);
    osc.frequency.linearRampToValueAtTime(baseFreq * 1.3, ctx.currentTime + 0.08);
    osc.frequency.linearRampToValueAtTime(baseFreq * 0.95, ctx.currentTime + 0.18);

    gain.gain.setValueAtTime(0, ctx.currentTime);
    gain.gain.linearRampToValueAtTime(0.06 + Math.random() * 0.04, ctx.currentTime + 0.03);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.22);

    osc.connect(gain);
    gain.connect(sunnyGain.current);
    osc.start(ctx.currentTime);
    osc.stop(ctx.currentTime + 0.25);
  };

  // Plays a thunder rumble
  const playThunder = (ctx: AudioContext) => {
    const buf = buildNoise(ctx, 3);
    const src = ctx.createBufferSource();
    src.buffer = buf;

    const lp = ctx.createBiquadFilter();
    lp.type = "lowpass";
    lp.frequency.value = 180;

    const gain = ctx.createGain();
    // Sharp crack then long rumble
    gain.gain.setValueAtTime(0, ctx.currentTime);
    gain.gain.linearRampToValueAtTime(0.9, ctx.currentTime + 0.02);   // crack
    gain.gain.exponentialRampToValueAtTime(0.3, ctx.currentTime + 0.3); // rumble start
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 2.5); // fade out

    src.connect(lp);
    lp.connect(gain);
    gain.connect(ctx.destination);
    src.start(ctx.currentTime);
    src.stop(ctx.currentTime + 3);
  };

  const stopAllIntervals = () => {
    if (sunnyInterval.current) { clearInterval(sunnyInterval.current); sunnyInterval.current = null; }
    if (lightningInterval.current) { clearInterval(lightningInterval.current); lightningInterval.current = null; }
  };

  useEffect(() => {
    if (typeof window === "undefined") return;

    if (!isSoundEnabled) {
      audioCtx.current?.suspend();
      stopAllIntervals();
      return;
    }

    const ctx = getCtx();
    if (ctx.state === "suspended") ctx.resume();
    initNodes(ctx);

    if (!atmosphericData) {
      // Silence everything
      windGain.current?.gain.setTargetAtTime(0, ctx.currentTime, 0.5);
      rainGain.current?.gain.setTargetAtTime(0, ctx.currentTime, 0.5);
      sunnyGain.current?.gain.setTargetAtTime(0, ctx.currentTime, 0.5);
      stopAllIntervals();
      return;
    }

    const windSpeed = atmosphericData.wind_speed ?? atmosphericData.wind?.speed ?? 0;
    let precipitation = 0;
    if (typeof atmosphericData.rain === "number") precipitation = atmosphericData.rain;
    else if (atmosphericData.rain?.["1h"]) precipitation = atmosphericData.rain["1h"];
    else if (atmosphericData.precipitation) precipitation = atmosphericData.precipitation;

    const condition = atmosphericData.weather?.[0]?.main?.toLowerCase() ?? "";
    const isThunderstorm = condition.includes("thunderstorm");
    const isRainy = precipitation > 0 || condition.includes("rain") || condition.includes("drizzle") || isThunderstorm;
    const isSunny = condition.includes("clear") || condition.includes("sun");

    // ── WIND ──
    const windFreq = 300 + windSpeed * 25;
    windFilter.current?.frequency.setTargetAtTime(windFreq, ctx.currentTime, 0.5);
    if (windFilter.current) {
  windFilter.current.Q.value = 1.8; // slight resonance = airy howl, not just white noise
}
    const windVol = windSpeed > 0 ? Math.min(0.32, 0.05 + windSpeed * 0.014) : 0;
    windGain.current?.gain.setTargetAtTime(windVol, ctx.currentTime, 1.2);

    // ── RAIN ──
    if (isRainy) {
      // Drizzle (0–1mm): very soft ~0.15
      // Moderate (1–5mm): gentle ~0.3
      // Heavy (5mm+): fuller ~0.55 — never harsh
      const rainVol = precipitation === 0
        ? 0.15  // condition-based (e.g. "Rain" with no mm data)
        : Math.min(0.55, 0.12 + Math.log1p(precipitation) * 0.15);
      rainGain.current?.gain.setTargetAtTime(rainVol, ctx.currentTime, 2); // slow fade in = gentle
    } else {
      rainGain.current?.gain.setTargetAtTime(0, ctx.currentTime, 1.5);
    }

    // ── LIGHTNING ──
    stopAllIntervals();
    if (isThunderstorm) {
      // First strike after 2–6s, then random every 8–20s
      const scheduleThunder = () => {
        const delay = 8000 + Math.random() * 12000;
        lightningInterval.current = setTimeout(() => {
          playThunder(ctx);
          scheduleThunder(); // reschedule
        }, delay) as unknown as NodeJS.Timeout;
      };
      setTimeout(() => playThunder(ctx), 2000 + Math.random() * 4000);
      scheduleThunder();
    }

    // ── SUNNY ──
    if (isSunny) {
      sunnyGain.current?.gain.setTargetAtTime(1, ctx.currentTime, 2);
      const chirpInterval = () => {
        playChirp(ctx);
        // Random gap between chirps: 1.5s – 5s
        sunnyInterval.current = setTimeout(chirpInterval, 1500 + Math.random() * 3500) as unknown as NodeJS.Timeout;
      };
      sunnyInterval.current = setTimeout(chirpInterval, 1000) as unknown as NodeJS.Timeout;
    } else {
      sunnyGain.current?.gain.setTargetAtTime(0, ctx.currentTime, 1);
    }

    return () => stopAllIntervals();
  }, [isSoundEnabled, atmosphericData]);

  return (
    <SoundscapeContext.Provider value={{ setAtmosphericData }}>
      {children}
      <div className="fixed bottom-6 right-6 z-[9999]">
        <button
          onClick={() => setIsSoundEnabled(!isSoundEnabled)}
          className={`px-5 py-3 rounded-full border backdrop-blur-md shadow-2xl transition-all ${
            isSoundEnabled
              ? "bg-blue-600/80 border-blue-400 text-white shadow-blue-500/50"
              : "bg-black/50 border-white/10 text-slate-400 hover:text-white"
          }`}
        >
          {isSoundEnabled ? "🔊 Ambient: ON" : "🔇 Ambient: OFF"}
        </button>
      </div>
    </SoundscapeContext.Provider>
  );
}

export const useSoundscape = () => {
  const context = useContext(SoundscapeContext);
  if (!context) throw new Error("useSoundscape must be used within SoundscapeProvider");
  return context;
};
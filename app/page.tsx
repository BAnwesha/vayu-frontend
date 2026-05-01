"use client";

import { useState, useEffect, useMemo, useRef } from "react";
import { useRouter } from "next/navigation";
import dynamic from "next/dynamic";
import { useWeatherSocket } from "@/hooks/useWeatherSocket";
import { GlobeMethods } from "react-globe.gl";
import SearchBar from "@/components/SearchBar";
import { useSoundscape } from "@/components/SoundScapeProvider";

const DynamicGlobe = dynamic(() => import("react-globe.gl"), {
  ssr: false,
  loading: () => (
    <p className="text-slate-500 text-sm animate-pulse pt-10 text-center">
      Initializing 3D Engine...
    </p>
  ),
});

interface City {
  city: string; // was: name
  lat: number;
  lng: number;
}

export default function Home() {
  const router = useRouter();
  const globeEl = useRef<GlobeMethods>(null!);
  const audioCtx = useRef<AudioContext | null>(null);

  const [cities, setCities] = useState<City[]>([]);
  const [activeCity, setActiveCity] = useState("");
  const [mounted, setMounted] = useState(false);
const { setAtmosphericData } = useSoundscape();
  const { weatherData, liveViewers } = useWeatherSocket(activeCity);
useEffect(() => {
    setAtmosphericData(weatherData);
  }, [weatherData, setAtmosphericData]);
  useEffect(() => {
    setMounted(true);
    fetch("/cities.json")
      .then((res) => res.json())
      .then((data: City[]) => setCities(data));
  }, [weatherData, activeCity]);

  const handleSearch = (cityName: string, lat: number, lng: number) => {
    setActiveCity(cityName);
    if (globeEl.current) {
      globeEl.current.pointOfView({ lat, lng, altitude: 1.8 }, 1000);
    }
  };
  const handleExplore = () => {
    router.push(`/weather?city=${encodeURIComponent(activeCity)}`);
  };

  if (!mounted) return null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-blue-950 to-slate-900 flex flex-col items-center pt-16 md:pt-24 text-white relative overflow-hidden">
      {/* Background glow */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[500px] h-[500px] bg-blue-600/10 rounded-full blur-[120px] pointer-events-none" />

      <div className="relative z-10 text-center space-y-6 max-w-4xl w-full px-4">
        {/* Branding */}
        <div className="inline-block">
          <div className="bg-white/5 backdrop-blur-md border border-white/10 px-6 py-2 rounded-full mb-2">
            <span className="text-xs font-bold tracking-[0.4em] uppercase text-blue-300">
              Atmospheric Intelligence
            </span>
          </div>
        </div>

        <h1 className="text-7xl md:text-8xl font-thin tracking-tighter">
          VAYU<span className="text-blue-500 font-black">.</span>
        </h1>

        <p className="text-lg md:text-xl text-slate-400 font-light leading-relaxed">
          Experience atmosphere in{" "}
          <span className="text-white border-b border-blue-500/50">
            real-time
          </span>
          .
        </p>

        {/* Live viewers badge */}
        {liveViewers > 0 && (
          <div className="text-sm text-blue-300/80 animate-pulse">
            🔥 {liveViewers} people viewing {activeCity || "this area"} right
            now
          </div>
        )}

        {/* Search + dropdown + CTA */}
        <div className="pt-6 flex flex-col items-center gap-6 relative">
          <SearchBar onCitySelect={handleSearch} />
          {/* Dashboard CTA — shown as soon as a city is selected */}
          {activeCity && (
            <button
              onClick={handleExplore}
              className="px-8 py-3 bg-blue-600 hover:bg-blue-500 text-white rounded-full font-medium tracking-wide transition-all shadow-[0_0_20px_rgba(37,99,235,0.3)] hover:shadow-[0_0_30px_rgba(37,99,235,0.5)] animate-in fade-in zoom-in cursor-pointer"
            >
              Enter {activeCity} Dashboard →
            </button>
          )}
        </div>

        {/* Globe */}
        <div className="w-full flex justify-center -mt-8 cursor-grab active:cursor-grabbing h-[600px]" >
          <DynamicGlobe
            ref={globeEl}
            pointsData={cities}
            onPointClick={(point: any) => {
              const city = point as City;
              setActiveCity(city.city);
              globeEl.current?.pointOfView(
                { lat: city.lat, lng: city.lng, altitude: 1.8 },
                1000,
              );
            }}
            pointAltitude={(d: any) => (d.city === activeCity ? 0.06 : 0.02)}
            pointRadius={(d: any) => (d.city === activeCity ? 0.4 : 0.2)}
            pointColor={(d: any) =>
              d.city === activeCity ? "#f59e0b" : "rgb(246, 59, 59)"
            }
            pointResolution={6}
            backgroundColor="rgba(0,0,0,0)"
            globeImageUrl="//unpkg.com/three-globe/example/img/earth-blue-marble.jpg"
          />
        </div>
      </div>

      <footer className="absolute bottom-6 text-sm text-slate-400 z-10 font-light tracking-widest">
        Powered By OpenWeatherMap API
      </footer>
    </div>
  );
}

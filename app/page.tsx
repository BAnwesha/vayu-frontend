"use client";

import { useRouter } from "next/navigation";
import SearchBar from "@/components/SearchBar";

export default function Home(){
  const router = useRouter();
  const handleSearch = (cityName: string) => {
    router.push(`/weather?city=${encodeURIComponent(cityName)}`);
  };
  return(
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-blue-950 to-slate-900 flex flex-col items-center pt-24 md:pt-36 text-white relative overflow-hidden">
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[500px] h-[500px] bg-blue-600/20 rounded-full blur-[120px] pointer-events-none"></div>
      <div className="relative z-10 text-center space-y-8 max-w-2xl"></div>
      
        <div className="inline-block">
          <div className="bg-white/5 backdrop-blur-md border border-white/10 px-6 py-2 rounded-full mb-4">
            <span className="text-xs font-bold tracking-[0.4em] uppercase text-blue-300">Atmospheric Intelligence</span>
          </div>
        </div>
        <h1 className="text-7xl md:text-8xl font-thin tracking-tighter">
          VAYU<span className="font-black text-blue-500">.</span>
        </h1>
        <p className="text-lg md:text-xl text-slate-400 font-light leading-relaxed">
          Experience atmosphere in <span className="text-white border-b border-blue-500/50">real-time</span>. 
        </p>
        <div className="pt-10">
          <SearchBar onCitySelect={handleSearch} />
        </div>
      
      <footer className="absolute bottom-6 text-sm text-slate-400">Powered By OpenWeatherMap API</footer>
    </div>
  )
}
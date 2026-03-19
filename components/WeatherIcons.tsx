import React from "react";

interface WeatherIconProps {
  condition: string;
  isDay: boolean;
  className?: string;
}

export default function WeatherIcon({ condition, isDay, className = "w-24 h-24" }: WeatherIconProps) {
  const cond = condition.toLowerCase();

  if (cond.includes("clear")) {
    return isDay ? (

      <svg className={`${className} text-yellow-300 drop-shadow-[0_0_15px_rgba(253,224,71,0.6)] animate-[spin_20s_linear_infinite]`} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="5" fill="currentColor" fillOpacity="0.2"/>
        <path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42"/>
      </svg>
    ) : (

      <svg className={`${className} text-blue-100 drop-shadow-[0_0_15px_rgba(219,234,254,0.6)]`} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" fill="currentColor" fillOpacity="0.2"/>
      </svg>
    );
  }


  if (cond.includes("thunderstorm")) {
    return (
      <svg className={`${className} text-slate-300 drop-shadow-[0_0_15px_rgba(148,163,184,0.6)]`} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M17.5 19H9a7 7 0 1 1 6.71-9h1.79a4.5 4.5 0 1 1 0 9Z" fill="currentColor" fillOpacity="0.2"/>
        <path d="m13 11-4 6h6l-4 6" className="text-yellow-400 animate-pulse drop-shadow-[0_0_8px_rgba(250,204,21,0.8)]"/>
      </svg>
    );
  }


  if (cond.includes("rain") || cond.includes("drizzle")) {
    return (
      <svg className={`${className} text-blue-200 drop-shadow-[0_0_15px_rgba(191,219,254,0.6)]`} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M17.5 19H9a7 7 0 1 1 6.71-9h1.79a4.5 4.5 0 1 1 0 9Z" fill="currentColor" fillOpacity="0.2"/>
        <path d="M8 19v2M12 19v2M16 19v2" className="animate-bounce"/>
      </svg>
    );
  }


  if (cond.includes("snow")) {
    return (
      <svg className={`${className} text-white drop-shadow-[0_0_15px_rgba(255,255,255,0.8)] animate-[spin_30s_linear_infinite]`} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="m20 16-4-4 4-4M4 8l4 4-4 4M16 4l-4 4-4-4M8 20l4-4 4 4M12 2v20M2 12h20M7 7l10 10M17 7 7 17"/>
      </svg>
    );
  }


  if (cond.includes("fog") || cond.includes("mist") || cond.includes("haze")) {
    return (
      <svg className={`${className} text-gray-300 drop-shadow-[0_0_15px_rgba(209,213,219,0.5)]`} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M4 14h16M4 18h16M8 10h8M10 6h4" className="animate-pulse"/>
      </svg>
    );
  }


  return (
    <svg className={`${className} text-white drop-shadow-[0_0_15px_rgba(255,255,255,0.6)]`} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M17.5 19H9a7 7 0 1 1 6.71-9h1.79a4.5 4.5 0 1 1 0 9Z" fill="currentColor" fillOpacity="0.2"/>
    </svg>
  );
}
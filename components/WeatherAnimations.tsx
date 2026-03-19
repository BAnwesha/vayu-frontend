import React from "react";

interface AnimationProps {
  condition: string;
  isDay: boolean;
}

export default function WeatherAnimations({ condition, isDay }: AnimationProps) {
  const cond = condition.toLowerCase();
  
  const isRaining = cond.includes("rain") || cond.includes("drizzle") || cond.includes("thunderstorm");
  const isCloudy = cond.includes("cloud") || cond.includes("fog") || cond.includes("mist");
  const isClearNight = !isDay && cond.includes("clear");

  const elements = Array.from({ length: 30 });

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
      
     
      {isRaining && elements.map((_, i) => (
        <div
          key={`rain-${i}`}
          className="absolute bg-blue-300/40 w-[2px] h-16 rounded-full opacity-0 rotate-[15deg] animate-rain"
          style={{
            left: `${Math.random() * 100}vw`,
            top: `${Math.random() * -20}vh`,
            animationDuration: `${0.6 + Math.random() * 0.4}s`,
            animationDelay: `${Math.random() * 2}s`
          }}
        />
      ))}

    
      {isCloudy && Array.from({ length: 5 }).map((_, i) => (
        <div
          key={`cloud-${i}`}
          className="absolute bg-white/10 blur-3xl rounded-full animate-cloud"
          style={{
            width: `${200 + Math.random() * 400}px`,
            height: `${100 + Math.random() * 200}px`,
            top: `${Math.random() * 50}vh`,
            animationDuration: `${20 + Math.random() * 30}s`,
            animationDelay: `${Math.random() * -20}s`
          }}
        />
      ))}

    
      {isClearNight && elements.map((_, i) => (
        <div
          key={`star-${i}`}
          className="absolute bg-white rounded-full animate-star"
          style={{
            width: `${2 + Math.random() * 3}px`,
            height: `${2 + Math.random() * 3}px`,
            left: `${Math.random() * 100}vw`,
            top: `${Math.random() * 80}vh`, // Keep stars primarily in the sky
            animationDuration: `${2 + Math.random() * 4}s`,
            animationDelay: `${Math.random() * 5}s`
          }}
        />
      ))}
      
    </div>
  );
}
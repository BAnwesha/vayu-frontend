"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import SearchBar from "@/components/SearchBar";
import WeatherAnimations from "@/components/WeatherAnimations";
import WeatherIcon from "@/components/WeatherIcons";

interface WeatherResponse {
  name: string;
  visibility: number;
  timezone: number;
  main: {
    temp: number;
    feels_like: number;
    temp_min: number;
    temp_max: number;
    humidity: number;
    pressure: number;
  };
  weather: {
    main: string;
    description: string;
  }[];
  wind: {
    speed: number;
  };
  sys: {
    country: string;
    sunrise: number;
    sunset: number;
  };
}

function WeatherDashboard() {
  const searchParams = useSearchParams();
  const initialCity = searchParams.get("city"); 
  
  const [weather, setWeather] = useState<WeatherResponse | null>(null);
  const [socket, setSocket] = useState<WebSocket | null>(null);

  useEffect(() => {
    const ws = new WebSocket("ws://localhost:8080/weather-updates");
    
    ws.onopen = () => {
      if (initialCity) {
        ws.send(initialCity);
      }
    };

    ws.onmessage = (e) => {
      const data = JSON.parse(e.data);
      setWeather(data);
    };
    
    setSocket(ws);
    
    return () => {
      ws.close();
    };
  }, [initialCity]);

  const handleSearch = (cityName: string) => {
    if (socket && socket.readyState === WebSocket.OPEN) {
      socket.send(cityName);
    }
  };

  const formatTime = (timestamp: number) => {
    return new Date(timestamp * 1000).toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const currentTime = Math.floor(Date.now() / 1000);
  const isDay = weather ? (currentTime >= weather.sys.sunrise && currentTime <= weather.sys.sunset) : true;
  const condition = weather ? weather.weather[0].main.toLowerCase() : "clear";

  const getBackgroundTheme = () => {
  if (!weather) return "from-slate-950 via-blue-950 to-slate-900";
  const windSpeed = weather.wind.speed;

  if (isDay) {

    if (condition.includes("rain") || condition.includes("drizzle") || condition.includes("thunderstorm")) {
      return "from-slate-500 via-slate-600 to-slate-700"; 
    }
    if (condition.includes("cloud")) {
      return "from-slate-400 via-gray-400 to-slate-500"; 
    }
    if (condition.includes("fog") || condition.includes("mist") || condition.includes("haze")) {
      return "from-gray-300 via-gray-400 to-gray-500"; 
    }
    if (windSpeed > 10) { 
      return "from-cyan-500 via-blue-400 to-blue-600";
    }
    
    return "from-blue-400 via-blue-500 to-blue-600";
  } else {

    if (condition.includes("rain") || condition.includes("drizzle") || condition.includes("thunderstorm")) {
      return "from-gray-900 via-slate-800 to-black"; 
    }
    if (condition.includes("cloud")) {
      return "from-slate-800 via-slate-900 to-black"; 
    }
    if (condition.includes("fog") || condition.includes("mist") || condition.includes("haze")) {
      return "from-gray-700 via-gray-800 to-gray-900"; 
    }
    if (windSpeed > 10) {
      return "from-blue-900 via-slate-800 to-black"; 
    }
    
    return "from-indigo-900 via-purple-900 to-black"; 
  }
};
  return (
    <main className={`min-h-screen bg-gradient-to-br ${getBackgroundTheme()} text-white p-6 md:p-12 font-sans flex flex-col items-center transition-colors duration-1000`}>
      <WeatherAnimations condition={condition} isDay={isDay} />
    
    <div className="relative z-10 w-full flex flex-col items-center"></div>
      <div className="relative w-full max-w-3xl mb-10 z-50">
        <SearchBar onCitySelect={handleSearch} />
      </div>

      {weather ? (
        <section className="w-full max-w-4xl bg-white/10 backdrop-blur-lg border border-white/20 rounded-3xl p-8 md:p-12 shadow-2xl flex flex-col gap-8">
          <div className="text-center">
            <h1 className="text-4xl md:text-5xl font-bold tracking-wide">
              {weather.name}, {weather.sys.country}
            </h1>
            
            <div className="flex items-center justify-center gap-6 my-6">
              <WeatherIcon condition={condition} isDay={isDay} className="w-24 h-24 md:w-32 md:h-32" />
              <p className="text-7xl md:text-8xl font-extrabold drop-shadow-lg">
                {Math.round(weather.main.temp)}°C
              </p>
            </div>
            
            <p className="text-xl text-white/80">
              Feels like: {Math.round(weather.main.feels_like)}°C
            </p>
            <p className="text-2xl capitalize font-medium mt-2">
              {weather.weather[0].description}
            </p>
          </div>

          <hr className="border-t border-white/20 my-2" />

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white/5 border border-white/10 rounded-2xl p-6 hover:-translate-y-1 transition-transform duration-300">
              <h3 className="text-lg font-semibold border-b border-white/10 pb-3 mb-4">Atmosphere</h3>
              <p className="my-2 text-white/80">Humidity: <span className="text-white font-medium">{weather.main.humidity}%</span></p>
              <p className="my-2 text-white/80">Pressure: <span className="text-white font-medium">{weather.main.pressure} hPa</span></p>
              <p className="my-2 text-white/80">Visibility: <span className="text-white font-medium">{weather.visibility / 1000} km</span></p>
            </div>

            <div className="bg-white/5 border border-white/10 rounded-2xl p-6 hover:-translate-y-1 transition-transform duration-300">
              <h3 className="text-lg font-semibold border-b border-white/10 pb-3 mb-4">Wind & Sun</h3>
              <p className="my-2 text-white/80">Wind Speed: <span className="text-white font-medium">{weather.wind.speed} m/s</span></p>
              <p className="my-2 text-white/80">Sunrise: <span className="text-white font-medium">{formatTime(weather.sys.sunrise)}</span></p>
              <p className="my-2 text-white/80">Sunset: <span className="text-white font-medium">{formatTime(weather.sys.sunset)}</span></p>
            </div>

            <div className="bg-white/5 border border-white/10 rounded-2xl p-6 hover:-translate-y-1 transition-transform duration-300">
              <h3 className="text-lg font-semibold border-b border-white/10 pb-3 mb-4">Temp Range</h3>
              <p className="my-2 text-white/80">Min Temp: <span className="text-white font-medium">{Math.round(weather.main.temp_min)}°C</span></p>
              <p className="my-2 text-white/80">Max Temp: <span className="text-white font-medium">{Math.round(weather.main.temp_max)}°C</span></p>
            </div>
          </div>
        </section>
      ) : (
        <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-3xl p-12 text-center shadow-xl w-full max-w-2xl mt-10">
          <p className="text-2xl font-medium mb-3">Connecting to Vayu Stream...</p>
          <small className="text-white/60 text-base">(Fetching live atmospheric data)</small>
        </div>
      )}
    </main>
  );
}

export default function WeatherPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-slate-900 text-white flex items-center justify-center">Loading Vayu...</div>}>
      <WeatherDashboard />
    </Suspense>
  );
}
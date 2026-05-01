"use client";

import { Suspense, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import SearchBar from "@/components/SearchBar";
import WeatherAnimations from "@/components/WeatherAnimations";
import WeatherIcon from "@/components/WeatherIcons";
import { useWeatherSocket } from "@/hooks/useWeatherSocket";
import { useSoundscape } from "@/components/SoundScapeProvider";
import AtmosphericOracle from "@/components/AtmosphericOracle";

interface ForecastItem {
  dt: number;
  main: {
    temp: number;
    temp_min: number;
    temp_max: number;
  };
  weather: {
    main: string;
    description: string;
  }[];
  pop: number;
}

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
  list?: ForecastItem[]; // 5-day/3-hour forecast from /forecast endpoint
}

function WeatherDashboard() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const initialCity = searchParams.get("city") || "";

  const { weatherData: weather, liveViewers } = useWeatherSocket(initialCity);
  const { setAtmosphericData } = useSoundscape();

  useEffect(() => {
    setAtmosphericData(weather);
  }, [weather, setAtmosphericData]);

  const handleSearch = (cityName: string) => {
    router.push(`/weather?city=${encodeURIComponent(cityName)}`);
  };

  const formatTime = (timestamp: number) => {
    return new Date(timestamp * 1000).toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  // Get one forecast entry per day, skipping today, max 5 days
  const getDailyForecasts = (): ForecastItem[] => {
    if (!weather?.list) return [];
    const seen = new Set<string>();
    const todayStr = new Date().toDateString();
    return weather.list
      .filter((item:ForecastItem) => {
        const day = new Date(item.dt * 1000).toDateString();
        if (day === todayStr) return false;
        if (seen.has(day)) return false;
        seen.add(day);
        return true;
      })
      .slice(0, 5);
  };

  const currentTime = Math.floor(Date.now() / 1000);
  const isDay = weather?.sys
    ? currentTime >= weather.sys.sunrise && currentTime <= weather.sys.sunset
    : true;
  const condition = weather?.weather?.[0]?.main?.toLowerCase() ?? "clear";

  const getBackgroundTheme = () => {
    if (!weather) return "from-slate-950 via-blue-950 to-slate-900";
    const windSpeed = weather?.wind?.speed ?? 0;

    if (isDay) {
      if (condition.includes("rain") || condition.includes("drizzle") || condition.includes("thunderstorm"))
        return "from-slate-500 via-slate-600 to-slate-700";
      if (condition.includes("cloud"))
        return "from-slate-400 via-gray-400 to-slate-500";
      if (condition.includes("fog") || condition.includes("mist") || condition.includes("haze"))
        return "from-gray-300 via-gray-400 to-gray-500";
      if (windSpeed > 10)
        return "from-cyan-500 via-blue-400 to-blue-600";
      return "from-blue-400 via-blue-500 to-blue-600";
    } else {
      if (condition.includes("rain") || condition.includes("drizzle") || condition.includes("thunderstorm"))
        return "from-gray-900 via-slate-800 to-black";
      if (condition.includes("cloud"))
        return "from-slate-800 via-slate-900 to-black";
      if (condition.includes("fog") || condition.includes("mist") || condition.includes("haze"))
        return "from-gray-700 via-gray-800 to-gray-900";
      if (windSpeed > 10)
        return "from-blue-900 via-slate-800 to-black";
      return "from-indigo-900 via-purple-900 to-black";
    }
  };

  const dailyForecasts = getDailyForecasts();

  return (
    <main className={`min-h-screen bg-gradient-to-br ${getBackgroundTheme()} text-white p-6 md:p-12 font-sans flex flex-col items-center transition-colors duration-1000`}>
      <WeatherAnimations condition={condition} isDay={isDay} />

      <div className="relative z-10 w-full flex flex-col items-center">
        <div className="relative w-full max-w-3xl mb-6 z-50">
          <SearchBar onCitySelect={handleSearch} />
        </div>

        {liveViewers > 1 && (
          <div className="mb-8 text-sm text-white/80 animate-pulse bg-black/20 px-6 py-2 rounded-full backdrop-blur-sm border border-white/10">
            🔥 {liveViewers} people viewing {weather?.name || initialCity} right now
          </div>
        )}

        {weather ? (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 w-full max-w-[1600px] 2xl:max-w-[90vw]">
            <section className="lg:col-span-2 w-full bg-white/10 backdrop-blur-lg border border-white/20 rounded-3xl p-8 md:p-12 shadow-2xl flex flex-col gap-8">

              {/* CURRENT WEATHER HEADER */}
              <div className="text-center">
                <h1 className="text-4xl md:text-5xl font-bold tracking-wide">
                  {weather.name}{weather.sys?.country ? `, ${weather.sys.country}` : ""}
                </h1>

                <div className="flex items-center justify-center gap-6 my-6">
                  <WeatherIcon condition={condition} isDay={isDay} className="w-24 h-24 md:w-32 md:h-32" />
                  <p className="text-7xl md:text-8xl font-extrabold drop-shadow-lg">
                    {Math.round(weather.main?.temp ?? 0)}°C
                  </p>
                </div>

                <p className="text-xl text-white/80">
                  Feels like: {Math.round(weather.main?.feels_like ?? 0)}°C
                </p>
                <p className="text-2xl capitalize font-medium mt-2">
                  {weather.weather?.[0]?.description ?? "Clear"}
                </p>
              </div>

              <hr className="border-t border-white/20 my-2" />

              {/* CURRENT METRICS */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white/5 border border-white/10 rounded-2xl p-6 hover:-translate-y-1 transition-transform duration-300">
                  <h3 className="text-lg font-semibold border-b border-white/10 pb-3 mb-4">Atmosphere</h3>
                  <p className="my-2 text-white/80">Humidity: <span className="text-white font-medium">{weather.main?.humidity ?? 0}%</span></p>
                  <p className="my-2 text-white/80">Pressure: <span className="text-white font-medium">{weather.main?.pressure ?? 0} hPa</span></p>
                  <p className="my-2 text-white/80">Visibility: <span className="text-white font-medium">{((weather.visibility ?? 0) / 1000).toFixed(1)} km</span></p>
                </div>

                <div className="bg-white/5 border border-white/10 rounded-2xl p-6 hover:-translate-y-1 transition-transform duration-300">
                  <h3 className="text-lg font-semibold border-b border-white/10 pb-3 mb-4">Wind & Sun</h3>
                  <p className="my-2 text-white/80">Wind Speed: <span className="text-white font-medium">{weather.wind?.speed ?? 0} m/s</span></p>
                  <p className="my-2 text-white/80">Sunrise: <span className="text-white font-medium">{weather.sys?.sunrise ? formatTime(weather.sys.sunrise) : "--:--"}</span></p>
                  <p className="my-2 text-white/80">Sunset: <span className="text-white font-medium">{weather.sys?.sunset ? formatTime(weather.sys.sunset) : "--:--"}</span></p>
                </div>

                <div className="bg-white/5 border border-white/10 rounded-2xl p-6 hover:-translate-y-1 transition-transform duration-300">
                  <h3 className="text-lg font-semibold border-b border-white/10 pb-3 mb-4">Temp Range</h3>
                  <p className="my-2 text-white/80">Min Temp: <span className="text-white font-medium">{Math.round(weather.main?.temp_min ?? 0)}°C</span></p>
                  <p className="my-2 text-white/80">Max Temp: <span className="text-white font-medium">{Math.round(weather.main?.temp_max ?? 0)}°C</span></p>
                </div>
              </div>

              {/* 5-DAY FORECAST SECTION */}
              {dailyForecasts.length > 0 && (
                <>
                  <hr className="border-t border-white/20 mt-4 mb-2" />
                  <div>
                    <h3 className="text-xl font-bold mb-6 tracking-wide">5-Day Forecast</h3>
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4">
                      {dailyForecasts.map((item, index) => {
                        const date = new Date(item.dt * 1000);
                        const dayName = date.toLocaleDateString("en-US", { weekday: "short" });
                        const dayCondition = item.weather?.[0]?.main?.toLowerCase() ?? "clear";
                        const popPercent = Math.round((item.pop ?? 0) * 100);

                        return (
                          <div
                            key={index}
                            className="bg-white/5 border border-white/10 rounded-2xl p-4 flex flex-col items-center justify-center hover:-translate-y-1 hover:bg-white/10 transition-all duration-300"
                          >
                            <span className="text-white/80 font-medium mb-3">{dayName}</span>
                            <WeatherIcon condition={dayCondition} isDay={true} className="w-10 h-10 mb-3" />
                            <div className="flex gap-2 text-sm mb-1">
                              <span className="font-bold">{Math.round(item.main?.temp_max ?? item.main?.temp ?? 0)}°</span>
                              <span className="text-white/50">{Math.round(item.main?.temp_min ?? item.main?.temp ?? 0)}°</span>
                            </div>
                            {popPercent > 0 ? (
                              <span className="text-xs text-blue-300 font-medium flex items-center gap-1 mt-1">
                                💧 {popPercent}%
                              </span>
                            ) : (
                              <span className="text-xs text-transparent mt-1">_</span>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </>
              )}

            </section>

            {/* VAYU ORACLE AI */}
            <div className="lg:col-span-1 w-full h-[600px] lg:h-auto">
              <AtmosphericOracle
                weatherData={weather}
                activeCity={weather.name || initialCity}
              />
            </div>
          </div>
        ) : (
          <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-3xl p-12 text-center shadow-xl w-full max-w-2xl mt-10">
            <p className="text-2xl font-medium mb-3">Connecting to Vayu Stream...</p>
            <small className="text-white/60 text-base">(Fetching live atmospheric data)</small>
          </div>
        )}
      </div>
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
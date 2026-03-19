"use client";

import { useState, useEffect, useRef } from "react";

interface SearchBarProps {
  onCitySelect: (cityName: string) => void;
}

export default function SearchBar({ onCitySelect }: SearchBarProps){
    const [cityInput, setCityInput] = useState("");
    const [suggestions, setSuggestions] = useState<any[]>([]);
    const API_KEY = process.env.NEXT_PUBLIC_GEOAPIFY_KEY;
    const skipFetch = useRef(false);
    useEffect(() => {
        if (skipFetch.current) {
          skipFetch.current = false;
          return;
        }
    const fetchCities = async () => {
        const searchterm = cityInput.trim().toLowerCase();
      if (searchterm.length < 2) {
        setSuggestions([]);
        return;
      }

      try {
        const response = await fetch(
          `https://api.geoapify.com/v1/geocode/autocomplete?text=${searchterm}&type=city&format=json&apiKey=${API_KEY}`
        );
        const data= await response.json();
        console.log("API returned these cities:", data);
        if (data && data.results && Array.isArray(data.results)) {
      setSuggestions(data.results);
    } else {
      setSuggestions([]);
    }
      } catch (error) {
        console.error("Error fetching city suggestions:", error);
      }
    };

    const timeoutId = setTimeout(() => {
        fetchCities();
    }, 500);

    return () => clearTimeout(timeoutId);
  }, [cityInput, API_KEY]);
  const handleClear = () => {
    setCityInput("");
    setSuggestions([]);
  };
  return (
    <div className="relative w-full max-w-3xl mb-10 z-50">
        <div className="relative w-full">
      <input
        type="text"
        value={cityInput}
        onChange={(e) => setCityInput(e.target.value)}
        placeholder="Search global cities..."
        className="w-full px-8 py-4 bg-white/10 border border-white/20 rounded-2xl backdrop-blur-md text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-white/40 shadow-lg text-lg"
      ></input>
      {cityInput.length > 0 && (
          <button
            onClick={handleClear}
            className="absolute right-4 top-1/2 -translate-y-1/2 p-2 text-white/50 hover:text-white transition-colors duration-200"
            aria-label="Clear search"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M18 6 6 18"/><path d="m6 6 12 12"/>
            </svg>
          </button>
        )}</div>
      {suggestions.length > 0 && (
        <ul className="absolute top-full left-0 w-full mt-2 bg-slate-900/70 backdrop-blur-xl border border-white/10 rounded-2xl overflow-hidden max-h-72 overflow-y-auto shadow-2xl">
          {suggestions.map((item, index) => (
            <li
              key={index}
              onClick={() => {
                onCitySelect(item.city || item.name);
                setCityInput(item.city || item.name);
                setSuggestions([]);
                skipFetch.current = true;
              }}
              className="px-6 py-4 cursor-pointer border-b border-white/5 hover:bg-white/20 hover:pl-8 transition-all duration-300"
            >
              {item.city}, {item.country}
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="group-hover:translate-x-1 transition-transform">
                  <path d="M5 12h14"/><path d="m12 5 7 7-7 7"/>
                </svg>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
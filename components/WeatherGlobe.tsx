import { useEffect, useState, useRef } from 'react';
import dynamic from 'next/dynamic';
// Import the methods type from the library
import { GlobeMethods } from 'react-globe.gl';

const Globe = dynamic(() => import('react-globe.gl'), { ssr: false });

// 1. Defined the interface to match what your JSON provides
interface City {
  name?: string;
  city?: string;
  lat: number;
  lng: number;
}

export default function InteractiveGlobe() {
  // 2. Properly type the Ref so it knows about .pointOfView()
  const globeEl = useRef<GlobeMethods>(null!); 
  
  const [mounted, setMounted] = useState(false);
  const [cities, setCities] = useState<City[]>([]);
  const [selectedCity, setSelectedCity] = useState("");
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });

  useEffect(() => {
    setMounted(true);
    setDimensions({ width: window.innerWidth, height: window.innerHeight });
    
    fetch('/cities.json')
      .then(res => res.json())
      .then((data: City[]) => setCities(data));

    const handleResize = () => {
      setDimensions({ width: window.innerWidth, height: window.innerHeight });
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // 3. Match the library's expected click signature
  const handlePointClick = (point: object) => {
    const cityData = point as City; // Type assertion to access our properties
    const cityName = cityData.name || cityData.city || "Unknown City";
    
    setSelectedCity(cityName);
    
    // 4. Use Optional Chaining (?.) to handle the "possibly null" error
    globeEl.current?.pointOfView({ 
      lat: cityData.lat, 
      lng: cityData.lng, 
      altitude: 1.5 
    }, 1000);
  };

  if (!mounted) return null;

  return (
    <div className="relative w-screen h-screen bg-[#020205] overflow-hidden">
      <div className="absolute top-10 left-1/2 -translate-x-1/2 z-50 w-full max-w-md px-4">
        <input 
          type="text" 
          value={selectedCity}
          placeholder="Click a city on the globe..."
          readOnly
          className="w-full bg-white/10 backdrop-blur-md border border-white/20 rounded-xl py-3 px-5 text-center text-white outline-none"
        />
      </div>

      <div className="absolute inset-0 flex items-center justify-center">
        <Globe
        
          ref={globeEl}
          width={dimensions.width}
          height={dimensions.height}
          globeImageUrl="//unpkg.com/three-globe/example/img/earth-blue-marble.jpg"
          pointsData={cities}
          pointLat="lat"
          pointLng="lng"
          pointColor={() => '#3b82f6'}
          pointRadius={0.3}
          onPointClick={handlePointClick}
          backgroundColor="rgba(0,0,0,0)"
        />
      </div>
    </div>
  );
}
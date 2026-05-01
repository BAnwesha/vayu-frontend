import { useState, useEffect } from 'react';

export const useWeatherSocket = (city: string) => {
    const [weatherData, setWeatherData] = useState<any>(null);
    const [liveViewers, setLiveViewers] = useState<number>(0);

    useEffect(() => {
        if (!city) return;

        const socket = new WebSocket('ws://localhost:8080/weather');

        socket.onopen = () => {
            socket.send(city);
        };

        socket.onmessage = (event) => {
            const payload = JSON.parse(event.data);
            if (payload.weather) {
                setWeatherData(payload.weather);
                setLiveViewers(payload.liveViewers);
            }
        };

        return () => {
            socket.close();
        };
    }, [city]);

    return { weatherData, liveViewers };
};
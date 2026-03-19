

# Vayu Frontend | Live Weather Dashboard 🌦️

A highly dynamic, responsive weather dashboard built with Next.js and Tailwind CSS. It connects to a custom Spring Boot WebSocket server to receive live, optimized weather updates.

## ✨ Key Features
* **Live WebSocket Integration:** Maintains a persistent connection to the backend, updating the UI instantly only when atmospheric conditions change.
* **Dynamic Theming:** The background gradient automatically shifts based on the time of day (using real sunrise/sunset epoch data) and current weather conditions.
* **Pure CSS Weather Animations:** Features a custom `<WeatherAnimations />` component that renders falling rain, floating clouds, and twinkling stars using pure CSS keyframes (no heavy animation libraries required).
* **Smart Autocomplete:** Integrates the Geoapify Geocoding API for global city search, featuring custom debounce logic and dependency-loop prevention.
* **Glassmorphism UI:** Modern, frosted-glass aesthetic built entirely with Tailwind utility classes.

## 🛠️ Tech Stack
* **Framework:** Next.js (React)
* **Styling:** Tailwind CSS
* **Icons:** Custom dynamic SVG components
* **External API:** Geoapify (Autocomplete)

## 🚀 Running Locally

1. Clone the repository:
   ```bash
   git clone [https://github.com/yourusername/vayu-frontend.git](https://github.com/yourusername/vayu-frontend.git)

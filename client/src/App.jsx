import { useState } from "react";
import axios from "axios";

function App() {
  const API_URL = import.meta.env.VITE_API_URL;
  const [city, setCity] = useState("");
  const [weather, setWeather] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [locationLoading , setLocationLoading] = useState(false);
  const [forecast, setForecast] = useState([]);
  const [history, setHistory] = useState(
    JSON.parse(localStorage.getItem("history")) || [],
  );
  const clearSearch = ()=>{
    setCity("");
  }

  const getWeather = async (searchCity = city) => {
    if (typeof searchCity !== "string" || !searchCity.trim()) {
      return;
    }

    try {
      setLoading(true);
      setError("");

      const res = await axios.get(
        `${API_URL}/api/weather${searchCity}`,
      );

      setWeather(res.data);
      const updatedHistory = [
        searchCity,
        ...history.filter((item) => item !== searchCity),
      ].slice(0, 5);

      setHistory(updatedHistory);

      localStorage.setItem("history", JSON.stringify(updatedHistory));
      console.log("Fetching forecast...");

      const forecastRes = await axios.get(
        `${API_URL}/api/weather/forecast/${searchCity}`,
      );

      console.log("Forecast success:", forecastRes.data);

      setForecast(forecastRes.data.list);
      
    } catch (err) {
      console.log("ERROR:", err);

      setError("City not found");
      setWeather(null);
      setForecast([]);
    } finally {
      setLoading(false);
      
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter") {
      getWeather();
      clearSearch();
    }
  };
  const getCurrentLocation = () => {
      setLocationLoading(true);
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        try {
          const { latitude, longitude } = position.coords;

          const res = await axios.get(
            `${API_URL}/api/weather/location/current?lat=${latitude}&lon=${longitude}`,
          );

          setWeather(res.data);
          setCity(res.data.name);

          const updatedHistory = [
            res.data.name,
            ...history.filter((item) => item !== res.data.name),
          ].slice(0, 5);

          setHistory(updatedHistory);

          localStorage.setItem("history", JSON.stringify(updatedHistory));

          setError("");
           
        } catch (error) {
          setError("Error fetching weather data");
        }
        finally{
          setLocationLoading(false);
        }
      },
      () => {
        setError("Location permission failed!");
        setLocationLoading(false);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0,
      },
    );
  };

  return (
    <div className="min-h-screen bg-blue-400 text-white flex items-center justify-center p-6">
      <div className="w-full max-w-md">
        <div className="backdrop-blur-xl bg-white/15 border border-white/20 rounded-3xl shadow-2xl p-8 text-white">
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold tracking-tight">Weather App</h1>
            <p className="text-slate-500 mt-2">
              Search any city around the world
            </p>
          </div>

          <div className="flex gap-3 mb-6">
            <input
              type="text"
              placeholder="Enter city..."
              value={city}
              onChange={(e) => setCity(e.target.value)}
              onKeyDown={handleKeyDown}
              className="flex-1 px-4 py-3 rounded-xl bg-white/20 border border-white/20 placeholder:text-black text-black outline-none focus:ring-2 focus:ring-white/40"
            />

            <button
              onClick={() => getWeather() }
              className="px-5 py-3 rounded-xl bg-white text-blue-700 font-semibold hover:scale-105 transition duration-200"
            >
              Search
            </button>
          </div>
          <div className="flex flex-wrap gap-2 mt-4">
            {history.map((item) => (
              <button
                key={item}
                onClick={() => getWeather(item)}
                className="px-3 py-1 rounded-lg bg-slate-700 text-white text-sm"
              >
                {item}
              </button>
            ))}
          </div>
          <button
            onClick={getCurrentLocation}
            disabled={loading}
            className="px-4 py-3 rounded-xl bg-pink-500 font-semibold hover:scale-105 transition duration-200 disabled:opacity-50"
          >
            {locationLoading ? "Getting Location..." : "Use My Location"}
             
          </button>

          {/* Loading */}
          {loading && (
            <div className="flex justify-center py-6">
              <div className="h-10 w-10 border-4 border-white border-t-transparent rounded-full animate-spin"></div>
              Loading weather...
            </div>
          )}

          {/* Error */}
          {error && (
            <div className="bg-red-500/20 border border-red-400/30 rounded-xl p-3 text-center">
              {error}
            </div>
          )}

          {/* Weather Card */}
          {weather && !loading && (
            <div className="mt-6">
              <div className="text-center">
                <h2 className="text-3xl font-bold">{weather.name}</h2>

                <img
                  className="mx-auto w-28 h-28"
                  src={`https://openweathermap.org/img/wn/${weather.weather[0].icon}@4x.png`}
                  alt="weather icon"
                />

                <p className="capitalize text-white -mt-4">
                  {weather.weather[0].description}
                </p>

                <div className="text-7xl font-bold mt-4">
                  {Math.round(weather.main.temp)}°
                </div>

                <p className="text-white mt-1">
                  Feels like {Math.round(weather.main.feels_like)}°
                </p>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mt-8">
                {forecast
                  .filter((_, index) => index % 8 === 0)
                  .slice(0, 5)
                  .map((item, index) => (
                    <div key={index} className="bg-slate-800 p-4 rounded-xl">
                      <p>
                        {new Date(item.dt_txt).toLocaleDateString("en-US", {
                          weekday: "short",
                        })}
                      </p>

                      <div className="mt-2">
                        <img
                          className="w-12 h-12 mx-auto"
                          src={`https://openweathermap.org/img/wn/${item.weather[0].icon}.png`}
                          alt=""
                        />

                        <p className="text-xl font-semibold">
                          {Math.round(item.main.temp)}°
                        </p>
                      </div>
                    </div>
                  ))}
              </div>

              {/* Stats Grid */}
              <div className="grid grid-cols-2 gap-4 mt-8">
                <div className="bg-white/10 rounded-2xl p-4">
                  <p className="text-sm text-white">Humidity</p>
                  <p className="text-2xl font-bold">{weather.main.humidity}%</p>
                </div>

                <div className="bg-white/10 rounded-2xl p-4">
                  <p className="text-sm text-white">Wind</p>
                  <p className="text-2xl font-bold">{weather.wind.speed}</p>
                </div>

                <div className="bg-white/10 rounded-2xl p-4">
                  <p className="text-sm text-white">Max Temp</p>
                  <p className="text-2xl font-bold">
                    {Math.round(weather.main.temp_max)}°
                  </p>
                </div>

                <div className="bg-white/10 rounded-2xl p-4">
                  <p className=" text-white">Min Temp</p>
                  <p className="text-2xl font-bold">
                    {Math.round(weather.main.temp_min)}°
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>

        <p className="text-center text-slate-900 mt-5 text-sm">
          Built with React • Express • OpenWeather API
        </p>
      </div>
    </div>
  );
}

export default App;

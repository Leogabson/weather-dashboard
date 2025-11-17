import { useState } from "react";
import axios from "axios";

function App() {
  const [city, setCity] = useState("");
  const [weather, setWeather] = useState(null);
  const [forecast, setForecast] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [isCelsius, setIsCelsius] = useState(true);

  const API_KEY = import.meta.env.VITE_WEATHER_API_KEY;

  const fetchWeather = async () => {
    if (!city.trim()) {
      setError("Please enter a city name");
      return;
    }

    setLoading(true);
    setError("");
    setWeather(null);
    setForecast([]);

    try {
      // Fetch current weather
      const weatherRes = await axios.get(
        `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${API_KEY}&units=metric`
      );

      // Fetch 5-day forecast
      const forecastRes = await axios.get(
        `https://api.openweathermap.org/data/2.5/forecast?q=${city}&appid=${API_KEY}&units=metric`
      );

      setWeather(weatherRes.data);

      // Get one forecast per day (every 8th item = 24 hours)
      const dailyForecast = forecastRes.data.list
        .filter((_, index) => index % 8 === 0)
        .slice(0, 5);
      setForecast(dailyForecast);

      setCity("");
    } catch (err) {
      setError(
        err.response?.data?.message || "City not found. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter") {
      fetchWeather();
    }
  };

  const convertTemp = (temp) => {
    if (isCelsius) {
      return Math.round(temp);
    }
    return Math.round((temp * 9) / 5 + 32);
  };

  const getWeatherIcon = (iconCode) => {
    return `https://openweathermap.org/img/wn/${iconCode}@2x.png`;
  };

  const formatDate = (timestamp) => {
    const date = new Date(timestamp * 1000);
    return date.toLocaleDateString("en-US", {
      weekday: "short",
      month: "short",
      day: "numeric",
    });
  };

  const getWeatherGradient = () => {
    if (!weather) return "from-blue-400 via-blue-500 to-blue-600";

    const condition = weather.weather[0].main.toLowerCase();

    if (condition.includes("clear"))
      return "from-yellow-400 via-orange-400 to-red-400";
    if (condition.includes("cloud"))
      return "from-gray-400 via-gray-500 to-gray-600";
    if (condition.includes("rain") || condition.includes("drizzle"))
      return "from-blue-500 via-blue-600 to-indigo-700";
    if (condition.includes("snow"))
      return "from-blue-100 via-blue-200 to-blue-300";
    if (condition.includes("thunder"))
      return "from-gray-700 via-purple-800 to-indigo-900";

    return "from-blue-400 via-blue-500 to-blue-600";
  };

  return (
    <div
      className={`min-h-screen bg-gradient-to-br ${getWeatherGradient()} p-4 transition-all duration-700`}
    >
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center py-8">
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-2">
            Weather Dashboard
          </h1>
          <p className="text-blue-100">Get weather updates for any city</p>
        </div>

        {/* Search Bar */}
        <div className="mb-8">
          <div className="flex gap-2 max-w-md mx-auto">
            <input
              type="text"
              placeholder="Enter city name..."
              value={city}
              onChange={(e) => setCity(e.target.value)}
              onKeyPress={handleKeyPress}
              className="flex-1 px-4 py-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-300"
            />
            <button
              onClick={fetchWeather}
              disabled={loading}
              className="px-6 py-3 bg-white text-blue-600 font-semibold rounded-lg hover:bg-blue-50 transition disabled:opacity-50"
            >
              {loading ? "Loading..." : "Search"}
            </button>
          </div>
          {error && (
            <p className="text-center text-red-200 mt-2 font-semibold">
              {error}
            </p>
          )}
        </div>

        {/* Temperature Toggle */}
        {weather && (
          <div className="flex justify-center mb-6">
            <div className="bg-white/90 backdrop-blur-sm rounded-lg p-1 flex gap-1">
              <button
                onClick={() => setIsCelsius(true)}
                className={`px-4 py-2 rounded-md font-semibold transition ${
                  isCelsius
                    ? "bg-blue-600 text-white"
                    : "text-gray-600 hover:bg-gray-100"
                }`}
              >
                °C
              </button>
              <button
                onClick={() => setIsCelsius(false)}
                className={`px-4 py-2 rounded-md font-semibold transition ${
                  !isCelsius
                    ? "bg-blue-600 text-white"
                    : "text-gray-600 hover:bg-gray-100"
                }`}
              >
                °F
              </button>
            </div>
          </div>
        )}

        {/* Current Weather Card */}
        {weather && (
          <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-xl p-8 mb-8 animate-fadeIn">
            <div className="text-center">
              <h2 className="text-3xl font-bold text-gray-800 mb-2">
                {weather.name}, {weather.sys.country}
              </h2>
              <div className="flex items-center justify-center mb-4">
                <img
                  src={getWeatherIcon(weather.weather[0].icon)}
                  alt={weather.weather[0].description}
                  className="w-24 h-24"
                />
              </div>
              <p className="text-6xl font-bold text-gray-800 mb-2">
                {convertTemp(weather.main.temp)}°{isCelsius ? "C" : "F"}
              </p>
              <p className="text-xl text-gray-600 capitalize mb-6">
                {weather.weather[0].description}
              </p>

              {/* Weather Details */}
              <div className="grid grid-cols-3 gap-4 max-w-md mx-auto">
                <div className="bg-blue-50 rounded-lg p-3">
                  <p className="text-gray-600 text-sm">Feels Like</p>
                  <p className="text-xl font-semibold text-gray-800">
                    {convertTemp(weather.main.feels_like)}°
                    {isCelsius ? "C" : "F"}
                  </p>
                </div>
                <div className="bg-blue-50 rounded-lg p-3">
                  <p className="text-gray-600 text-sm">Humidity</p>
                  <p className="text-xl font-semibold text-gray-800">
                    {weather.main.humidity}%
                  </p>
                </div>
                <div className="bg-blue-50 rounded-lg p-3">
                  <p className="text-gray-600 text-sm">Wind</p>
                  <p className="text-xl font-semibold text-gray-800">
                    {Math.round(weather.wind.speed)} m/s
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* 5-Day Forecast */}
        {forecast.length > 0 && (
          <div className="animate-fadeIn">
            <h3 className="text-2xl font-bold text-white mb-4 text-center">
              5-Day Forecast
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
              {forecast.map((day, index) => (
                <div
                  key={index}
                  className="bg-white/90 backdrop-blur-sm rounded-xl shadow-lg p-4 text-center hover:scale-105 transition-transform"
                >
                  <p className="font-semibold text-gray-700 mb-2">
                    {formatDate(day.dt)}
                  </p>
                  <img
                    src={getWeatherIcon(day.weather[0].icon)}
                    alt={day.weather[0].description}
                    className="w-16 h-16 mx-auto"
                  />
                  <p className="text-2xl font-bold text-gray-800">
                    {convertTemp(day.main.temp)}°{isCelsius ? "C" : "F"}
                  </p>
                  <p className="text-sm text-gray-600 capitalize">
                    {day.weather[0].description}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Empty State */}
        {!weather && !loading && !error && (
          <div className="text-center text-white text-lg">
            <p>🌤️ Search for a city to see the weather</p>
          </div>
        )}
      </div>
    </div>
  );
}

export default App;

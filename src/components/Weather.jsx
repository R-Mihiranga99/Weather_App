import React, { useEffect, useRef, useState } from 'react'
import '../styles/Weather.css'
import search_icon from '../assets/search.png'
import clear_icon from '../assets/clear.png'
import cloud_icon from '../assets/cloud.png'
import drizzle_icon from '../assets/drizzle.png'
import rain_icon from '../assets/rain.png'
import snow_icon from '../assets/snow.png'

// Note: You might want to find specific icons for these, but we can reuse existing ones or use text for now
const Weather = () => {
    const inputRef = useRef()
    const [weatherData, setWeatherData] = useState(false);
    const [forecastData, setForecastData] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [bgClass, setBgClass] = useState('default'); // State for dynamic background

    const allIcons = {
        "01d": clear_icon, "01n": clear_icon,
        "02d": cloud_icon, "02n": cloud_icon,
        "03d": cloud_icon, "03n": cloud_icon,
        "04d": drizzle_icon, "04n": drizzle_icon,
        "09d": rain_icon, "09n": rain_icon,
        "10d": rain_icon, "10n": rain_icon,
        "13d": snow_icon, "13n": snow_icon,
    }

    // Helper to determine background based on weather description
    const updateBackground = (weatherCode) => {
        const code = weatherCode.toLowerCase();
        if (code.includes('clear')) setBgClass('clear');
        else if (code.includes('cloud')) setBgClass('clouds');
        else if (code.includes('rain') || code.includes('drizzle')) setBgClass('rain');
        else if (code.includes('snow')) setBgClass('snow');
        else setBgClass('default');
    };

    const fetchData = async (url) => {
        setLoading(true);
        setError('');
        try {
            const response = await fetch(url);
            const data = await response.json();

            if (!response.ok) {
                setError(data.message || "City not found");
                setWeatherData(false);
                setForecastData([]);
                return;
            }

            // 1. Process Current Weather
            const icon = allIcons[data.weather[0].icon] || clear_icon;
            updateBackground(data.weather[0].main);
            
            setWeatherData({
                humidity: data.main.humidity,
                windSpeed: data.wind.speed,
                temperature: Math.floor(data.main.temp),
                feelsLike: Math.floor(data.main.feels_like),
                pressure: data.main.pressure,
                location: data.name,
                country: data.sys.country,
                icon: icon,
                description: data.weather[0].description,
                dt: data.dt // Unix timestamp for time
            });

            // 2. Fetch 5-Day Forecast (Requires a second API call usually, but using same coords if possible is better)
            // Note: We use the coordinates from the first call to ensure accuracy for the second
            const { lat, lon } = data.coord;
            const forecastUrl = `https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&units=metric&appid=${import.meta.env.VITE_APP_ID}`;
            
            const forecastRes = await fetch(forecastUrl);
            const forecastJson = await forecastRes.json();

            if(forecastRes.ok) {
                // Filter: Get one reading per day (e.g., around noon 12:00:00)
                const dailyData = forecastJson.list.filter(reading => reading.dt_txt.includes("12:00:00")).slice(0, 5);
                setForecastData(dailyData);
            }

        } catch (error) {
            setWeatherData(false);
            setForecastData([]);
            setError("Failed to fetch weather data");
            console.error("Error:", error);
        } finally {
            setLoading(false);
        }
    };

    const search = (city) => {
        if (city === "") {
            setError("Please enter a city name");
            return;
        }
        const url = `https://api.openweathermap.org/data/2.5/weather?q=${city}&units=metric&appid=${import.meta.env.VITE_APP_ID}`;
        fetchData(url);
    }

    const searchByLocation = () => {
        if (navigator.geolocation) {
            setLoading(true);
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    const { latitude, longitude } = position.coords;
                    const url = `https://api.openweathermap.org/data/2.5/weather?lat=${latitude}&lon=${longitude}&units=metric&appid=${import.meta.env.VITE_APP_ID}`;
                    fetchData(url);
                },
                () => {
                    setLoading(false);
                    setError("Location access denied. Please search manually.");
                }
            );
        } else {
            setError("Geolocation is not supported by your browser.");
        }
    }

    useEffect(() => {
        search("London");
    }, [])

    const handleKeyPress = (e) => {
        if (e.key === 'Enter') {
            search(inputRef.current.value);
        }
    }

    // Date formatter
    const getCurrentDate = () => {
        return new Date().toLocaleDateString('en-US', {
            weekday: 'long', month: 'long', day: 'numeric' 
        });
    }

    return (
        <div className={`weather-app ${bgClass}`}>
            <div className='weather-card'>
                {/* Search Section */}
                <div className='search-section'>
                    <div className='search-bar'>
                        <input 
                            ref={inputRef} 
                            type='text' 
                            placeholder='Search city...' 
                            onKeyPress={handleKeyPress}
                            disabled={loading}
                        />
                        <button className='search-btn' onClick={() => search(inputRef.current.value)}>
                            <img src={search_icon} alt='Search' />
                        </button>
                    </div>
                    
                    {/* Location Button (Add a location icon here if you have one, or use text) */}
                    <button className='location-btn' onClick={searchByLocation} title="Use my location">
                        📍
                    </button>
                </div>
                
                {error && <div className='error-message'>{error}</div>}

                {loading ? (
                    <div className='loading-container'>
                        <div className='loading-spinner'></div>
                        <p>Updating forecast...</p>
                    </div>
                ) : weatherData ? (
                    <>
                        {/* Main Weather Info */}
                        <div className='weather-header'>
                            <p className='date-label'>{getCurrentDate()}</p>
                            <p className='location'>{weatherData.location}, {weatherData.country}</p>
                        </div>

                        <div className='weather-main'>
                            <img src={weatherData.icon} alt="Weather icon" className='weather-icon'/>
                            <div className='temp-container'>
                                <h1 className='temperature'>{weatherData.temperature}°</h1>
                                <p className='weather-description'>{weatherData.description}</p>
                            </div>
                        </div>

                        {/* Extended Details Grid */}
                        <div className='weather-details-grid'>
                            <div className='detail-card'>
                                <span className='detail-label'>Humidity</span>
                                <p className='detail-value'>{weatherData.humidity}%</p>
                            </div>
                            <div className='detail-card'>
                                <span className='detail-label'>Wind</span>
                                <p className='detail-value'>{weatherData.windSpeed} km/h</p>
                            </div>
                            <div className='detail-card'>
                                <span className='detail-label'>Feels Like</span>
                                <p className='detail-value'>{weatherData.feelsLike}°C</p>
                            </div>
                            <div className='detail-card'>
                                <span className='detail-label'>Pressure</span>
                                <p className='detail-value'>{weatherData.pressure} hPa</p>
                            </div>
                        </div>

                        {/* 5-Day Forecast Section */}
                        {forecastData.length > 0 && (
                            <div className='forecast-section'>
                                <h3>5-Day Forecast</h3>
                                <div className='forecast-list'>
                                    {forecastData.map((day, index) => (
                                        <div key={index} className='forecast-item'>
                                            <p className='forecast-day'>
                                                {new Date(day.dt * 1000).toLocaleDateString('en-US', { weekday: 'short' })}
                                            </p>
                                            <img src={allIcons[day.weather[0].icon] || clear_icon} alt="icon" />
                                            <p className='forecast-temp'>{Math.floor(day.main.temp)}°</p>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </>
                ) : (
                    <div className='no-data'>
                        <p>Search for a city to see weather information</p>
                    </div>
                )}
            </div>
        </div>
    )
}

export default Weather
import React, { useEffect, useRef, useState } from 'react'
import '../styles/Weather.css'
import search_icon from '../assets/search.png'
import clear_icon from '../assets/clear.png'
import cloud_icon from '../assets/cloud.png'
import drizzle_icon from '../assets/drizzle.png'
import rain_icon from '../assets/rain.png'
import snow_icon from '../assets/snow.png'
import wind_icon from '../assets/wind.png'
import humidity_icon from '../assets/humidity.png'

const Weather = () => {
    const inputRef = useRef()
    const [weatherData, setWeatherData] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const allIcons = {
        "01d": clear_icon,
        "01n": clear_icon,
        "02d": cloud_icon,
        "02n": cloud_icon,
        "03d": cloud_icon,
        "03n": cloud_icon,
        "04d": drizzle_icon,
        "04n": drizzle_icon,
        "09d": rain_icon,
        "09n": rain_icon,
        "10d": rain_icon,
        "10n": rain_icon,
        "13d": snow_icon,
        "13n": snow_icon,
    }

    const search = async (city) => {
        if (city === "") {
            setError("Please enter a city name");
            return;
        }
        
        setLoading(true);
        setError('');
        
        try {
            const url = `https://api.openweathermap.org/data/2.5/weather?q=${city}&units=metric&appid=${import.meta.env.VITE_APP_ID}`;

            const response = await fetch(url);
            const data = await response.json();
            
            if(!response.ok) {
                setError(data.message || "City not found");
                setWeatherData(false);
                return;
            }

            const icon = allIcons[data.weather[0].icon] || clear_icon;
            setWeatherData({
                humidity: data.main.humidity,
                windSpeed: data.wind.speed,
                temperature: Math.floor(data.main.temp),
                location: data.name,
                country: data.sys.country,
                icon: icon,
                description: data.weather[0].description
            })
        } catch (error) {
            setWeatherData(false);
            setError("Failed to fetch weather data");
            console.error("Error in fetching weather data:", error);
        } finally {
            setLoading(false);
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

  return (
    <div className='weather-app'>
        <div className='weather-card'>
            <div className='search-section'>
                <div className='search-bar'>
                    <input 
                        ref={inputRef} 
                        type='text' 
                        placeholder='Search for a city...' 
                        onKeyPress={handleKeyPress}
                        disabled={loading}
                    />
                    <button 
                        className='search-btn' 
                        onClick={() => search(inputRef.current.value)}
                        disabled={loading}
                    >
                        <img src={search_icon} alt='Search' />
                    </button>
                </div>
                {error && <div className='error-message'>{error}</div>}
            </div>

            {loading ? (
                <div className='loading-container'>
                    <div className='loading-spinner'></div>
                    <p>Loading weather data...</p>
                </div>
            ) : weatherData ? (
                <>
                    <div className='weather-main'>
                        <img src={weatherData.icon} alt="Weather icon" className='weather-icon'/>
                        <p className='temperature'>{weatherData.temperature}°C</p>
                        <p className='weather-description'>{weatherData.description}</p>
                    </div>
                    
                    <div className='location-section'>
                        <p className='location'>{weatherData.location}, {weatherData.country}</p>
                    </div>
                    
                    <div className='weather-details'>
                        <div className='detail-card'>
                            <img src={humidity_icon} alt='Humidity' />
                            <div className='detail-info'> 
                                <p className='detail-value'>{weatherData.humidity}%</p>
                                <span className='detail-label'>Humidity</span>
                            </div>
                        </div>

                        <div className='detail-card'>
                            <img src={wind_icon} alt='Wind speed' />
                            <div className='detail-info'>
                                <p className='detail-value'>{weatherData.windSpeed} km/h</p>
                                <span className='detail-label'>Wind Speed</span>
                            </div>
                        </div>
                    </div>
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
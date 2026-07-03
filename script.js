console.log('🚀 App started!');

/*API Configuration ( yaha free API ka base URL aur geocoding URL define kiya gaya hai )*/
const API_CONFIG = {
    BASE_URL: 'https://api.open-meteo.com/v1',
    GEO_URL: 'https://geocoding-api.open-meteo.com/v1'
};

const weatherCodes = {
    0: { desc: 'Clear sky', icon: 'fa-sun', color: '#f9a826' },
    1: { desc: 'Mainly clear', icon: 'fa-cloud-sun', color: '#f9a826' },
    2: { desc: 'Partly cloudy', icon: 'fa-cloud-sun', color: '#a7a9be' },
    3: { desc: 'Overcast', icon: 'fa-cloud', color: '#a7a9be' },
    45: { desc: 'Fog', icon: 'fa-smog', color: '#a7a9be' },
    48: { desc: 'Depositing rime fog', icon: 'fa-smog', color: '#a7a9be' },
    51: { desc: 'Light drizzle', icon: 'fa-cloud-rain', color: '#4ecdc4' },
    53: { desc: 'Moderate drizzle', icon: 'fa-cloud-rain', color: '#4ecdc4' },
    55: { desc: 'Dense drizzle', icon: 'fa-cloud-showers-heavy', color: '#4ecdc4' },
    61: { desc: 'Slight rain', icon: 'fa-cloud-rain', color: '#4ecdc4' },
    63: { desc: 'Moderate rain', icon: 'fa-cloud-showers-heavy', color: '#4ecdc4' },
    65: { desc: 'Heavy rain', icon: 'fa-cloud-showers-heavy', color: '#ff6b6b' },
    71: { desc: 'Slight snow fall', icon: 'fa-snowflake', color: '#6bcbff' },
    73: { desc: 'Moderate snow fall', icon: 'fa-snowflake', color: '#6bcbff' },
    75: { desc: 'Heavy snow fall', icon: 'fa-snowflake', color: '#6bcbff' },
    80: { desc: 'Rain showers', icon: 'fa-cloud-rain', color: '#4ecdc4' },
    81: { desc: 'Moderate rain showers', icon: 'fa-cloud-showers-heavy', color: '#4ecdc4' },
    82: { desc: 'Violent rain showers', icon: 'fa-cloud-showers-heavy', color: '#ff6b6b' },
    95: { desc: 'Thunderstorm', icon: 'fa-bolt', color: '#ffd93d' },
    96: { desc: 'Thunderstorm with hail', icon: 'fa-bolt', color: '#ff6b6b' },
    99: { desc: 'Severe thunderstorm', icon: 'fa-bolt', color: '#ff0000' }
};

function getWeatherCodeInfo(code) {
    return weatherCodes[code] || weatherCodes[0];
}

console.log('📦 Getting DOM elements...');

const DOM = {
    loading: document.getElementById('loading'),
    searchInput: document.getElementById('searchInput'),
    searchBtn: document.getElementById('searchBtn'),
    locationBtn: document.getElementById('locationBtn'),
    themeToggle: document.getElementById('themeToggle'),
    cityName: document.getElementById('cityName'),
    dateTime: document.getElementById('dateTime'),
    weatherDesc: document.getElementById('weatherDesc'),
    currentTemp: document.getElementById('currentTemp'),
    tempMax: document.getElementById('tempMax'),
    tempMin: document.getElementById('tempMin'),
    weatherIcon: document.getElementById('weatherIcon'),
    windSpeed: document.getElementById('windSpeed'),
    humidity: document.getElementById('humidity'),
    airQuality: document.getElementById('airQuality'),
    precipitation: document.getElementById('precipitation'),
    forecastContainer: document.getElementById('forecastContainer'),
    alertsContainer: document.getElementById('alertsContainer'),
    alertCount: document.getElementById('alertCount'),
    citiesGrid: document.getElementById('citiesGrid'),
    lastUpdated: document.getElementById('lastUpdated')
};

console.log('✅ DOM elements:', Object.keys(DOM));

function showLoading() {
    console.log('⏳ Showing loading...');
    if (DOM.loading) {
        DOM.loading.classList.remove('hidden');
    }
}

function hideLoading() {
    console.log('✅ Hiding loading...');
    if (DOM.loading) {
        DOM.loading.classList.add('hidden');
    }
}

async function getCityCoordinates(cityName) {
    console.log(`📍 Getting coordinates for: ${cityName}`);
    try {
        const url = `${API_CONFIG.GEO_URL}/search?name=${encodeURIComponent(cityName)}&count=1&language=en&format=json`;
        console.log(`🌐 Fetching: ${url}`);
        
        const response = await fetch(url);
        console.log(`📡 Response status: ${response.status}`);
        
        if (!response.ok) throw new Error(`HTTP ${response.status}`);
        
        const data = await response.json();
        console.log('📊 Geocoding data:', data);
        
        if (!data.results || data.results.length === 0) {
            throw new Error('City not found');
        }
        
        const result = data.results[0];
        const coords = {
            lat: result.latitude,
            lon: result.longitude,
            name: result.name,
            country: result.country || '',
            timezone: result.timezone || 'auto'
        };
        console.log('✅ Coordinates found:', coords);
        return coords;
    } catch (error) {
        console.error('❌ Error fetching city coordinates:', error);
        throw error;
    }
}

async function fetchWeatherData(lat, lon, timezone = 'auto') {
    console.log(`🌤️ Fetching weather for lat: ${lat}, lon: ${lon}`);
    try {
        const url = `${API_CONFIG.BASE_URL}/forecast?latitude=${lat}&longitude=${lon}&current_weather=true&daily=weathercode,temperature_2m_max,temperature_2m_min,precipitation_sum,precipitation_probability_max,wind_speed_10m_max&timezone=${timezone}&forecast_days=8`;
        console.log(`🌐 Fetching: ${url}`);
        
        const response = await fetch(url);
        console.log(`📡 Response status: ${response.status}`);
        
        if (!response.ok) throw new Error(`HTTP ${response.status}`);
        
        const data = await response.json();
        console.log('📊 Weather data received:', data);
        return {
            current: data.current_weather,
            daily: data.daily,
            alerts: []
        };
    } catch (error) {
        console.error('❌ Error fetching weather data:', error);
        throw error;
    }
}

async function getCompleteWeatherData(cityName) {
    console.log(`🔍 Getting complete weather for: ${cityName}`);
    try {
        const coords = await getCityCoordinates(cityName);
        const weather = await fetchWeatherData(coords.lat, coords.lon, coords.timezone);
        return {
            city: coords,
            weather: weather
        };
    } catch (error) {
        console.error('❌ Error getting complete weather data:', error);
        throw error;
    }
}

function updateCurrentWeather(data, cityName) {
    console.log('🔄 Updating current weather UI...');
    
    try {
        const { current, daily } = data;
        
        if (DOM.cityName) DOM.cityName.textContent = cityName;
        
        const now = new Date();
        const options = { 
            weekday: 'long', 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        };
        if (DOM.dateTime) DOM.dateTime.textContent = now.toLocaleDateString('en-US', options);
        
        if (DOM.currentTemp) DOM.currentTemp.textContent = Math.round(current.temperature);
        
        const weatherInfo = getWeatherCodeInfo(current.weathercode);
        if (DOM.weatherDesc) DOM.weatherDesc.textContent = weatherInfo.desc;
        if (DOM.weatherIcon) {
            DOM.weatherIcon.className = `fas ${weatherInfo.icon}`;
            DOM.weatherIcon.style.color = weatherInfo.color;
        }
        
        if (daily && daily.temperature_2m_max && daily.temperature_2m_min) {
            if (DOM.tempMax) DOM.tempMax.textContent = `↑ ${Math.round(daily.temperature_2m_max[0])}°`;
            if (DOM.tempMin) DOM.tempMin.textContent = `↓ ${Math.round(daily.temperature_2m_min[0])}°`;
        }
        
        if (current.windspeed !== undefined && DOM.windSpeed) {
            DOM.windSpeed.textContent = `${current.windspeed} km/h`;
        }
        
        if (DOM.humidity) DOM.humidity.textContent = '--%';
        if (DOM.airQuality) DOM.airQuality.textContent = 'N/A';
        
        if (daily && daily.precipitation_probability_max && DOM.precipitation) {
            const precip = Math.round(daily.precipitation_probability_max[0]);
            DOM.precipitation.textContent = `${precip}%`;
        }
        
        console.log('✅ UI updated successfully');
    } catch (error) {
        console.error('❌ Error updating UI:', error);
    }
}

function updateForecast(dailyData) {
    console.log('🔄 Updating forecast UI...');
    
    if (!dailyData || !dailyData.time) {
        if (DOM.forecastContainer) {
            DOM.forecastContainer.innerHTML = '<p class="no-data">No forecast data available</p>';
        }
        return;
    }
    
    const days = Math.min(dailyData.time.length, 7);
    let html = '';
    
    for (let i = 0; i < days; i++) {
        const date = new Date(dailyData.time[i]);
        const dayName = date.toLocaleDateString('en-US', { weekday: 'short' });
        const dayDate = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
        
        const maxTemp = Math.round(dailyData.temperature_2m_max[i]);
        const minTemp = Math.round(dailyData.temperature_2m_min[i]);
        const weatherInfo = getWeatherCodeInfo(dailyData.weathercode[i]);
        const precipProb = dailyData.precipitation_probability_max ? 
            Math.round(dailyData.precipitation_probability_max[i]) : 0;
        
        html += `
            <div class="forecast-card">
                <div class="day">${dayName}</div>
                <div class="date">${dayDate}</div>
                <div class="forecast-icon">
                    <i class="fas ${weatherInfo.icon}" style="color: ${weatherInfo.color}"></i>
                </div>
                <div class="forecast-temp">${maxTemp}°</div>
                <div class="forecast-range">↓ ${minTemp}°</div>
                <div class="forecast-desc">${weatherInfo.desc}</div>
                ${precipProb > 0 ? `<div class="forecast-precip">💧 ${precipProb}%</div>` : ''}
            </div>
        `;
    }
    
    if (DOM.forecastContainer) {
        DOM.forecastContainer.innerHTML = html;
        console.log('✅ Forecast updated');
    }
}

function updateAlerts(alerts) {
    if (!alerts || alerts.length === 0) {
        if (DOM.alertsContainer) {
            DOM.alertsContainer.innerHTML = `
                <div class="alert-item" style="border-left-color: #4ecdc4; background: rgba(78, 205, 196, 0.05);">
                    <div class="alert-info">
                        <span class="alert-icon" style="color: #4ecdc4;">✅</span>
                        <span>No active weather alerts for this location</span>
                    </div>
                </div>
            `;
        }
        if (DOM.alertCount) DOM.alertCount.textContent = '0 alerts';
        return;
    }
    
    let html = '';
    alerts.forEach(alert => {
        const severity = alert.severity || 'moderate';
        html += `
            <div class="alert-item">
                <div class="alert-info">
                    <span class="alert-icon"><i class="fas fa-triangle-exclamation"></i></span>
                    <div>
                        <div class="alert-title">${alert.title || 'Weather Alert'}</div>
                        <div class="alert-desc">${alert.description || alert.desc || 'No description'}</div>
                    </div>
                </div>
                <span class="alert-severity ${severity.toLowerCase()}">${severity.toUpperCase()}</span>
            </div>
        `;
    });
    
    if (DOM.alertsContainer) DOM.alertsContainer.innerHTML = html;
    if (DOM.alertCount) DOM.alertCount.textContent = `${alerts.length} alert${alerts.length > 1 ? 's' : ''}`;
}

function updateOtherCities(citiesData) {
    console.log('🔄 Updating other cities...');
    
    if (!citiesData || citiesData.length === 0) {
        if (DOM.citiesGrid) {
            DOM.citiesGrid.innerHTML = '<p class="no-data">No city data available</p>';
        }
        return;
    }
    
    let html = '';
    citiesData.forEach(city => {
        if (!city) return;
        const temp = city.weather?.current?.temperature;
        const weatherCode = city.weather?.current?.weathercode;
        const weatherInfo = weatherCode !== undefined ? getWeatherCodeInfo(weatherCode) : { icon: 'fa-cloud', color: '#a7a9be' };
        
        html += `
            <div class="city-card" data-city="${city.name}">
                <div class="city-name">${city.name}</div>
                <div class="city-icon">
                    <i class="fas ${weatherInfo.icon}" style="color: ${weatherInfo.color}"></i>
                </div>
                <div class="city-temp">${temp !== undefined ? Math.round(temp) : '--'}°</div>
                <div class="city-condition">${weatherInfo.desc || 'N/A'}</div>
            </div>
        `;
    });
    
    if (DOM.citiesGrid) {
        DOM.citiesGrid.innerHTML = html;
        
        document.querySelectorAll('.city-card').forEach(card => {
            card.addEventListener('click', () => {
                const cityName = card.dataset.city;
                if (cityName) {
                    if (DOM.searchInput) DOM.searchInput.value = cityName;
                    loadWeatherData(cityName);
                }
            });
        });
        console.log('✅ Other cities updated');
    }
}

function updateLastUpdated() {
    const now = new Date();
    if (DOM.lastUpdated) {
        DOM.lastUpdated.textContent = now.toLocaleTimeString('en-US', { 
            hour: '2-digit', 
            minute: '2-digit',
            second: '2-digit'
        });
    }
}

function showError(message) {
    console.error('❌ Error:', message);
    const toast = document.createElement('div');
    toast.className = 'error-toast';
    toast.innerHTML = `
        <i class="fas fa-exclamation-circle"></i>
        <span>${message}</span>
        <button class="toast-close">&times;</button>
    `;
    
    document.body.appendChild(toast);
    
    setTimeout(() => {
        toast.classList.add('fade-out');
        setTimeout(() => toast.remove(), 300);
    }, 5000);
    
    toast.querySelector('.toast-close').addEventListener('click', () => {
        toast.classList.add('fade-out');
        setTimeout(() => toast.remove(), 300);
    });
}

let temperatureChart = null;
let precipitationChart = null;

function initCharts() {
    console.log('📊 Initializing charts...');
    
    try {
        const tempCanvas = document.getElementById('temperatureChart');
        const precipCanvas = document.getElementById('precipitationChart');
        
        if (!tempCanvas || !precipCanvas) {
            console.log('⏳ Chart canvases not ready yet');
            return;
        }
        
        if (typeof Chart === 'undefined') {
            console.log('⏳ Chart.js not loaded yet');
            setTimeout(initCharts, 500);
            return;
        }
        
        const tempCtx = tempCanvas.getContext('2d');
        temperatureChart = new Chart(tempCtx, {
            type: 'line',
            data: {
                labels: [],
                datasets: [{
                    label: 'Max Temperature',
                    data: [],
                    borderColor: '#ff6b6b',
                    backgroundColor: 'rgba(255, 107, 107, 0.1)',
                    fill: true,
                    tension: 0.4,
                    pointBackgroundColor: '#ff6b6b',
                    pointBorderColor: '#fff',
                    pointBorderWidth: 2,
                    pointRadius: 4
                }, {
                    label: 'Min Temperature',
                    data: [],
                    borderColor: '#4ecdc4',
                    backgroundColor: 'rgba(78, 205, 196, 0.1)',
                    fill: true,
                    tension: 0.4,
                    pointBackgroundColor: '#4ecdc4',
                    pointBorderColor: '#fff',
                    pointBorderWidth: 2,
                    pointRadius: 4
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        labels: {
                            color: '#fffffe',
                            font: { size: 12 }
                        }
                    }
                },
                scales: {
                    x: {
                        grid: { color: 'rgba(255,255,255,0.1)' },
                        ticks: { color: '#fffffe' }
                    },
                    y: {
                        grid: { color: 'rgba(255,255,255,0.1)' },
                        ticks: { color: '#fffffe' }
                    }
                }
            }
        });
        
        const precipCtx = precipCanvas.getContext('2d');
        precipitationChart = new Chart(precipCtx, {
            type: 'bar',
            data: {
                labels: [],
                datasets: [{
                    label: 'Precipitation Probability',
                    data: [],
                    backgroundColor: 'rgba(78, 205, 196, 0.8)',
                    borderColor: '#4ecdc4',
                    borderWidth: 2,
                    borderRadius: 4,
                    hoverBackgroundColor: 'rgba(78, 205, 196, 1)'
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        labels: {
                            color: '#fffffe',
                            font: { size: 12 }
                        }
                    }
                },
                scales: {
                    x: {
                        grid: { color: 'rgba(255,255,255,0.1)' },
                        ticks: { color: '#fffffe' }
                    },
                    y: {
                        beginAtZero: true,
                        max: 100,
                        grid: { color: 'rgba(255,255,255,0.1)' },
                        ticks: {
                            color: '#fffffe',
                            callback: function(value) { return value + '%'; }
                        }
                    }
                }
            }
        });
        
        console.log('✅ Charts initialized successfully');
    } catch (error) {
        console.error('❌ Error initializing charts:', error);
    }
}

function updateCharts(dailyData) {
    if (!dailyData || !dailyData.time || !temperatureChart || !precipitationChart) {
        console.log('⏳ Charts not ready for update');
        return;
    }
    
    console.log('📊 Updating charts...');
    
    const days = Math.min(dailyData.time.length, 7);
    const labels = [];
    const maxTemps = [];
    const minTemps = [];
    const precipProb = [];
    
    for (let i = 0; i < days; i++) {
        const date = new Date(dailyData.time[i]);
        labels.push(date.toLocaleDateString('en-US', { weekday: 'short' }));
        maxTemps.push(Math.round(dailyData.temperature_2m_max[i]));
        minTemps.push(Math.round(dailyData.temperature_2m_min[i]));
        precipProb.push(dailyData.precipitation_probability_max ? 
            Math.round(dailyData.precipitation_probability_max[i]) : 0);
    }
    
    temperatureChart.data.labels = labels;
    temperatureChart.data.datasets[0].data = maxTemps;
    temperatureChart.data.datasets[1].data = minTemps;
    temperatureChart.update();
    
    precipitationChart.data.labels = labels;
    precipitationChart.data.datasets[0].data = precipProb;
    precipitationChart.update();
    
    console.log('✅ Charts updated');
}

// Main Functions
async function loadWeatherData(cityName) {
    console.log(`🔍 Loading weather for: ${cityName}`);
    showLoading();
    
    try {
        const data = await getCompleteWeatherData(cityName);
        console.log('📊 Full data:', data);
        
        if (!data || !data.weather) {
            throw new Error('No weather data received');
        }
        
        updateCurrentWeather(data.weather, data.city.name);
        updateForecast(data.weather.daily);
        updateAlerts(data.weather.alerts || []);
        updateCharts(data.weather.daily);
        
        if (DOM.searchInput) DOM.searchInput.value = data.city.name;
        updateLastUpdated();
        
        console.log(`✅ Weather data loaded for ${data.city.name}`);
        
        // Load other cities
        await loadOtherCities();
        
    } catch (error) {
        console.error('❌ Error loading weather data:', error);
        showError(`Failed to load weather data: ${error.message}`);
    } finally {
        hideLoading();
    }
}

async function loadOtherCities() {
    console.log('🌆 Loading other cities...');
    try {
        const cities = ['Beijing', 'Shanghai', 'Chongqing'];
        const citiesData = await Promise.all(cities.map(async city => {
            try {
                return await getCompleteWeatherData(city);
            } catch (e) {
                console.warn(`Could not load ${city}:`, e);
                return null;
            }
        }));
        updateOtherCities(citiesData.filter(c => c !== null));
    } catch (error) {
        console.error('Error loading other cities:', error);
    }
}

// Event Handlers 
function handleSearch() {
    const cityName = DOM.searchInput ? DOM.searchInput.value.trim() : '';
    console.log(`🔍 Searching for: ${cityName}`);
    if (!cityName) {
        showError('Please enter a city name');
        return;
    }
    loadWeatherData(cityName);
}

function handleLocationRequest() {
    console.log('📍 Getting user location...');
    if (!navigator.geolocation) {
        showError('Geolocation is not supported by your browser');
        return;
    }
    
    showLoading();
    
    navigator.geolocation.getCurrentPosition(
        async (position) => {
            try {
                const { latitude, longitude } = position.coords;
                console.log(`📍 Location: ${latitude}, ${longitude}`);
                
                const response = await fetch(
                    `https://api.open-meteo.com/v1/geocoding/reverse?latitude=${latitude}&longitude=${longitude}&format=json`
                );
                const data = await response.json();
                
                if (data.results && data.results.length > 0) {
                    const city = data.results[0];
                    console.log(`📍 Found city: ${city.name}`);
                    await loadWeatherData(city.name);
                } else {
                    throw new Error('Location not found');
                }
            } catch (error) {
                console.error('Error getting location:', error);
                showError('Failed to get weather for your location');
                await loadWeatherData('Guangzhou');
            } finally {
                hideLoading();
            }
        },
        (error) => {
            console.error('Geolocation error:', error);
            showError('Unable to access your location. Please search manually.');
            hideLoading();
        }
    );
}

function toggleTheme() {
    const currentTheme = document.documentElement.getAttribute('data-theme');
    const newTheme = currentTheme === 'light' ? 'dark' : 'light';
    document.documentElement.setAttribute('data-theme', newTheme);
    
    const icon = DOM.themeToggle ? DOM.themeToggle.querySelector('i') : null;
    if (icon) {
        icon.className = newTheme === 'light' ? 'fas fa-sun' : 'fas fa-moon';
    }
    
    localStorage.setItem('theme', newTheme);
}

function loadThemePreference() {
    const savedTheme = localStorage.getItem('theme') || 'dark';
    document.documentElement.setAttribute('data-theme', savedTheme);
    
    const icon = DOM.themeToggle ? DOM.themeToggle.querySelector('i') : null;
    if (icon) {
        icon.className = savedTheme === 'light' ? 'fas fa-sun' : 'fas fa-moon';
    }
}

async function initApp() {
    console.log('🌤️ Weather App Initializing...');
    console.log('📦 Checking dependencies...');
    console.log('Chart.js loaded:', typeof Chart !== 'undefined');
    
    loadThemePreference();
    
    if (DOM.searchBtn) {
        DOM.searchBtn.addEventListener('click', handleSearch);
        console.log('✅ Search button listener added');
    }
    
    if (DOM.searchInput) {
        DOM.searchInput.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') handleSearch();
        });
        console.log('✅ Search input listener added');
    }
    
    if (DOM.locationBtn) {
        DOM.locationBtn.addEventListener('click', handleLocationRequest);
        console.log('✅ Location button listener added');
    }
    
    if (DOM.themeToggle) {
        DOM.themeToggle.addEventListener('click', toggleTheme);
        console.log('✅ Theme toggle listener added');
    }
    
    setTimeout(initCharts, 500);
    
    console.log('🌍 Loading default city: Guangzhou');
    await loadWeatherData('Guangzhou');
    
    console.log('✅ Weather App Ready!');
}

document.addEventListener('DOMContentLoaded', () => {
    console.log('📄 DOM loaded!');
    initApp();
});

if (document.readyState === 'complete' || document.readyState === 'interactive') {
    console.log('📄 DOM already loaded, starting app...');
    initApp();
}
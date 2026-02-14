// ========================================
// CONSTANTS & CONFIGURATION
// ========================================
const API_BASE = 'https://api.open-meteo.com/v1';
const GEO_API = 'https://geocoding-api.open-meteo.com/v1';
const RECENT_SEARCHES_KEY = 'weatherRecentSearches';
const MAX_RECENT_SEARCHES = 5;

// Weather code to description and icon mapping
const WEATHER_CODES = {
    0: { desc: "Cerah", icon: "fa-sun", color: "#fbbf24" },
    1: { desc: "Cerah Berawan", icon: "fa-cloud-sun", color: "#60a5fa" },
    2: { desc: "Berawan Sebagian", icon: "fa-cloud-sun", color: "#60a5fa" },
    3: { desc: "Mendung", icon: "fa-cloud", color: "#94a3b8" },
    45: { desc: "Berkabut", icon: "fa-smog", color: "#94a3b8" },
    48: { desc: "Kabut Beku", icon: "fa-smog", color: "#94a3b8" },
    51: { desc: "Gerimis Ringan", icon: "fa-cloud-rain", color: "#60a5fa" },
    53: { desc: "Gerimis", icon: "fa-cloud-rain", color: "#60a5fa" },
    55: { desc: "Gerimis Lebat", icon: "fa-cloud-showers-heavy", color: "#3b82f6" },
    61: { desc: "Hujan Ringan", icon: "fa-cloud-rain", color: "#60a5fa" },
    63: { desc: "Hujan", icon: "fa-cloud-showers-heavy", color: "#3b82f6" },
    65: { desc: "Hujan Lebat", icon: "fa-cloud-showers-heavy", color: "#2563eb" },
    71: { desc: "Salju Ringan", icon: "fa-snowflake", color: "#93c5fd" },
    73: { desc: "Salju", icon: "fa-snowflake", color: "#60a5fa" },
    75: { desc: "Salju Lebat", icon: "fa-snowflake", color: "#3b82f6" },
    80: { desc: "Hujan Ringan", icon: "fa-cloud-rain", color: "#60a5fa" },
    81: { desc: "Hujan Deras", icon: "fa-cloud-showers-heavy", color: "#3b82f6" },
    82: { desc: "Hujan Sangat Deras", icon: "fa-cloud-showers-heavy", color: "#2563eb" },
    85: { desc: "Salju Ringan", icon: "fa-snowflake", color: "#93c5fd" },
    86: { desc: "Salju Lebat", icon: "fa-snowflake", color: "#3b82f6" },
    95: { desc: "Badai Petir", icon: "fa-cloud-bolt", color: "#7c3aed" },
    96: { desc: "Badai Petir & Hujan Es", icon: "fa-cloud-bolt", color: "#6d28d9" },
    99: { desc: "Badai Petir Kuat", icon: "fa-cloud-bolt", color: "#5b21b6" }
};

// ========================================
// INITIALIZATION
// ========================================
document.addEventListener('DOMContentLoaded', () => {
    console.log('🌤 Cloud Weather Pro - Initialized');
    
    // Hide loading screen
    setTimeout(() => {
        document.querySelector('.loading-screen').classList.add('hidden');
    }, 1000);

    // Load theme from localStorage
    loadTheme();
    
    // Setup event listeners
    setupEventListeners();
    
    // Load recent searches
    loadRecentSearches();
    
    // Update time every second
    updateCurrentTime();
    setInterval(updateCurrentTime, 1000);
});

// ========================================
// THEME MANAGEMENT
// ========================================
function loadTheme() {
    const savedTheme = localStorage.getItem('weatherTheme') || 'dark';
    document.documentElement.setAttribute('data-theme', savedTheme);
    updateThemeIcon(savedTheme);
}

function toggleTheme() {
    const html = document.documentElement;
    const currentTheme = html.getAttribute('data-theme');
    const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
    
    html.setAttribute('data-theme', newTheme);
    localStorage.setItem('weatherTheme', newTheme);
    updateThemeIcon(newTheme);
}

function updateThemeIcon(theme) {
    const icon = document.querySelector('.theme-toggle i');
    icon.className = theme === 'dark' ? 'fa-solid fa-moon' : 'fa-solid fa-sun';
}

// ========================================
// EVENT LISTENERS
// ========================================
function setupEventListeners() {
    // Theme toggle
    document.getElementById('themeToggle').addEventListener('click', toggleTheme);
    
    // Enter key on search input
    document.getElementById('cityInput').addEventListener('keypress', (e) => {
        if (e.key === 'Enter') searchWeather();
    });
    
    // Smooth scroll for nav links
    document.querySelectorAll('.menu a').forEach(link => {
        link.addEventListener('click', function(e) {
            if (this.getAttribute('href').startsWith('#')) {
                e.preventDefault();
                const target = document.querySelector(this.getAttribute('href'));
                if (target) {
                    target.scrollIntoView({ behavior: 'smooth' });
                }
            }
        });
    });
}

// ========================================
// RECENT SEARCHES MANAGEMENT
// ========================================
function loadRecentSearches() {
    const searches = getRecentSearches();
    const container = document.getElementById('recentSearches');
    
    if (searches.length === 0) return;
    
    container.innerHTML = '<p style="color: var(--text-secondary); font-size: 0.9rem; margin-bottom: 0.5rem;">Pencarian Terakhir:</p>';
    
    searches.forEach(city => {
        const tag = document.createElement('span');
        tag.className = 'recent-tag';
        tag.innerHTML = `<i class="fa-solid fa-clock-rotate-left"></i> ${city}`;
        tag.onclick = () => searchWeatherByCity(city);
        container.appendChild(tag);
    });
}

function getRecentSearches() {
    const searches = localStorage.getItem(RECENT_SEARCHES_KEY);
    return searches ? JSON.parse(searches) : [];
}

function addRecentSearch(cityName) {
    let searches = getRecentSearches();
    
    // Remove if already exists
    searches = searches.filter(city => city.toLowerCase() !== cityName.toLowerCase());
    
    // Add to beginning
    searches.unshift(cityName);
    
    // Limit to MAX_RECENT_SEARCHES
    if (searches.length > MAX_RECENT_SEARCHES) {
        searches = searches.slice(0, MAX_RECENT_SEARCHES);
    }
    
    localStorage.setItem(RECENT_SEARCHES_KEY, JSON.stringify(searches));
    loadRecentSearches();
}

// ========================================
// TIME MANAGEMENT
// ========================================
function updateCurrentTime() {
    const timeElement = document.getElementById('currentTime');
    if (!timeElement) return;
    
    const now = new Date();
    const options = { 
        weekday: 'long', 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        timeZone: 'Asia/Jakarta'
    };
    
    timeElement.textContent = now.toLocaleDateString('id-ID', options) + ' WIB';
}

// ========================================
// GEOLOCATION
// ========================================
function getCurrentLocation() {
    const btn = document.querySelector('.btn-location');
    const originalHTML = btn.innerHTML;
    
    if (!navigator.geolocation) {
        alert('❌ Geolocation tidak didukung oleh browser Anda.');
        return;
    }
    
    btn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i>';
    btn.disabled = true;
    
    navigator.geolocation.getCurrentPosition(
        (position) => {
            const { latitude, longitude } = position.coords;
            console.log('📍 Location found:', latitude, longitude);
            fetchWeatherByCoords(latitude, longitude);
            btn.innerHTML = originalHTML;
            btn.disabled = false;
        },
        (error) => {
            console.error('Location error:', error);
            alert('❌ Tidak dapat mengakses lokasi Anda. Pastikan izin lokasi diaktifkan.');
            btn.innerHTML = originalHTML;
            btn.disabled = false;
        }
    );
}

// ========================================
// WEATHER SEARCH
// ========================================
function searchWeather() {
    const cityInput = document.getElementById('cityInput');
    const city = cityInput.value.trim();
    
    if (!city) {
        alert('⚠️ Masukkan nama kota terlebih dahulu!');
        return;
    }
    
    searchWeatherByCity(city);
}

async function searchWeatherByCity(cityName) {
    try {
        showLoading();
        
        // Geocoding - convert city name to coordinates
        const geoResponse = await fetch(`${GEO_API}/search?name=${encodeURIComponent(cityName)}&count=1&language=id`);
        const geoData = await geoResponse.json();
        
        if (!geoData.results || geoData.results.length === 0) {
            throw new Error('Kota tidak ditemukan. Periksa ejaan dan coba lagi.');
        }
        
        const location = geoData.results[0];
        console.log('📍 Location found:', location);
        
        // Add to recent searches
        addRecentSearch(location.name);
        
        // Fetch weather data
        await fetchWeatherByCoords(location.latitude, location.longitude, location.name, location.country);
        
    } catch (error) {
        console.error('Search error:', error);
        alert('❌ ' + error.message);
        hideWeatherData();
    }
}

// ========================================
// FETCH WEATHER DATA
// ========================================
async function fetchWeatherByCoords(lat, lon, cityName = null, country = null) {
    try {
        showLoading();
        
        // Fetch current weather + hourly + daily forecast
        const weatherResponse = await fetch(
            `${API_BASE}/forecast?latitude=${lat}&longitude=${lon}` +
            `&current=temperature_2m,relative_humidity_2m,apparent_temperature,precipitation,` +
            `weather_code,surface_pressure,wind_speed_10m,wind_direction_10m` +
            `&hourly=visibility` +
            `&daily=weather_code,temperature_2m_max,temperature_2m_min,sunrise,sunset` +
            `&timezone=Asia/Jakarta`
        );
        
        const weatherData = await weatherResponse.json();
        console.log('🌤 Weather data received:', weatherData);
        
        // If city name not provided, reverse geocode
        if (!cityName) {
            const geoResponse = await fetch(
                `${GEO_API}/search?latitude=${lat}&longitude=${lon}&count=1&language=id`
            );
            const geoData = await geoResponse.json();
            if (geoData.results && geoData.results.length > 0) {
                cityName = geoData.results[0].name;
                country = geoData.results[0].country;
            } else {
                cityName = `${lat.toFixed(2)}, ${lon.toFixed(2)}`;
            }
        }
        
        // Display weather
        displayCurrentWeather(weatherData, cityName, country);
        displayForecast(weatherData.daily);
        
        hideLoading();
        
    } catch (error) {
        console.error('Fetch error:', error);
        alert('❌ Gagal mengambil data cuaca. Silakan coba lagi.');
        hideLoading();
        hideWeatherData();
    }
}

// ========================================
// DISPLAY CURRENT WEATHER
// ========================================
function displayCurrentWeather(data, cityName, country) {
    const current = data.current;
    
    // Update city name
    const cityNameEl = document.getElementById('cityName');
    cityNameEl.innerHTML = `<i class="fa-solid fa-location-dot"></i> ${cityName}${country ? ', ' + country : ''}`;
    
    // Weather icon and description
    const weatherInfo = WEATHER_CODES[current.weather_code] || WEATHER_CODES[0];
    const iconEl = document.getElementById('weatherIcon');
    iconEl.innerHTML = `<i class="fa-solid ${weatherInfo.icon} fa-4x" style="color: ${weatherInfo.color}"></i>`;
    
    document.getElementById('weatherDesc').textContent = weatherInfo.desc;
    
    // Temperature
    document.getElementById('tempValue').textContent = Math.round(current.temperature_2m);
    document.getElementById('feelsLike').textContent = Math.round(current.apparent_temperature) + '°C';
    
    // Details
    document.getElementById('humidity').textContent = current.relative_humidity_2m + '%';
    document.getElementById('windSpeed').textContent = Math.round(current.wind_speed_10m) + ' km/h';
    document.getElementById('pressure').textContent = Math.round(current.surface_pressure) + ' hPa';
    
    // Visibility (from hourly data, take first value)
    const visibility = data.hourly?.visibility?.[0];
    document.getElementById('visibility').textContent = visibility ? 
        (visibility / 1000).toFixed(1) + ' km' : 'N/A';
    
    // Sunrise & Sunset (from daily data, take today)
    if (data.daily?.sunrise?.[0]) {
        const sunrise = new Date(data.daily.sunrise[0]);
        document.getElementById('sunrise').textContent = sunrise.toLocaleTimeString('id-ID', { 
            hour: '2-digit', 
            minute: '2-digit',
            timeZone: 'Asia/Jakarta'
        });
    }
    
    if (data.daily?.sunset?.[0]) {
        const sunset = new Date(data.daily.sunset[0]);
        document.getElementById('sunset').textContent = sunset.toLocaleTimeString('id-ID', { 
            hour: '2-digit', 
            minute: '2-digit',
            timeZone: 'Asia/Jakarta'
        });
    }
    
    // Show weather section with animation
    const weatherSection = document.getElementById('currentWeather');
    weatherSection.style.display = 'block';
    weatherSection.classList.add('fade-in');
}

// ========================================
// DISPLAY 7-DAY FORECAST
// ========================================
function displayForecast(daily) {
    const forecastGrid = document.getElementById('forecastGrid');
    forecastGrid.innerHTML = '';
    
    // Display 7 days (skip today, show next 7)
    for (let i = 1; i < 8 && i < daily.time.length; i++) {
        const date = new Date(daily.time[i]);
        const weatherInfo = WEATHER_CODES[daily.weather_code[i]] || WEATHER_CODES[0];
        
        const card = document.createElement('div');
        card.className = 'forecast-card slide-in';
        card.style.animationDelay = `${i * 0.1}s`;
        
        card.innerHTML = `
            <div class="forecast-day">${getDayName(date)}</div>
            <div class="forecast-date">${date.getDate()} ${getMonthName(date)}</div>
            <div class="forecast-icon">
                <i class="fa-solid ${weatherInfo.icon}" style="color: ${weatherInfo.color}"></i>
            </div>
            <div class="forecast-temp">
                ${Math.round(daily.temperature_2m_max[i])}° / ${Math.round(daily.temperature_2m_min[i])}°
            </div>
            <div class="forecast-desc">${weatherInfo.desc}</div>
        `;
        
        forecastGrid.appendChild(card);
    }
    
    // Show forecast section
    const forecastSection = document.getElementById('forecastSection');
    forecastSection.style.display = 'block';
    forecastSection.classList.add('fade-in');
}

// ========================================
// UTILITY FUNCTIONS
// ========================================
function getDayName(date) {
    const days = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];
    return days[date.getDay()];
}

function getMonthName(date) {
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des'];
    return months[date.getMonth()];
}

function showLoading() {
    // Could add a loading spinner here if needed
    console.log('⏳ Loading...');
}

function hideLoading() {
    console.log('✅ Loading complete');
}

function hideWeatherData() {
    document.getElementById('currentWeather').style.display = 'none';
    document.getElementById('forecastSection').style.display = 'none';
}

// ========================================
// CONSOLE MESSAGE
// ========================================
console.log('%c🌤 Cloud Weather Pro', 'color: #6366f1; font-size: 20px; font-weight: bold;');
console.log('%cDeveloped by Muhammad Mufadhol Afif (fanskey)', 'color: #8b5cf6; font-size: 12px;');
console.log('%cLKS Ma\'arif 2026 - SMK Islam 1 Blitar', 'color: #a0aec0; font-size: 10px;');

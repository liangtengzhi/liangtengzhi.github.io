// ===== 天气工具 — Open-Meteo 版（修复城市名显示问题） =====

const DEFAULT_CITY = '石家庄';  // 改为石家庄，更符合你的需求
const DEFAULT_LAT = 38.0900;
const DEFAULT_LON = 114.5100;
let currentCity = DEFAULT_CITY;
let currentLat = DEFAULT_LAT;
let currentLon = DEFAULT_LON;
let selectedDate = null;

// ===== 格式化时间 =====
function formatHour(timeStr) {
    if (timeStr.includes('T')) {
        const parts = timeStr.split('T');
        return parts[1].substring(0, 5);
    }
    return timeStr;
}

// ===== 反向地理编码（优先 ip-api.com，失败则尝试 Nominatim） =====
function getCityFromCoords(lat, lon) {
    // 优先使用 ip-api.com（国内准确率高）
    return fetch(`https://ip-api.com/json/${lat},${lon}?lang=zh-CN`)
        .then(r => {
            if (!r.ok) throw new Error('IP定位请求失败');
            return r.json();
        })
        .then(data => {
            if (data && data.status === 'success') {
                // 返回城市名，如果城市为空则返回地区名
                return data.city || data.regionName || data.country || '未知城市';
            }
            throw new Error('定位失败');
        })
        .catch(() => {
            // 降级使用 Nominatim
            return fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}&zoom=10&accept-language=zh`, {
                headers: { 'User-Agent': 'MyWebsite/1.0' }
            })
            .then(r => {
                if (!r.ok) throw new Error('Nominatim 请求失败');
                return r.json();
            })
            .then(data => {
                if (data && data.address) {
                    const addr = data.address;
                    return addr.city || addr.town || addr.village || addr.county || addr.state || '未知城市';
                }
                throw new Error('未找到城市');
            })
            .catch(() => {
                // 都失败则抛出错误
                throw new Error('无法获取城市名');
            });
        });
}

// ===== 初始化日期选择器 =====
function initDatePicker() {
    const picker = document.getElementById('datePicker');
    if (!picker) return;
    const today = new Date();
    const todayStr = formatDate(today);
    picker.min = todayStr;
    const maxDate = new Date(today);
    maxDate.setDate(maxDate.getDate() + 7);
    picker.max = formatDate(maxDate);
    picker.value = todayStr;
    selectedDate = today;
    picker.addEventListener('change', function() {
        if (this.value) {
            const parts = this.value.split('-');
            const d = new Date(parseInt(parts[0]), parseInt(parts[1])-1, parseInt(parts[2]));
            selectedDate = d;
            if (currentCity) fetchWeather(currentCity);
        }
    });
}

function formatDate(date) {
    const y = date.getFullYear();
    const m = String(date.getMonth()+1).padStart(2, '0');
    const d = String(date.getDate()).padStart(2, '0');
    return `${y}-${m}-${d}`;
}

// ===== 获取天气数据（支持城市名或经纬度） =====
function fetchWeather(query) {
    const resultDiv = document.getElementById('weatherResult');
    if (!resultDiv) return;
    resultDiv.innerHTML = '<p style="color: #b0a8a0; text-align: center;">加载中…</p>';

    if (typeof query === 'string') {
        const cityName = query.trim();
        if (!cityName) { alert('请输入城市名'); resultDiv.innerHTML = ''; return; }
        const geocodeUrl = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(cityName)}&limit=1&accept-language=zh`;
        fetch(geocodeUrl)
            .then(r => r.json())
            .then(data => {
                if (data && data.length > 0) {
                    const lat = parseFloat(data[0].lat);
                    const lon = parseFloat(data[0].lon);
                    let displayCity = data[0].display_name.split(',')[0] || cityName;
                    currentCity = displayCity;
                    document.getElementById('cityInput').value = displayCity;
                    currentLat = lat;
                    currentLon = lon;
                    fetchWeatherData(lat, lon, displayCity);
                } else {
                    resultDiv.innerHTML = `<p style="color: #b05a4a; text-align: center;">未找到该城市，请检查输入</p>`;
                }
            })
            .catch(err => {
                resultDiv.innerHTML = `<p style="color: #b05a4a; text-align: center;">地理编码失败：${err.message}</p>`;
            });
        return;
    } else if (query && typeof query === 'object' && query.lat !== undefined) {
        const lat = query.lat;
        const lon = query.lon;
        getCityFromCoords(lat, lon)
            .then(city => {
                currentCity = city;
                document.getElementById('cityInput').value = city;
                currentLat = lat;
                currentLon = lon;
                fetchWeatherData(lat, lon, city);
            })
            .catch(() => {
                // 如果获取城市名失败，使用经纬度查询，但显示"我的位置"
                currentCity = '我的位置';
                document.getElementById('cityInput').value = '我的位置';
                currentLat = lat;
                currentLon = lon;
                fetchWeatherData(lat, lon, '我的位置');
            });
        return;
    } else {
        if (currentLat && currentLon && currentCity !== DEFAULT_CITY) {
            fetchWeatherData(currentLat, currentLon, currentCity);
        } else {
            currentLat = DEFAULT_LAT;
            currentLon = DEFAULT_LON;
            currentCity = DEFAULT_CITY;
            document.getElementById('cityInput').value = DEFAULT_CITY;
            fetchWeatherData(DEFAULT_LAT, DEFAULT_LON, DEFAULT_CITY);
        }
    }
}

// ===== 实际获取天气数据（Open-Meteo API） =====
function fetchWeatherData(lat, lon, cityName) {
    const resultDiv = document.getElementById('weatherResult');
    if (!resultDiv) return;

    const picker = document.getElementById('datePicker');
    let targetDate = selectedDate;
    if (!targetDate && picker && picker.value) {
        const parts = picker.value.split('-');
        targetDate = new Date(parseInt(parts[0]), parseInt(parts[1])-1, parseInt(parts[2]));
    }
    if (!targetDate) targetDate = new Date();

    const today = new Date();
    today.setHours(0,0,0,0);
    const target = new Date(targetDate);
    target.setHours(0,0,0,0);
    let diffDays = Math.round((target - today) / (1000*60*60*24));
    if (diffDays < 0) diffDays = 0;
    if (diffDays > 6) diffDays = 6;

    const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&hourly=temperature_2m,precipitation_probability,weathercode&timezone=auto&forecast_days=7`;

    fetch(url)
        .then(r => { if (!r.ok) throw new Error('网络响应异常'); return r.json(); })
        .then(data => {
            if (!data || !data.hourly) {
                resultDiv.innerHTML = `<p style="color: #b05a4a; text-align: center;">未获取到天气数据</p>`;
                return;
            }

            const times = data.hourly.time;
            const temps = data.hourly.temperature_2m;
            const rains = data.hourly.precipitation_probability;
            const codes = data.hourly.weathercode;

            const targetDateStr = formatDate(targetDate);
            const hourlyData = [];
            for (let i = 0; i < times.length; i++) {
                const datePart = times[i].split('T')[0];
                if (datePart === targetDateStr) {
                    const hour = parseInt(times[i].split('T')[1].substring(0,2));
                    hourlyData.push({
                        time: times[i],
                        hour: hour,
                        temp: temps[i],
                        rain: rains[i] || 0,
                        code: codes[i]
                    });
                }
            }

            if (hourlyData.length === 0) {
                resultDiv.innerHTML = `<p style="color: #b0a8a0; text-align: center;">该日暂无逐小时数据</p>`;
                return;
            }

            const filtered = hourlyData.filter(h => h.hour >= 6 && h.hour <= 22);
            const displayData = filtered.length > 0 ? filtered : hourlyData;

            renderDayForecast(displayData, cityName, targetDate);
        })
        .catch(error => {
            resultDiv.innerHTML = `<p style="color: #b05a4a; text-align: center;">查询失败：${error.message}</p>`;
        });
}

// ===== 渲染指定日期的天气 =====
function renderDayForecast(hourlyData, cityName, date) {
    const resultDiv = document.getElementById('weatherResult');
    if (!resultDiv) return;

    const dateStr = `${date.getMonth()+1}月${date.getDate()}日`;
    const weekdays = ['日', '一', '二', '三', '四', '五', '六'];
    const weekday = weekdays[date.getDay()];

    let html = `<div class="forecast-wrapper"><div class="forecast-section"><div class="fc-section-title">${cityName} · ${dateStr} (周${weekday})</div><div class="fc-hourly">`;
    hourlyData.forEach(h => {
        const time = formatHour(h.time);
        const temp = h.temp !== undefined ? Math.round(h.temp) : '--';
        const desc = getWeatherDesc(h.code);
        const icon = getWeatherIconFromCode(h.code);
        const rain = h.rain !== undefined ? Math.round(h.rain) : '0';
        html += `
            <div class="fc-hour-item">
                <div class="fc-hour-time">${time}</div>
                <div class="fc-hour-icon">${icon}</div>
                <div class="fc-hour-temp">${temp}°C</div>
                <div class="fc-hour-desc">${desc}</div>
                <div class="fc-hour-rain">🌧 ${rain}%</div>
            </div>
        `;
    });
    html += `</div></div></div>`;
    resultDiv.innerHTML = html;
}

// ===== Open-Meteo 天气代码映射 =====
function getWeatherDesc(code) {
    const map = {
        0: '晴天', 1: '少云', 2: '多云', 3: '阴天',
        45: '雾', 48: '雾',
        51: '小毛毛雨', 53: '毛毛雨', 55: '大毛毛雨',
        56: '冻雨', 57: '冻雨',
        61: '小雨', 63: '中雨', 65: '大雨',
        66: '冻雨', 67: '冻雨',
        71: '小雪', 73: '中雪', 75: '大雪', 77: '雪粒',
        80: '阵雨', 81: '阵雨', 82: '阵雨',
        85: '阵雪', 86: '阵雪',
        95: '雷暴', 96: '雷暴', 99: '雷暴'
    };
    return map[code] || '未知';
}

function getWeatherIconFromCode(code) {
    const map = {
        0: '☀️', 1: '⛅', 2: '☁️', 3: '☁️',
        45: '🌫️', 48: '🌫️',
        51: '🌧️', 53: '🌧️', 55: '🌧️',
        56: '🌧️', 57: '🌧️',
        61: '🌧️', 63: '🌧️', 65: '🌧️',
        66: '🌧️', 67: '🌧️',
        71: '❄️', 73: '❄️', 75: '❄️', 77: '❄️',
        80: '🌧️', 81: '🌧️', 82: '🌧️',
        85: '❄️', 86: '❄️',
        95: '⛈️', 96: '⛈️', 99: '⛈️'
    };
    return map[code] || '☁️';
}

// ===== 自动定位 =====
function autoLocate() {
    const resultDiv = document.getElementById('weatherResult');
    if (!resultDiv) return;
    resultDiv.innerHTML = '<p style="color: #b0a8a0; text-align: center;">正在获取您的位置…</p>';

    if (!navigator.geolocation) {
        resultDiv.innerHTML = '<p style="color: #b0a8a0; text-align: center;">浏览器不支持定位</p>';
        currentLat = DEFAULT_LAT;
        currentLon = DEFAULT_LON;
        currentCity = DEFAULT_CITY;
        document.getElementById('cityInput').value = DEFAULT_CITY;
        fetchWeatherData(DEFAULT_LAT, DEFAULT_LON, DEFAULT_CITY);
        return;
    }

    navigator.geolocation.getCurrentPosition(
        pos => {
            const lat = pos.coords.latitude;
            const lon = pos.coords.longitude;
            getCityFromCoords(lat, lon)
                .then(city => {
                    currentCity = city;
                    document.getElementById('cityInput').value = city;
                    currentLat = lat;
                    currentLon = lon;
                    fetchWeatherData(lat, lon, city);
                })
                .catch(() => {
                    // 获取城市名失败时，显示"我的位置"而非"当前位置"
                    currentCity = '我的位置';
                    document.getElementById('cityInput').value = '我的位置';
                    currentLat = lat;
                    currentLon = lon;
                    fetchWeatherData(lat, lon, '我的位置');
                });
        },
        err => {
            let msg = '定位失败，使用默认城市';
            if (err.code === err.PERMISSION_DENIED) msg = '您拒绝了定位权限，使用默认城市';
            else if (err.code === err.TIMEOUT) msg = '定位超时，使用默认城市';
            resultDiv.innerHTML = `<p style="color: #b0a8a0; text-align: center;">${msg}</p>`;
            currentLat = DEFAULT_LAT;
            currentLon = DEFAULT_LON;
            currentCity = DEFAULT_CITY;
            document.getElementById('cityInput').value = DEFAULT_CITY;
            fetchWeatherData(DEFAULT_LAT, DEFAULT_LON, DEFAULT_CITY);
        },
        { enableHighAccuracy: true, timeout: 5000, maximumAge: 60000 }
    );
}

// ===== 手动查询 =====
function manualSearch() {
    const city = document.getElementById('cityInput').value.trim();
    if (!city) { alert('请输入城市名'); return; }
    fetchWeather(city);
}

// ===== 页面加载 =====
window.onload = function() {
    initDatePicker();
    autoLocate();
};
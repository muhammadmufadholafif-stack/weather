console.log("Cloud Weather App Loaded");

function getWeather() {
    const city = document.getElementById("city").value.trim();
    const result = document.getElementById("weather-result");
    if (!city) return result.innerText = "Masukkan nama kota.";

    console.log("Mencari cuaca untuk:", city);

    fetch(`https://geocoding-api.open-meteo.com/v1/search?name=${city}&count=1`)
    .then(res => res.json())
    .then(geo => {
        if (!geo.results?.length) throw new Error("Kota tidak ditemukan.");
        const { latitude, longitude } = geo.results[0];
        console.log("Koordinat ditemukan:", geo.results[0]);
        return fetch(`https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current_weather=true`);
    })
    .then(res => res.json())
    .then(data => {
        const w = data.current_weather;
        console.log("Data cuaca diterima:", w);
        const wibTime = new Date(w.time + "Z").toLocaleString('id-ID', { timeZone: 'Asia/Jakarta' });
        result.innerHTML = `${getIcon(w.weathercode)} <br>🌡 ${w.temperature}°C 💨 ${w.windspeed} km/h <br>⏱ ${wibTime}`;
    })
    .catch(err => {
        console.log("Error:", err);
        result.innerText = err.message || "Gagal mengambil data cuaca.";
    });
}

function getIcon(code) {
    return ({
        0:"☀️ Cerah",1:"⛅ Berawan",2:"⛅ Berawan",3:"☁️ Mendung",
        45:"🌫 Kabut",48:"🌫 Kabut",51:"🌦 Hujan ringan",53:"🌦 Hujan ringan",
        55:"🌦 Hujan ringan",61:"🌧 Hujan",63:"🌧 Hujan",65:"🌧 Hujan",
        71:"❄️ Salju",73:"❄️ Salju",75:"❄️ Salju",80:"🌧 Hujan deras",
        81:"🌧 Hujan deras",82:"🌧 Hujan deras",95:"⛈ Badai",96:"⛈ Badai",
        99:"⛈ Badai"
    }[code] || "🌈 Tidak diketahui");
}

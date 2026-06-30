const icons = {
  0: "☀️", 1: "🌤️", 2: "⛅", 3: "☁️",
  45: "🌫️", 48: "🌫️",
  51: "🌦️", 53: "🌦️", 55: "🌧️",
  61: "🌧️", 63: "🌧️", 65: "🌧️",
  71: "❄️", 73: "❄️", 75: "❄️",
  80: "🌦️", 81: "🌧️", 82: "⛈️",
  95: "⛈️", 96: "⛈️", 99: "⛈️"
};

  const descriptions = {
  0: "Céu limpo", 1: "Poucas nuvens", 2: "Parcialmente nublado", 3: "Nublado",
  45: "Nevoeiro", 48: "Nevoeiro com geada",
  51: "Garoa leve", 53: "Garoa moderada", 55: "Garoa densa",
  61: "Chuva fraca", 63: "Chuva moderada", 65: "Chuva forte",
  71: "Neve fraca", 73: "Neve moderada", 75: "Neve forte",
  80: "Pancadas de chuva", 81: "Chuva torrencial", 82: "Tempestade violenta",
  95: "Tempestade", 96: "Tempestade com granizo", 99: "Tempestade forte"
};

const backgrounds = {
  sun: "assets/sun.jpg",
  clouds: "assets/clouds.jpg",
  rain: "assets/backgrounds/rain.jpg",
  snow: "assets/snow.jpg",
  storm: "assets/storm.jpg",
  fog: "assets/fog.jpg",
  default: "assets/default.jpg"
};

const dom = {
  city: document.querySelector(".city"),
  temp: document.querySelector(".temp"),
  icon: document.querySelector(".icon"),
  desc: document.querySelector(".description"),
  wind: document.querySelector(".wind"),
  humidity: document.querySelector(".humidity"),
  feelsLike: document.querySelector(".feels-like"),
  searchBar: document.querySelector(".search-bar"),
  searchBtn: document.querySelector(".search-btn"),
  weatherBox: document.querySelector(".weather"),
  errorMsg: document.querySelector(".error-msg")
};

const setBackground = (code) => {
  let bg = backgrounds.default;
  
  if (code === 0) bg = backgrounds.sun;
  else if ([1, 2, 3].includes(code)) bg = backgrounds.clouds;
  else if ([45, 48].includes(code)) bg = backgrounds.fog;
  else if ([51, 53, 55, 61, 63, 65, 80, 81].includes(code)) bg = backgrounds.rain;
  else if ([71, 73, 75, 77].includes(code)) bg = backgrounds.snow;
  else if ([95, 96, 99, 82].includes(code)) bg = backgrounds.storm;

  const img = new Image();
  img.src = bg;
  img.onload = () => {
    document.body.style.backgroundImage = `url('${bg}')`;
  };
};

const getWeather = async (city) => {
  try {
    dom.weatherBox.classList.add("loading");
    dom.errorMsg.style.display = "none";

    const geoRes = await fetch(
      `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(city)}&count=1&language=pt&format=json`
    );
    const geoData = await geoRes.json();

    if (!geoData.results?.length) throw new Error("Cidade não encontrada");

    const { latitude, longitude, name, admin1 } = geoData.results[0];

    const weatherRes = await fetch(
      `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current_weather=true&hourly=relativehumidity_2m,apparent_temperature&timezone=auto`
    );
    const data = await weatherRes.json();
    
    const currentHour = new Date().getHours();
    const humidity = data.hourly.relativehumidity_2m[currentHour] || "--";
    const feelsLike = data.hourly.apparent_temperature[currentHour] || "--"; // ✅ Pegando sensação térmica

    updateUI(data.current_weather, name, admin1, humidity, feelsLike);

  } catch (err) {
    dom.weatherBox.classList.add("loading");
    dom.errorMsg.style.display = "block";
    console.error(err);
  }
};

const updateUI = (w, city, state, humidity, feelsLike) => {
  dom.city.innerText = state ? `${city}, ${state}` : city;
  dom.temp.innerText = `${Math.round(w.temperature)}°`;
  dom.icon.innerText = icons[w.weathercode] || "🌍";
  dom.desc.innerText = descriptions[w.weathercode] || "Desconhecido";
  
  dom.wind.innerText = `${w.windspeed} km/h`;
  dom.humidity.innerText = `${humidity}%`;
  dom.feelsLike.innerText = `${Math.round(feelsLike)}°`; // ✅ Atualizando UI

  setBackground(w.weathercode);

  dom.weatherBox.classList.remove("loading");
  dom.weatherBox.style.animation = "none";
  dom.weatherBox.offsetHeight; /* trigger reflow */
  dom.weatherBox.style.animation = "fadeIn 0.5s ease-out forwards";
};

dom.searchBtn.addEventListener("click", () => {
    if(dom.searchBar.value) getWeather(dom.searchBar.value);
});

dom.searchBar.addEventListener("keyup", (e) => {
  if (e.key === "Enter" && dom.searchBar.value) getWeather(dom.searchBar.value);
});

getWeather("Fortaleza");

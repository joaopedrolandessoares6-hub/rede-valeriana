
const menuToggle = document.getElementById("menu-toggle");
const mainNav = document.getElementById("main-nav");

// Menu para celular
if (menuToggle && mainNav) {
    menuToggle.addEventListener("click", function () {
        const aberto = mainNav.classList.toggle("is-open");

        menuToggle.setAttribute("aria-expanded", String(aberto));
        menuToggle.setAttribute(
            "aria-label",
            aberto ? "Fechar menu" : "Abrir menu"
        );
        menuToggle.textContent = aberto ? "✕" : "☰";
    });

    mainNav.querySelectorAll("a").forEach(function (link) {
        link.addEventListener("click", function () {
            mainNav.classList.remove("is-open");
            menuToggle.setAttribute("aria-expanded", "false");
            menuToggle.setAttribute("aria-label", "Abrir menu");
            menuToggle.textContent = "☰";
        });
    });
}

// Atualizar o ano automaticamente
const currentYear = document.getElementById("current-year");

if (currentYear) {
    currentYear.textContent = new Date().getFullYear();
}

// PREVISÃO DO TEMPO — NOVA ALMEIDA, SERRA/ES
const weatherCurrent = document.getElementById("weather-current");
const weatherForecast = document.getElementById("weather-forecast");
const weatherUpdated = document.getElementById("weather-updated");
const weatherRefresh = document.getElementById("weather-refresh");

const weatherDescriptions = {
    0: "Céu limpo",
    1: "Predominantemente limpo",
    2: "Parcialmente nublado",
    3: "Nublado",
    45: "Neblina",
    48: "Neblina com gelo",
    51: "Garoa leve",
    53: "Garoa moderada",
    55: "Garoa intensa",
    56: "Garoa congelante leve",
    57: "Garoa congelante intensa",
    61: "Chuva fraca",
    63: "Chuva moderada",
    65: "Chuva forte",
    66: "Chuva congelante leve",
    67: "Chuva congelante forte",
    71: "Neve fraca",
    73: "Neve moderada",
    75: "Neve forte",
    77: "Grãos de neve",
    80: "Pancadas de chuva fracas",
    81: "Pancadas de chuva moderadas",
    82: "Pancadas de chuva fortes",
    85: "Pancadas de neve fracas",
    86: "Pancadas de neve fortes",
    95: "Trovoadas",
    96: "Trovoadas com granizo leve",
    99: "Trovoadas com granizo forte"
};

function descricaoTempo(codigo) {
    return weatherDescriptions[codigo] || "Condição não identificada";
}

function iconeTempo(codigo) {
    if ([0, 1].includes(codigo)) return "☀️";
    if ([2, 3].includes(codigo)) return "☁️";
    if ([45, 48].includes(codigo)) return "🌫️";
    if ([51, 53, 55, 56, 57].includes(codigo)) return "🌦️";
    if ([61, 63, 65, 66, 67, 80, 81, 82].includes(codigo)) return "🌧️";
    if ([71, 73, 75, 77, 85, 86].includes(codigo)) return "❄️";
    if ([95, 96, 99].includes(codigo)) return "⛈️";
    return "🌤️";
}

function formatarDia(data) {
    const dataLocal = new Date(data + "T12:00:00");

    return dataLocal.toLocaleDateString("pt-BR", {
        weekday: "short",
        day: "2-digit",
        month: "2-digit"
    });
}

async function carregarPrevisao() {
    if (!weatherCurrent || !weatherForecast) return;

    if (weatherRefresh) {
        weatherRefresh.disabled = true;
        weatherRefresh.textContent = "Atualizando...";
    }

    weatherCurrent.textContent = "Carregando condições atuais...";
    weatherForecast.textContent = "Carregando os próximos 7 dias...";

    const parametros = new URLSearchParams({
        latitude: "-20.055",
        longitude: "-40.185",
        current: [
            "temperature_2m",
            "relative_humidity_2m",
            "apparent_temperature",
            "precipitation",
            "wind_speed_10m",
            "weather_code"
        ].join(","),
        daily: [
            "weather_code",
            "temperature_2m_max",
            "temperature_2m_min",
            "precipitation_probability_max"
        ].join(","),
        forecast_days: "7",
        timezone: "America/Sao_Paulo"
    });

    try {
        const resposta = await fetch(
            "https://api.open-meteo.com/v1/forecast?" + parametros
        );

        if (!resposta.ok) {
            throw new Error("Não foi possível consultar a previsão.");
        }

        const dados = await resposta.json();
        const atual = dados.current;
        const diario = dados.daily;

        weatherCurrent.innerHTML = `
            <div class="weather-main">
                <span class="weather-icon">
                    ${iconeTempo(atual.weather_code)}
                </span>
                <div>
                    <p class="weather-condition">
                        ${descricaoTempo(atual.weather_code)}
                    </p>
                    <p class="weather-temperature">
                        ${Math.round(atual.temperature_2m)}°C
                    </p>
                    <p class="weather-feels">
                        Sensação térmica:
                        ${Math.round(atual.apparent_temperature)}°C
                    </p>
                </div>
            </div>
            <div class="weather-details">
                <div>
                    <span>💧 Umidade</span>
                    <strong>${atual.relative_humidity_2m}%</strong>
                </div>
                <div>
                    <span>🌬️ Vento</span>
                    <strong>${Math.round(atual.wind_speed_10m)} km/h</strong>
                </div>
                <div>
                    <span>🌧️ Chuva atual</span>
                    <strong>${atual.precipitation} mm</strong>
                </div>
            </div>
        `;

        weatherForecast.innerHTML = diario.time.map(function (dia, i) {
            return `
                <article class="forecast-card">
                    <h4>${i === 0 ? "Hoje" : formatarDia(dia)}</h4>
                    <span class="forecast-icon">
                        ${iconeTempo(diario.weather_code[i])}
                    </span>
                    <p>${descricaoTempo(diario.weather_code[i])}</p>
                    <div class="forecast-temperatures">
                        <strong>
                            ${Math.round(diario.temperature_2m_max[i])}°
                        </strong>
                        <span>
                            ${Math.round(diario.temperature_2m_min[i])}°
                        </span>
                    </div>
                    <p class="forecast-rain">
                        🌧️ ${diario.precipitation_probability_max[i] ?? "—"}%
                        de chance de chuva
                    </p>
                </article>
            `;
        }).join("");

        if (weatherUpdated) {
            weatherUpdated.textContent =
                "Atualizado em " +
                new Date().toLocaleString("pt-BR", {
                    dateStyle: "short",
                    timeStyle: "short"
                });
        }
    } catch (erro) {
        console.error("Erro ao carregar a previsão:", erro);

        weatherCurrent.textContent =
            "Não foi possível carregar o tempo agora. " +
            "Verifique sua conexão e tente novamente.";

        weatherForecast.textContent =
            "A previsão está temporariamente indisponível.";
    } finally {
        if (weatherRefresh) {
            weatherRefresh.disabled = false;
            weatherRefresh.textContent = "Atualizar previsão";
        }
    }
}

if (weatherRefresh) {
    weatherRefresh.addEventListener("click", carregarPrevisao);
}

carregarPrevisao();

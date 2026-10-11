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
                        Sensação térmica: ${Math.round(atual.apparent_temperature)}°C
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
                        <strong>${Math.round(diario.temperature_2m_max[i])}°</strong>
                        <span>${Math.round(diario.temperature_2m_min[i])}°</span>
                    </div>
                    <p class="forecast-rain">
                        🌧️ ${diario.precipitation_probability_max[i] ?? "—"}% de chance de chuva
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
            "Não foi possível carregar o tempo agora. Verifique sua conexão e tente novamente.";

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

// ============================================
// ÁREA DO REDATOR — SUPABASE
// Não altera as outras seções do site.
// ============================================

(function iniciarAreaRedator() {
    const loginArea = document.getElementById("writer-login");
    const editorArea = document.getElementById("writer-editor");

    if (!loginArea || !editorArea) return;

    const SUPABASE_URL =
        "https://xabcmkktfwrawmhuwzyl.supabase.co";

    const SUPABASE_KEY =
        "sb_publishable_BouziJPMdZcdKdx69cQiow_LaF67tFi";

    const loginForm = document.getElementById("writer-login-form");
    const emailInput = document.getElementById("writer-email");
    const passwordInput = document.getElementById("writer-password");
    const loginButton = document.getElementById("writer-login-button");
    const logoutButton = document.getElementById("writer-logout-button");
    const displayName = document.getElementById("writer-display");
    const titleInput = document.getElementById("article-title");
    const contentInput = document.getElementById("article-content");
    const saveButton = document.getElementById("article-save-button");
    const newButton = document.getElementById("article-new-button");
    const articleMessage = document.getElementById("article-message");
    const writerMessage = document.getElementById("writer-message");
    const articlesList = document.getElementById("articles-list");

    if (!window.supabase) {
        writerMessage.textContent =
            "Não foi possível carregar a conexão com o Supabase.";
        return;
    }

    const db = window.supabase.createClient(
        SUPABASE_URL,
        SUPABASE_KEY
    );

    let usuarioAtual = null;
    let artigoEditando = null;
    let salvando = false;

    function mensagem(elemento, texto) {
        elemento.textContent = texto;
    }

    function mostrarLogin() {
        loginArea.hidden = false;
        editorArea.hidden = true;
        usuarioAtual = null;
        artigoEditando = null;
        titleInput.value = "";
        contentInput.value = "";
        articlesList.replaceChildren();
    }

    function mostrarEditor(membro) {
        loginArea.hidden = true;
        editorArea.hidden = false;

        displayName.textContent =
             membro.display_name || usuarioAtual.email || "Redator";

        mensagem(writerMessage, "");
    }

    async function verificarMembro(usuario) {
    const { data, error } = await db
        .from("team_members")
        .select("user_id, display_name, role")
        .eq("user_id", usuario.id)
        .maybeSingle();

    if (error) {
        console.error("Erro real ao verificar equipe:", error);
        throw new Error(
            "Erro Supabase (" + error.code + "): " + error.message
        );
    }

    if (!data) {
        await db.auth.signOut();
        throw new Error(
            "Esta conta não está autorizada a acessar a área do redator."
        );
    }

    usuarioAtual = usuario;
    mostrarEditor(data);
    await carregarArtigos();
}

    async function entrar(evento) {
        evento.preventDefault();

        loginButton.disabled = true;
        mensagem(writerMessage, "Verificando acesso...");

        try {
            const { data, error } = await db.auth.signInWithPassword({
                email: emailInput.value.trim(),
                password: passwordInput.value
            });

            if (error) throw error;

            await verificarMembro(data.user);
            passwordInput.value = "";
        } catch (erro) {
            console.error("Erro no login:", erro);
            mensagem(
                writerMessage,
                erro.message || "Não foi possível entrar."
            );
        } finally {
            loginButton.disabled = false;
        }
    }

    async function carregarArtigos() {
        articlesList.replaceChildren();

        const carregando = document.createElement("p");
        carregando.textContent = "Carregando rascunhos...";
        articlesList.appendChild(carregando);

        const { data, error } = await db
            .from("articles")
            .select("id, title, content, status, updated_at")
            .order("updated_at", { ascending: false });

        articlesList.replaceChildren();

        if (error) {
            console.error("Erro ao carregar artigos:", error);
            mensagem(
                articleMessage,
                "Não foi possível carregar os rascunhos. Confira as permissões do banco."
            );
            return;
        }

        if (!data || data.length === 0) {
            const vazio = document.createElement("p");
            vazio.textContent = "Ainda não há rascunhos salvos.";
            articlesList.appendChild(vazio);
            return;
        }

        data.forEach(function (artigo) {
            const botao = document.createElement("button");
            botao.type = "button";
            botao.className = "button button-outline";
            botao.style.display = "block";
            botao.style.width = "100%";
            botao.style.margin = "10px 0";
            botao.style.textAlign = "left";

            const atualizado = artigo.updated_at
                ? new Date(artigo.updated_at).toLocaleString("pt-BR")
                : "";

            botao.textContent =
                (artigo.title || "Sem título") +
                " — " +
                (artigo.status === "published" ? "Publicado" : "Rascunho") +
                (atualizado ? " · " + atualizado : "");

            botao.addEventListener("click", function () {
                artigoEditando = artigo.id;
                titleInput.value = artigo.title || "";
                contentInput.value = artigo.content || "";
                saveButton.textContent = "Salvar alterações";

                mensagem(
                    articleMessage,
                    "Editando: " + (artigo.title || "Sem título")
                );

                titleInput.focus();
            });

            articlesList.appendChild(botao);
        });
    }

    function novoRascunho() {
        artigoEditando = null;
        titleInput.value = "";
        contentInput.value = "";
        saveButton.textContent = "Salvar rascunho";
        mensagem(articleMessage, "Novo rascunho.");
        titleInput.focus();
    }

    async function salvarArtigo() {
        if (!usuarioAtual || salvando) return;

        const title = titleInput.value.trim();
        const content = contentInput.value.trim();

        if (!title || !content) {
            mensagem(
                articleMessage,
                "Preencha o título e o conteúdo antes de salvar."
            );
            return;
        }

        salvando = true;
        saveButton.disabled = true;
        mensagem(articleMessage, "Salvando rascunho...");

        try {
            let resultado;

            if (artigoEditando) {
                resultado = await db
                    .from("articles")
                    .update({
                        title: title,
                        content: content,
                        updated_at: new Date().toISOString()
                    })
                    .eq("id", artigoEditando)
                    .select("id")
                    .maybeSingle();
            } else {
                resultado = await db
                    .from("articles")
                    .insert({
                        title: title,
                        content: content,
                        status: "draft",
                        author_id: usuarioAtual.id
                    })
                    .select("id")
                    .single();
            }

            if (resultado.error) throw resultado.error;

            if (!resultado.data) {
                throw new Error(
                    "O banco não confirmou a gravação. Confira as políticas de acesso."
                );
            }

            artigoEditando = resultado.data.id;
            saveButton.textContent = "Salvar alterações";

            mensagem(articleMessage, "Rascunho salvo com sucesso!");
            await carregarArtigos();
        } catch (erro) {
            console.error("Erro ao salvar artigo:", erro);
            mensagem(
                articleMessage,
                erro.message || "Erro ao salvar o rascunho."
            );
        } finally {
            salvando = false;
            saveButton.disabled = false;
        }
    }

    async function sair() {
        const { error } = await db.auth.signOut();

        if (error) {
            mensagem(writerMessage, "Não foi possível encerrar a sessão.");
            return;
        }

        mostrarLogin();
        mensagem(writerMessage, "Você saiu da área do redator.");
    }

    loginForm.addEventListener("submit", entrar);
    saveButton.addEventListener("click", salvarArtigo);
    newButton.addEventListener("click", novoRascunho);
    logoutButton.addEventListener("click", sair);

    async function restaurarSessao() {
        mensagem(writerMessage, "Verificando sessão...");

        try {
            const { data, error } = await db.auth.getSession();

            if (error) throw error;

            if (data.session) {
                await verificarMembro(data.session.user);
            } else {
                mostrarLogin();
                mensagem(writerMessage, "");
            }
        } catch (erro) {
            console.error("Erro ao restaurar sessão:", erro);
            mostrarLogin();
            mensagem(
                writerMessage,
                erro.message || "Não foi possível verificar sua sessão."
            );
        }
    }

    restaurarSessao();
})();
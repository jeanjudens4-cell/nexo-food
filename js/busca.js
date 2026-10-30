
document.addEventListener("DOMContentLoaded", () => {
  const container =
    document.getElementById("all-recipes") ||
    document.getElementById("featured-recipes");

  const formularioBusca = document.getElementById("recipe-search");
  const campoBusca = document.getElementById("search-input");
  const formularioIngredientes = document.getElementById("ingredient-search-form");
  const campoIngredientes = document.getElementById("ingredients-input");
  const modoIngredientes = document.getElementById("ingredient-match-mode");
  const botaoLimpar = document.getElementById("clear-ingredients");
  const contador = document.getElementById("recipe-count");

  const mensagemVazia =
    document.getElementById("no-recipes") ||
    document.getElementById("empty-recipes");

  const botoesCategoria = document.querySelectorAll("[data-categoria]");

  if (!container) return;

  if (!Array.isArray(window.receitas)) {
    container.innerHTML = "<p>Não foi possível carregar as receitas.</p>";
    return;
  }

  let categoriaAtual = "Todas";
  let termoAtual = "";
  let ingredientesProcurados = [];
  let modoCorrespondencia = "todos";

  function normalizar(texto) {
    return String(texto || "")
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .toLocaleLowerCase("pt-BR")
      .trim();
  }

  function lerIngredientes(texto) {
    return texto.split(",").map(normalizar).filter(Boolean);
  }

  function correspondeIngredientes(receita) {
    if (!ingredientesProcurados.length) return true;

    const ingredientes = (receita.ingredientes || []).map(normalizar);

    const encontrados = ingredientesProcurados.map((procurado) =>
      ingredientes.some((item) => item.includes(procurado))
    );

    return modoCorrespondencia === "qualquer"
      ? encontrados.some(Boolean)
      : encontrados.every(Boolean);
  }

  function renderizarReceitas(lista) {
    const inicial = Boolean(document.getElementById("featured-recipes"));
    const caminho = inicial ? "pages/receita.html" : "receita.html";

    container.innerHTML = lista.map((receita) => `
      <article class="product-card">
        <img src="${receita.imagem}" alt="${receita.nome}" loading="lazy">

        <div class="product-card-content">
          <span class="recipe-category">${receita.categoria}</span>
          <h3>${receita.nome}</h3>
          <p>${receita.descricao}</p>

          <div class="recipe-meta">
            <span>⏱ ${receita.tempo} min</span>
            <span>${receita.dificuldade}</span>
          </div>

          <a class="recipe-card-link"
             href="${caminho}?id=${encodeURIComponent(receita.id)}">
            Ver receita →
          </a>

          <button type="button"
                  class="favorite-button"
                  data-favorito-id="${receita.id}"
                  aria-pressed="false">
            ♡ Favoritar
          </button>
        </div>
      </article>
    `).join("");

    if (contador) {
      contador.textContent =
        `${lista.length} ${lista.length === 1 ? "receita encontrada" : "receitas encontradas"}`;
    }

    if (mensagemVazia) mensagemVazia.hidden = lista.length > 0;

    if (typeof atualizarBotoesFavoritos === "function") {
      atualizarBotoesFavoritos();
    }
  }

  function aplicarFiltros() {
    const resultados = window.receitas.filter((receita) => {
      const categoriaOK =
        categoriaAtual === "Todas" ||
        normalizar(receita.categoria) === normalizar(categoriaAtual);

      const texto = normalizar([
        receita.nome,
        receita.categoria,
        receita.descricao,
        ...(receita.ingredientes || [])
      ].join(" "));

      return (
        categoriaOK &&
        texto.includes(termoAtual) &&
        correspondeIngredientes(receita)
      );
    });

    renderizarReceitas(resultados);
  }

  if (formularioBusca && campoBusca) {
    formularioBusca.addEventListener("submit", (evento) => {
      evento.preventDefault();
      termoAtual = normalizar(campoBusca.value);
      aplicarFiltros();
    });

    campoBusca.addEventListener("input", () => {
      termoAtual = normalizar(campoBusca.value);
      aplicarFiltros();
    });
  }

  if (formularioIngredientes && campoIngredientes) {
    formularioIngredientes.addEventListener("submit", (evento) => {
      evento.preventDefault();
      ingredientesProcurados = lerIngredientes(campoIngredientes.value);

      if (modoIngredientes) {
        modoCorrespondencia = modoIngredientes.value;
      }

      aplicarFiltros();
    });

    campoIngredientes.addEventListener("input", () => {
      ingredientesProcurados = lerIngredientes(campoIngredientes.value);
      aplicarFiltros();
    });
  }

  if (modoIngredientes) {
    modoIngredientes.addEventListener("change", () => {
      modoCorrespondencia = modoIngredientes.value;
      aplicarFiltros();
    });
  }

  if (botaoLimpar) {
    botaoLimpar.addEventListener("click", () => {
      if (campoIngredientes) campoIngredientes.value = "";

      ingredientesProcurados = [];
      aplicarFiltros();
    });
  }

  botoesCategoria.forEach((botao) => {
    botao.addEventListener("click", () => {
      categoriaAtual = botao.dataset.categoria;

      botoesCategoria.forEach((item) => {
        const ativo = item === botao;
        item.classList.toggle("active", ativo);
        item.setAttribute("aria-pressed", String(ativo));
      });

      aplicarFiltros();
    });
  });

  const parametros = new URLSearchParams(window.location.search);
  const categoriaURL = parametros.get("categoria");
  const pesquisaURL = parametros.get("q");

  if (categoriaURL) {
    const encontrada = [...botoesCategoria].find(
      (botao) => normalizar(botao.dataset.categoria) === normalizar(categoriaURL)
    );

    if (encontrada) categoriaAtual = encontrada.dataset.categoria;
  }

  if (pesquisaURL && campoBusca) {
    campoBusca.value = pesquisaURL;
    termoAtual = normalizar(pesquisaURL);
  }

  botoesCategoria.forEach((botao) => {
    const ativo = normalizar(botao.dataset.categoria) === normalizar(categoriaAtual);
    botao.classList.toggle("active", ativo);
    botao.setAttribute("aria-pressed", String(ativo));
  });

  aplicarFiltros();
});

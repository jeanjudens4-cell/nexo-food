
/* ==========================================
   NEXO FOOD - BUSCA INTELIGENTE
   Pesquisa + Categorias + Ingredientes
   ========================================== */

document.addEventListener("DOMContentLoaded", function () {
  "use strict";

  const area = document.getElementById("all-recipes");
  const contador = document.getElementById("recipe-count");
  const mensagem = document.getElementById("no-recipes");

  const formulario = document.getElementById("recipe-search");
  const campo = document.getElementById("search-input");

  const formularioIngredientes =
    document.getElementById("ingredient-search-form");

  const campoIngredientes =
    document.getElementById("ingredients-input");

  const modoIngredientes =
    document.getElementById("ingredient-match-mode");

  const botaoLimpar =
    document.getElementById("clear-ingredients");

  const botoesCategoria =
    document.querySelectorAll("[data-categoria]");

  if (!area) {
    console.error("NEXO FOOD: não encontrei #all-recipes.");
    return;
  }

  if (!Array.isArray(window.receitas)) {
    area.textContent =
      "Não foi possível carregar as receitas. Confira receitas.js.";
    console.error("NEXO FOOD: window.receitas não está disponível.");
    return;
  }

  // Estado dos filtros: todos permanecem ativos ao mesmo tempo.
  let categoriaSelecionada = "Todas";
  let textoPesquisa = "";
  let ingredientesPesquisa = [];

  // Ignora acentos, maiúsculas e espaços desnecessários.
  function normalizar(valor) {
    return String(valor ?? "")
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .toLocaleLowerCase("pt-BR")
      .trim();
  }

  function obterIngredientes(receita) {
    if (Array.isArray(receita.ingredientes)) {
      return receita.ingredientes.map((item) => {
        if (typeof item === "string") return item;

        if (item && typeof item === "object") {
          return [
            item.nome,
            item.name,
            item.ingrediente
          ].filter(Boolean).join(" ");
        }

        return String(item ?? "");
      });
    }

    if (typeof receita.ingredientes === "string") {
      return receita.ingredientes.split(",");
    }

    return [];
  }

  function dividirIngredientes(valor) {
    return String(valor ?? "")
      .split(/[,;\n]+/)
      .map((item) => normalizar(item))
      .filter(Boolean);
  }

  function correspondeTexto(receita) {
    if (!textoPesquisa) return true;

    const ingredientes = obterIngredientes(receita).join(" ");

    const textoCompleto = normalizar([
      receita.nome,
      receita.categoria,
      receita.descricao,
      ingredientes,
      receita.tempo,
      receita.dificuldade
    ].join(" "));

    // Permite pesquisar várias palavras.
    const palavras = textoPesquisa
      .split(/\s+/)
      .filter(Boolean);

    return palavras.every((palavra) =>
      textoCompleto.includes(palavra)
    );
  }

  function correspondeCategoria(receita) {
    return (
      categoriaSelecionada === "Todas" ||
      normalizar(receita.categoria) ===
        normalizar(categoriaSelecionada)
    );
  }

  function correspondeIngredientes(receita) {
    if (ingredientesPesquisa.length === 0) return true;

    const ingredientesReceita = obterIngredientes(receita)
      .map((item) => normalizar(item));

    const modo = modoIngredientes?.value || "todos";

    function encontrou(ingredienteProcurado) {
      return ingredientesReceita.some((item) =>
        item.includes(ingredienteProcurado)
      );
    }

    if (modo === "qualquer") {
      return ingredientesPesquisa.some(encontrou);
    }

    return ingredientesPesquisa.every(encontrou);
  }

  function criarElemento(tag, classe, texto) {
    const elemento = document.createElement(tag);

    if (classe) elemento.className = classe;
    if (texto !== undefined) elemento.textContent = String(texto);

    return elemento;
  }

  function criarCard(receita) {
    const card = criarElemento("article", "product-card");

    const imagem = document.createElement("img");
    imagem.src = receita.imagem || "";
    imagem.alt = receita.nome || "Receita";
    imagem.loading = "lazy";

    imagem.addEventListener("error", () => {
      imagem.style.display = "none";
    });

    const conteudo = criarElemento("div", "product-card-content");

    const categoria = criarElemento(
      "span",
      "recipe-category",
      receita.categoria || "Receita"
    );

    const titulo = criarElemento(
      "h3",
      "",
      receita.nome || "Receita sem nome"
    );

    const descricao = criarElemento(
      "p",
      "",
      receita.descricao || ""
    );

    const meta = criarElemento("div", "recipe-meta");

    meta.append(
      criarElemento(
        "span",
        "",
        `⏱ ${receita.tempo ?? "—"} min`
      ),
      criarElemento(
        "span",
        "",
        receita.dificuldade || "Dificuldade não informada"
      )
    );

    const link = document.createElement("a");
    link.className = "recipe-card-link";

    link.href =
      `receita.html?id=${encodeURIComponent(receita.id)}`;

    link.textContent = "Ver receita →";

    const favorito = document.createElement("button");
    favorito.type = "button";
    favorito.className = "favorite-button";
    favorito.dataset.favoritoId = String(receita.id);
    favorito.setAttribute("aria-pressed", "false");
    favorito.textContent = "♡ Favoritar";

    conteudo.append(
      categoria,
      titulo,
      descricao,
      meta,
      link,
      favorito
    );

    card.append(imagem, conteudo);

    return card;
  }

  function atualizarFavoritos() {
    if (
      typeof window.atualizarBotoesFavoritos === "function"
    ) {
      window.atualizarBotoesFavoritos();
    }
  }

  function renderizar(lista) {
    area.replaceChildren();

    lista.forEach((receita) => {
      area.appendChild(criarCard(receita));
    });

    if (contador) {
      contador.textContent =
        `${lista.length} receita(s) encontrada(s)`;
    }

    if (mensagem) {
      mensagem.hidden = lista.length !== 0;

      if (lista.length === 0) {
        mensagem.textContent =
          "Nenhuma receita encontrada. Experimente mudar sua busca ou os filtros.";
      }
    }

    atualizarFavoritos();

    document.dispatchEvent(
      new Event("receitasRenderizadas")
    );
  }

  function filtrar() {
    const resultados = window.receitas.filter((receita) => {
      return (
        correspondeCategoria(receita) &&
        correspondeTexto(receita) &&
        correspondeIngredientes(receita)
      );
    });

    renderizar(resultados);
  }

  // Busca por nome, categoria, descrição e ingredientes.
  if (formulario && campo) {
    formulario.addEventListener("submit", (evento) => {
      evento.preventDefault();
      textoPesquisa = normalizar(campo.value);
      filtrar();
    });

    campo.addEventListener("input", () => {
      textoPesquisa = normalizar(campo.value);
      filtrar();
    });
  }

  // Busca por ingredientes disponíveis.
  if (formularioIngredientes && campoIngredientes) {
    formularioIngredientes.addEventListener("submit", (evento) => {
      evento.preventDefault();

      ingredientesPesquisa =
        dividirIngredientes(campoIngredientes.value);

      filtrar();
    });

    campoIngredientes.addEventListener("input", () => {
      ingredientesPesquisa =
        dividirIngredientes(campoIngredientes.value);

      filtrar();
    });
  }

  if (modoIngredientes) {
    modoIngredientes.addEventListener("change", filtrar);
  }

  if (botaoLimpar) {
    botaoLimpar.addEventListener("click", () => {
      if (campoIngredientes) campoIngredientes.value = "";

      ingredientesPesquisa = [];
      filtrar();
    });
  }

  // Filtros de categoria.
  botoesCategoria.forEach((botao) => {
    botao.addEventListener("click", () => {
      categoriaSelecionada = botao.dataset.categoria || "Todas";

      botoesCategoria.forEach((item) => {
        item.classList.toggle("active", item === botao);
      });

      filtrar();
    });
  });

  // Suporte a links com ?categoria=... e ?q=...
  const parametros = new URLSearchParams(window.location.search);
  const categoriaURL = parametros.get("categoria");
  const pesquisaURL = parametros.get("q");

  if (categoriaURL) {
    const botao = [...botoesCategoria].find((item) =>
      normalizar(item.dataset.categoria) === normalizar(categoriaURL)
    );

    if (botao) {
      categoriaSelecionada = botao.dataset.categoria;

      botoesCategoria.forEach((item) => {
        item.classList.toggle("active", item === botao);
      });
    }
  }

  if (pesquisaURL && campo) {
    campo.value = pesquisaURL;
    textoPesquisa = normalizar(pesquisaURL);
  }

  filtrar();
});

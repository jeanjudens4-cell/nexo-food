
/* ==========================================
   NEXO FOOD - SISTEMA DE FAVORITOS
   ========================================== */

(() => {
  "use strict";

  const CHAVE = "nexoFoodFavoritos";

  function obterFavoritos() {
    try {
      const dados = JSON.parse(localStorage.getItem(CHAVE) || "[]");
      return Array.isArray(dados) ? dados.map(String) : [];
    } catch (erro) {
      console.error("Erro ao carregar favoritos:", erro);
      return [];
    }
  }

  function salvarFavoritos(lista) {
    try {
      localStorage.setItem(CHAVE, JSON.stringify(lista));
      return true;
    } catch (erro) {
      console.error("Erro ao salvar favoritos:", erro);
      alert("Não foi possível salvar os favoritos neste navegador.");
      return false;
    }
  }

  function ehFavorito(id) {
    return obterFavoritos().includes(String(id));
  }

  function alternarFavorito(id) {
    const chave = String(id);
    const atuais = obterFavoritos();

    const atualizados = atuais.includes(chave)
      ? atuais.filter((item) => item !== chave)
      : [...atuais, chave];

    if (!salvarFavoritos(atualizados)) return;

    atualizarBotoesFavoritos();
    renderizarPaginaFavoritos();

    document.dispatchEvent(new Event("favoritosAtualizados"));
  }

  function atualizarBotoesFavoritos() {
    const favoritos = obterFavoritos();

    document.querySelectorAll("[data-favorito-id]").forEach((botao) => {
      const id = String(botao.dataset.favoritoId);
      const ativo = favoritos.includes(id);

      botao.classList.toggle("favoritado", ativo);
      botao.setAttribute("aria-pressed", String(ativo));
      botao.textContent = ativo ? "♥ Favoritado" : "♡ Favoritar";
      botao.setAttribute(
        "aria-label",
        ativo ? "Remover dos favoritos" : "Adicionar aos favoritos"
      );
    });
  }

  function renderizarPaginaFavoritos() {
    const area = document.getElementById("favorite-recipes");

    if (!area || !Array.isArray(window.receitas)) return;

    const favoritos = obterFavoritos();

    const receitasSalvas = window.receitas.filter((receita) =>
      favoritos.includes(String(receita.id))
    );

    area.innerHTML = "";

    const contador = document.getElementById("favorite-count");
    const mensagem = document.getElementById("empty-favorites");

    if (contador) {
      contador.textContent = String(receitasSalvas.length);
    }

    if (mensagem) {
      mensagem.hidden = receitasSalvas.length > 0;
    }

    receitasSalvas.forEach((receita) => {
      const card = document.createElement("article");
      card.className = "product-card";

      const imagem = document.createElement("img");
      imagem.src = receita.imagem || "";
      imagem.alt = receita.nome || "Receita";
      imagem.loading = "lazy";

      imagem.addEventListener("error", () => {
        imagem.style.display = "none";
      });

      const conteudo = document.createElement("div");
      conteudo.className = "product-card-content";

      const categoria = document.createElement("span");
      categoria.className = "recipe-category";
      categoria.textContent = receita.categoria || "Receita";

      const titulo = document.createElement("h3");
      titulo.textContent = receita.nome || "Receita";

      const descricao = document.createElement("p");
      descricao.textContent = receita.descricao || "";

      const detalhes = document.createElement("div");
      detalhes.className = "recipe-meta";

      const tempo = document.createElement("span");
      tempo.textContent = `⏱ ${receita.tempo ?? "—"} min`;

      const dificuldade = document.createElement("span");
      dificuldade.textContent = receita.dificuldade || "";

      detalhes.append(tempo, dificuldade);

      const link = document.createElement("a");
      link.className = "recipe-card-link";
      link.href = `receita.html?id=${encodeURIComponent(receita.id)}`;
      link.textContent = "Ver receita →";

      const botao = document.createElement("button");
      botao.type = "button";
      botao.className = "favorite-button favoritado";
      botao.dataset.favoritoId = String(receita.id);
      botao.setAttribute("aria-pressed", "true");
      botao.textContent = "♥ Favoritado";

      conteudo.append(
        categoria,
        titulo,
        descricao,
        detalhes,
        link,
        botao
      );

      card.append(imagem, conteudo);
      area.appendChild(card);
    });

    atualizarBotoesFavoritos();
  }

  // Um único evento funciona para os cards criados dinamicamente.
  document.addEventListener("click", (evento) => {
    const botao = evento.target.closest(
      ".favorite-button[data-favorito-id], [data-favorito-id]"
    );

    if (!botao) return;

    evento.preventDefault();
    alternarFavorito(botao.dataset.favoritoId);
  });

  window.NexoFavoritos = {
    obterFavoritos,
    salvarFavoritos,
    ehFavorito,
    alternarFavorito,
    atualizarBotoesFavoritos,
    renderizarPaginaFavoritos
  };

  // Compatibilidade com os outros scripts do projeto.
  window.atualizarBotoesFavoritos = atualizarBotoesFavoritos;
  window.renderizarPaginaFavoritos = renderizarPaginaFavoritos;

  function iniciar() {
    atualizarBotoesFavoritos();
    renderizarPaginaFavoritos();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", iniciar);
  } else {
    iniciar();
  }

  window.addEventListener("storage", (evento) => {
    if (evento.key === CHAVE) iniciar();
  });
})();

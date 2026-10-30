
document.addEventListener("DOMContentLoaded", () => {
  const container = document.getElementById("featured-recipes");
  const formulario = document.getElementById("recipe-search");
  const campoBusca = document.getElementById("search-input");
  const mensagemVazia = document.getElementById("empty-recipes");

  if (!container) {
    console.error("NEXO FOOD: elemento #featured-recipes não encontrado.");
    return;
  }

  function mostrarReceitas(lista) {
    if (lista.length === 0) {
      container.innerHTML = "";

      if (mensagemVazia) {
        mensagemVazia.hidden = false;
      }

      return;
    }

    if (mensagemVazia) {
      mensagemVazia.hidden = true;
    }

    container.innerHTML = lista.map((receita) => `
      <article class="product-card">
        <img
          src="${receita.imagem}"
          alt="${receita.nome}"
          loading="lazy"
        >

        <div class="product-card-content">
          <span class="recipe-category">${receita.categoria}</span>

          <h3>${receita.nome}</h3>

          <p>${receita.descricao}</p>

          <div class="recipe-meta">
            <span>⏱ ${receita.tempo} min</span>
            <span>${receita.dificuldade}</span>
          </div>

          <a
            class="recipe-card-link"
            href="pages/receita.html?id=${encodeURIComponent(receita.id)}"
          >
            Ver receita →
          </a>

          <button
            type="button"
            class="favorite-button"
            data-favorito-id="${receita.id}"
            aria-pressed="false"
          >
            ♡ Favoritar
          </button>
        </div>
      </article>
    `).join("");

    if (typeof atualizarBotoesFavoritos === "function") {
      atualizarBotoesFavoritos();
    }
  }

  if (typeof receitas === "undefined" || !Array.isArray(receitas)) {
    container.innerHTML = "<p>Não foi possível carregar as receitas.</p>";
    console.error("NEXO FOOD: verifique o arquivo js/receitas.js.");
    return;
  }

  if (formulario && campoBusca) {
    formulario.addEventListener("submit", (evento) => {
      evento.preventDefault();

      const termo = campoBusca.value.trim().toLowerCase();

      const resultados = receitas.filter((receita) => {
        const texto = [
          receita.nome,
          receita.categoria,
          receita.descricao
        ].join(" ").toLowerCase();

        return texto.includes(termo);
      });

      mostrarReceitas(resultados);
    });
  }

  mostrarReceitas(receitas);
});

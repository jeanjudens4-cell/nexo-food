
document.addEventListener("DOMContentLoaded", () => {
  const areaDetalhes = document.getElementById("recipe-detail");

  if (!areaDetalhes) {
    console.error("NEXO FOOD: elemento #recipe-detail não encontrado.");
    return;
  }

  const parametros = new URLSearchParams(window.location.search);
  const idReceita = Number(parametros.get("id"));

  if (typeof receitas === "undefined" || !Array.isArray(receitas)) {
    areaDetalhes.innerHTML = `
      <h1>Erro ao carregar as receitas</h1>
      <p>Verifique o caminho do arquivo receitas.js.</p>
      <a href="../index.html">Voltar ao início</a>
    `;
    return;
  }

  const receita = receitas.find((item) => item.id === idReceita);

  if (!receita) {
    areaDetalhes.innerHTML = `
      <div class="recipe-not-found">
        <h1>Receita não encontrada</h1>
        <p>Não encontramos essa receita. Escolha outra no nosso site.</p>
        <a href="receitas.html" class="button">
          Explorar receitas
        </a>
      </div>
    `;
    return;
  }

  const ingredientes = receita.ingredientes || [];
  const preparo = receita.preparo || [];

  areaDetalhes.innerHTML = `
    <article class="recipe-detail">
      <img
        class="recipe-detail-image"
        src="${receita.imagem}"
        alt="${receita.nome}"
      >

      <div class="recipe-detail-content">
        <span class="recipe-category">${receita.categoria}</span>

        <h1>${receita.nome}</h1>

        <p class="recipe-description">${receita.descricao}</p>

        <div class="recipe-information">
          <div>
            <strong>${receita.tempo} min</strong>
            <span>Tempo total</span>
          </div>

          <div>
            <strong>${receita.dificuldade}</strong>
            <span>Dificuldade</span>
          </div>

          <div>
            <strong>${receita.porcoes || 4}</strong>
            <span>Porções</span>
          </div>
        </div>

        <button
          type="button"
          class="favorite-button"
          data-favorito-id="${receita.id}"
          aria-pressed="false"
        >
          ♡ Favoritar
        </button>

        <section class="recipe-section">
          <h2>Ingredientes</h2>

          ${
            ingredientes.length
              ? `<ul>${ingredientes.map((item) => `<li>${item}</li>`).join("")}</ul>`
              : "<p>Ingredientes ainda não cadastrados.</p>"
          }
        </section>

        <section class="recipe-section">
          <h2>Modo de preparo</h2>

          ${
            preparo.length
              ? `<ol>${preparo.map((passo) => `<li>${passo}</li>`).join("")}</ol>`
              : "<p>Modo de preparo ainda não cadastrado.</p>"
          }
        </section>

        <a href="receitas.html" class="button">
          Ver outras receitas
        </a>
      </div>
    </article>
  `;

  if (typeof atualizarBotoesFavoritos === "function") {
    atualizarBotoesFavoritos();
  }
});

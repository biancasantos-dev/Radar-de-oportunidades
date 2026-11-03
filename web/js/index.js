// ============================================================
// RADAR DE OPORTUNIDADES — INDEX.JS
// Carregamento dinâmico via JSON + Filtros em Abas de Pasta
// ============================================================

document.addEventListener('DOMContentLoaded', () => {
  const folderWrapper = document.getElementById('container-pasta');
  const tabs = document.querySelectorAll('.folder-tab');
  const tipoSelect = document.getElementById('filtro-tipo');
  const searchInput = document.getElementById('campo-busca-curso');
  const searchForm = document.querySelector('.folder-toolbar');
  const cardsGrid = document.getElementById('grid-oportunidades');
  const emptyState = document.getElementById('estado-vazio');

  // Dicionário estático para abreviação dos meses (estilo ticket)
  const MESES = {
    '01': 'JAN', '02': 'FEV', '03': 'MAR', '04': 'ABR',
    '05': 'MAI', '06': 'JUN', '07': 'JUL', '08': 'AGO',
    '09': 'SET', '10': 'OUT', '11': 'NOV', '12': 'DEZ'
  };

  let activeEixo = 'geral';
  let todasOportunidades = [];

  function fecharSelects() {
    document.querySelectorAll('.custom-select-wrap.is-open').forEach(w => {
      w.classList.remove('is-open');
      const trg = w.querySelector('.custom-select-trigger');
      if (trg) trg.setAttribute('aria-expanded', 'false');
    });
  }

  // ── 1. Carregar Oportunidades do JSON e LocalStorage ──
  async function carregarOportunidades() {
    try {
      const response = await fetch('assets/data/oportunidades.json');
      if (!response.ok) throw new Error('Falha ao carregar dados');
      const dadosJson = await response.json();

      const dadosLocais = localStorage.getItem('oportunidades_gestao');
      if (dadosLocais) {
        todasOportunidades = JSON.parse(dadosLocais);
        dadosJson.forEach(item => {
          if (!todasOportunidades.some(to => to.id === item.id)) {
            todasOportunidades.push(item);
          }
        });
      } else {
        todasOportunidades = dadosJson;
      }

      renderizarCards();
    } catch (error) {
      console.error('Erro ao buscar dados:', error);
      cardsGrid.innerHTML = '<p class="empty-desc">Erro ao carregar as vagas. Tente recarregar a página.</p>';
    }
  }

  // ── 2. Renderização Semântica Direta dos Cards ──
  function renderizarCards() {
    const selectedTipo = tipoSelect.value;
    const searchTerm = searchInput.value.trim().toLowerCase();

    const filtradas = todasOportunidades.filter(item => {
      const matchEixo = (activeEixo === 'geral') || (item.eixo === activeEixo);
      const matchTipo = (selectedTipo === 'TODOS') || (item.tipo === selectedTipo);
      const textoCompleto = `${item.titulo} ${item.departamento} ${item.descricao}`.toLowerCase();
      const matchBusca = !searchTerm || textoCompleto.includes(searchTerm);
      return matchEixo && matchTipo && matchBusca;
    });

    // Atualiza dinamicamente o contador do topo com base no total cadastrado
    const countEl = document.getElementById('contador-vagas');
    if (countEl) {
      const totalAbertas = todasOportunidades.filter(i => (i.status || '').toUpperCase() === 'ABERTA').length;
      
      if (activeEixo === 'geral' && selectedTipo === 'TODOS' && !searchTerm) {
        countEl.textContent = `${totalAbertas} Oportunidades Abertas`;
      } else {
        countEl.textContent = `${filtradas.length} ${filtradas.length === 1 ? 'Oportunidade Encontrada' : 'Oportunidades Encontradas'}`;
      }
    }

    cardsGrid.innerHTML = '';

    if (filtradas.length === 0) {
      emptyState.classList.remove('hidden');
      return;
    }

    emptyState.classList.add('hidden');

    filtradas.forEach(item => {
      const isEncerrada = (item.status || '').toUpperCase() === 'ENCERRADA';
      const statusClass = isEncerrada ? 'status-encerrada' : 'status-aberta';
      const cardClass = isEncerrada ? 'opportunity-card card-encerrada' : 'opportunity-card';
      const btnText = isEncerrada ? 'Inscrições Encerradas' : 'Ver Oportunidade';
      const btnClass = isEncerrada ? 'btn-action btn-action-encerrada' : 'btn-action';

      // Formatação inteligente da data para estilo ticket (Ex: "15 NOV")
      const partesData = (item.data_limite || '').split('/');
      const dia = partesData[0] || '15';
      const mesNum = partesData[1] || '11';
      const mesTexto = MESES[mesNum] || 'NOV';

      const bolsaLower = (item.bolsa || '').toLowerCase();
      const captionBolsa = bolsaLower.includes('h') || bolsaLower.includes('ac') || bolsaLower.includes('voluntário')
        ? 'Benefício'
        : 'Remuneração';

      const article = document.createElement('article');
      article.className = cardClass;
      article.setAttribute('data-eixo', item.eixo);
      article.setAttribute('data-tipo', item.tipo);

      article.innerHTML = `
        <header class="card-top">
          <strong class="badge-pill">${item.tipo}</strong>
          <span class="badge-status ${statusClass}">${item.status}</span>
        </header>

        <h2 class="card-heading">${item.titulo}</h2>
        
        <p class="card-dept">${item.departamento} <span class="arrow-accent" aria-hidden="true">↗</span></p>

        <p class="card-desc">${item.descricao}</p>

        <footer class="card-footer">
          <dl class="card-bento-metrics">
            <div class="metric-box bolsa-box">
              <dt class="metric-caption">${captionBolsa}</dt>
              <dd class="metric-val">${item.bolsa}</dd>
            </div>
            <div class="metric-box prazo-box">
              <dt class="metric-caption">${isEncerrada ? 'Encerrado em' : 'Inscrições até'}</dt>
              <dd class="metric-val">${dia} ${mesTexto}</dd>
            </div>
          </dl>
          
          <a href="detalhe.html?id=${item.id}" class="${btnClass}">
            <span>${btnText}</span>
            <img src="assets/icons/arrow-right.svg" alt="" class="btn-action-icon" aria-hidden="true" width="16" height="16">
          </a>
        </footer>
      `;

      cardsGrid.appendChild(article);
    });
  }

  // ── 3. Alternância das Abas da Pasta ──
  tabs.forEach(tab => {
    tab.addEventListener('click', () => {
      fecharSelects();
      const selectedEixo = tab.getAttribute('data-eixo');
      if (selectedEixo === activeEixo) return;

      activeEixo = selectedEixo;

      tabs.forEach(t => t.classList.remove('active'));
      tab.classList.add('active');

      folderWrapper.setAttribute('data-active-eixo', activeEixo);
      renderizarCards();
    });
  });

  // ── 4. Filtro por Tipo e Busca (Filtro por Tipo é sincronizado via script.js global) ──
  tipoSelect.addEventListener('change', renderizarCards);
  searchInput.addEventListener('input', () => {
    fecharSelects();
    renderizarCards();
  });
  searchForm.addEventListener('submit', (e) => {
    e.preventDefault();
    fecharSelects();
    renderizarCards();
  });

  // Inicialização
  folderWrapper.setAttribute('data-active-eixo', 'geral');
  carregarOportunidades();
});

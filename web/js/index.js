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

  // Elementos do componente de Select Customizado
  const selectWrap = document.getElementById('wrap-filtro-tipo');
  const selectTrigger = document.getElementById('select-trigger-tipo');
  const triggerDot = document.getElementById('trigger-dot');
  const triggerText = document.getElementById('trigger-text');
  const selectDropdown = document.getElementById('select-menu-tipo');
  const selectOptions = document.querySelectorAll('.custom-select-option');

  // Dicionário estático para abreviação dos meses (estilo ticket)
  const MESES = {
    '01': 'JAN', '02': 'FEV', '03': 'MAR', '04': 'ABR',
    '05': 'MAI', '06': 'JUN', '07': 'JUL', '08': 'AGO',
    '09': 'SET', '10': 'OUT', '11': 'NOV', '12': 'DEZ'
  };

  let activeEixo = 'geral';
  let todasOportunidades = [];

  // ── Utilitários do Select Customizado ──
  function fecharDropdown() {
    if (selectWrap) {
      selectWrap.classList.remove('is-open');
      if (selectTrigger) selectTrigger.setAttribute('aria-expanded', 'false');
    }
  }

  function abrirDropdown() {
    if (selectWrap) {
      selectWrap.classList.add('is-open');
      if (selectTrigger) selectTrigger.setAttribute('aria-expanded', 'true');
    }
  }

  // ── 1. Carregar Oportunidades do JSON ──
  async function carregarOportunidades() {
    try {
      const response = await fetch('assets/data/oportunidades.json');
      if (!response.ok) throw new Error('Falha ao carregar dados');
      todasOportunidades = await response.json();
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
              <dt class="metric-caption">Remuneração</dt>
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
      fecharDropdown();
      const selectedEixo = tab.getAttribute('data-eixo');
      if (selectedEixo === activeEixo) return;

      activeEixo = selectedEixo;

      tabs.forEach(t => t.classList.remove('active'));
      tab.classList.add('active');

      folderWrapper.setAttribute('data-active-eixo', activeEixo);
      renderizarCards();
    });
  });

  // ── 4. Filtro Customizado de Tipos na Identidade Visual OportUni ──
  if (selectTrigger && selectDropdown) {
    // Abrir/Fechar ao clicar no botão disparador
    selectTrigger.addEventListener('click', (e) => {
      e.stopPropagation();
      const isOpen = selectWrap.classList.contains('is-open');
      if (isOpen) {
        fecharDropdown();
      } else {
        abrirDropdown();
      }
    });

    // Seleção de item
    selectOptions.forEach(option => {
      option.addEventListener('click', (e) => {
        e.stopPropagation();
        const valor = option.getAttribute('data-value');
        const dotClass = option.getAttribute('data-dot');
        const textSpan = option.querySelector('.option-text');
        const label = textSpan ? textSpan.textContent : valor;

        // Atualiza o select nativo e dispara o evento change
        tipoSelect.value = valor;
        tipoSelect.dispatchEvent(new Event('change'));

        // Atualiza o texto e indicador de cor do botão trigger
        if (triggerText) triggerText.textContent = label;
        if (triggerDot) triggerDot.className = `type-dot ${dotClass}`;

        // Atualiza marcação visual de seleção e ARIA
        selectOptions.forEach(opt => {
          opt.classList.remove('selected');
          opt.setAttribute('aria-selected', 'false');
        });
        option.classList.add('selected');
        option.setAttribute('aria-selected', 'true');

        fecharDropdown();
        selectTrigger.focus();
      });

      // Acessibilidade via teclado (Enter ou Espaço)
      option.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          option.click();
        }
      });
    });

    // Fechar ao clicar fora
    document.addEventListener('click', (e) => {
      if (selectWrap && !selectWrap.contains(e.target)) {
        fecharDropdown();
      }
    });

    // Fechar ao pressionar a tecla Escape
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        fecharDropdown();
      }
    });
  }

  // ── 5. Filtro por Tipo e Busca ──
  tipoSelect.addEventListener('change', renderizarCards);
  searchInput.addEventListener('input', () => {
    fecharDropdown();
    renderizarCards();
  });
  searchForm.addEventListener('submit', (e) => {
    e.preventDefault();
    fecharDropdown();
    renderizarCards();
  });

  // Inicialização
  folderWrapper.setAttribute('data-active-eixo', 'geral');
  carregarOportunidades();
});

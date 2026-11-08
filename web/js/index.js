// ============================================================
// RADAR DE OPORTUNIDADES — INDEX.JS (MURAL DE OPORTUNIDADES)
// 
// Esta é a página inicial pública do sistema, onde alunos e professores
// consultam os editais abertos na Universidade Católica do Salvador.
// 
// Principais responsabilidades deste script:
// 1. Carga de Dados Inteligente: busca as vagas ativas direto da API Java (/api/oportunidades).
//    Se o banco estiver indisponível no momento, ativa o fallback dos arquivos locais.
// 2. Filtros Combinados em Tempo Real:
//    - Abas da pasta por Eixo Temático (Geral, Exatas, Humanas e Saúde).
//    - Dropdown de Modalidade (IC, Monitoria, Extensão, Estágio, Evento, Grupo).
//    - Campo de busca textual por curso ou palavra-chave.
// 3. Renderização Dinâmica: monta os cards semânticos estilo "ticket acadêmico",
//    com selo de status (Aberta / Encerrada), benefício e prazo formatado.
// ============================================================

document.addEventListener('DOMContentLoaded', () => {
  // ── Elementos do DOM (Document Object Model) ──
  const folderWrapper = document.getElementById('container-pasta');
  const tabs = document.querySelectorAll('.folder-tab');
  const tipoSelect = document.getElementById('filtro-tipo');
  const searchInput = document.getElementById('campo-busca-curso');
  const searchForm = document.querySelector('.folder-toolbar');
  const cardsGrid = document.getElementById('grid-oportunidades');
  const emptyState = document.getElementById('estado-vazio');

  // Mapeamento numérico dos meses para abreviações textuais (ex: '11' -> 'NOV')
  const MESES = {
    '01': 'JAN', '02': 'FEV', '03': 'MAR', '04': 'ABR',
    '05': 'MAI', '06': 'JUN', '07': 'JUL', '08': 'AGO',
    '09': 'SET', '10': 'OUT', '11': 'NOV', '12': 'DEZ'
  };

  // Estado atual dos filtros da interface
  let activeEixo = 'geral'; // Inicia na aba 'Geral' (todas as áreas)
  let todasOportunidades = [];

  // Fecha menus dropdown abertos ao interagir com a página
  function fecharSelects() {
    document.querySelectorAll('.custom-select-wrap.is-open').forEach(w => {
      w.classList.remove('is-open');
      const trg = w.querySelector('.custom-select-trigger');
      if (trg) trg.setAttribute('aria-expanded', 'false');
    });
  }

  // ── Carregar Oportunidades (API Back-end + Fallback de Contingência) ──
  async function carregarOportunidades() {
    try {
      // 1. Prioridade máxima: consulta o endpoint do servidor Java HttpServer
      if (typeof apiFetch === 'function') {
        try {
          const vagasApi = await apiFetch('/oportunidades');
          if (Array.isArray(vagasApi) && vagasApi.length > 0) {
            todasOportunidades = vagasApi;
            renderizarCards();
            return;
          }
        } catch (apiErr) {
          console.warn('API /api/oportunidades indisponível, usando fallback local:', apiErr);
        }
      }

      // 2. Fallback: se o banco não estiver rodando, carrega os dados locais do protótipo
      const response = await fetch('assets/data/oportunidades.json');
      if (!response.ok) throw new Error('Falha ao carregar dados locais');
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

  // ── Renderização Dinâmica dos Cards no Grid ──
  // Filtra as oportunidades com base no Eixo, no Tipo e na busca digitada.
  function renderizarCards() {
    const selectedTipo = tipoSelect.value;
    const searchTerm = searchInput.value.trim().toLowerCase();

    // Aplica os filtros combinados
    const filtradas = todasOportunidades.filter(item => {
      const matchEixo = (activeEixo === 'geral') || (item.eixo === activeEixo);
      const matchTipo = (selectedTipo === 'TODOS') || (item.tipo === selectedTipo);
      const textoCompleto = `${item.titulo} ${item.departamento} ${item.descricao}`.toLowerCase();
      const matchBusca = !searchTerm || textoCompleto.includes(searchTerm);
      return matchEixo && matchTipo && matchBusca;
    });

    // Atualiza o contador de vagas no cabeçalho do mural
    const countEl = document.getElementById('contador-vagas');
    if (countEl) {
      const totalAbertas = todasOportunidades.filter(i => (i.status || '').toUpperCase() === 'ABERTA').length;
      
      if (activeEixo === 'geral' && selectedTipo === 'TODOS' && !searchTerm) {
        countEl.textContent = `${totalAbertas} Oportunidades Abertas`;
      } else {
        countEl.textContent = `${filtradas.length} ${filtradas.length === 1 ? 'Oportunidade Encontrada' : 'Oportunidades Encontradas'}`;
      }
    }

    // Limpa o grid atual antes de renderizar os novos cards
    cardsGrid.innerHTML = '';

    // Se nenhuma vaga atender aos filtros, exibe a ilustração de 'Estado Vazio'
    if (filtradas.length === 0) {
      emptyState.classList.remove('hidden');
      return;
    }

    emptyState.classList.add('hidden');

    // Cria o elemento HTML de cada card de oportunidade
    filtradas.forEach(item => {
      const isEncerrada = (item.status || '').toUpperCase() === 'ENCERRADA';
      const statusClass = isEncerrada ? 'status-encerrada' : 'status-aberta';
      const cardClass = isEncerrada ? 'opportunity-card card-encerrada' : 'opportunity-card';
      const btnText = isEncerrada ? 'Inscrições Encerradas' : 'Ver Oportunidade';
      const btnClass = isEncerrada ? 'btn-action btn-action-encerrada' : 'btn-action';

      // Separa dia e mês para o design estilo ticket (ex: "15 NOV")
      const partesData = (item.data_limite || '').split('/');
      const dia = partesData[0] || '15';
      const mesNum = partesData[1] || '11';
      const mesTexto = MESES[mesNum] || 'NOV';

      // Identifica se a remuneração é financeira (Remuneração) ou horas complementares (Benefício)
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

  // ── Alternância das Abas da Pasta por Eixo Acadêmico ──
  tabs.forEach(tab => {
    tab.addEventListener('click', () => {
      fecharSelects();
      const selectedEixo = tab.getAttribute('data-eixo');
      if (selectedEixo === activeEixo) return;

      activeEixo = selectedEixo;

      // Atualiza a aba visualmente ativa
      tabs.forEach(t => t.classList.remove('active'));
      tab.classList.add('active');

      // Aplica a cor temática do Eixo na pasta
      folderWrapper.setAttribute('data-active-eixo', activeEixo);
      renderizarCards();
    });
  });

  // ── Filtro por Tipo de Vaga e Busca Textual em Tempo Real ──
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

  // ── Inicialização ──
  folderWrapper.setAttribute('data-active-eixo', 'geral');
  carregarOportunidades();
});

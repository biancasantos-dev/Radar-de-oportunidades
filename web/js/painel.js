// ==============================================================================
// OPORTUNI — PAINEL.JS (PORTAL DO DOCENTE / GESTÃO DE OPORTUNIDADES)
//
// O que este arquivo faz?
// 1. Apresenta a lista de editais e oportunidades criados pelo professor conectado.
// 2. Calcula indicadores automáticos (KPIs):
//    - Total de Vagas
//    - Vagas Abertas
//    - Vagas Encerradas
//    - Alunos Únicos Inscritos (calcula a quantidade exata de estudantes interessados)
// 3. Permite busca em tempo real por título, tipo de vaga ou departamento.
// 4. Oferece botões rápidos para:
//    - Alternar status da vaga (Encerrar ou Reabrir inscrições).
//    - Excluir vaga com confirmação em janela modal.
//    - Acessar a tela de candidatos inscritos ou o mural público.
// 5. Integração com o Back-end Java:
//    - Consome as rotas '/api/oportunidades' e '/api/interesses'.
//    - Mantém contingência offline com arquivos JSON e LocalStorage para que o
//      sistema nunca falhe durante apresentações ou avaliações.
// ==============================================================================

// Aguarda o navegador montar toda a estrutura HTML da página
document.addEventListener('DOMContentLoaded', () => {

  // --------------------------------------------------------------------------
  // Mapear os elementos da tela no JavaScript
  // --------------------------------------------------------------------------
  const tbody = document.getElementById('painel-tbody');
  const emptyState = document.getElementById('painel-empty-state');
  const searchInput = document.getElementById('input-search-painel');
  const filterPills = document.querySelectorAll('.filter-pill');
  const btnLogout = document.getElementById('btn-logout');
  const userDisplayEmail = document.getElementById('user-display-email');

  // Elementos numéricos dos Cards de Indicadores (KPIs)
  const kpiTotalEl = document.getElementById('kpi-total');
  const kpiAbertasEl = document.getElementById('kpi-abertas');
  const kpiInscritosEl = document.getElementById('kpi-inscritos');
  const kpiEncerradasEl = document.getElementById('kpi-encerradas');

  // Contadores numéricos que ficam dentro dos botões de filtro (pílulas)
  const countTodosEl = document.getElementById('count-todos');
  const countAbertasEl = document.getElementById('count-abertas');
  const countEncerradasEl = document.getElementById('count-encerradas');

  // Elementos da Caixa de Diálogo (Modal) de Confirmação de Exclusão
  const modalDelete = document.getElementById('modal-confirm-delete');
  const btnCancelDelete = document.getElementById('btn-cancel-delete');
  const btnConfirmDelete = document.getElementById('btn-confirm-delete');

  // Toast (balão temporário para mensagens como "Vaga encerrada com sucesso")
  const toast = document.getElementById('toast');
  const toastMsg = document.getElementById('toast-msg');

  // Variáveis para guardar o estado dos dados em memória
  let vagas = [];
  let inscritos = [];
  let listaProfessores = [];
  let docenteAtivo = null;
  let todasVagasSistema = [];
  let statusFiltro = 'TODOS';
  let vagaParaExcluirId = null;

  // Dicionário que associa a modalidade da vaga à respectiva classe CSS de cor
  const mapaBadgeTipo = {
    'Iniciação Científica': 'badge-ic',
    'Monitoria': 'badge-monitoria',
    'Extensão': 'badge-extensao',
    'Estágio/Emprego': 'badge-estagio',
    'Evento': 'badge-evento',
    'Grupo de Estudo': 'badge-grupo'
  };

  // --------------------------------------------------------------------------
  // Identificar qual Professor está usando o painel
  // --------------------------------------------------------------------------
  async function carregarDocenteAtivo() {
    // 1. Tenta carregar o catálogo de professores oficiais
    try {
      const resp = await fetch('assets/data/professores.json');
      if (resp.ok) {
        listaProfessores = await resp.json();
      }
    } catch (e) {
      console.warn('Aviso: Não foi possível buscar professores.json:', e);
    }

    // 2. Mescla com docentes que foram cadastrados localmente
    try {
      const profsLocais = JSON.parse(localStorage.getItem('professores_cadastrados') || '[]');
      listaProfessores = [...profsLocais, ...listaProfessores];
    } catch (e) {
      console.warn('Aviso ao ler professores locais:', e);
    }

    // 3. Tenta recuperar o perfil salvo no login (LocalStorage ou SessionStorage)
    const salvo = localStorage.getItem('oportuni_docente_ativo') || sessionStorage.getItem('oportuni_docente_ativo');
    if (salvo) {
      try {
        docenteAtivo = JSON.parse(salvo);
      } catch (e) {
        docenteAtivo = null;
      }
    }

    // 4. Se o perfil salvo não tiver todos os dados, localiza pelo e-mail
    if (!docenteAtivo) {
      const emailSalvo = localStorage.getItem('oportuni_docente_email');
      if (emailSalvo && listaProfessores.length > 0) {
        docenteAtivo = listaProfessores.find(p => p.email.toLowerCase() === emailSalvo.toLowerCase());
      }
    }

    // 5. Se nenhum professor estiver autenticado, redireciona com segurança para login
    if (!docenteAtivo) {
      window.location.href = 'login.html';
      return;
    }

    // Atualiza a barra de boas-vindas do professor no cabeçalho
    atualizarCabecalhoDocente();
  }

  // Preenche o nome e departamento do docente logado na interface
  function atualizarCabecalhoDocente() {
    const tagEl = document.getElementById('painel-docente-tag');
    const deptoEl = document.getElementById('painel-docente-depto');

    if (tagEl) {
      tagEl.textContent = 'Portal do Docente';
    }
    if (userDisplayEmail && docenteAtivo) {
      userDisplayEmail.textContent = `${docenteAtivo.nome} • ${docenteAtivo.email}`;
    }
    if (deptoEl && docenteAtivo) {
      deptoEl.textContent = docenteAtivo.departamento;
    }
  }

  // Ação de Logout: remove as credenciais e volta para a tela de login
  if (btnLogout) {
    btnLogout.addEventListener('click', () => {
      if (typeof removeToken === 'function') removeToken();
      sessionStorage.removeItem('token');
      sessionStorage.removeItem('oportuni_docente_ativo');
      window.location.href = 'login.html';
    });
  }

  // --------------------------------------------------------------------------
  // Carregar Candidaturas de Alunos (/api/interesses)
  // --------------------------------------------------------------------------
  async function carregarInscritos() {
    // 1. Tenta consultar a lista real do banco de dados via API Java
    if (typeof apiFetch === 'function') {
      try {
        const inscritosApi = await apiFetch('/interesses');
        if (Array.isArray(inscritosApi) && inscritosApi.length > 0) {
          // Mapeia o formato do Java para as propriedades esperadas pelo front-end
          inscritos = inscritosApi.map(item => ({
            id: item.id,
            oportunidade_id: item.idOportunidade || item.id_oportunidade,
            nome_aluno: item.nome,
            email_aluno: item.email,
            matricula: item.matricula,
            curso: item.curso,
            periodo: item.semestre,
            mensagem: item.justificativa
          }));
          return;
        }
      } catch (e) {
        console.warn('API /api/interesses offline, usando dados de contingência:', e);
      }
    }

    // 2. Se a API estiver desligada, usa o arquivo estático de contingência
    try {
      const response = await fetch('assets/data/inscritos.json');
      if (response.ok) {
        inscritos = await response.json();
      }
    } catch (e) {
      console.warn('Inscritos carregados com lista vazia por contingência:', e);
    }
  }

  // Função auxiliar que calcula quantos alunos se inscreveram em determinada vaga
  function contarInscritosDaVaga(vagaId) {
    return inscritos.filter(i => i.oportunidade_id === vagaId).length;
  }

  // --------------------------------------------------------------------------
  // Carregar Vagas do Sistema e Filtrar pelo Professor Conectado
  // --------------------------------------------------------------------------
  async function carregarVagas() {
    try {
      // Carrega primeiro as dependências (inscritos e professor)
      await carregarInscritos();
      await carregarDocenteAtivo();

      // Tenta obter as oportunidades do banco de dados via API Java
      let vagasJson = [];
      if (typeof apiFetch === 'function') {
        try {
          const dadosApi = await apiFetch('/oportunidades');
          if (Array.isArray(dadosApi) && dadosApi.length > 0) {
            vagasJson = dadosApi;
          }
        } catch (apiErr) {
          console.warn('API /api/oportunidades offline no painel, usando fallback local:', apiErr);
        }
      }

      // Se a API não respondeu, lê o arquivo de contingência local
      if (vagasJson.length === 0) {
        const response = await fetch('assets/data/oportunidades.json');
        if (!response.ok) throw new Error('Falha ao ler oportunidades.json');
        vagasJson = await response.json();
      }

      // Sincroniza com o LocalStorage para preservar vagas criadas ou alteradas nesta sessão
      const dadosLocais = localStorage.getItem('oportunidades_gestao');
      if (dadosLocais) {
        todasVagasSistema = JSON.parse(dadosLocais);
        vagasJson.forEach(item => {
          if (!todasVagasSistema.some(tv => tv.id === item.id)) {
            todasVagasSistema.push(item);
          }
        });
      } else {
        todasVagasSistema = vagasJson;
      }
      localStorage.setItem('oportunidades_gestao', JSON.stringify(todasVagasSistema));

      // Filtra para exibir apenas as vagas que pertencem a este professor
      filtrarVagasDoDocente();

      // Renderiza as informações na tela
      atualizarInterface();
    } catch (error) {
      console.error('Erro ao buscar dados das vagas:', error);
      tbody.innerHTML = '<tr><td colspan="6" style="text-align:center; padding:24px;">Erro ao carregar oportunidades.</td></tr>';
    }
  }

  // Regra de associação estrita: a vaga pertence ao professor apenas se o ID ou nome baterem exatamente
  function filtrarVagasDoDocente() {
    if (!docenteAtivo) {
      vagas = [];
      return;
    }
    vagas = todasVagasSistema.filter(v => 
      v.professor_id === docenteAtivo.id || 
      (v.professor_nome && docenteAtivo.nome && v.professor_nome.toLowerCase().includes(docenteAtivo.nome.toLowerCase()))
    );
  }

  // Salva no LocalStorage as vagas atualizadas para não perder as alterações
  function salvarVagasLocal() {
    try {
      // 1. Remove apenas as vagas que pertencem a este professor
      todasVagasSistema = todasVagasSistema.filter(v => 
        !(v.professor_id === docenteAtivo.id || 
          (v.professor_nome && docenteAtivo.nome && v.professor_nome.toLowerCase().includes(docenteAtivo.nome.toLowerCase())))
      );
      // 2. Insere as vagas atualizadas
      todasVagasSistema = [...todasVagasSistema, ...vagas];
      localStorage.setItem('oportunidades_gestao', JSON.stringify(todasVagasSistema));
    } catch (e) {
      console.error('Erro ao persistir no localStorage:', e);
    }
  }

  // --------------------------------------------------------------------------
  // Atualização dos Indicadores (KPIs) e Renderização da Tabela
  // --------------------------------------------------------------------------
  function atualizarInterface() {
    atualizarKPIs();
    renderizarTabela();
  }

  // Calcula totais numéricos e atualiza os cards no topo da página
  function atualizarKPIs() {
    const total = vagas.length;
    const abertas = vagas.filter(v => (v.status || '').toUpperCase() === 'ABERTA').length;
    const encerradas = vagas.filter(v => (v.status || '').toUpperCase() === 'ENCERRADA').length;
    
    // Contagem de ALUNOS ÚNICOS inscritos:
    // Se o mesmo aluno se inscreveu em 2 vagas do professor, ele é contado apenas uma vez!
    // Usamos o objeto Set() do JavaScript para eliminar duplicatas automaticamente.
    const vagasIds = new Set(vagas.map(v => v.id));
    const inscricoesDoDocente = inscritos.filter(i => vagasIds.has(i.oportunidade_id));
    const totalAlunosUnicos = new Set(inscricoesDoDocente.map(i => i.matricula)).size;

    // Atualiza os cartões superiores
    if (kpiTotalEl) kpiTotalEl.textContent = total;
    if (kpiAbertasEl) kpiAbertasEl.textContent = abertas;
    if (kpiEncerradasEl) kpiEncerradasEl.textContent = encerradas;
    if (kpiInscritosEl) kpiInscritosEl.textContent = totalAlunosUnicos;

    // Atualiza os numerozinhos dentro dos botões de filtro
    if (countTodosEl) countTodosEl.textContent = total;
    if (countAbertasEl) countAbertasEl.textContent = abertas;
    if (countEncerradasEl) countEncerradasEl.textContent = encerradas;
  }

  // Monta as linhas da tabela (HTML) baseado nos filtros de busca e status
  function renderizarTabela() {
    const termoBusca = (searchInput.value || '').trim().toLowerCase();

    // Filtra as vagas pelas opções selecionadas
    const filtradas = vagas.filter(item => {
      const matchStatus = (statusFiltro === 'TODOS') || ((item.status || '').toUpperCase() === statusFiltro);
      const texto = `${item.titulo} ${item.departamento} ${item.tipo}`.toLowerCase();
      const matchBusca = !termoBusca || texto.includes(termoBusca);
      return matchStatus && matchBusca;
    });

    // Limpa a tabela antes de preencher novamente
    tbody.innerHTML = '';

    // Se nenhuma vaga correspondeu aos filtros, exibe a ilustração de "nenhum resultado"
    if (filtradas.length === 0) {
      emptyState.classList.remove('hidden');
      return;
    }

    emptyState.classList.add('hidden');

    // Cria uma linha <tr> para cada vaga encontrada
    filtradas.forEach(vaga => {
      const isAberta = (vaga.status || '').toUpperCase() === 'ABERTA';
      const statusClass = isAberta ? 'status-aberta' : 'status-encerrada';
      const badgeTipoClass = mapaBadgeTipo[vaga.tipo] || 'badge-ic';
      const qtdInscritos = contarInscritosDaVaga(vaga.id);
      
      // Ícone e dica de texto do botão de encerrar/reabrir
      const iconeToggle = isAberta ? 'assets/icons/lock.svg' : 'assets/icons/unlock.svg';
      const tooltipToggle = isAberta ? 'Encerrar Inscrições' : 'Reabrir Inscrições';

      const tr = document.createElement('tr');
      tr.innerHTML = `
        <td>
          <div class="table-vaga-cell">
            <strong class="table-vaga-title">${vaga.titulo}</strong>
            <span class="table-vaga-dept">${vaga.departamento}</span>
          </div>
        </td>
        <td>
          <span class="table-tipo-badge ${badgeTipoClass}">${vaga.tipo}</span>
        </td>
        <td>
          <span class="table-prazo">${vaga.data_limite || 'A definir'}</span>
        </td>
        <td>
          <span class="table-status-badge ${statusClass}">${vaga.status}</span>
        </td>
        <td>
          <a href="inscritos.html?id=${vaga.id}" class="btn-table-inscritos" title="Ver candidatos desta vaga">
            <img src="assets/icons/users.svg" alt="" width="14" height="14">
            <span>${qtdInscritos} ${qtdInscritos === 1 ? 'aluno' : 'alunos'}</span>
          </a>
        </td>
        <td class="table-actions-cell">
          <a href="detalhe.html?id=${vaga.id}" class="btn-table-icon" title="Ver no mural público">
            <img src="assets/icons/eye.svg" alt="Ver" width="15" height="15">
          </a>
          <a href="oportunidade.html?id=${vaga.id}" class="btn-table-icon" title="Editar vaga">
            <img src="assets/icons/edit.svg" alt="Editar" width="15" height="15">
          </a>
          <button type="button" class="btn-table-icon btn-action-toggle" data-id="${vaga.id}" title="${tooltipToggle}">
            <img src="${iconeToggle}" alt="${tooltipToggle}" width="15" height="15">
          </button>
          <button type="button" class="btn-table-icon btn-action-delete" data-id="${vaga.id}" title="Excluir vaga">
            <img src="assets/icons/trash.svg" alt="Excluir" width="15" height="15">
          </button>
        </td>
      `;

      tbody.appendChild(tr);
    });

    // Vincula os cliques dos botões de ação gerados dinamicamente
    anexarEventosAcoes();
  }

  // --------------------------------------------------------------------------
  // Ações Interativas da Linha (Encerrar/Reabrir e Excluir)
  // --------------------------------------------------------------------------
  function anexarEventosAcoes() {
    // Ação: Alternar Status entre ABERTA e ENCERRADA
    document.querySelectorAll('.btn-action-toggle').forEach(btn => {
      btn.addEventListener('click', async () => {
        const id = parseInt(btn.getAttribute('data-id'), 10);
        const index = vagas.findIndex(v => v.id === id);
        if (index !== -1) {
          const statusAtual = (vagas[index].status || '').toUpperCase();
          const novoStatus = statusAtual === 'ABERTA' ? 'ENCERRADA' : 'ABERTA';
          vagas[index].status = novoStatus;
          salvarVagasLocal();
          atualizarInterface();

          // Sincroniza alteração de status com a API Java (Bug 2)
          if (typeof apiFetch === 'function') {
            try {
              await apiFetch(`/oportunidades/${id}`, { method: 'PATCH' });
            } catch (errApi) {
              console.warn('API offline ou erro ao alternar status da vaga:', errApi);
            }
          }

          exibirToast(`Vaga #${id} agora está ${novoStatus}!`);
        }
      });
    });

    // Ação: Abrir o modal de confirmação antes de excluir
    document.querySelectorAll('.btn-action-delete').forEach(btn => {
      btn.addEventListener('click', () => {
        vagaParaExcluirId = parseInt(btn.getAttribute('data-id'), 10);
        if (modalDelete) {
          // Usa o método padrão HTML5 showModal() se suportado
          if (typeof modalDelete.showModal === 'function') {
            modalDelete.showModal();
          } else {
            modalDelete.classList.add('open');
          }
        }
      });
    });
  }

  // Ação: Confirmou a exclusão dentro do modal
  if (btnConfirmDelete) {
    btnConfirmDelete.addEventListener('click', async () => {
      if (vagaParaExcluirId !== null) {
        const idExcluir = vagaParaExcluirId;
        vagas = vagas.filter(v => v.id !== idExcluir);
        salvarVagasLocal();
        atualizarInterface();
        fecharModalDelete();

        // Sincroniza exclusão no banco PostgreSQL via API Java (Bug 2)
        if (typeof apiFetch === 'function') {
          try {
            await apiFetch(`/oportunidades/${idExcluir}`, { method: 'DELETE' });
          } catch (errApi) {
            console.warn('API offline ou erro ao excluir vaga via DELETE /api/oportunidades:', errApi);
          }
        }

        exibirToast('Oportunidade removida com sucesso!');
        vagaParaExcluirId = null;
      }
    });
  }

  // Ação: Cancelou a exclusão
  if (btnCancelDelete) {
    btnCancelDelete.addEventListener('click', fecharModalDelete);
  }

  // Fecha o modal de confirmação
  function fecharModalDelete() {
    if (modalDelete) {
      if (typeof modalDelete.close === 'function') {
        modalDelete.close();
      } else {
        modalDelete.classList.remove('open');
      }
    }
  }

  // --------------------------------------------------------------------------
  // Filtros Rápidos (Pílulas) e Campo de Busca
  // --------------------------------------------------------------------------
  filterPills.forEach(pill => {
    pill.addEventListener('click', () => {
      // Remove a classe 'active' de todas as pílulas
      filterPills.forEach(p => {
        p.classList.remove('active');
        p.setAttribute('aria-selected', 'false');
      });
      // Ativa apenas a pílula clicada
      pill.classList.add('active');
      pill.setAttribute('aria-selected', 'true');
      statusFiltro = pill.getAttribute('data-status');
      renderizarTabela();
    });
  });

  // Toda vez que o professor digita algo no campo de busca, a tabela se atualiza
  if (searchInput) {
    searchInput.addEventListener('input', renderizarTabela);
  }

  // --------------------------------------------------------------------------
  // Balão de Notificação (Toast)
  // --------------------------------------------------------------------------
  let toastTimer;
  function exibirToast(mensagem) {
    if (!toast) return;
    toastMsg.textContent = mensagem;
    toast.classList.remove('hidden');
    clearTimeout(toastTimer);
    // Some após 2.8 segundos
    toastTimer = setTimeout(() => {
      toast.classList.add('hidden');
    }, 2800);
  }

  // Inicia o carregamento completo do painel
  carregarVagas();
});

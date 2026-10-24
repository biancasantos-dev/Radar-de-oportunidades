// ============================================================
// OPORTUNI — PAINEL.JS
// Gestão de Vagas, Métricas e Interatividade do Painel Docente
// ============================================================

document.addEventListener('DOMContentLoaded', () => {
  const tbody = document.getElementById('painel-tbody');
  const emptyState = document.getElementById('painel-empty-state');
  const searchInput = document.getElementById('input-search-painel');
  const filterPills = document.querySelectorAll('.filter-pill');
  const btnLogout = document.getElementById('btn-logout');
  const userDisplayEmail = document.getElementById('user-display-email');

  // KPIs
  const kpiTotalEl = document.getElementById('kpi-total');
  const kpiAbertasEl = document.getElementById('kpi-abertas');
  const kpiInscritosEl = document.getElementById('kpi-inscritos');
  const kpiEncerradasEl = document.getElementById('kpi-encerradas');

  // Contadores das pílulas de filtro
  const countTodosEl = document.getElementById('count-todos');
  const countAbertasEl = document.getElementById('count-abertas');
  const countEncerradasEl = document.getElementById('count-encerradas');

  // Modal de Exclusão
  const modalDelete = document.getElementById('modal-confirm-delete');
  const btnCancelDelete = document.getElementById('btn-cancel-delete');
  const btnConfirmDelete = document.getElementById('btn-confirm-delete');

  // Toast
  const toast = document.getElementById('toast');
  const toastMsg = document.getElementById('toast-msg');

  let vagas = [];
  let inscritos = [];
  let listaProfessores = [];
  let docenteAtivo = null;
  let todasVagasSistema = [];
  let statusFiltro = 'TODOS';
  let vagaParaExcluirId = null;

  // Mapa de cores para badges de modalidade
  const mapaBadgeTipo = {
    'Iniciação Científica': 'badge-ic',
    'Monitoria': 'badge-monitoria',
    'Extensão': 'badge-extensao',
    'Estágio/Emprego': 'badge-estagio',
    'Evento': 'badge-evento',
    'Grupo de Estudo': 'badge-grupo'
  };

  // ── 1. Determinação Dinâmica do Docente Ativo ──
  async function carregarDocenteAtivo() {
    try {
      const resp = await fetch('assets/data/professores.json');
      if (resp.ok) {
        listaProfessores = await resp.json();
      }
    } catch (e) {
      console.warn('Erro ao carregar lista de professores:', e);
    }

    // Tenta obter perfil salvo em sessão de login anterior
    const salvo = localStorage.getItem('oportuni_docente_ativo') || sessionStorage.getItem('oportuni_docente_ativo');
    if (salvo) {
      try {
        docenteAtivo = JSON.parse(salvo);
      } catch (e) {
        docenteAtivo = null;
      }
    }

    // Se veio e-mail digitado no login, busca na lista
    if (!docenteAtivo) {
      const emailSalvo = localStorage.getItem('oportuni_docente_email');
      if (emailSalvo && listaProfessores.length > 0) {
        docenteAtivo = listaProfessores.find(p => p.email.toLowerCase() === emailSalvo.toLowerCase());
      }
    }

    // Fallback dinâmico: utiliza o primeiro professor vindo de professores.json
    if (!docenteAtivo && listaProfessores.length > 0) {
      docenteAtivo = listaProfessores[0];
    }

    atualizarCabecalhoDocente();
  }

  function atualizarCabecalhoDocente() {
    const tagEl = document.getElementById('painel-docente-tag');
    const deptoEl = document.getElementById('painel-docente-depto');

    if (tagEl) {
      tagEl.textContent = `Área Docente • ${docenteAtivo.tag || docenteAtivo.departamento}`;
    }
    if (userDisplayEmail) {
      userDisplayEmail.textContent = `${docenteAtivo.nome} • ${docenteAtivo.email}`;
    }
    if (deptoEl) {
      deptoEl.textContent = docenteAtivo.departamento;
    }
  }

  if (btnLogout) {
    btnLogout.addEventListener('click', () => {
      if (typeof removeToken === 'function') removeToken();
      sessionStorage.removeItem('token');
      sessionStorage.removeItem('oportuni_docente_ativo');
      window.location.href = 'login.html';
    });
  }

  // ── 2. Carregar Dados de Inscritos e Vagas ──
  async function carregarInscritos() {
    try {
      const response = await fetch('assets/data/inscritos.json');
      if (response.ok) {
        inscritos = await response.json();
      }
    } catch (e) {
      console.warn('Inscritos carregados com fallback:', e);
    }
  }

  function contarInscritosDaVaga(vagaId) {
    return inscritos.filter(i => i.oportunidade_id === vagaId).length;
  }

  async function carregarVagas() {
    try {
      await carregarInscritos();
      await carregarDocenteAtivo();

      const response = await fetch('assets/data/oportunidades.json');
      if (!response.ok) throw new Error('Falha ao carregar vagas');
      const vagasJson = await response.json();

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

      filtrarVagasDoDocente();
      atualizarInterface();
    } catch (error) {
      console.error('Erro ao buscar dados:', error);
      tbody.innerHTML = '<tr><td colspan="6" style="text-align:center; padding:24px;">Erro ao carregar oportunidades.</td></tr>';
    }
  }

  function filtrarVagasDoDocente() {
    if (!docenteAtivo) return;
    vagas = todasVagasSistema.filter(v => 
      v.professor_id === docenteAtivo.id || 
      (v.departamento && docenteAtivo.departamento && v.departamento.toLowerCase().includes(docenteAtivo.departamento.toLowerCase().split('/')[0].trim()))
    );
  }

  function salvarVagasLocal() {
    try {
      // 1. Remove da base global as vagas antigas deste docente
      todasVagasSistema = todasVagasSistema.filter(v => 
        !(v.professor_id === docenteAtivo.id || (v.departamento && docenteAtivo.departamento && v.departamento.toLowerCase().includes(docenteAtivo.departamento.toLowerCase().split('/')[0].trim())))
      );
      // 2. Adiciona as vagas atualizadas
      todasVagasSistema = [...todasVagasSistema, ...vagas];
      localStorage.setItem('oportunidades_gestao', JSON.stringify(todasVagasSistema));
    } catch (e) {
      console.error('Erro ao salvar no localStorage:', e);
    }
  }

  // ── 3. Atualizar KPIs e Tabela ──
  function atualizarInterface() {
    atualizarKPIs();
    renderizarTabela();
  }

  function atualizarKPIs() {
    const total = vagas.length;
    const abertas = vagas.filter(v => (v.status || '').toUpperCase() === 'ABERTA').length;
    const encerradas = vagas.filter(v => (v.status || '').toUpperCase() === 'ENCERRADA').length;
    
    // Contagem real de alunos únicos inscritos nas vagas deste professor (7 alunos)
    const vagasIds = new Set(vagas.map(v => v.id));
    const inscricoesDoDocente = inscritos.filter(i => vagasIds.has(i.oportunidade_id));
    const totalAlunosUnicos = new Set(inscricoesDoDocente.map(i => i.matricula)).size;

    if (kpiTotalEl) kpiTotalEl.textContent = total;
    if (kpiAbertasEl) kpiAbertasEl.textContent = abertas;
    if (kpiEncerradasEl) kpiEncerradasEl.textContent = encerradas;
    if (kpiInscritosEl) kpiInscritosEl.textContent = totalAlunosUnicos;

    if (countTodosEl) countTodosEl.textContent = total;
    if (countAbertasEl) countAbertasEl.textContent = abertas;
    if (countEncerradasEl) countEncerradasEl.textContent = encerradas;
  }

  function renderizarTabela() {
    const termoBusca = (searchInput.value || '').trim().toLowerCase();

    const filtradas = vagas.filter(item => {
      const matchStatus = (statusFiltro === 'TODOS') || ((item.status || '').toUpperCase() === statusFiltro);
      const texto = `${item.titulo} ${item.departamento} ${item.tipo}`.toLowerCase();
      const matchBusca = !termoBusca || texto.includes(termoBusca);
      return matchStatus && matchBusca;
    });

    tbody.innerHTML = '';

    if (filtradas.length === 0) {
      emptyState.classList.remove('hidden');
      return;
    }

    emptyState.classList.add('hidden');

    filtradas.forEach(vaga => {
      const isAberta = (vaga.status || '').toUpperCase() === 'ABERTA';
      const statusClass = isAberta ? 'status-aberta' : 'status-encerrada';
      const badgeTipoClass = mapaBadgeTipo[vaga.tipo] || 'badge-ic';
      const qtdInscritos = contarInscritosDaVaga(vaga.id);
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

    anexarEventosAcoes();
  }

  // ── 4. Ações de Linha (Toggle Status e Exclusão) ──
  function anexarEventosAcoes() {
    // Alternar Status Aberta/Encerrada
    document.querySelectorAll('.btn-action-toggle').forEach(btn => {
      btn.addEventListener('click', () => {
        const id = parseInt(btn.getAttribute('data-id'), 10);
        const index = vagas.findIndex(v => v.id === id);
        if (index !== -1) {
          const statusAtual = (vagas[index].status || '').toUpperCase();
          const novoStatus = statusAtual === 'ABERTA' ? 'ENCERRADA' : 'ABERTA';
          vagas[index].status = novoStatus;
          salvarVagasLocal();
          atualizarInterface();
          exibirToast(`Vaga #${id} agora está ${novoStatus}!`);
        }
      });
    });

    // Abrir Modal de Exclusão
    document.querySelectorAll('.btn-action-delete').forEach(btn => {
      btn.addEventListener('click', () => {
        vagaParaExcluirId = parseInt(btn.getAttribute('data-id'), 10);
        if (modalDelete) {
          if (typeof modalDelete.showModal === 'function') {
            modalDelete.showModal();
          } else {
            modalDelete.classList.add('open');
          }
        }
      });
    });
  }

  // Confirmação de Exclusão
  if (btnConfirmDelete) {
    btnConfirmDelete.addEventListener('click', () => {
      if (vagaParaExcluirId !== null) {
        vagas = vagas.filter(v => v.id !== vagaParaExcluirId);
        salvarVagasLocal();
        atualizarInterface();
        fecharModalDelete();
        exibirToast('Oportunidade removida com sucesso!');
        vagaParaExcluirId = null;
      }
    });
  }

  if (btnCancelDelete) {
    btnCancelDelete.addEventListener('click', fecharModalDelete);
  }

  function fecharModalDelete() {
    if (modalDelete) {
      if (typeof modalDelete.close === 'function') {
        modalDelete.close();
      } else {
        modalDelete.classList.remove('open');
      }
    }
  }

  // ── 5. Filtros e Busca ──
  filterPills.forEach(pill => {
    pill.addEventListener('click', () => {
      filterPills.forEach(p => {
        p.classList.remove('active');
        p.setAttribute('aria-selected', 'false');
      });
      pill.classList.add('active');
      pill.setAttribute('aria-selected', 'true');
      statusFiltro = pill.getAttribute('data-status');
      renderizarTabela();
    });
  });

  if (searchInput) {
    searchInput.addEventListener('input', renderizarTabela);
  }

  // ── 6. Toast Notification ──
  let toastTimer;
  function exibirToast(mensagem) {
    if (!toast) return;
    toastMsg.textContent = mensagem;
    toast.classList.remove('hidden');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => {
      toast.classList.add('hidden');
    }, 2800);
  }

  // Inicialização
  carregarVagas();
});

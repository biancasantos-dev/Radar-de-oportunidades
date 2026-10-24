// ============================================================
// OPORTUNI — INSCRITOS.JS
// Gestão de Candidaturas, Avaliação de Alunos e Exportação CSV
// ============================================================

document.addEventListener('DOMContentLoaded', () => {
  // Elementos do Cabeçalho da Vaga
  const vagaTipoEl = document.getElementById('vaga-tipo');
  const vagaStatusEl = document.getElementById('vaga-status');
  const vagaDeptoEl = document.getElementById('vaga-depto');
  const vagaTituloEl = document.getElementById('vaga-titulo');
  const vagaBolsaEl = document.getElementById('vaga-bolsa');
  const vagaPrazoEl = document.getElementById('vaga-prazo');
  const vagaDocenteEl = document.getElementById('vaga-docente');
  const selectVagaAtiva = document.getElementById('select-vaga-ativa');

  // KPIs
  const kpiTotalEl = document.getElementById('kpi-inscritos-total');
  const kpiAprovadosEl = document.getElementById('kpi-inscritos-aprovados');
  const kpiAnaliseEl = document.getElementById('kpi-inscritos-analise');
  const kpiPendentesEl = document.getElementById('kpi-inscritos-pendentes');

  // Filtros de Status & Busca
  const filterPills = document.querySelectorAll('.filter-pill');
  const countTodosEl = document.getElementById('count-todos');
  const countAprovadosEl = document.getElementById('count-aprovados');
  const countAnaliseEl = document.getElementById('count-analise');
  const countPendentesEl = document.getElementById('count-pendentes');
  const searchInput = document.getElementById('input-search-candidatos');
  const btnExportCsv = document.getElementById('btn-export-csv');

  // Container de Candidatos e Estado Vazio
  const candidatosGrid = document.getElementById('candidatos-grid');
  const emptyState = document.getElementById('candidatos-empty-state');
  const btnLogout = document.getElementById('btn-logout');

  // Toast
  const toast = document.getElementById('toast');
  const toastMsg = document.getElementById('toast-msg');

  // Estado da Aplicação
  let todasVagas = [];
  let vagasDocente = [];
  let todosInscritos = [];
  let listaProfessores = [];
  let vagaAtiva = null;
  let statusFiltro = 'TODOS';
  let docenteAtivo = null;

  // Mapa de classes CSS para badges de modalidade
  const mapaBadgeTipo = {
    'Iniciação Científica': 'badge-ic',
    'Monitoria': 'badge-monitoria',
    'Extensão': 'badge-extensao',
    'Estágio/Emprego': 'badge-estagio',
    'Evento': 'badge-evento',
    'Grupo de Estudo': 'badge-grupo'
  };

  // ── 1. Logout ──
  if (btnLogout) {
    btnLogout.addEventListener('click', () => {
      if (typeof removeToken === 'function') removeToken();
      sessionStorage.removeItem('token');
      sessionStorage.removeItem('oportuni_docente_ativo');
      window.location.href = 'login.html';
    });
  }

  // ── 2. Inicialização e Carga Dinâmica de Dados (JSON) ──
  async function inicializar() {
    try {
      await carregarDocenteAtivo();
      await carregarVagas();
      await carregarInscritos();

      definirVagaAtiva();
      atualizarInterface();
    } catch (error) {
      console.error('Erro na inicialização de inscritos:', error);
      vagaTituloEl.textContent = 'Erro ao carregar candidatos.';
    }
  }

  // Identifica o docente ativo puxando dinamicamente de assets/data/professores.json
  async function carregarDocenteAtivo() {
    try {
      const resp = await fetch('assets/data/professores.json');
      if (resp.ok) {
        listaProfessores = await resp.json();
      }
    } catch (e) {
      console.warn('Erro ao carregar dados de professores:', e);
    }

    // 1. Tenta recuperar sessão salva de login anterior
    const salvo = localStorage.getItem('oportuni_docente_ativo') || sessionStorage.getItem('oportuni_docente_ativo');
    if (salvo) {
      try {
        const parsed = JSON.parse(salvo);
        docenteAtivo = listaProfessores.find(p => p.id === parsed.id || p.email.toLowerCase() === (parsed.email || '').toLowerCase()) || parsed;
      } catch (e) {
        docenteAtivo = null;
      }
    }

    // 2. Se veio e-mail de login, localiza na lista oficial de professores carregada do JSON
    if (!docenteAtivo) {
      const emailSalvo = localStorage.getItem('oportuni_docente_email');
      if (emailSalvo && listaProfessores.length > 0) {
        docenteAtivo = listaProfessores.find(p => p.email.toLowerCase() === emailSalvo.toLowerCase());
      }
    }

    // 3. Fallback dinâmico: utiliza o primeiro professor cadastrado no JSON de dados
    if (!docenteAtivo && listaProfessores.length > 0) {
      docenteAtivo = listaProfessores[0];
    }
  }

  // Carrega as oportunidades dinamicamente de assets/data/oportunidades.json
  async function carregarVagas() {
    const resp = await fetch('assets/data/oportunidades.json');
    if (!resp.ok) throw new Error('Falha ao buscar oportunidades.json');
    todasVagas = await resp.json();

    // Sincroniza com alterações ou vagas criadas localmente pelo docente
    const dadosLocais = localStorage.getItem('oportunidades_gestao');
    if (dadosLocais) {
      try {
        const vagasLocais = JSON.parse(dadosLocais);
        vagasLocais.forEach(vl => {
          const idx = todasVagas.findIndex(tv => tv.id === vl.id);
          if (idx !== -1) {
            todasVagas[idx] = vl;
          } else {
            todasVagas.push(vl);
          }
        });
      } catch (e) {}
    }

    // Filtra as vagas correspondentes ao docente identificado
    if (docenteAtivo) {
      vagasDocente = todasVagas.filter(v => 
        v.professor_id === docenteAtivo.id || 
        (v.departamento && docenteAtivo.departamento && v.departamento.toLowerCase().includes(docenteAtivo.departamento.toLowerCase().split('/')[0].trim()))
      );
    }

    if (vagasDocente.length === 0) {
      vagasDocente = todasVagas;
    }
  }

  // Carrega os inscritos dinamicamente de assets/data/inscritos.json
  async function carregarInscritos() {
    const resp = await fetch('assets/data/inscritos.json');
    if (!resp.ok) throw new Error('Falha ao buscar inscritos.json');
    todosInscritos = await resp.json();

    // Sincroniza com status alterados pelo professor na sessão
    const dadosLocais = localStorage.getItem('inscritos_gestao');
    if (dadosLocais) {
      try {
        const inscritosLocais = JSON.parse(dadosLocais);
        inscritosLocais.forEach(il => {
          const item = todosInscritos.find(ti => ti.id === il.id);
          if (item && il.status) {
            item.status = il.status;
          }
        });
      } catch (e) {}
    }
  }

  function salvarInscritosLocal() {
    localStorage.setItem('inscritos_gestao', JSON.stringify(todosInscritos));
  }

  // ── 3. Definição da Vaga Ativa pelo parâmetro ?id=... ──
  function definirVagaAtiva() {
    const params = new URLSearchParams(window.location.search);
    const idParam = parseInt(params.get('id'), 10);

    if (idParam) {
      vagaAtiva = todasVagas.find(v => v.id === idParam);
    }

    // Se não encontrou ou não passou parâmetro, usa a primeira vaga do docente
    if (!vagaAtiva && vagasDocente.length > 0) {
      vagaAtiva = vagasDocente[0];
    }
  }

  // ── 4. Atualizar Interface Geral ──
  function atualizarInterface() {
    renderizarBannerVaga();
    atualizarKPIs();
    renderizarCandidatos();
  }

  // Renderiza dados do edital no banner de contexto
  function renderizarBannerVaga() {
    if (!vagaAtiva) return;

    vagaTituloEl.textContent = vagaAtiva.titulo;
    vagaTipoEl.textContent = vagaAtiva.tipo;
    vagaTipoEl.className = `table-tipo-badge ${mapaBadgeTipo[vagaAtiva.tipo] || 'badge-ic'}`;

    const isAberta = (vagaAtiva.status || '').toUpperCase() === 'ABERTA';
    vagaStatusEl.textContent = vagaAtiva.status;
    vagaStatusEl.className = `table-status-badge ${isAberta ? 'status-aberta' : 'status-encerrada'}`;

    vagaDeptoEl.textContent = vagaAtiva.departamento;
    vagaBolsaEl.textContent = vagaAtiva.bolsa || 'Voluntário';
    vagaPrazoEl.textContent = vagaAtiva.data_limite || 'A definir';
    vagaDocenteEl.textContent = vagaAtiva.professor_nome || docenteAtivo.nome;

    const linkMural = document.getElementById('link-ver-edital-publico');
    if (linkMural) {
      linkMural.href = `detalhe.html?id=${vagaAtiva.id}`;
    }
  }

  // ── 5. Atualizar KPIs da Vaga Selecionada ──
  function atualizarKPIs() {
    if (!vagaAtiva) return;

    const inscritosDaVaga = todosInscritos.filter(i => i.oportunidade_id === vagaAtiva.id);
    const total = inscritosDaVaga.length;
    const aprovados = inscritosDaVaga.filter(i => (i.status || '').toLowerCase() === 'aprovado').length;
    const analise = inscritosDaVaga.filter(i => (i.status || '').toLowerCase().includes('análise') || (i.status || '').toLowerCase().includes('analise')).length;
    const pendentes = inscritosDaVaga.filter(i => (i.status || '').toLowerCase() === 'pendente').length;
    const rejeitados = inscritosDaVaga.filter(i => (i.status || '').toLowerCase() === 'rejeitado').length;

    if (kpiTotalEl) kpiTotalEl.textContent = total;
    if (kpiAprovadosEl) kpiAprovadosEl.textContent = aprovados;
    if (kpiAnaliseEl) kpiAnaliseEl.textContent = analise;
    if (kpiPendentesEl) kpiPendentesEl.textContent = pendentes;

    if (countTodosEl) countTodosEl.textContent = total;
    if (countAprovadosEl) countAprovadosEl.textContent = aprovados;
    if (countAnaliseEl) countAnaliseEl.textContent = analise;
    if (countPendentesEl) countPendentesEl.textContent = pendentes;

    const countRejeitadosEl = document.getElementById('count-rejeitados');
    if (countRejeitadosEl) countRejeitadosEl.textContent = rejeitados;
  }

  // ── 6. Renderizar Grid de Candidatos com Design OportUni ──
  function renderizarCandidatos() {
    if (!vagaAtiva) return;

    const termoBusca = (searchInput.value || '').trim().toLowerCase();
    const inscritosDaVaga = todosInscritos.filter(i => i.oportunidade_id === vagaAtiva.id);

    const filtrados = inscritosDaVaga.filter(item => {
      const statusAluno = (item.status || '').trim();
      let matchStatus = true;
      if (statusFiltro !== 'TODOS') {
        matchStatus = statusAluno.toLowerCase().includes(statusFiltro.toLowerCase());
      }

      const textoBusca = `${item.nome_aluno} ${item.matricula} ${item.curso} ${item.periodo} ${item.turno} ${item.email_aluno}`.toLowerCase();
      const matchBusca = !termoBusca || textoBusca.includes(termoBusca);

      return matchStatus && matchBusca;
    });

    candidatosGrid.innerHTML = '';

    if (filtrados.length === 0) {
      emptyState.classList.remove('hidden');
      return;
    }

    emptyState.classList.add('hidden');

    filtrados.forEach(aluno => {
      // Iniciais do Avatar
      const partesNome = (aluno.nome_aluno || 'Aluno').split(' ');
      const iniciais = (partesNome[0][0] + (partesNome.length > 1 ? partesNome[partesNome.length - 1][0] : '')).toUpperCase();

      // Identificação dos Status
      const stLower = (aluno.status || '').toLowerCase();
      const isRejeitado = stLower.includes('rejeitado');
      const isAprovado = stLower.includes('aprovado');
      const isAnalise = stLower.includes('análise') || stLower.includes('analise');

      let statusBadgeClass = 'status-badge-pendente';
      let statusLabel = aluno.status || 'Pendente';

      if (isAprovado) {
        statusBadgeClass = 'status-badge-aprovado';
      } else if (isAnalise) {
        statusBadgeClass = 'status-badge-analise';
      } else if (isRejeitado) {
        statusBadgeClass = 'status-badge-rejeitado';
      }

      const card = document.createElement('article');
      card.className = `candidato-card ${isRejeitado ? 'card-rejeitado' : ''}`;

      // Rodapé de Ações: Avaliação 100% reversível (Aprovar, Analisar, Rejeitar, E-mail)
      const rodapeAcoesHtml = `
        <button type="button" class="btn-card-action btn-action-aprovar ${isAprovado ? 'is-active' : ''}" data-id="${aluno.id}" data-action="Aprovado" title="${isAprovado ? 'Clique para desmarcar (voltar a Pendente)' : 'Aprovar candidatura'}">
          <img src="assets/icons/check.svg" alt="" width="13" height="13">
          <span>${isAprovado ? 'Aprovado' : 'Aprovar'}</span>
        </button>
        <button type="button" class="btn-card-action btn-action-analise ${isAnalise ? 'is-active' : ''}" data-id="${aluno.id}" data-action="Em Análise" title="${isAnalise ? 'Clique para desmarcar (voltar a Pendente)' : 'Colocar em análise'}">
          <img src="assets/icons/eye.svg" alt="" width="13" height="13">
          <span>${isAnalise ? 'Em Análise' : 'Analisar'}</span>
        </button>
        <button type="button" class="btn-card-action btn-action-rejeitar ${isRejeitado ? 'is-active' : ''}" data-id="${aluno.id}" data-action="Rejeitado" title="${isRejeitado ? 'Clique para desmarcar (voltar a Pendente)' : 'Rejeitar candidatura'}">
          <img src="assets/icons/x.svg" alt="" width="13" height="13">
          <span>${isRejeitado ? 'Rejeitado' : 'Rejeitar'}</span>
        </button>
        <a href="mailto:${aluno.email_aluno}?subject=Processo Seletivo UCSal - ${encodeURIComponent(vagaAtiva.titulo)}" class="btn-card-email" title="Enviar e-mail para o estudante">
          <img src="assets/icons/mail.svg" alt="E-mail" width="15" height="15">
        </a>
      `;

      card.innerHTML = `
        <header class="candidato-card-header">
          <div class="candidato-perfil-wrap">
            <div class="candidato-avatar" aria-hidden="true">${iniciais}</div>
            <div class="candidato-nome-wrap">
              <strong class="candidato-nome">${aluno.nome_aluno}</strong>
              <span class="candidato-data">Inscrito em ${formatarData(aluno.data_registro)}</span>
            </div>
          </div>
          <span class="status-badge ${statusBadgeClass}">${statusLabel}</span>
        </header>

        <div class="candidato-chips-row">
          <span class="candidato-chip">
            <img src="assets/icons/user.svg" alt="" width="13" height="13">
            <span>${aluno.matricula}</span>
          </span>
          <span class="candidato-chip">
            <img src="assets/icons/calendar.svg" alt="" width="13" height="13">
            <span>${aluno.periodo || ''}${aluno.periodo && aluno.turno ? ' • ' : ''}${aluno.turno || ''}</span>
          </span>
          <span class="candidato-chip chip-gpa">
            <img src="assets/icons/star.svg" alt="" width="13" height="13">
            <span>Coeficiente: <strong>${aluno.coeficiente || '—'}</strong></span>
          </span>
        </div>

        <div class="candidato-contato-line">
          <span class="contato-curso">${aluno.curso || ''}</span>
          ${aluno.telefone ? `<span class="contato-sep">•</span><a href="tel:${aluno.telefone}" class="contato-link">${aluno.telefone}</a>` : ''}
          ${aluno.email_aluno ? `<span class="contato-sep">•</span><a href="mailto:${aluno.email_aluno}" class="contato-link">${aluno.email_aluno}</a>` : ''}
        </div>

        <blockquote class="candidato-mensagem-box">
          ${aluno.mensagem || 'Sem mensagem adicional informada.'}
        </blockquote>

        <footer class="candidato-actions-row">
          ${rodapeAcoesHtml}
        </footer>
      `;

      candidatosGrid.appendChild(card);
    });

    anexarEventosAcoes();
  }

  // ── 7. Ações de Avaliação Reversíveis (Aprovar / Em Análise / Rejeitar) ──
  function anexarEventosAcoes() {
    document.querySelectorAll('.btn-action-aprovar, .btn-action-analise, .btn-action-rejeitar').forEach(btn => {
      btn.addEventListener('click', () => {
        const idInscricao = parseInt(btn.getAttribute('data-id'), 10);
        const acaoStatus = btn.getAttribute('data-action');

        const index = todosInscritos.findIndex(i => i.id === idInscricao);
        if (index === -1) return;

        const statusAtual = todosInscritos[index].status || 'Pendente';
        const nomeAluno = todosInscritos[index].nome_aluno;

        // Se clicou no status já ativo, desmarca e reverte para 'Pendente'
        if (statusAtual.toLowerCase() === acaoStatus.toLowerCase()) {
          todosInscritos[index].status = 'Pendente';
          exibirToast(`Candidatura de ${nomeAluno} revertida para Pendente.`);
        } else {
          todosInscritos[index].status = acaoStatus;
          exibirToast(`${nomeAluno} marcado como: ${acaoStatus}!`);
        }

        salvarInscritosLocal();
        atualizarKPIs();
        renderizarCandidatos();
      });
    });
  }

  // ── 8. Filtros por Pílulas e Busca ──
  filterPills.forEach(pill => {
    pill.addEventListener('click', () => {
      filterPills.forEach(p => {
        p.classList.remove('active');
        p.setAttribute('aria-selected', 'false');
      });
      pill.classList.add('active');
      pill.setAttribute('aria-selected', 'true');
      statusFiltro = pill.getAttribute('data-status');
      renderizarCandidatos();
    });
  });

  if (searchInput) {
    searchInput.addEventListener('input', renderizarCandidatos);
  }

  // ── 9. Exportação de Candidatos em CSV ──
  if (btnExportCsv) {
    btnExportCsv.addEventListener('click', () => {
      if (!vagaAtiva) return;

      const inscritosDaVaga = todosInscritos.filter(i => i.oportunidade_id === vagaAtiva.id);
      if (inscritosDaVaga.length === 0) {
        exibirToast('Não há candidatos para exportar nesta vaga.');
        return;
      }

      // Cabeçalho CSV compatível com Excel brasileiro (separado por ponto e vírgula)
      let csv = '\uFEFF'; // BOM para garantir acentos corretos em UTF-8 no Excel
      csv += 'Nome;Matrícula;E-mail;Curso;Período;Turno;Coeficiente;Telefone;Status;Data Inscrição;Mensagem de Motivação\n';

      inscritosDaVaga.forEach(item => {
        const linha = [
          `"${(item.nome_aluno || '').replace(/"/g, '""')}"`,
          `"${item.matricula || ''}"`,
          `"${item.email_aluno || ''}"`,
          `"${item.curso || ''}"`,
          `"${item.periodo || ''}"`,
          `"${item.turno || ''}"`,
          `"${item.coeficiente || ''}"`,
          `"${item.telefone || ''}"`,
          `"${item.status || ''}"`,
          `"${item.data_registro || ''}"`,
          `"${(item.mensagem || '').replace(/"/g, '""').replace(/\n/g, ' ')}"`
        ];
        csv += linha.join(';') + '\n';
      });

      // Criação de link para download
      const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.setAttribute('href', url);
      const nomeSanitizado = (vagaAtiva.titulo || 'vaga').toLowerCase().replace(/[^a-z0-9]/g, '_').substring(0, 30);
      link.setAttribute('download', `candidatos_${nomeSanitizado}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      exibirToast('Planilha CSV gerada e baixada com sucesso!');
    });
  }

  // ── 10. Funções Utilitárias ──
  function formatarData(dataIso) {
    if (!dataIso) return 'Data recente';
    try {
      const [dataPart, horaPart] = dataIso.split(' ');
      const [ano, mes, dia] = dataPart.split('-');
      return `${dia}/${mes}/${ano}` + (horaPart ? ` às ${horaPart}` : '');
    } catch (e) {
      return dataIso;
    }
  }

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

  // Inicia o fluxo
  inicializar();
});

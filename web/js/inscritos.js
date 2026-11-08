// ==============================================================================
// OPORTUNI — INSCRITOS.JS (GESTÃO DE CANDIDATURAS & EXPORTAÇÃO CSV)
//
// O que este arquivo faz?
// 1. Apresenta todos os alunos que demonstraram interesse na vaga selecionada (?id=X).
// 2. Exibe o banner de resumo do edital no topo, com seletor rápido para trocar de vaga.
// 3. Calcula indicadores de triagem em tempo real (KPIs):
//    - Total de Inscritos, Aprovados, Em Análise e Pendentes.
// 4. Grid de Candidatos:
//    - Cartões visuais contendo foto/iniciais, matrícula, curso, semestre e justificativa.
//    - Botões de avaliação com triagem 100% reversível (Aprovar, Colocar em Análise ou Rejeitar).
//    - Botão de envio direto de e-mail ao estudante com assunto preenchido.
// 5. Exportação de Relatório em Planilha CSV:
//    - Integração com o Back-end Java no endpoint '/api/oportunidades/{id}/exportar-csv',
//      processando os dados via Java Streams API (requisito/bônus de POOALAB).
//    - Contingência no navegador gerando arquivo formatado em UTF-8 com BOM para Excel.
// ==============================================================================

// Aguarda o carregamento do DOM pelo navegador
document.addEventListener('DOMContentLoaded', () => {

  // --------------------------------------------------------------------------
  // Mapear os elementos visuais do banner superior e da interface
  // --------------------------------------------------------------------------
  const vagaTipoEl = document.getElementById('vaga-tipo');
  const vagaStatusEl = document.getElementById('vaga-status');
  const vagaDeptoEl = document.getElementById('vaga-depto');
  const vagaTituloEl = document.getElementById('vaga-titulo');
  const vagaBolsaEl = document.getElementById('vaga-bolsa');
  const vagaPrazoEl = document.getElementById('vaga-prazo');
  const vagaDocenteEl = document.getElementById('vaga-docente');
  const selectVagaAtiva = document.getElementById('select-vaga-ativa');

  // Elementos numéricos dos Indicadores de Triagem (KPIs)
  const kpiTotalEl = document.getElementById('kpi-inscritos-total');
  const kpiAprovadosEl = document.getElementById('kpi-inscritos-aprovados');
  const kpiAnaliseEl = document.getElementById('kpi-inscritos-analise');
  const kpiPendentesEl = document.getElementById('kpi-inscritos-pendentes');

  // Filtros rápidos por status e campo de busca por nome/matrícula
  const filterPills = document.querySelectorAll('.filter-pill');
  const countTodosEl = document.getElementById('count-todos');
  const countAprovadosEl = document.getElementById('count-aprovados');
  const countAnaliseEl = document.getElementById('count-analise');
  const countPendentesEl = document.getElementById('count-pendentes');
  const searchInput = document.getElementById('input-search-candidatos');
  const btnExportCsv = document.getElementById('btn-export-csv');

  // Área onde os cartões dos alunos são inseridos dinamicamente
  const candidatosGrid = document.getElementById('candidatos-grid');
  const emptyState = document.getElementById('candidatos-empty-state');
  const btnLogout = document.getElementById('btn-logout');

  // Notificação Toast
  const toast = document.getElementById('toast');
  const toastMsg = document.getElementById('toast-msg');

  // Variáveis para gerenciar o estado da página em memória
  let todasVagas = [];
  let vagasDocente = [];
  let todosInscritos = [];
  let listaProfessores = [];
  let vagaAtiva = null;
  let statusFiltro = 'TODOS';
  let docenteAtivo = null;

  // Dicionário de estilos CSS para identificar visualmente a modalidade da vaga
  const mapaBadgeTipo = {
    'Iniciação Científica': 'badge-ic',
    'Monitoria': 'badge-monitoria',
    'Extensão': 'badge-extensao',
    'Estágio/Emprego': 'badge-estagio',
    'Evento': 'badge-evento',
    'Grupo de Estudo': 'badge-grupo'
  };

  // --------------------------------------------------------------------------
  // Ação de Logout (Sair da Sessão)
  // --------------------------------------------------------------------------
  if (btnLogout) {
    btnLogout.addEventListener('click', () => {
      if (typeof removeToken === 'function') removeToken();
      sessionStorage.removeItem('token');
      sessionStorage.removeItem('oportuni_docente_ativo');
      window.location.href = 'login.html';
    });
  }

  // --------------------------------------------------------------------------
  // Inicialização e Carregamento dos Dados
  // --------------------------------------------------------------------------
  async function inicializar() {
    try {
      // Carrega os dados em cadeia
      await carregarDocenteAtivo();
      await carregarVagas();
      await carregarInscritos();

      // Identifica qual vaga deve ser exibida e desenha a interface
      definirVagaAtiva();
      atualizarInterface();
    } catch (error) {
      console.error('Erro na inicialização de inscritos:', error);
      if (vagaTituloEl) vagaTituloEl.textContent = 'Erro ao carregar candidatos.';
    }
  }

  // Identifica o docente ativo na sessão ou seleciona o padrão
  async function carregarDocenteAtivo() {
    try {
      const resp = await fetch('assets/data/professores.json');
      if (resp.ok) {
        listaProfessores = await resp.json();
      }
    } catch (e) {
      console.warn('Aviso: professores.json indisponível via fetch:', e);
    }

    try {
      const profsLocais = JSON.parse(localStorage.getItem('professores_cadastrados') || '[]');
      listaProfessores = [...profsLocais, ...listaProfessores];
    } catch (e) {}

    // Recupera a credencial salva no login
    const salvo = localStorage.getItem('oportuni_docente_ativo') || sessionStorage.getItem('oportuni_docente_ativo');
    if (salvo) {
      try {
        const parsed = JSON.parse(salvo);
        docenteAtivo = listaProfessores.find(p => p.id === parsed.id || p.email.toLowerCase() === (parsed.email || '').toLowerCase()) || parsed;
      } catch (e) {
        docenteAtivo = null;
      }
    }

    if (!docenteAtivo) {
      const emailSalvo = localStorage.getItem('oportuni_docente_email');
      if (emailSalvo && listaProfessores.length > 0) {
        docenteAtivo = listaProfessores.find(p => p.email.toLowerCase() === emailSalvo.toLowerCase());
      }
    }

    if (!docenteAtivo) {
      window.location.href = 'login.html';
      return;
    }
  }

  // Carrega as vagas cadastradas no sistema
  async function carregarVagas() {
    const resp = await fetch('assets/data/oportunidades.json');
    if (!resp.ok) throw new Error('Falha ao buscar oportunidades.json');
    todasVagas = await resp.json();

    // Sincroniza com eventuais vagas criadas ou editadas nesta sessão
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

    // Filtra as vagas do professor ativo
    if (docenteAtivo) {
      vagasDocente = todasVagas.filter(v => 
        v.professor_id === docenteAtivo.id || 
        (v.professor_nome && docenteAtivo.nome && v.professor_nome.toLowerCase().includes(docenteAtivo.nome.toLowerCase()))
      );
    }

    if (!docenteAtivo) {
      vagasDocente = [];
    }
  }

  // Carrega a lista de candidaturas (/api/interesses com contingência local)
  async function carregarInscritos() {
    // 1. Tenta carregar do Back-end Java conectado ao PostgreSQL
    if (typeof apiFetch === 'function') {
      try {
        const inscritosApi = await apiFetch('/interesses');
        if (Array.isArray(inscritosApi) && inscritosApi.length > 0) {
          todosInscritos = inscritosApi.map(item => ({
            id: item.id,
            oportunidade_id: item.idOportunidade || item.id_oportunidade,
            nome_aluno: item.nome,
            email_aluno: item.email,
            matricula: item.matricula,
            curso: item.curso,
            periodo: item.semestre,
            mensagem: item.justificativa,
            status: 'Em Análise',
            data_registro: '2026-10-20 14:00'
          }));
          return;
        }
      } catch (e) {
        console.warn('API /api/interesses offline, usando dados de contingência local:', e);
      }
    }

    // 2. Fallback estático: lê do arquivo inscritos.json
    const resp = await fetch('assets/data/inscritos.json');
    if (!resp.ok) throw new Error('Falha ao buscar inscritos.json');
    todosInscritos = await resp.json();

    // Sincroniza com alterações de status (Aprovado/Rejeitado) feitas localmente
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

  // Salva no LocalStorage as avaliações feitas pelo professor
  function salvarInscritosLocal() {
    localStorage.setItem('inscritos_gestao', JSON.stringify(todosInscritos));
  }

  // --------------------------------------------------------------------------
  // Determinar qual Vaga está Ativa na Tela
  // Lê o parâmetro '?id=X' da URL (ex: inscritos.html?id=1)
  // --------------------------------------------------------------------------
  function definirVagaAtiva() {
    const params = new URLSearchParams(window.location.search);
    const idParam = parseInt(params.get('id'), 10);

    if (idParam) {
      const encontrada = todasVagas.find(v => v.id === idParam);
      if (encontrada) {
        // Validação estrita de autoria: apenas o professor responsável pode ver os candidatos
        const ehDono = docenteAtivo && (
          encontrada.professor_id === docenteAtivo.id ||
          (encontrada.professor_nome && docenteAtivo.nome && encontrada.professor_nome.toLowerCase().includes(docenteAtivo.nome.toLowerCase()))
        );
        if (!ehDono) {
          alert('Acesso restrito: Você só tem autorização para visualizar as candidaturas das vagas criadas por você.');
          window.location.href = 'painel.html';
          return;
        }
        vagaAtiva = encontrada;
      }
    }

    // Se o parâmetro não foi informado, seleciona a primeira vaga do professor
    if (!vagaAtiva && vagasDocente.length > 0) {
      vagaAtiva = vagasDocente[0];
    }
  }

  // --------------------------------------------------------------------------
  // Atualizar Toda a Interface Visual
  // --------------------------------------------------------------------------
  function atualizarInterface() {
    renderizarBannerVaga();
    atualizarKPIs();
    renderizarCandidatos();
  }

  // Preenche as informações do edital no banner no topo da tela
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
    if (vagaDocenteEl) {
      vagaDocenteEl.textContent = vagaAtiva.professor_nome || (docenteAtivo ? docenteAtivo.nome : 'Professor');
    }

    // Atualiza o link que permite ao professor ver o edital público como um aluno veria
    const linkMural = document.getElementById('link-ver-edital-publico');
    if (linkMural) {
      linkMural.href = `detalhe.html?id=${vagaAtiva.id}`;
    }
  }

  // --------------------------------------------------------------------------
  // Calcular Indicadores de Triagem (KPIs)
  // --------------------------------------------------------------------------
  function atualizarKPIs() {
    if (!vagaAtiva) return;

    // Filtra apenas os inscritos que pertencem a esta vaga específica
    const inscritosDaVaga = todosInscritos.filter(i => i.oportunidade_id === vagaAtiva.id);
    const total = inscritosDaVaga.length;
    const aprovados = inscritosDaVaga.filter(i => (i.status || '').toLowerCase() === 'aprovado').length;
    const analise = inscritosDaVaga.filter(i => (i.status || '').toLowerCase().includes('análise') || (i.status || '').toLowerCase().includes('analise')).length;
    const pendentes = inscritosDaVaga.filter(i => (i.status || '').toLowerCase() === 'pendente').length;
    const rejeitados = inscritosDaVaga.filter(i => (i.status || '').toLowerCase() === 'rejeitado').length;

    // Atualiza os cartões superiores
    if (kpiTotalEl) kpiTotalEl.textContent = total;
    if (kpiAprovadosEl) kpiAprovadosEl.textContent = aprovados;
    if (kpiAnaliseEl) kpiAnaliseEl.textContent = analise;
    if (kpiPendentesEl) kpiPendentesEl.textContent = pendentes;

    // Atualiza os contadores das pílulas de filtro
    if (countTodosEl) countTodosEl.textContent = total;
    if (countAprovadosEl) countAprovadosEl.textContent = aprovados;
    if (countAnaliseEl) countAnaliseEl.textContent = analise;
    if (countPendentesEl) countPendentesEl.textContent = pendentes;

    const countRejeitadosEl = document.getElementById('count-rejeitados');
    if (countRejeitadosEl) countRejeitadosEl.textContent = rejeitados;
  }

  // Ajuste (Segurança): Função utilitária de sanitização HTML contra ataques de Stored XSS
  function sanitizarHtml(texto) {
    if (texto === null || texto === undefined) return '';
    return String(texto)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  // --------------------------------------------------------------------------
  // Renderizar a Grade de Candidatos Inscritos
  // --------------------------------------------------------------------------
  function renderizarCandidatos() {
    if (!vagaAtiva) return;

    const termoBusca = (searchInput.value || '').trim().toLowerCase();
    const inscritosDaVaga = todosInscritos.filter(i => i.oportunidade_id === vagaAtiva.id);

    // Aplica o filtro de status e o filtro de busca textual
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

    // Se nenhum candidato correspondeu, exibe o aviso amigável
    if (filtrados.length === 0) {
      emptyState.classList.remove('hidden');
      return;
    }

    emptyState.classList.add('hidden');

    // Desenha cada cartão de candidato
    filtrados.forEach(aluno => {
      // Extrai as iniciais do nome para criar o avatar circular (ex: "Mariana Souza" -> "MS")
      const partesNome = (aluno.nome_aluno || 'Aluno').split(' ');
      const iniciais = (partesNome[0][0] + (partesNome.length > 1 ? partesNome[partesNome.length - 1][0] : '')).toUpperCase();

      // Checa qual é o status atual da triagem
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

      // Botões de Ação:
      // O professor pode clicar para Aprovar, Colocar em Análise ou Rejeitar.
      // Se clicar no botão que já está ativo, a ação se desfaz (volta para Pendente).
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
        <a href="mailto:${encodeURIComponent(aluno.email_aluno || '')}?subject=Processo%20Seletivo%20UCSal%20-%20${encodeURIComponent(vagaAtiva.titulo || '')}" class="btn-card-email" title="Enviar e-mail para o estudante">
          <img src="assets/icons/mail.svg" alt="E-mail" width="15" height="15">
        </a>
      `;

      card.innerHTML = `
        <header class="candidato-card-header">
          <div class="candidato-perfil-wrap">
            <div class="candidato-avatar" aria-hidden="true">${sanitizarHtml(iniciais)}</div>
            <div class="candidato-nome-wrap">
              <strong class="candidato-nome">${sanitizarHtml(aluno.nome_aluno)}</strong>
              <span class="candidato-data">Inscrito em ${formatarData(aluno.data_registro)}</span>
            </div>
          </div>
          <span class="status-badge ${statusBadgeClass}">${sanitizarHtml(statusLabel)}</span>
        </header>

        <div class="candidato-chips-row">
          <span class="candidato-chip">
            <img src="assets/icons/user.svg" alt="" width="13" height="13">
            <span>${sanitizarHtml(aluno.matricula)}</span>
          </span>
          <span class="candidato-chip">
            <img src="assets/icons/calendar.svg" alt="" width="13" height="13">
            <span>${sanitizarHtml(aluno.periodo || '')}${aluno.periodo && aluno.turno ? ' • ' : ''}${sanitizarHtml(aluno.turno || '')}</span>
          </span>
          <span class="candidato-chip chip-gpa">
            <img src="assets/icons/star.svg" alt="" width="13" height="13">
            <span>Coeficiente: <strong>${sanitizarHtml(aluno.coeficiente || '—')}</strong></span>
          </span>
        </div>

        <div class="candidato-contato-line">
          <span class="contato-curso">${sanitizarHtml(aluno.curso || '')}</span>
          ${aluno.telefone ? `<span class="contato-sep">•</span><span class="contato-item"><a href="tel:${encodeURIComponent(aluno.telefone)}" class="contato-link">${sanitizarHtml(aluno.telefone)}</a></span>` : ''}
          ${aluno.email_aluno ? `<span class="contato-sep">•</span><span class="contato-item"><a href="mailto:${encodeURIComponent(aluno.email_aluno)}" class="contato-link">${sanitizarHtml(aluno.email_aluno)}</a></span>` : ''}
        </div>

        <blockquote class="candidato-mensagem-box">
          ${sanitizarHtml(aluno.mensagem || 'Sem mensagem adicional informada.')}
        </blockquote>

        <footer class="candidato-actions-row">
          ${rodapeAcoesHtml}
        </footer>
      `;

      candidatosGrid.appendChild(card);
    });

    // Conecta os ouvintes de evento aos botões criados
    anexarEventosAcoes();
  }

  // --------------------------------------------------------------------------
  // Ações de Triagem Reversível (Aprovar / Em Análise / Rejeitar)
  // --------------------------------------------------------------------------
  function anexarEventosAcoes() {
    document.querySelectorAll('.btn-action-aprovar, .btn-action-analise, .btn-action-rejeitar').forEach(btn => {
      btn.addEventListener('click', () => {
        const idInscricao = parseInt(btn.getAttribute('data-id'), 10);
        const acaoStatus = btn.getAttribute('data-action');

        const index = todosInscritos.findIndex(i => i.id === idInscricao);
        if (index === -1) return;

        const statusAtual = todosInscritos[index].status || 'Pendente';
        const nomeAluno = todosInscritos[index].nome_aluno;

        // Se o professor clicar no status que já estava ativo, o sistema desfaz (volta a Pendente)
        if (statusAtual.toLowerCase() === acaoStatus.toLowerCase()) {
          todosInscritos[index].status = 'Pendente';
          exibirToast(`Candidatura de ${nomeAluno} revertida para Pendente.`);
        } else {
          todosInscritos[index].status = acaoStatus;
          exibirToast(`${nomeAluno} marcado como: ${acaoStatus}!`);
        }

        // Persiste a escolha, recalcula indicadores e redesenha a tela
        salvarInscritosLocal();
        atualizarKPIs();
        renderizarCandidatos();
      });
    });
  }

  // --------------------------------------------------------------------------
  // Filtros por Pílulas e Campo de Busca
  // --------------------------------------------------------------------------
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

  // --------------------------------------------------------------------------
  // Exportação de Candidatos em Planilha CSV
  // Integração com Back-end Java (Streams API) e contingência no navegador
  // --------------------------------------------------------------------------
  if (btnExportCsv) {
    btnExportCsv.addEventListener('click', async () => {
      if (!vagaAtiva) return;

      // 1. Tenta obter o CSV diretamente do endpoint Java (/api/oportunidades/{id}/exportar-csv)
      // Ajuste (Segurança): Anexa token de autenticação no cabeçalho e na URL para download seguro
      // Esse endpoint usa a Java Streams API para montar a planilha com alta performance!
      try {
        const token = (typeof getToken === 'function' ? getToken() : null) || sessionStorage.getItem('token') || localStorage.getItem('token');
        const headers = token ? { 'Authorization': `Bearer ${token}` } : {};
        const urlCsv = token ? `/api/oportunidades/${vagaAtiva.id}/exportar-csv?token=${encodeURIComponent(token)}` : `/api/oportunidades/${vagaAtiva.id}/exportar-csv`;
        const respBackend = await fetch(urlCsv, { headers });
        if (respBackend.ok) {
          const blob = await respBackend.blob();
          const url = URL.createObjectURL(blob);
          const link = document.createElement('a');
          link.href = url;
          link.download = `inscritos_vaga_${vagaAtiva.id}.csv`;
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
          URL.revokeObjectURL(url);
          exibirToast('Planilha CSV gerada via backend Java Streams e baixada com sucesso!');
          return;
        }
      } catch (errBackend) {
        console.warn('Backend Java offline para exportação, gerando planilha via JavaScript local:', errBackend);
      }

      // 2. Se o servidor estiver offline, geramos o CSV diretamente no navegador:
      const inscritosDaVaga = todosInscritos.filter(i => i.oportunidade_id === vagaAtiva.id);
      if (inscritosDaVaga.length === 0) {
        exibirToast('Não há candidatos para exportar nesta vaga.');
        return;
      }

      // Inicia com o caractere BOM (\uFEFF) para que o Microsoft Excel brasileiro
      // abra os caracteres acentuados em UTF-8 perfeitamente sem distorção.
      // Usamos ponto e vírgula (;) como separador padrão no Brasil.
      let csv = '\uFEFF';
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

      // Transforma o texto CSV em um arquivo binário para download imediato
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

  // --------------------------------------------------------------------------
  // Funções Utilitárias (Datas e Toasts)
  // --------------------------------------------------------------------------
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

  // Inicia todo o ciclo de vida da tela
  inicializar();
});

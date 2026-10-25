// ============================================================
// OPORTUNI — DETALHE.JS
// Lógica de Apresentação do Edital, Candidatura e Vagas Relacionadas
// ============================================================

document.addEventListener('DOMContentLoaded', async () => {
  // Elementos do Header e Hero
  const bodyEl = document.body;
  const breadEixo = document.getElementById('bread-eixo');
  const breadTitulo = document.getElementById('bread-titulo');
  const detalheId = document.getElementById('detalhe-id');
  const detalheTipo = document.getElementById('detalhe-tipo');
  const detalheEixoBadge = document.getElementById('detalhe-eixo-badge');
  const detalheStatus = document.getElementById('detalhe-status');
  const detalheStatusText = document.getElementById('detalhe-status-text');
  const detalheTitulo = document.getElementById('detalhe-titulo');
  const detalheDepto = document.getElementById('detalhe-depto');
  const detalheBolsa = document.getElementById('detalhe-bolsa');
  const detalheCaptionBolsa = document.getElementById('detalhe-caption-bolsa');
  const detalhePrazo = document.getElementById('detalhe-prazo');
  const detalheCaptionPrazo = document.getElementById('detalhe-caption-prazo');
  const detalheDocenteHero = document.getElementById('detalhe-docente-hero');

  // Elementos do Edital
  const detalheDescricao = document.getElementById('detalhe-descricao');
  const detalheRequisitosList = document.getElementById('detalhe-requisitos-list');
  const atividadesGrid = document.getElementById('atividades-grid');
  const docenteNome = document.getElementById('docente-nome');
  const docenteDepto = document.getElementById('docente-depto');
  const docenteEmailLink = document.getElementById('docente-email-link');
  const docenteInitials = document.getElementById('docente-initials');
  const btnDuvidaDocente = document.getElementById('btn-duvida-docente');

  // Elementos da Sidebar de Candidatura
  const stickyStatusBadge = document.getElementById('sticky-status-badge');
  const stickyStatusText = document.getElementById('sticky-status-text');
  const stickyPrazoDias = document.getElementById('sticky-prazo-dias');
  const stickyCaptionBolsa = document.getElementById('sticky-caption-bolsa');
  const stickyBolsaValor = document.getElementById('sticky-bolsa-valor');
  const stickyDataLimite = document.getElementById('sticky-data-limite');
  const timelineProgress = document.getElementById('timeline-progress');
  const btnAbrirCandidatura = document.getElementById('btn-abrir-candidatura');
  const btnCompartilhar = document.getElementById('btn-compartilhar');
  const stickyDocenteActions = document.getElementById('sticky-docente-actions');
  const btnDocenteEditar = document.getElementById('btn-docente-editar');
  const btnDocenteInscritos = document.getElementById('btn-docente-inscritos');

  // Elementos do Modal de Candidatura
  const modalBackdrop = document.getElementById('modal-candidatura-backdrop');
  const modalSubtituloVaga = document.getElementById('modal-subtitulo-vaga');
  const btnFecharModal = document.getElementById('btn-fechar-modal');
  const btnCancelarCandidatura = document.getElementById('btn-cancelar-candidatura');
  const formCandidatura = document.getElementById('form-candidatura');
  const candNome = document.getElementById('cand-nome');
  const candEmail = document.getElementById('cand-email');
  const candMatricula = document.getElementById('cand-matricula');
  const candCurso = document.getElementById('cand-curso');
  const candPeriodo = document.getElementById('cand-periodo');
  const candCr = document.getElementById('cand-cr');
  const candTurno = document.getElementById('cand-turno');
  const candTelefone = document.getElementById('cand-telefone');
  const candMensagem = document.getElementById('cand-mensagem');
  const btnSubmeterCandidatura = document.getElementById('btn-submeter-candidatura');

  // Vagas Relacionadas
  const gridRelacionadas = document.getElementById('grid-relacionadas');
  const relacionadaseixoNome = document.getElementById('relacionadas-eixo-nome');

  // Toast
  const toast = document.getElementById('toast');
  const toastMsg = document.getElementById('toast-msg');

  // Navbar do Professor
  const navLinkPainel = document.getElementById('nav-link-painel');
  const navBtnNovaVaga = document.getElementById('nav-btn-nova-vaga');
  const navBtnProfessor = document.getElementById('nav-btn-professor');
  const btnLogout = document.getElementById('btn-logout');

  // Dicionário de Meses
  const MESES = {
    '01': 'JAN', '02': 'FEV', '03': 'MAR', '04': 'ABR',
    '05': 'MAI', '06': 'JUN', '07': 'JUL', '08': 'AGO',
    '09': 'SET', '10': 'OUT', '11': 'NOV', '12': 'DEZ'
  };

  const EIXO_NOMES = {
    'exatas': 'Exatas & Tecnologia',
    'humanas': 'Humanas & Sociais',
    'saude': 'Saúde & Biológicas',
    'geral': 'Acadêmico'
  };

  let todasVagas = [];
  let listaProfessores = [];
  let vagaAtual = null;
  let docenteResponsavel = null;

  // ── 1. Parâmetro da Vaga pela URL ──
  const urlParams = new URLSearchParams(window.location.search);
  const vagaId = urlParams.get('id') ? parseInt(urlParams.get('id'), 10) : null;

  // ── 2. Toast de Notificação ──
  function mostrarToast(mensagem) {
    if (!toast || !toastMsg) return;
    toastMsg.textContent = mensagem;
    toast.classList.add('show');
    setTimeout(() => {
      toast.classList.remove('show');
    }, 3800);
  }

  // ── 3. Ajuste da Navbar para Usuário Docente Logado ──
  function ajustarNavbarDocente() {
    const isDocente = typeof isAuthenticated === 'function' ? isAuthenticated() : !!sessionStorage.getItem('token');
    if (isDocente) {
      if (navLinkPainel) navLinkPainel.style.display = 'inline-flex';
      if (navBtnNovaVaga) navBtnNovaVaga.style.display = 'inline-flex';
      if (navBtnProfessor) navBtnProfessor.style.display = 'none';
      if (btnLogout) {
        btnLogout.style.display = 'inline-flex';
        btnLogout.addEventListener('click', () => {
          if (typeof removeToken === 'function') removeToken();
          else sessionStorage.removeItem('token');
          window.location.href = 'index.html';
        });
      }
    }
  }

  // ── 4. Carregamento dos Dados ──
  async function carregarDados() {
    try {
      // Carrega Professores
      const respProf = await fetch('assets/data/professores.json');
      if (respProf.ok) {
        listaProfessores = await respProf.json();
      }

      // Carrega Oportunidades
      const respVagas = await fetch('assets/data/oportunidades.json');
      const jsonVagas = respVagas.ok ? await respVagas.json() : [];

      const vagasLocais = localStorage.getItem('oportunidades_gestao');
      if (vagasLocais) {
        todasVagas = JSON.parse(vagasLocais);
        jsonVagas.forEach(item => {
          if (!todasVagas.some(v => v.id === item.id)) {
            todasVagas.push(item);
          }
        });
      } else {
        todasVagas = jsonVagas;
      }

      // Seleciona a vaga solicitada ou a primeira da lista
      if (vagaId) {
        vagaAtual = todasVagas.find(v => v.id === vagaId);
      }
      if (!vagaAtual && todasVagas.length > 0) {
        vagaAtual = todasVagas[0];
      }

      // Encontra o docente responsável
      if (vagaAtual) {
        if (vagaAtual.professor_id) {
          docenteResponsavel = listaProfessores.find(p => p.id === vagaAtual.professor_id);
        }
        if (!docenteResponsavel && vagaAtual.professor_nome) {
          docenteResponsavel = listaProfessores.find(p => p.nome.toLowerCase() === vagaAtual.professor_nome.toLowerCase());
        }
        if (!docenteResponsavel) {
          docenteResponsavel = {
            nome: vagaAtual.professor_nome || 'Docente Responsável',
            email: 'pesquisa.extensao@ucsal.br',
            departamento: vagaAtual.departamento || 'UCSAL',
            avatar: 'PR'
          };
        }
      }

    } catch (e) {
      console.error('Erro ao carregar dados:', e);
    }
  }

  // ── 5. Renderização do Edital na Página ──
  function renderizarEdital() {
    if (!vagaAtual) {
      detalheTitulo.textContent = 'Oportunidade não encontrada.';
      return;
    }

    const { id, titulo, tipo, eixo, departamento, descricao, requisitos, bolsa, data_limite, status } = vagaAtual;
    const isEncerrada = (status || '').toUpperCase() === 'ENCERRADA';

    // Atualiza o título da página no navegador
    document.title = `OportUni | ${titulo}`;

    // Atualiza atributo no body para paleta de cores do eixo
    bodyEl.setAttribute('data-eixo', eixo || 'geral');

    // Breadcrumbs
    const eixoLegivel = EIXO_NOMES[eixo] || 'Acadêmico';
    if (breadEixo) breadEixo.textContent = eixoLegivel;
    if (breadTitulo) breadTitulo.textContent = titulo;

    // Hero
    if (detalheId) detalheId.textContent = String(id).padStart(3, '0');
    if (detalheTipo) detalheTipo.textContent = tipo;
    if (detalheEixoBadge) detalheEixoBadge.textContent = eixoLegivel;
    if (detalheTitulo) detalheTitulo.textContent = titulo;
    if (detalheDepto) detalheDepto.textContent = departamento;

    // Status do Hero
    if (detalheStatus && detalheStatusText) {
      if (isEncerrada) {
        detalheStatus.className = 'badge-status status-encerrada';
        detalheStatusText.textContent = 'ENCERRADA';
      } else {
        detalheStatus.className = 'badge-status status-aberta';
        detalheStatusText.textContent = 'ABERTA';
      }
    }

    // Formatação de Bolsa / Remuneração
    const bolsaLower = (bolsa || '').toLowerCase();
    const isBeneficio = bolsaLower.includes('h') || bolsaLower.includes('ac') || bolsaLower.includes('voluntário');
    const labelBolsa = isBeneficio ? 'Benefício' : 'Remuneração';

    if (detalheCaptionBolsa) detalheCaptionBolsa.textContent = labelBolsa;
    if (detalheBolsa) detalheBolsa.textContent = bolsa || 'A definir';
    if (stickyCaptionBolsa) stickyCaptionBolsa.textContent = labelBolsa;
    if (stickyBolsaValor) stickyBolsaValor.textContent = bolsa || 'A definir';

    // Formatação de Prazo
    let prazoFormatado = data_limite || 'A definir';
    if (data_limite && data_limite.includes('/')) {
      const p = data_limite.split('/');
      if (p.length === 3) {
        prazoFormatado = `${p[0]} ${MESES[p[1]] || p[1]} ${p[2]}`;
      }
    }
    if (detalheCaptionPrazo) detalheCaptionPrazo.textContent = isEncerrada ? 'Encerrado em' : 'Inscrições até';
    if (detalhePrazo) detalhePrazo.textContent = prazoFormatado;
    if (stickyDataLimite) stickyDataLimite.textContent = data_limite || '--/--/----';

    // Orientador
    const orientadorNome = docenteResponsavel ? docenteResponsavel.nome : 'Docente Responsável';
    if (detalheDocenteHero) detalheDocenteHero.textContent = orientadorNome;

    // Bloco 1: Descrição
    if (detalheDescricao) {
      detalheDescricao.textContent = descricao || 'Consulte o departamento para mais informações.';
    }

    // Bloco 2: Requisitos Estruturados (Separação inteligente por linhas, ponto e vírgula ou marcadores)
    if (detalheRequisitosList) {
      detalheRequisitosList.innerHTML = '';
      
      let itensRequisitos = [];
      if (requisitos && requisitos.trim()) {
        itensRequisitos = requisitos
          .split(/[\n;•]+/)
          .map(r => r.trim())
          .filter(r => r.length > 0);
      }

      if (itensRequisitos.length === 0) {
        itensRequisitos = [
          'Estar regularmente matriculado na UCSAL no curso de aderência ou áreas afins.',
          'Disponibilidade de carga horária para dedicação ao projeto.',
          'Bom rendimento acadêmico e cumprimento das normas regimentais do edital.'
        ];
      } else if (!itensRequisitos.some(r => r.toLowerCase().includes('matriculado') || r.toLowerCase().includes('matrícula'))) {
        itensRequisitos.unshift('Estar regularmente matriculado na UCSAL no curso correspondente.');
      }

      itensRequisitos.forEach(req => {
        const li = document.createElement('li');
        li.innerHTML = `
          <span class="req-check-icon" aria-hidden="true">✓</span>
          <span>${req}</span>
        `;
        detalheRequisitosList.appendChild(li);
      });
    }

    // Bloco 3: Atividades & Atribuições (Do cadastro ou contextualizadas por modalidade)
    if (atividadesGrid) {
      let itensAtividades = [];

      // Se o professor cadastrou atividades específicas, prioriza o texto cadastrado
      if (vagaAtual.atividades && vagaAtual.atividades.trim()) {
        itensAtividades = vagaAtual.atividades
          .split(/[\n;•]+/)
          .map(a => a.trim())
          .filter(a => a.length > 0);
      }

      // Se não houver atividades cadastradas, aplica a grade contextualizada por modalidade
      if (itensAtividades.length === 0) {
        const tipoLower = (tipo || '').toLowerCase();

        if (tipoLower.includes('iniciação') || tipoLower.includes('ic')) {
          itensAtividades = [
            'Levantamento bibliográfico e estado da arte científico',
            'Coleta, processamento e análise rigorosa de dados',
            'Elaboração de artigos e resumos para congressos',
            'Redação do relatório técnico final da bolsa'
          ];
        } else if (tipoLower.includes('monitoria')) {
          itensAtividades = [
            'Atendimento e esclarecimento de dúvidas dos discentes',
            'Apoio em aulas práticas e laboratórios da disciplina',
            'Auxílio na elaboração e resolução de exercícios formativos',
            'Mentoria sobre boas práticas de estudo e fixação'
          ];
        } else if (tipoLower.includes('extensão')) {
          itensAtividades = [
            'Planejamento de oficinas e ações de impacto comunitário',
            'Diálogo direto com os públicos externos atendidos',
            'Produção de materiais educativos e cartilhas práticas',
            'Registro de frequência e avaliação do impacto social'
          ];
        } else {
          itensAtividades = [
            'Execução prática de atividades supervisionadas',
            'Desenvolvimento de competências técnicas e relacionais',
            'Acompanhamento de rotinas e processos institucionais',
            'Cumprimento do plano de atividades aprovado'
          ];
        }
      }

      atividadesGrid.innerHTML = '';
      itensAtividades.forEach(ativ => {
        const div = document.createElement('div');
        div.className = 'atividade-pill';
        div.innerHTML = `
          <span class="atividade-check">✓</span>
          <span>${ativ}</span>
        `;
        atividadesGrid.appendChild(div);
      });
    }

    // Bloco 4: Docente Responsável
    if (docenteNome) docenteNome.textContent = orientadorNome;
    if (docenteDepto) docenteDepto.textContent = docenteResponsavel ? docenteResponsavel.departamento : departamento;
    if (docenteEmailLink && docenteResponsavel) {
      docenteEmailLink.textContent = docenteResponsavel.email;
      docenteEmailLink.href = `mailto:${docenteResponsavel.email}`;
    }
    if (docenteInitials && docenteResponsavel) {
      docenteInitials.textContent = docenteResponsavel.avatar || 'PR';
    }
    if (btnDuvidaDocente && docenteResponsavel) {
      btnDuvidaDocente.href = `mailto:${docenteResponsavel.email}?subject=${encodeURIComponent(`[OportUni] Dúvida sobre edital: ${titulo}`)}`;
    }

    // Sidebar de Candidatura
    if (stickyStatusBadge && stickyStatusText) {
      if (isEncerrada) {
        stickyStatusBadge.className = 'sticky-badge-status status-encerrada';
        stickyStatusText.textContent = 'Edital Encerrado';
        if (stickyPrazoDias) stickyPrazoDias.textContent = 'Prazo Finalizado';
        if (timelineProgress) timelineProgress.style.width = '100%';
        if (btnAbrirCandidatura) {
          btnAbrirCandidatura.disabled = true;
          btnAbrirCandidatura.innerHTML = `<span>Inscrições Encerradas</span>`;
        }
      } else {
        stickyStatusBadge.className = 'sticky-badge-status status-aberta';
        stickyStatusText.textContent = 'Edital Aberto';
        if (stickyPrazoDias) stickyPrazoDias.textContent = 'Inscrições Abertas';
        if (timelineProgress) timelineProgress.style.width = '65%';
        if (btnAbrirCandidatura) {
          btnAbrirCandidatura.disabled = false;
          btnAbrirCandidatura.innerHTML = `
            <span>Candidatar-se à Vaga</span>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
              <line x1="5" y1="12" x2="19" y2="12"></line>
              <polyline points="12 5 19 12 12 19"></polyline>
            </svg>
          `;
        }
      }
    }

    // Modal Subtítulo
    if (modalSubtituloVaga) {
      modalSubtituloVaga.textContent = `Edital: ${titulo} (${tipo})`;
    }

    // Ações Rápidas de Gestão Docente
    const isDocente = typeof isAuthenticated === 'function' ? isAuthenticated() : !!sessionStorage.getItem('token');
    if (isDocente && stickyDocenteActions) {
      stickyDocenteActions.style.display = 'flex';
      if (btnDocenteEditar) btnDocenteEditar.href = `oportunidade.html?id=${id}`;
      if (btnDocenteInscritos) btnDocenteInscritos.href = `inscritos.html?id=${id}`;
    }

    // Renderiza Vagas Relacionadas
    renderizarRelacionadas();
  }

  // ── 6. Vagas Relacionadas no mesmo Eixo ──
  function renderizarRelacionadas() {
    if (!gridRelacionadas || !vagaAtual) return;

    if (relacionadaseixoNome) {
      relacionadaseixoNome.textContent = EIXO_NOMES[vagaAtual.eixo] || 'Acadêmico';
    }

    const relacionadas = todasVagas
      .filter(v => v.id !== vagaAtual.id && (v.eixo === vagaAtual.eixo || v.tipo === vagaAtual.tipo))
      .slice(0, 3);

    gridRelacionadas.innerHTML = '';

    if (relacionadas.length === 0) {
      gridRelacionadas.innerHTML = `
        <p style="grid-column: 1 / -1; color: var(--text-muted); font-size: 0.95rem;">
          Nenhuma outra oportunidade encontrada neste eixo no momento.
        </p>
      `;
      return;
    }

    relacionadas.forEach(item => {
      const isEncerrada = (item.status || '').toUpperCase() === 'ENCERRADA';
      const statusClass = isEncerrada ? 'status-encerrada' : 'status-aberta';

      const card = document.createElement('a');
      card.href = `detalhe.html?id=${item.id}`;
      card.className = 'card-relacionada';

      card.innerHTML = `
        <div class="card-relacionada-top">
          <span class="badge-pill">${item.tipo}</span>
          <span class="badge-status ${statusClass}">${item.status}</span>
        </div>
        <h3 class="card-relacionada-title">${item.titulo}</h3>
        <p class="card-relacionada-depto">${item.departamento}</p>
        <div class="card-relacionada-footer">
          <span class="card-relacionada-bolsa">${item.bolsa}</span>
          <span class="card-relacionada-btn">
            <span>Ver Edital</span>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="9 18 15 12 9 6"></polyline></svg>
          </span>
        </div>
      `;

      gridRelacionadas.appendChild(card);
    });
  }

  // ── 7. Interações do Modal de Candidatura ──
  function abrirModal() {
    if (!vagaAtual || (vagaAtual.status || '').toUpperCase() === 'ENCERRADA') {
      mostrarToast('As inscrições para este edital já foram encerradas.');
      return;
    }

    // Carrega dados salvos do cache do estudante se existirem
    const cacheEstudante = localStorage.getItem('oportuni_estudante_cache');
    if (cacheEstudante) {
      try {
        const dados = JSON.parse(cacheEstudante);
        if (dados.nome && !candNome.value) candNome.value = dados.nome;
        if (dados.email && !candEmail.value) candEmail.value = dados.email;
        if (dados.matricula && !candMatricula.value) candMatricula.value = dados.matricula;
        if (dados.curso && !candCurso.value) candCurso.value = dados.curso;
        if (dados.periodo && !candPeriodo.value) candPeriodo.value = dados.periodo;
        if (dados.cr && !candCr.value) candCr.value = dados.cr;
        if (dados.telefone && !candTelefone.value) candTelefone.value = dados.telefone;
      } catch (e) {}
    }

    modalBackdrop.classList.add('is-open');
    modalBackdrop.setAttribute('aria-hidden', 'false');
    candNome.focus();
    document.body.style.overflow = 'hidden';
  }

  function fecharModal() {
    modalBackdrop.classList.remove('is-open');
    modalBackdrop.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
  }

  if (btnAbrirCandidatura) {
    btnAbrirCandidatura.addEventListener('click', abrirModal);
  }

  if (btnFecharModal) {
    btnFecharModal.addEventListener('click', fecharModal);
  }

  if (btnCancelarCandidatura) {
    btnCancelarCandidatura.addEventListener('click', fecharModal);
  }

  // Fecha modal ao clicar fora no backdrop
  if (modalBackdrop) {
    modalBackdrop.addEventListener('click', (e) => {
      if (e.target === modalBackdrop) {
        fecharModal();
      }
    });
  }

  // Fecha modal com Escape
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && modalBackdrop.classList.contains('is-open')) {
      fecharModal();
    }
  });

  // ── 8. Envio da Candidatura pelo Formulário ──
  if (formCandidatura) {
    formCandidatura.addEventListener('submit', async (e) => {
      e.preventDefault();

      // Validação de campos obrigatórios
      let valido = true;
      const obrigatorios = [candNome, candEmail, candMatricula, candCurso, candPeriodo, candTelefone, candMensagem];

      obrigatorios.forEach(campo => {
        campo.classList.remove('is-invalid');
        if (!campo.value.trim()) {
          campo.classList.add('is-invalid');
          valido = false;
        }
      });

      // Validação simples de email institucional
      if (candEmail.value && !candEmail.value.includes('@')) {
        candEmail.classList.add('is-invalid');
        valido = false;
      }

      if (!valido) {
        mostrarToast('Por favor, preencha todos os campos obrigatórios destacados.');
        const primeiroErro = formCandidatura.querySelector('.is-invalid');
        if (primeiroErro) primeiroErro.focus();
        return;
      }

      btnSubmeterCandidatura.disabled = true;
      btnSubmeterCandidatura.style.opacity = '0.7';

      // Criação da candidatura
      const novaCandidatura = {
        id: Date.now(),
        oportunidade_id: vagaAtual.id,
        nome_aluno: candNome.value.trim(),
        email_aluno: candEmail.value.trim(),
        matricula: candMatricula.value.trim(),
        curso: candCurso.value.trim(),
        periodo: candPeriodo.value.trim(),
        turno: candTurno ? candTurno.value : 'Matutino',
        coeficiente: candCr.value.trim() || 'N/A',
        telefone: candTelefone.value.trim(),
        mensagem: candMensagem.value.trim(),
        status: 'Em Análise',
        data_registro: new Date().toISOString().replace('T', ' ').substring(0, 16)
      };

      // Salva no perfil local do estudante para auto-completar na próxima candidatura
      localStorage.setItem('oportuni_estudante_cache', JSON.stringify({
        nome: candNome.value.trim(),
        email: candEmail.value.trim(),
        matricula: candMatricula.value.trim(),
        curso: candCurso.value.trim(),
        periodo: candPeriodo.value.trim(),
        cr: candCr.value.trim(),
        telefone: candTelefone.value.trim()
      }));

      // Adiciona à lista de inscritos do sistema (usada em inscritos.html)
      try {
        let todosInscritos = [];
        const salvoInscritos = localStorage.getItem('todos_inscritos') || localStorage.getItem('inscritos_gestao');
        if (salvoInscritos) {
          todosInscritos = JSON.parse(salvoInscritos);
        } else {
          const resp = await fetch('assets/data/inscritos.json');
          if (resp.ok) todosInscritos = await resp.json();
        }

        todosInscritos.unshift(novaCandidatura);
        localStorage.setItem('todos_inscritos', JSON.stringify(todosInscritos));
        localStorage.setItem('inscritos_gestao', JSON.stringify(todosInscritos));
      } catch (err) {
        console.warn('Erro ao salvar no banco local de inscritos:', err);
      }

      fecharModal();
      btnSubmeterCandidatura.disabled = false;
      btnSubmeterCandidatura.style.opacity = '1';

      mostrarToast('Candidatura submetida com sucesso! Boa sorte no processo.');

      // Atualiza visual do botão para indicar candidatura efetuada
      if (btnAbrirCandidatura) {
        btnAbrirCandidatura.innerHTML = `
          <span>Candidatura Enviada ✓</span>
        `;
        btnAbrirCandidatura.style.background = 'linear-gradient(135deg, #2A3576, #8FD31A)';
      }
    });
  }

  // ── 9. Botão de Compartilhar Link ──
  if (btnCompartilhar) {
    btnCompartilhar.addEventListener('click', async () => {
      const urlAtual = window.location.href;
      try {
        if (navigator.clipboard && navigator.clipboard.writeText) {
          await navigator.clipboard.writeText(urlAtual);
        } else {
          const tempInput = document.createElement('input');
          tempInput.value = urlAtual;
          document.body.appendChild(tempInput);
          tempInput.select();
          document.execCommand('copy');
          document.body.removeChild(tempInput);
        }
        mostrarToast('Link do edital copiado para a área de transferência!');
      } catch (err) {
        mostrarToast('Link: ' + urlAtual);
      }
    });
  }

  // ── Inicialização ──
  ajustarNavbarDocente();
  await carregarDados();
  renderizarEdital();
});

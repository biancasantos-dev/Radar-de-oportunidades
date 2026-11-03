// ============================================================
// OPORTUNI — CADASTRO-PROFESSOR.JS
// Cadastro de Docentes Exclusivo com E-mail Institucional UCSal
// ============================================================

document.addEventListener('DOMContentLoaded', async () => {
  const form = document.getElementById('form-cadastro');
  const campoNome = document.getElementById('campo-nome');
  const campoEmail = document.getElementById('campo-email');
  const campoEixo = document.getElementById('campo-eixo');
  const campoDepartamento = document.getElementById('campo-departamento');
  const campoSenha = document.getElementById('campo-senha');
  const campoConfirmarSenha = document.getElementById('campo-confirmar-senha');
  const campoTermo = document.getElementById('campo-termo');
  const btnSubmit = document.getElementById('btn-submit-cadastro');
  const btnText = btnSubmit.querySelector('.btn-text');
  const btnIcon = btnSubmit.querySelector('.btn-icon');
  const spinner = document.getElementById('cadastro-spinner');

  // Elementos de Feedback
  const feedbackBox = document.getElementById('cadastro-feedback');
  const feedbackText = document.getElementById('feedback-text');
  const emailValidationHint = document.getElementById('email-validation-hint');
  const emailHintText = document.getElementById('email-hint-text');
  const emailStatusIcon = document.getElementById('email-status-icon');
  const senhaValidationHint = document.getElementById('senha-validation-hint');
  const senhaHintText = document.getElementById('senha-hint-text');

  // Botões de alternância de senha
  const btnToggleSenha = document.getElementById('btn-toggle-senha');
  const btnToggleConfirmar = document.getElementById('btn-toggle-confirmar');

  // Select customizado de Eixo
  const wrapEixo = document.getElementById('wrap-campo-eixo');
  const triggerEixo = document.getElementById('trigger-campo-eixo');
  const menuEixo = document.getElementById('menu-campo-eixo');

  let listaProfessoresExistentes = [];

  // ── 1. Carregar Professores Existentes para Evitar Duplicidade ──
  async function carregarProfessores() {
    try {
      const resp = await fetch('assets/data/professores.json');
      if (resp.ok) {
        listaProfessoresExistentes = await resp.json();
      }
    } catch (e) {
      console.warn('Aviso: Não foi possível carregar professores.json:', e);
    }

    try {
      const locais = localStorage.getItem('professores_cadastrados');
      if (locais) {
        const profsLocais = JSON.parse(locais);
        listaProfessoresExistentes = [...profsLocais, ...listaProfessoresExistentes];
      }
    } catch (e) {
      console.warn('Aviso: Erro ao ler professores_cadastrados:', e);
    }
  }

  // Carregamento de professores existentes em segundo plano
  carregarProfessores();

  // ── 2. Alternância de Visibilidade das Senhas ──
  function configurarToggleSenha(btn, input) {
    if (!btn || !input) return;
    const eyeShow = btn.querySelector('.eye-show');
    const eyeHide = btn.querySelector('.eye-hide');

    btn.addEventListener('click', () => {
      const isPassword = input.type === 'password';
      input.type = isPassword ? 'text' : 'password';
      eyeShow.classList.toggle('hidden', isPassword);
      eyeHide.classList.toggle('hidden', !isPassword);
      btn.setAttribute('aria-label', isPassword ? 'Ocultar senha' : 'Exibir senha');
    });
  }

  configurarToggleSenha(btnToggleSenha, campoSenha);
  configurarToggleSenha(btnToggleConfirmar, campoConfirmarSenha);

  // ── 3. Sincronização do Select Customizado de Eixo (Gerenciado por script.js) ──
  if (campoEixo && wrapEixo) {
    campoEixo.addEventListener('change', () => {
      wrapEixo.classList.remove('is-invalid');
    });
  }

  // Assegura que os selects globais foram inicializados
  if (typeof initCustomSelects === 'function') {
    initCustomSelects();
  }

  // ── 4. Validação Rigorosa de E-mail UCSal ──
  // CRITÉRIO MANDATÓRIO: Apenas domínios @ucsal.br ou @prof.ucsal.br
  function checarEmailUcsal(email) {
    const limpo = (email || '').trim().toLowerCase();
    const formatoValido = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(limpo);

    if (!formatoValido) {
      return { valido: false, motivo: 'formato', mensagem: 'Formato de e-mail inválido.' };
    }

    const ehUcsal = limpo.endsWith('@ucsal.br') || 
                    limpo.endsWith('@prof.ucsal.br') || 
                    /@([a-z0-9-]+\.)*ucsal\.br$/i.test(limpo);

    if (!ehUcsal) {
      return { 
        valido: false, 
        motivo: 'dominio', 
        mensagem: 'O cadastro é exclusivo para docentes da UCSal (@ucsal.br ou @prof.ucsal.br).' 
      };
    }

    // Verifica se já existe professor cadastrado com este e-mail
    const jaExiste = listaProfessoresExistentes.some(p => p.email && p.email.toLowerCase() === limpo);
    if (jaExiste) {
      return {
        valido: false,
        motivo: 'duplicado',
        mensagem: 'Este e-mail institucional já possui conta cadastrada. Faça login.'
      };
    }

    return { valido: true, mensagem: 'E-mail institucional UCSal válido e disponível.' };
  }

  // Feedback em tempo real para o campo de e-mail
  campoEmail.addEventListener('input', () => {
    const val = campoEmail.value.trim();

    if (!val) {
      emailValidationHint.className = 'domain-feedback-hint';
      emailHintText.textContent = 'Apenas e-mails institucionais @ucsal.br ou @prof.ucsal.br são autorizados.';
      emailStatusIcon.textContent = '';
      emailStatusIcon.className = 'email-status-indicator';
      campoEmail.style.borderColor = '';
      return;
    }

    // Se o usuário digitou arroba, já checa o domínio
    if (val.includes('@')) {
      const res = checarEmailUcsal(val);
      if (res.valido) {
        emailValidationHint.className = 'domain-feedback-hint is-valid';
        emailHintText.textContent = res.mensagem;
        emailStatusIcon.textContent = '';
        emailStatusIcon.className = 'email-status-indicator is-valid';
        campoEmail.style.borderColor = '#2E7D32';
      } else {
        emailValidationHint.className = 'domain-feedback-hint is-invalid';
        emailHintText.textContent = res.mensagem;
        emailStatusIcon.textContent = '';
        emailStatusIcon.className = 'email-status-indicator is-invalid';
        campoEmail.style.borderColor = '#D32F2F';
      }
    } else {
      emailValidationHint.className = 'domain-feedback-hint';
      emailHintText.textContent = 'Digite seu e-mail institucional completo (@ucsal.br)...';
      emailStatusIcon.textContent = '';
      emailStatusIcon.className = 'email-status-indicator';
      campoEmail.style.borderColor = '';
    }
  });

  // ── 5. Feedback em Tempo Real para Senhas ──
  function checarSenhas() {
    const s1 = campoSenha.value;
    const s2 = campoConfirmarSenha.value;

    if (!s1 && !s2) {
      senhaValidationHint.className = 'password-match-hint';
      senhaHintText.textContent = 'A senha deve ter pelo menos 6 caracteres.';
      return;
    }

    if (s1.length < 6) {
      senhaValidationHint.className = 'password-match-hint is-invalid';
      senhaHintText.textContent = 'A senha deve conter no mínimo 6 caracteres.';
      return;
    }

    if (s2) {
      if (s1 === s2) {
        senhaValidationHint.className = 'password-match-hint is-valid';
        senhaHintText.textContent = 'As senhas digitadas conferem.';
      } else {
        senhaValidationHint.className = 'password-match-hint is-invalid';
        senhaHintText.textContent = 'As senhas digitadas não coincidem.';
      }
    } else {
      senhaValidationHint.className = 'password-match-hint';
      senhaHintText.textContent = 'Digite a confirmação da senha para validar.';
    }
  }

  campoSenha.addEventListener('input', checarSenhas);
  campoConfirmarSenha.addEventListener('input', checarSenhas);

  // ── 6. Extração de Iniciais para Avatar Editorial ──
  function extrairIniciais(nome) {
    if (!nome) return 'PR';
    // Remove títulos comuns como Prof., Profa., Dr., Dra., Me.
    const limpo = nome
      .replace(/^(prof\.|profa\.|dr\.|dra\.|me\.|ms\.|doutor|doutora|mestre)\s+/gi, '')
      .trim();
    const partes = limpo.split(/\s+/).filter(p => p.length > 0);
    if (partes.length === 1) return partes[0].substring(0, 2).toUpperCase();
    if (partes.length >= 2) return (partes[0][0] + partes[partes.length - 1][0]).toUpperCase();
    return 'PR';
  }

  // ── 7. Submissão do Formulário de Cadastro ──
  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    limparFeedback();

    const nome = campoNome.value.trim();
    const email = campoEmail.value.trim().toLowerCase();
    const eixo = campoEixo.value;
    const depto = campoDepartamento.value.trim();
    const senha = campoSenha.value;
    const confirmarSenha = campoConfirmarSenha.value;
    const termoAceito = campoTermo.checked;

    // 1. Validação de Nome
    if (!nome || nome.length < 3) {
      exibirFeedback('error', 'Por favor, informe seu nome completo e titulação acadêmica.');
      campoNome.focus();
      return;
    }

    // 2. Validação Rigorosa de E-mail UCSal
    const checkEmail = checarEmailUcsal(email);
    if (!checkEmail.valido) {
      exibirFeedback('error', checkEmail.mensagem);
      campoEmail.focus();
      return;
    }

    // 3. Validação de Eixo
    if (!eixo) {
      exibirFeedback('error', 'Selecione o seu Eixo Principal de atuação acadêmica.');
      if (wrapEixo) wrapEixo.classList.add('is-invalid');
      triggerEixo.focus();
      return;
    }

    // 4. Validação de Departamento
    if (!depto || depto.length < 2) {
      exibirFeedback('error', 'Por favor, informe seu Curso ou Departamento na UCSal.');
      campoDepartamento.focus();
      return;
    }

    // 5. Validação de Senha
    if (!senha || senha.length < 6) {
      exibirFeedback('error', 'A senha deve conter no mínimo 6 caracteres para garantir a segurança da conta.');
      campoSenha.focus();
      return;
    }

    if (senha !== confirmarSenha) {
      exibirFeedback('error', 'A confirmação de senha não confere com a senha informada.');
      campoConfirmarSenha.focus();
      return;
    }

    // 6. Validação do Termo de Vínculo Docente
    if (!termoAceito) {
      exibirFeedback('error', 'É necessário declarar seu vínculo docente ativo com a UCSal para prosseguir.');
      campoTermo.focus();
      return;
    }

    iniciarCarregamento();

    try {
      // Simulação de processamento seguro
      await new Promise(resolve => setTimeout(resolve, 750));

      // Mapeamento de tags por eixo
      const tagsPorEixo = {
        'exatas': 'Exatas & TI',
        'humanas': 'Humanas & Sociais',
        'saude': 'Saúde & Biológicas'
      };

      // Determinação de ID único
      const maiorId = listaProfessoresExistentes.reduce((max, p) => (p.id > max ? p.id : max), 10);
      const novoId = Math.max(maiorId + 1, Date.now() % 100000);

      const novoProfessor = {
        id: novoId,
        nome: nome,
        email: email,
        senha: senha,
        departamento: depto,
        eixo: eixo,
        tag: tagsPorEixo[eixo] || depto,
        avatar: extrairIniciais(nome),
        data_cadastro: new Date().toLocaleDateString('pt-BR')
      };

      // Salva na lista de professores cadastrados no localStorage
      let cadastradosLocais = [];
      try {
        const dadosLocais = localStorage.getItem('professores_cadastrados');
        if (dadosLocais) cadastradosLocais = JSON.parse(dadosLocais);
      } catch (err) {
        cadastradosLocais = [];
      }

      cadastradosLocais.unshift(novoProfessor);
      localStorage.setItem('professores_cadastrados', JSON.stringify(cadastradosLocais));

      // Realiza autenticação imediata do novo docente
      localStorage.setItem('oportuni_docente_ativo', JSON.stringify(novoProfessor));
      sessionStorage.setItem('oportuni_docente_ativo', JSON.stringify(novoProfessor));
      localStorage.setItem('oportuni_docente_email', email);

      const tokenDemo = `docente_${btoa(email)}_${Date.now()}`;
      if (typeof setToken === 'function') {
        setToken(tokenDemo);
      } else {
        sessionStorage.setItem('token', tokenDemo);
      }

      exibirFeedback('success', `Conta criada com sucesso! Bem-vindo(a), ${novoProfessor.nome}. Entrando no painel...`);

      // Redireciona para o Painel do Docente
      setTimeout(() => {
        window.location.href = 'painel.html';
      }, 1200);

    } catch (err) {
      console.error('Erro ao realizar cadastro docente:', err);
      exibirFeedback('error', 'Ocorreu um erro ao salvar o cadastro. Tente novamente.');
      pararCarregamento();
    }
  });

  // ── Funções Utilitárias de Interface ──
  function exibirFeedback(tipo, mensagem) {
    feedbackBox.className = `cadastro-feedback feedback-${tipo}`;
    feedbackText.textContent = mensagem;
    feedbackBox.classList.remove('hidden');
    feedbackBox.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  }

  function limparFeedback() {
    feedbackBox.classList.add('hidden');
    feedbackText.textContent = '';
  }

  function iniciarCarregamento() {
    btnSubmit.disabled = true;
    btnText.textContent = 'Processando Cadastro...';
    if (btnIcon) btnIcon.classList.add('hidden');
    spinner.classList.remove('hidden');
  }

  function pararCarregamento() {
    btnSubmit.disabled = false;
    btnText.textContent = 'Concluir Cadastro Docente';
    if (btnIcon) btnIcon.classList.remove('hidden');
    spinner.classList.add('hidden');
  }
});

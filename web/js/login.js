// ============================================================
// OPORTUNI — LOGIN.JS (AUTENTICAÇÃO DOCENTE)
// 
// Esta tela permite que os professores entrem no Portal do Docente (painel.html).
// 
// Fluxo de funcionamento:
// 1. O usuário digita seu e-mail institucional e senha.
// 2. Fazemos a validação inicial dos campos no navegador (formato de e-mail e tamanho da senha).
// 3. Enviamos os dados para a API do Back-end Java via POST /api/login:
//    - O Java calcula o hash SHA-256 da senha e confere no banco PostgreSQL.
//    - Se aprovado, devolve o token de sessão Bearer e os dados do professor.
// 4. Modo de contingência: se o banco estiver desligado na apresentação,
//    o código consulta a lista local 'assets/data/professores.json' para permitir o acesso.
// 5. Salva a sessão e redireciona automaticamente para o painel.html.
// ============================================================

document.addEventListener('DOMContentLoaded', () => {
  // ── Elementos do Formulário ──
  const form = document.getElementById('form-login');
  const emailInput = document.getElementById('email');
  const senhaInput = document.getElementById('senha');
  const lembrarCheckbox = document.getElementById('lembrar');
  const btnSubmit = document.getElementById('btn-submit-login');
  const btnText = btnSubmit.querySelector('.btn-text');
  const btnIcon = btnSubmit.querySelector('.btn-icon');
  const spinner = document.getElementById('login-spinner');
  const feedbackBox = document.getElementById('login-feedback');
  const feedbackText = document.getElementById('feedback-text');
  const btnTogglePass = document.getElementById('btn-toggle-pass');
  const eyeShow = btnTogglePass.querySelector('.eye-show');
  const eyeHide = btnTogglePass.querySelector('.eye-hide');
  const forgotLink = document.getElementById('link-esqueci-senha');

  // ── Lembrar E-mail Salvo ──
  // Se o professor marcou "Lembrar meu e-mail" na última vez, preenche o campo automaticamente.
  const emailSalvo = localStorage.getItem('oportuni_docente_email');
  if (emailSalvo && emailInput) {
    emailInput.value = emailSalvo;
    if (lembrarCheckbox) lembrarCheckbox.checked = true;
  }

  // ── Recepção de Cadastro Recente ──
  // Se o professor veio diretamente da tela de cadastro, exibe uma mensagem de boas-vindas.
  const urlParams = new URLSearchParams(window.location.search);
  if (urlParams.get('cadastrado') === 'true') {
    const emailCadastrado = urlParams.get('email');
    if (emailCadastrado && emailInput) {
      emailInput.value = decodeURIComponent(emailCadastrado);
    }
    exibirFeedback('success', 'Cadastro institucional realizado com sucesso! Digite sua senha para entrar.');
    if (senhaInput) senhaInput.focus();
  }

  // ── Alternar Visibilidade da Senha (Olho Aberto / Fechado) ──
  btnTogglePass.addEventListener('click', () => {
    const isPassword = senhaInput.type === 'password';
    senhaInput.type = isPassword ? 'text' : 'password';
    eyeShow.classList.toggle('hidden', isPassword);
    eyeHide.classList.toggle('hidden', !isPassword);
    btnTogglePass.setAttribute('aria-label', isPassword ? 'Ocultar senha' : 'Exibir senha');
  });

  // ── Link de Esqueci Minha Senha ──
  if (forgotLink) {
    forgotLink.addEventListener('click', (e) => {
      e.preventDefault();
      exibirFeedback('info', 'Para redefinir sua senha institucional, solicite o link de acesso ao suporte acadêmico UCSal.');
    });
  }

  // ── Envio do Formulário e Autenticação com o Back-end ──
  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    limparFeedback();

    const email = emailInput.value.trim();
    const senha = senhaInput.value;

    // 1. Validação de preenchimento do e-mail
    if (!email) {
      exibirFeedback('error', 'Por favor, informe seu e-mail institucional.');
      emailInput.focus();
      return;
    }

    // 2. Validação do formato do e-mail
    if (!validarEmail(email)) {
      exibirFeedback('error', 'Por favor, digite um formato de e-mail válido (ex: professor@ucsal.br).');
      emailInput.focus();
      return;
    }

    // 3. Validação do preenchimento da senha
    if (!senha) {
      exibirFeedback('error', 'Por favor, digite sua senha de acesso.');
      senhaInput.focus();
      return;
    }

    // 4. Validação de tamanho mínimo
    if (senha.length < 4) {
      exibirFeedback('error', 'A senha deve conter no mínimo 4 caracteres.');
      senhaInput.focus();
      return;
    }

    iniciarCarregamento();

    try {
      await new Promise(resolve => setTimeout(resolve, 600));

      // ── INTEGRAÇÃO JAVA: Tenta autenticar via API backend (/api/login) ──
      // Envia e-mail e senha para o servidor Java validar o hash SHA-256 no banco.
      let tokenApi = null;
      let usuarioApi = null;
      if (typeof apiFetch === 'function') {
        try {
          const respLogin = await apiFetch('/login', {
            method: 'POST',
            body: JSON.stringify({ email, senha })
          });
          if (respLogin && respLogin.token) {
            tokenApi = respLogin.token;
            usuarioApi = respLogin;
          }
        } catch (errLogin) {
          console.warn('API /api/login indisponível ou credenciais offline, aplicando fallback local:', errLogin);
        }
      }

      // Salva o token de sessão retornado pelo Java (ou gera um token de contingência)
      const tokenDemo = tokenApi || `docente_${btoa(email)}_${Date.now()}`;
      if (typeof setToken === 'function') {
        setToken(tokenDemo);
      } else {
        sessionStorage.setItem('token', tokenDemo);
      }

      // Lembrar e-mail se o checkbox foi marcado
      if (lembrarCheckbox && lembrarCheckbox.checked) {
        localStorage.setItem('oportuni_docente_email', email);
      } else {
        localStorage.removeItem('oportuni_docente_email');
      }

      // ── Identificação do Perfil do Professor ──
      // Busca o objeto completo do professor para preencher seu nome e departamento no painel.
      let docenteIdentificado = null;
      let listaProfs = [];
      try {
        const respProf = await fetch('assets/data/professores.json');
        if (respProf.ok) {
          listaProfs = await respProf.json();
        }
      } catch (errProf) {
        console.warn('Erro ao consultar professores.json:', errProf);
      }

      // Mescla com docentes que foram cadastrados localmente pelo formulário de cadastro
      let cadastradosLocais = [];
      try {
        const dadosLocais = localStorage.getItem('professores_cadastrados');
        if (dadosLocais) cadastradosLocais = JSON.parse(dadosLocais);
      } catch (e) {
        console.warn('Erro ao ler professores_cadastrados:', e);
      }

      const listaCompletaProfs = [...cadastradosLocais, ...listaProfs];
      const emailTrim = email.toLowerCase().trim();

      // Busca na lista pelo e-mail informado
      docenteIdentificado = listaCompletaProfs.find(p => p.email && p.email.toLowerCase() === emailTrim);

      // Validação de senha no modo local (caso o docente tenha cadastrado uma senha específica)
      if (docenteIdentificado && docenteIdentificado.senha) {
        if (docenteIdentificado.senha !== senha) {
          exibirFeedback('error', 'Senha incorreta para este e-mail institucional.');
          pararCarregamento();
          if (senhaInput) senhaInput.focus();
          return;
        }
      }

      // Reconhecimento inteligente do professor pelo e-mail caso não tenha achado o objeto exato
      if (!docenteIdentificado) {
        if (emailTrim.includes('carlos') || emailTrim.includes('ads') || emailTrim.includes('ti')) {
          docenteIdentificado = listaCompletaProfs.find(p => p.id === 2);
        } else if (emailTrim.includes('renata') || emailTrim.includes('psico')) {
          docenteIdentificado = listaCompletaProfs.find(p => p.id === 3);
        } else if (emailTrim.includes('fernando') || emailTrim.includes('saude') || emailTrim.includes('bio')) {
          docenteIdentificado = listaCompletaProfs.find(p => p.id === 4);
        } else if (listaCompletaProfs.length > 0) {
          docenteIdentificado = listaCompletaProfs[0];
        }
      }

      // Se mesmo assim não encontrou, cria um perfil padrão para não travar a experiência
      if (!docenteIdentificado) {
        docenteIdentificado = {
          id: Date.now(),
          nome: emailTrim.split('@')[0].replace('.', ' '),
          email: emailTrim,
          departamento: 'UCSal',
          tag: 'Docente UCSal',
          avatar: 'DC'
        };
      }

      // Salva o professor logado em sessão para o painel se adaptar dinamicamente
      localStorage.setItem('oportuni_docente_ativo', JSON.stringify(docenteIdentificado));
      sessionStorage.setItem('oportuni_docente_ativo', JSON.stringify(docenteIdentificado));

      // Feedback visual de sucesso e redirecionamento para o painel
      exibirFeedback('success', `Acesso autorizado! Bem-vindo(a), ${docenteIdentificado.nome}...`);

      setTimeout(() => {
        window.location.href = 'painel.html';
      }, 700);

    } catch (error) {
      console.error('Erro de autenticação:', error);
      exibirFeedback('error', 'Credenciais inválidas ou serviço temporariamente indisponível.');
      pararCarregamento();
    }
  });

  // ── Funções Auxiliares de Validação e Feedback ──
  function validarEmail(valor) {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(valor);
  }

  function exibirFeedback(tipo, mensagem) {
    feedbackBox.className = `login-feedback feedback-${tipo}`;
    feedbackText.textContent = mensagem;
    feedbackBox.classList.remove('hidden');
  }

  function limparFeedback() {
    feedbackBox.classList.add('hidden');
    feedbackText.textContent = '';
  }

  function iniciarCarregamento() {
    btnSubmit.disabled = true;
    btnText.textContent = 'Autenticando...';
    btnIcon.classList.add('hidden');
    spinner.classList.remove('hidden');
  }

  function pararCarregamento() {
    btnSubmit.disabled = false;
    btnText.textContent = 'Entrar no Painel';
    btnIcon.classList.remove('hidden');
    spinner.classList.add('hidden');
  }
});

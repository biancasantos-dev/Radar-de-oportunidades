// ============================================================
// OPORTUNI — LOGIN.JS
// Autenticação Docente e Interatividade da Tela de Acesso
// ============================================================

document.addEventListener('DOMContentLoaded', () => {
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

  // Recupera e-mail salvo se a opção 'lembrar' tiver sido usada anteriormente
  const emailSalvo = localStorage.getItem('oportuni_docente_email');
  if (emailSalvo && emailInput) {
    emailInput.value = emailSalvo;
    if (lembrarCheckbox) lembrarCheckbox.checked = true;
  }

  // Alternar visibilidade da senha
  btnTogglePass.addEventListener('click', () => {
    const isPassword = senhaInput.type === 'password';
    senhaInput.type = isPassword ? 'text' : 'password';
    eyeShow.classList.toggle('hidden', isPassword);
    eyeHide.classList.toggle('hidden', !isPassword);
    btnTogglePass.setAttribute('aria-label', isPassword ? 'Ocultar senha' : 'Exibir senha');
  });

  // Recuperação de senha
  if (forgotLink) {
    forgotLink.addEventListener('click', (e) => {
      e.preventDefault();
      exibirFeedback('info', 'Para redefinir sua senha institucional, solicite o link de acesso ao suporte acadêmico UCSal.');
    });
  }

  // Submissão do formulário
  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    limparFeedback();

    const email = emailInput.value.trim();
    const senha = senhaInput.value;

    // Validações de entrada
    if (!email) {
      exibirFeedback('error', 'Por favor, informe seu e-mail institucional.');
      emailInput.focus();
      return;
    }

    if (!validarEmail(email)) {
      exibirFeedback('error', 'Por favor, digite um formato de e-mail válido (ex: professor@ucsal.br).');
      emailInput.focus();
      return;
    }

    if (!senha) {
      exibirFeedback('error', 'Por favor, digite sua senha de acesso.');
      senhaInput.focus();
      return;
    }

    if (senha.length < 4) {
      exibirFeedback('error', 'A senha deve conter no mínimo 4 caracteres.');
      senhaInput.focus();
      return;
    }

    iniciarCarregamento();

    try {
      await new Promise(resolve => setTimeout(resolve, 600));

      // Gravação do token na sessão (função compartilhada de script.js)
      const tokenDemo = `docente_${btoa(email)}_${Date.now()}`;
      if (typeof setToken === 'function') {
        setToken(tokenDemo);
      } else {
        sessionStorage.setItem('token', tokenDemo);
      }

      // Lembrar e-mail caso selecionado
      if (lembrarCheckbox && lembrarCheckbox.checked) {
        localStorage.setItem('oportuni_docente_email', email);
      } else {
        localStorage.removeItem('oportuni_docente_email');
      }

      // Feedback de sucesso e redirecionamento
      exibirFeedback('success', 'Acesso autorizado! Redirecionando para o painel...');

      setTimeout(() => {
        window.location.href = 'painel.html';
      }, 700);

    } catch (error) {
      console.error('Erro de autenticação:', error);
      exibirFeedback('error', 'Credenciais inválidas ou serviço temporariamente indisponível.');
      pararCarregamento();
    }
  });

  // ── Funções Utilitárias ──
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

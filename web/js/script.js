// ============================================================
// OPORTUNI — Utilitários Globais da API
// Padrão exigido: token Bearer no header + sessionStorage
// ============================================================

const API_BASE = '/api';

// ── Gestão do Token de Autenticação ──
function getToken() {
  return sessionStorage.getItem('token');
}

function setToken(token) {
  sessionStorage.setItem('token', token);
}

function removeToken() {
  sessionStorage.removeItem('token');
}

function isAuthenticated() {
  return !!getToken();
}

// ── Requisições Assíncronas Padronizadas ──
async function apiFetch(endpoint, options = {}) {
  const token = getToken();

  const headers = {
    'Content-Type': 'application/json',
    ...(token && { 'Authorization': `Bearer ${token}` }),
    ...options.headers
  };

  const response = await fetch(`${API_BASE}${endpoint}`, {
    ...options,
    headers
  });

  if (!response.ok) {
    const errorMsg = await response.text();
    throw new Error(errorMsg || 'Erro na requisição');
  }

  const contentType = response.headers.get('Content-Type') || '';
  if (contentType.includes('application/json')) {
    return response.json();
  }

  return response.text();
}

// ── Menu Sanduíche Mobile Interativo ──
function initMobileMenu() {
  const toggleBtn = document.querySelector('.navbar-toggle');
  const navMenu = document.querySelector('.navbar-nav');

  if (!toggleBtn || !navMenu) return;

  function fecharMenu() {
    toggleBtn.classList.remove('active');
    navMenu.classList.remove('open');
    toggleBtn.setAttribute('aria-expanded', 'false');
  }

  function abrirMenu() {
    toggleBtn.classList.add('active');
    navMenu.classList.add('open');
    toggleBtn.setAttribute('aria-expanded', 'true');
  }

  toggleBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    const isOpen = navMenu.classList.contains('open');
    if (isOpen) {
      fecharMenu();
    } else {
      abrirMenu();
    }
  });

  // Fecha o menu ao clicar fora dele
  document.addEventListener('click', (e) => {
    if (!navMenu.contains(e.target) && !toggleBtn.contains(e.target)) {
      fecharMenu();
    }
  });

  // Fecha o menu ao clicar em qualquer link ou botão interno (ex: logout, nova vaga, mural)
  navMenu.querySelectorAll('a, button').forEach(el => {
    el.addEventListener('click', () => {
      fecharMenu();
    });
  });

  // Fecha com a tecla ESC
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      fecharMenu();
    }
  });

  // Fecha automaticamente ao expandir a tela para desktop
  window.addEventListener('resize', () => {
    if (window.innerWidth > 768) {
      fecharMenu();
    }
  });
}

// ── Componente Global: Custom Select na Identidade Visual OportUni ──
function initCustomSelects(container = document) {
  const wraps = container.querySelectorAll('.custom-select-wrap');

  wraps.forEach(wrap => {
    if (wrap.dataset.selectInit === 'true') return;
    wrap.dataset.selectInit = 'true';

    const nativeSelect = wrap.querySelector('select');
    const trigger = wrap.querySelector('.custom-select-trigger');
    const dropdown = wrap.querySelector('.custom-select-dropdown');
    const options = wrap.querySelectorAll('.custom-select-option');
    const triggerText = wrap.querySelector('.trigger-text');
    const triggerDot = wrap.querySelector('.trigger-label .type-dot');

    if (!trigger || !dropdown) return;

    function fechar() {
      wrap.classList.remove('is-open');
      trigger.setAttribute('aria-expanded', 'false');
    }

    function abrir() {
      // Fecha outros selects abertos
      document.querySelectorAll('.custom-select-wrap.is-open').forEach(other => {
        if (other !== wrap) {
          other.classList.remove('is-open');
          const otherTrg = other.querySelector('.custom-select-trigger');
          if (otherTrg) otherTrg.setAttribute('aria-expanded', 'false');
        }
      });
      wrap.classList.add('is-open');
      trigger.setAttribute('aria-expanded', 'true');
    }

    trigger.addEventListener('click', (e) => {
      e.stopPropagation();
      if (wrap.classList.contains('is-open')) {
        fechar();
      } else {
        abrir();
      }
    });

    function sincronizarUI(valor) {
      let optEncontrada = null;
      options.forEach(opt => {
        const optVal = opt.getAttribute('data-value');
        if (optVal !== null && optVal === valor) {
          optEncontrada = opt;
          opt.classList.add('selected');
          opt.setAttribute('aria-selected', 'true');
        } else {
          opt.classList.remove('selected');
          opt.setAttribute('aria-selected', 'false');
        }
      });

      if (optEncontrada && valor !== '') {
        const textSpan = optEncontrada.querySelector('.option-text');
        const dotClass = optEncontrada.getAttribute('data-dot');

        if (triggerText) {
          triggerText.textContent = textSpan ? textSpan.textContent.trim() : valor;
          triggerText.classList.remove('is-placeholder');
        }

        if (triggerDot) {
          triggerDot.style.display = 'inline-block';
          triggerDot.className = dotClass ? `type-dot ${dotClass}` : 'type-dot';
        }

        wrap.classList.remove('is-invalid');
      } else {
        const placeholder = trigger.getAttribute('data-placeholder') || 'Selecione...';
        if (triggerText) {
          triggerText.textContent = placeholder;
          triggerText.classList.add('is-placeholder');
        }
        if (triggerDot) {
          // Se houver um dot default especificado no trigger inicial, use-o; senão oculte
          const initialDotClass = trigger.getAttribute('data-initial-dot');
          if (initialDotClass) {
            triggerDot.style.display = 'inline-block';
            triggerDot.className = `type-dot ${initialDotClass}`;
          } else {
            triggerDot.style.display = 'none';
          }
        }
      }
    }

    // Clique nas opções
    options.forEach(option => {
      option.addEventListener('click', (e) => {
        e.stopPropagation();
        const valor = option.getAttribute('data-value');

        if (nativeSelect) {
          nativeSelect.value = valor;
          nativeSelect.dispatchEvent(new Event('change', { bubbles: true }));
        }

        sincronizarUI(valor);
        fechar();
        trigger.focus();
      });

      option.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          option.click();
        }
      });
    });

    // Ouve alterações no select nativo feitas via código
    if (nativeSelect) {
      nativeSelect.addEventListener('change', () => {
        sincronizarUI(nativeSelect.value);
      });

      // Sincroniza estado inicial
      sincronizarUI(nativeSelect.value);
    }
  });

  // Fechamento ao clicar fora ou tecla ESC
  if (!window._customSelectGlobalListenersInitialized) {
    window._customSelectGlobalListenersInitialized = true;

    document.addEventListener('click', (e) => {
      document.querySelectorAll('.custom-select-wrap.is-open').forEach(openWrap => {
        if (!openWrap.contains(e.target)) {
          openWrap.classList.remove('is-open');
          const trg = openWrap.querySelector('.custom-select-trigger');
          if (trg) trg.setAttribute('aria-expanded', 'false');
        }
      });
    });

    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        document.querySelectorAll('.custom-select-wrap.is-open').forEach(openWrap => {
          openWrap.classList.remove('is-open');
          const trg = openWrap.querySelector('.custom-select-trigger');
          if (trg) trg.setAttribute('aria-expanded', 'false');
        });
      }
    });
  }
}

window.initCustomSelects = initCustomSelects;

// Inicialização automática após carregamento da página
function initGlobalComponents() {
  initMobileMenu();
  initCustomSelects();
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initGlobalComponents);
} else {
  initGlobalComponents();
}


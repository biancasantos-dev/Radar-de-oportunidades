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

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initMobileMenu);
} else {
  initMobileMenu();
}

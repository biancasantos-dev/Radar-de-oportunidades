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
document.addEventListener('DOMContentLoaded', () => {
  const toggleBtn = document.querySelector('.navbar-toggle');
  const navMenu = document.querySelector('.navbar-nav');

  if (toggleBtn && navMenu) {
    toggleBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      toggleBtn.classList.toggle('active');
      navMenu.classList.toggle('open');
    });

    // Fecha o menu ao clicar fora
    document.addEventListener('click', (e) => {
      if (!navMenu.contains(e.target) && !toggleBtn.contains(e.target)) {
        toggleBtn.classList.remove('active');
        navMenu.classList.remove('open');
      }
    });

    // Fecha ao clicar em um link interno
    navMenu.querySelectorAll('a').forEach(link => {
      link.addEventListener('click', () => {
        toggleBtn.classList.remove('active');
        navMenu.classList.remove('open');
      });
    });
  }
});

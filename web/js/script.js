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

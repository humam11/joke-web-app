export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? '/api';

const unsafeMethods = new Set(['DELETE', 'PATCH', 'POST', 'PUT']);

function getCookie(name) {
  return document.cookie
    .split(';')
    .map((cookie) => cookie.trim())
    .find((cookie) => cookie.startsWith(`${name}=`))
    ?.slice(name.length + 1);
}

function buildUrl(path) {
  if (path.startsWith('http://') || path.startsWith('https://')) {
    return path;
  }

  return `${API_BASE_URL}${path}`;
}

export async function apiFetch(path, options = {}) {
  const method = (options.method ?? 'GET').toUpperCase();
  const headers = new Headers(options.headers ?? {});

  if (options.body && !(options.body instanceof FormData) && !headers.has('Content-Type')) {
    headers.set('Content-Type', 'application/json');
  }

  if (unsafeMethods.has(method) && !getCookie('csrftoken') && path !== '/auth/me/') {
    await fetch(buildUrl('/auth/me/'), { credentials: 'include' });
  }

  const csrfToken = getCookie('csrftoken');
  if (unsafeMethods.has(method) && csrfToken && !headers.has('X-CSRFToken')) {
    headers.set('X-CSRFToken', csrfToken);
  }

  return fetch(buildUrl(path), {
    credentials: 'include',
    ...options,
    method,
    headers,
  });
}

export async function apiRequest(path, options = {}) {
  const response = await apiFetch(path, options);
  const data = response.status === 204 ? null : await response.json();

  if (!response.ok) {
    throw new Error(data?.detail ?? 'Request failed');
  }

  return data;
}

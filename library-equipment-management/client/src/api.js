const API = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
export async function request(path, method = 'GET', body, signal) {
  const response = await fetch(API + path, {
    method, signal, credentials: 'include', headers: { 'Content-Type': 'application/json' },
    ...(body ? { body: JSON.stringify(body) } : {})
  });
  const data = await response.json();
  if (!response.ok) {
    if (response.status === 401 && path !== '/auth/login' && !(path === '/auth/me' && method === 'GET')) window.dispatchEvent(new Event('session-expired'));
    const error = new Error(data.message || 'Request failed'); error.status = response.status; throw error;
  }
  return data;
}

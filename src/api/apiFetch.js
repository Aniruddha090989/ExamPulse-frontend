
const API_BASE_URL = (
  import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080'
).replace(/\/+$/, '');

export function getStoredUser() {
  try {
    const storedUser =
      localStorage.getItem('user') ||
      sessionStorage.getItem('user');

    return storedUser ? JSON.parse(storedUser) : null;
  } catch (error) {
    console.error('Failed to read stored user:', error);
    return null;
  }
}

export async function apiFetch(endpoint, options = {}) {
  const user = getStoredUser();
  const headers = new Headers(options.headers || {});

  if (user?.token) {
    headers.set('Authorization', `Bearer ${user.token}`);
  }

  if (
    options.body &&
    typeof options.body === 'string' &&
    !headers.has('Content-Type')
  ) {
    headers.set('Content-Type', 'application/json');
  }

  const url = /^https?:\/\//i.test(endpoint)
    ? endpoint
    : `${API_BASE_URL}/${endpoint.replace(/^\/+/, '')}`;

  // Login and registration handle their own error toasts.
  const isAuthRequest =
    String(endpoint).includes('/api/auth/login') ||
    String(endpoint).includes('/api/auth/register');

  try {
    const response = await fetch(url, {
      ...options,
      headers,
    });

    // Centralized HTTP error notifications for non-auth requests.
    if (!response.ok && !isAuthRequest) {
      let message = `Request failed (${response.status}${
        response.statusText ? `: ${response.statusText}` : ''
      }).`;

      try {
        const payload = await response.clone().json();

        message =
          payload?.message ||
          payload?.error ||
          payload?.detail ||
          message;
      } catch {
        try {
          const text = (await response.clone().text()).trim();

          if (
            text &&
            text.length < 240 &&
            !text.startsWith('<!DOCTYPE')
          ) {
            message = text;
          }
        } catch {
          // Keep the status-based fallback.
        }
      }

      window.dispatchEvent(
        new CustomEvent('exampulse:toast', {
          detail: {
            message,
            type: response.status >= 500 ? 'error' : 'warning',
          },
        })
      );
    }

    return response;
  } catch (error) {
    // Avoid duplicate network-error toasts on login/register pages.
    if (!isAuthRequest) {
      window.dispatchEvent(
        new CustomEvent('exampulse:toast', {
          detail: {
            message: error?.message?.includes('Failed to fetch')
              ? 'Unable to connect to the server. Check your connection and try again.'
              : error?.message || 'A network error occurred.',
            type: 'error',
          },
        })
      );
    }

    throw error;
  }
}

export function clearStoredUser() {
  localStorage.removeItem('user');
  sessionStorage.removeItem('user');
}

export { API_BASE_URL };

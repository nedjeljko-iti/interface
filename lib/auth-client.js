const TOKEN_KEY = 'interface_token';

export function getToken() {
  return localStorage.getItem(TOKEN_KEY);
}

export function setToken(token) {
  localStorage.setItem(TOKEN_KEY, token);
}

export function removeToken() {
  localStorage.removeItem(TOKEN_KEY);
}

export function getUser() {
  const token = getToken();
  if (!token) return null;
  try {
    const payload = token.split('.')[1];
    return JSON.parse(atob(payload));
  } catch {
    return null;
  }
}

export function isLoggedIn() {
  const user = getUser();
  if (!user) return false;
  if (user.exp && user.exp * 1000 < Date.now()) {
    removeToken();
    return false;
  }
  return true;
}

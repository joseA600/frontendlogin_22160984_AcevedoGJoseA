const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api/v2';
const AUTH_URL = import.meta.env.VITE_AUTH_URL || 'http://localhost:3000/api/v1/auth';

const TOKEN_KEY = 'accessToken';
const USER_KEY = 'authUser';

export function obtenerToken() {
  return localStorage.getItem(TOKEN_KEY);
}

export function obtenerUsuarioGuardado() {
  try {
    const raw = localStorage.getItem(USER_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function guardarSesion(token, user) {
  localStorage.setItem(TOKEN_KEY, token);
  localStorage.setItem(USER_KEY, JSON.stringify(user));
}

export function limpiarSesion() {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(USER_KEY);
}


export async function peticion(ruta, metodo = 'GET', datos = null, baseUrl = API_URL) {
  const headers = {
    'Content-Type': 'application/json',
  };

  const token = obtenerToken();
  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  const opciones = { method: metodo, headers };

  if (datos) {
    opciones.body = JSON.stringify(datos);
  }

  const url = `${baseUrl}${ruta}`;
  let respuesta;

  try {
    respuesta = await fetch(url, opciones);
  } catch (error) {
    throw new Error('No se pudo conectar con el backend. Verifica que esté corriendo en ' + baseUrl);
  }

  const json = await respuesta.json().catch(() => ({}));

  if (respuesta.status === 401) {
    limpiarSesion();
    window.dispatchEvent(new Event('sesion-expirada'));
  }

  if (!respuesta.ok) {
    const errorMsg = json.message || json.error || `Error ${respuesta.status}: Solicitud fallida`;
    throw new Error(errorMsg);
  }

  return json;
}

export { API_URL, AUTH_URL };

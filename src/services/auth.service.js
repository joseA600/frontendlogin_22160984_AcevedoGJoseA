import {
  peticion,
  AUTH_URL,
  guardarSesion,
  limpiarSesion,
  obtenerToken,
  obtenerUsuarioGuardado,
} from './api';

export async function iniciarSesion(identifier, password) {
  const json = await peticion('/login', 'POST', { identifier, password }, AUTH_URL);
  guardarSesion(json.accessToken, json.user);
  return json;
}

export function obtenerUsuarioActual() {
  return peticion('/me', 'GET', null, AUTH_URL);
}

export function cerrarSesion() {
  limpiarSesion();
}

export function haySesionActiva() {
  return Boolean(obtenerToken());
}

export { obtenerToken, obtenerUsuarioGuardado };

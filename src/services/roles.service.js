import { peticion } from './api';

export function obtenerRoles() {
  return peticion('/roles');
}

export function obtenerRol(id) {
  return peticion(`/roles/${id}`);
}

export function crearRol(rol) {
  return peticion('/roles', 'POST', rol);
}

export function actualizarRol(id, rol) {
  return peticion(`/roles/${id}`, 'PUT', rol);
}

export function eliminarRol(id) {
  return peticion(`/roles/${id}`, 'DELETE');
}

import { peticion } from './api';

export function crearUsuario(usuario) {
  return peticion('/usuarios', 'POST', usuario);
}

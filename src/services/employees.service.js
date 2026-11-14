import { peticion } from './api';

// GET /employees -> lista todos los empleados
export function obtenerEmpleados() {
  return peticion('/employees');
}

export function obtenerEmpleado(id) {
  return peticion(`/employees/${id}`);
}

export function crearEmpleado(empleado) {
  return peticion('/employees', 'POST', empleado);
}

export function actualizarEmpleado(id, empleado) {
  return peticion(`/employees/${id}`, 'PUT', empleado);
}

export function eliminarEmpleado(id) {
  return peticion(`/employees/${id}`, 'DELETE');
}

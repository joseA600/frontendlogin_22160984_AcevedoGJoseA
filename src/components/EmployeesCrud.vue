<script setup>
import { ref, onMounted } from 'vue'
import {
  obtenerEmpleados,
  obtenerEmpleado,
  crearEmpleado,
  actualizarEmpleado,
  eliminarEmpleado,
} from '../services/employees.service'
import { crearUsuario } from '../services/usuarios.service'
import { obtenerRoles } from '../services/roles.service'

//estados reactivos
const mensaje = ref('')
const error = ref('')
const respuestaRaw = ref(null)
const roles = ref([])

//paneles
const mostrarCrear = ref(false)
const mostrarLista = ref(false)
const empleados = ref([])

//formulario de creación cuenta de acceso mas datos del empleado
const nuevo = ref({
  username: '',
  email: '',
  password: '',
  role_id: '',
  first_name: '',
  last_name: '',
  phone: '',
  is_active: true,
})

//consultar empleado (Ver uno)
const consultarId = ref('')
const empleadoConsultado = ref(null)

//editar empleado
const editar = ref({
  id: '',
  user_id: '',
  first_name: '',
  last_name: '',
  phone: '',
  job_title: '',
  is_active: true,
})

function avisar(txt, json = null) {
  mensaje.value = txt
  error.value = ''
  if (json) respuestaRaw.value = json
}

function fallar(err) {
  error.value = err.message || 'Error en la petición'
  mensaje.value = ''
}

function abrirNuevoEmpleado() {
  mostrarCrear.value = !mostrarCrear.value
  if (mostrarCrear.value) {
    error.value = ''
  }
}

function cerrarNuevoEmpleado() {
  mostrarCrear.value = false
  nuevo.value = {
    username: '',
    email: '',
    password: '',
    role_id: '',
    first_name: '',
    last_name: '',
    phone: '',
    is_active: true,
  }
}

//ver empleados
async function toggleLista() {
  mostrarLista.value = !mostrarLista.value
  if (mostrarLista.value) {
    await cargarEmpleados()
  }
}

async function cargarEmpleados() {
  try {
    const json = await obtenerEmpleados()
    empleados.value = json.data || []
    respuestaRaw.value = json
  } catch (e) {
    fallar(e)
  }
}

//cargar los roles para el menú 
async function cargarRoles() {
  try {
    const json = await obtenerRoles()
    roles.value = json.data || []
  } catch (e) {
    
  }
}

function limpiarPayload(obj) {
  const payload = { ...obj }
  for (const campo of ['phone', 'job_title']) {
    if (typeof payload[campo] === 'string') {
      payload[campo] = payload[campo].trim() || null
    }
  }
  return payload
}


async function ejecutarCrear() {
  const username = nuevo.value.username.trim()
  const email = nuevo.value.email.trim()
  const password = nuevo.value.password
  const roleId = Number(nuevo.value.role_id)
  const nombre = nuevo.value.first_name.trim()
  const apellido = nuevo.value.last_name.trim()

  if (!username) {
    error.value = 'El username es obligatorio'
    return
  }
  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    error.value = 'Ingresa un email válido'
    return
  }
  if (password.length < 8) {
    error.value = 'La contraseña debe tener al menos 8 caracteres'
    return
  }
  if (!Number.isInteger(roleId) || roleId <= 0) {
    error.value = 'Selecciona un rol'
    return
  }
  if (!nombre || !apellido) {
    error.value = 'Nombre y apellido del empleado son obligatorios'
    return
  }

  try {
    const jsonU = await crearUsuario({ username, email, password, role_id: roleId })
    const userId = jsonU.data.id

    const payload = limpiarPayload({
      user_id: Number(userId),
      first_name: nombre,
      last_name: apellido,
      phone: nuevo.value.phone,
      is_active: nuevo.value.is_active,
    })
    const jsonE = await crearEmpleado(payload)

    avisar(`Empleado "${nombre} ${apellido}" creado con su cuenta "${username}". Ya puede iniciar sesión con su contraseña.`, jsonE)
    cerrarNuevoEmpleado()
    if (mostrarLista.value) await cargarEmpleados()
  } catch (e) {
    fallar(e)
  }
}

async function ejecutarConsultar() {
  const id = consultarId.value.toString().trim()
  if (!id) {
    error.value = 'Ingresa un ID para consultar'
    return
  }

  try {
    const json = await obtenerEmpleado(id)
    empleadoConsultado.value = json.data
    avisar(`Empleado #${id} consultado correctamente`, json)
  } catch (e) {
    empleadoConsultado.value = null
    fallar(e)
  }
}

async function cargarDatosParaEditar() {
  const id = editar.value.id.toString().trim()
  if (!id) {
    error.value = 'Ingresa el ID del empleado que deseas editar'
    return
  }

  try {
    const json = await obtenerEmpleado(id)
    const emp = json.data
    editar.value = {
      id,
      user_id: emp.user_id,
      first_name: emp.first_name || '',
      last_name: emp.last_name || '',
      phone: emp.phone || '',
      job_title: emp.job_title || '',
      is_active: emp.is_active !== false,
    }
    avisar(`Datos del empleado #${id} cargados para editar`, json)
  } catch (e) {
    fallar(e)
  }
}

function limpiarFormularioEditar() {
  editar.value = {
    id: '',
    user_id: '',
    first_name: '',
    last_name: '',
    phone: '',
    job_title: '',
    is_active: true,
  }
}

async function ejecutarActualizar() {
  const id = editar.value.id.toString().trim()
  const nombre = editar.value.first_name.trim()
  const apellido = editar.value.last_name.trim()

  if (!id) {
    error.value = 'Ingresa el ID del empleado a actualizar'
    return
  }
  if (!nombre || !apellido) {
    error.value = 'Nombre y apellido no pueden estar vacíos'
    return
  }

  const userId = Number(editar.value.user_id)
  if (!Number.isInteger(userId) || userId <= 0) {
    error.value = 'user_id debe ser un entero positivo'
    return
  }

  try {
    const payload = limpiarPayload({
      user_id: userId,
      first_name: nombre,
      last_name: apellido,
      phone: editar.value.phone,
      job_title: editar.value.job_title,
      is_active: editar.value.is_active,
    })
    const json = await actualizarEmpleado(id, payload)
    avisar(`Empleado #${id} actualizado exitosamente`, json)
    limpiarFormularioEditar()
    if (mostrarLista.value) await cargarEmpleados()
  } catch (e) {
    fallar(e)
  }
}

async function ejecutarEliminar(emp) {
  if (!confirm(`¿Estás seguro de eliminar al empleado "${emp.first_name} ${emp.last_name}" (ID #${emp.id})?`)) return

  try {
    const json = await eliminarEmpleado(emp.id)
    avisar(`Empleado #${emp.id} eliminado correctamente`, json)
    if (empleadoConsultado.value && empleadoConsultado.value.id === emp.id) {
      empleadoConsultado.value = null
    }
    if (mostrarLista.value) await cargarEmpleados()
  } catch (e) {
    fallar(e)
  }
}

onMounted(cargarRoles)
</script>

<template>
  <div class="panel">
    <!-- Encabezado -->
    <header class="header">
      <div class="fila-titulo">
        <div>
          <h2>CRUD de Empleados</h2>
          <p>22160984 - Acevedo García José Antonio</p>
        </div>
        <button class="btn-primario" @click="abrirNuevoEmpleado">
          {{ mostrarCrear ? '✕ Cerrar formulario' : '＋ Nuevo Empleado' }}
        </button>
      </div>
    </header>

    <div v-if="mensaje" class="msg msg-ok">{{ mensaje }}</div>
    <div v-if="error" class="msg msg-err">{{ error }}</div>

    <section v-if="mostrarCrear" class="bloque">
      <h3>Nuevo Empleado (Crear)</h3>
      <form @submit.prevent="ejecutarCrear" class="formulario">
        <div class="subtitulo">Cuenta de acceso</div>
        <div class="fila-tres">
          <div class="campo">
            <label>Username:</label>
            <input v-model="nuevo.username" type="text" placeholder="Ej. ana28" maxlength="30" required />
          </div>
          <div class="campo input-grow">
            <label>Email:</label>
            <input v-model="nuevo.email" type="email" placeholder="Ej. ana@correo.com" maxlength="254" required />
          </div>
          <div class="campo input-grow">
            <label>Contraseña (mín. 8 caracteres):</label>
            <input v-model="nuevo.password" type="password" placeholder="••••••••" minlength="8" autocomplete="new-password" required />
          </div>
          <div class="campo">
            <label>Rol:</label>
            <select v-model="nuevo.role_id" required>
              <option value="" disabled>Selecciona un rol</option>
              <option v-for="rol in roles" :key="rol.id" :value="rol.id">{{ rol.name }}</option>
            </select>
          </div>
        </div>

        <div class="subtitulo">Datos del empleado</div>
        <div class="fila-tres">
          <div class="campo input-grow">
            <label>Nombre:</label>
            <input v-model="nuevo.first_name" type="text" placeholder="Ej. Ana" maxlength="100" required />
          </div>
          <div class="campo input-grow">
            <label>Apellido:</label>
            <input v-model="nuevo.last_name" type="text" placeholder="Ej. González" maxlength="100" required />
          </div>
          <div class="campo input-grow">
            <label>Teléfono:</label>
            <input v-model="nuevo.phone" type="text" placeholder="Ej. 5551234567" maxlength="20" />
          </div>
          <div class="campo check-campo">
            <label>
              <input v-model="nuevo.is_active" type="checkbox" /> Activo
            </label>
          </div>
        </div>

        <div class="fila-btns">
          <button type="submit" class="btn-primario">Crear Empleado</button>
          <button type="button" @click="cerrarNuevoEmpleado">Cancelar</button>
        </div>
      </form>
    </section>

    <div class="grid-cuadros">
      <section class="bloque">
        <h3>Consultar Empleado (Ver uno)</h3>
        <form @submit.prevent="ejecutarConsultar" class="formulario">
          <div class="campo">
            <label>ID del Empleado:</label>
            <div class="fila">
              <input v-model="consultarId" type="number" min="1" placeholder="Ej. 1" class="input-grow" required />
              <button type="submit">Consultar</button>
            </div>
          </div>
        </form>

        <div v-if="empleadoConsultado" class="resultado-consulta">
          <p><strong>ID:</strong> {{ empleadoConsultado.id }}</p>
          <p><strong>User ID:</strong> {{ empleadoConsultado.user_id }}</p>
          <p><strong>Nombre:</strong> {{ empleadoConsultado.first_name }} {{ empleadoConsultado.last_name }}</p>
          <p><strong>Teléfono:</strong> {{ empleadoConsultado.phone || '-' }}</p>
          <p><strong>Puesto:</strong> {{ empleadoConsultado.job_title || '-' }}</p>
          <p><strong>Activo:</strong> {{ empleadoConsultado.is_active ? 'Sí' : 'No' }}</p>
          <button type="button" class="btn-sm" @click="empleadoConsultado = null">Cerrar detalle</button>
        </div>
      </section>

      <section class="bloque">
        <h3>Editar Empleado (Actualizar)</h3>
        <form @submit.prevent="ejecutarActualizar" class="formulario">
          <div class="campo">
            <label>ID a editar:</label>
            <div class="fila">
              <input v-model="editar.id" type="number" min="1" placeholder="ID" class="input-grow" required />
              <button type="button" @click="cargarDatosParaEditar">Cargar</button>
            </div>
          </div>
          <div class="fila">
            <div class="campo">
              <label>User ID:</label>
              <input v-model="editar.user_id" type="number" min="1" placeholder="User ID" style="width: 100px;" required />
            </div>
            <div class="campo input-grow">
              <label>Nombre:</label>
              <input v-model="editar.first_name" type="text" placeholder="Nombre" maxlength="100" required />
            </div>
            <div class="campo input-grow">
              <label>Apellido:</label>
              <input v-model="editar.last_name" type="text" placeholder="Apellido" maxlength="100" required />
            </div>
          </div>
          <div class="fila">
            <div class="campo input-grow">
              <label>Teléfono:</label>
              <input v-model="editar.phone" type="text" placeholder="Teléfono" maxlength="20" />
            </div>
            <div class="campo input-grow">
              <label>Puesto:</label>
              <input v-model="editar.job_title" type="text" placeholder="Puesto" maxlength="60" />
            </div>
            <div class="campo check-campo">
              <label>
                <input v-model="editar.is_active" type="checkbox" /> Activo
              </label>
            </div>
          </div>
          <div class="fila-btns">
            <button type="submit" class="btn-primario">Guardar Cambios</button>
            <button type="button" @click="limpiarFormularioEditar">Limpiar</button>
          </div>
        </form>
      </section>
    </div>

    <section class="bloque">
      <button type="button" class="btn-desplegable" @click="toggleLista">
        {{ mostrarLista ? '▾ Ver empleados' : '▸ Ver empleados' }} ({{ empleados.length }})
      </button>
      <div v-if="mostrarLista" class="contenido-desplegable">
        <div class="fila-titulo">
          <h3>Listado de Empleados</h3>
          <button @click="cargarEmpleados">Recargar lista</button>
        </div>
        <table>
          <thead>
            <tr>
              <th style="width: 50px;">ID</th>
              <th style="width: 60px;">User</th>
              <th>Nombre</th>
              <th>Teléfono</th>
              <th>Puesto</th>
              <th style="width: 70px; text-align: center;">Activo</th>
              <th style="width: 100px; text-align: center;">Acciones</th>
            </tr>
          </thead>
          <tbody>
            <tr v-if="empleados.length === 0">
              <td colspan="7" style="text-align: center; color: #777;">
                No hay empleados registrados.
              </td>
            </tr>
            <tr v-for="emp in empleados" :key="emp.id">
              <td>#{{ emp.id }}</td>
              <td>{{ emp.user_id }}</td>
              <td><strong>{{ emp.first_name }} {{ emp.last_name }}</strong></td>
              <td>{{ emp.phone || '-' }}</td>
              <td>{{ emp.job_title || '-' }}</td>
              <td style="text-align: center;">{{ emp.is_active ? 'Sí' : 'No' }}</td>
              <td style="text-align: center;">
                <button class="btn-sm btn-eliminar" @click="ejecutarEliminar(emp)">Eliminar</button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </section>

    <section class="bloque">
      <details>
        <summary>Respuesta del microservicio (JSON)</summary>
        <pre class="json-box">{{ respuestaRaw }}</pre>
      </details>
    </section>
  </div>
</template>

<style scoped>
.panel {
  max-width: 900px;
  margin: 0 auto;
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.header {
  border-bottom: 2px solid #111;
  padding-bottom: 8px;
}

.header h2 {
  font-size: 20px;
  margin-bottom: 2px;
}

.header p {
  font-size: 13px;
  color: #555;
}

.msg {
  padding: 8px 12px;
  border: 1px solid #111;
  font-size: 13px;
}

.msg-ok {
  background: #f4f4f4;
}

.msg-err {
  background: #ffffff;
  border-left: 5px solid #111;
  font-weight: 600;
}

.grid-cuadros {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
}

@media (max-width: 680px) {
  .grid-cuadros {
    grid-template-columns: 1fr;
  }
}

.bloque {
  border: 1px solid #ccc;
  padding: 14px;
  background: #fff;
}

.bloque h3 {
  font-size: 14px;
  margin-bottom: 10px;
  border-bottom: 1px solid #eee;
  padding-bottom: 4px;
}

.subtitulo {
  font-size: 12px;
  font-weight: 700;
  text-transform: uppercase;
  color: #444;
  border-bottom: 1px dashed #ccc;
  padding-bottom: 2px;
}

.formulario {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.campo {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.campo label {
  font-size: 12px;
  font-weight: 600;
  text-transform: uppercase;
}

.check-campo label {
  display: flex;
  align-items: center;
  gap: 6px;
  text-transform: none;
  font-weight: 500;
  font-size: 13px;
}

.fila {
  display: flex;
  gap: 8px;
  align-items: flex-end;
}

.fila-tres {
  display: flex;
  gap: 12px;
  flex-wrap: wrap;
}

.input-grow {
  flex: 1;
  min-width: 160px;
}

.fila-btns {
  display: flex;
  gap: 8px;
  margin-top: 4px;
}

.fila-titulo {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 12px;
}

.btn-primario {
  background: #111;
  color: #fff;
  border: 1px solid #111;
  padding: 6px 14px;
  cursor: pointer;
  font-weight: 600;
  font-size: 13px;
}

.btn-primario:hover {
  background: #333;
}

.btn-desplegable {
  width: 100%;
  text-align: left;
  background: #f4f4f4;
  border: 1px solid #ccc;
  padding: 8px 12px;
  cursor: pointer;
  font-size: 14px;
  font-weight: 600;
}

.btn-desplegable:hover {
  background: #eee;
}

.contenido-desplegable {
  margin-top: 12px;
}

.resultado-consulta {
  margin-top: 10px;
  padding: 10px;
  background: #f9f9f9;
  border: 1px solid #111;
  font-size: 13px;
}

.resultado-consulta p {
  margin-bottom: 4px;
}

.btn-sm {
  padding: 3px 8px;
  font-size: 12px;
}

.btn-eliminar {
  border: 1px solid #a00;
  color: #a00;
  background: #fff;
}

.btn-eliminar:hover {
  background: #a00;
  color: #fff;
}

table {
  width: 100%;
  border-collapse: collapse;
  font-size: 13px;
}

th, td {
  border: 1px solid #ddd;
  padding: 6px 8px;
  text-align: left;
}

thead {
  background: #f0f0f0;
}

details summary {
  cursor: pointer;
  font-size: 13px;
  color: #444;
}

.json-box {
  background: #f7f7f7;
  border: 1px solid #ddd;
  padding: 8px;
  margin-top: 8px;
  font-size: 11px;
  overflow: auto;
  max-height: 180px;
  font-family: monospace;
}
</style>

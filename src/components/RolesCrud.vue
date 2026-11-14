<script setup>
import { ref, onMounted } from 'vue'
import {
  obtenerRoles,
  obtenerRol,
  crearRol,
  actualizarRol,
  eliminarRol,
} from '../services/roles.service'

// Estados reactivos
const roles = ref([])
const mensaje = ref('')
const error = ref('')
const respuestaRaw = ref(null)

// 1. Crear nuevo rol
const nuevoNombre = ref('')
const nuevaDescripcion = ref('')

// 2. Consultar rol (Ver uno)
const consultarId = ref('')
const rolConsultado = ref(null)

// 3. Editar rol
const editarId = ref('')
const editarNombre = ref('')
const editarDescripcion = ref('')

function avisar(txt, json = null) {
  mensaje.value = txt
  error.value = ''
  if (json) respuestaRaw.value = json
}

function fallar(err) {
  error.value = err.message || 'Error en la petición'
  mensaje.value = ''
}

// Listar todos los roles
async function cargarRoles() {
  try {
    const json = await obtenerRoles()
    roles.value = json.data || []
    respuestaRaw.value = json
  } catch (e) {
    fallar(e)
  }
}

// Crear rol
async function ejecutarCrear() {
  const nom = nuevoNombre.value.trim()
  if (!nom) {
    error.value = 'El nombre es obligatorio'
    return
  }

  try {
    const json = await crearRol({
      name: nom,
      description: nuevaDescripcion.value.trim() || null,
    })
    avisar('Rol creado exitosamente', json)
    nuevoNombre.value = ''
    nuevaDescripcion.value = ''
    await cargarRoles()
  } catch (e) {
    fallar(e)
  }
}

// Consultar un rol por ID
async function ejecutarConsultar() {
  const id = consultarId.value.toString().trim()
  if (!id) {
    error.value = 'Ingresa un ID para consultar'
    return
  }

  try {
    const json = await obtenerRol(id)
    rolConsultado.value = json.data
    avisar(`Rol #${id} consultado correctamente`, json)
  } catch (e) {
    rolConsultado.value = null
    fallar(e)
  }
}

// Cargar datos en el cuadro de editar al ingresar ID
async function cargarDatosParaEditar() {
  const id = editarId.value.toString().trim()
  if (!id) {
    error.value = 'Ingresa el ID del rol que deseas editar'
    return
  }

  try {
    const json = await obtenerRol(id)
    editarNombre.value = json.data.name
    editarDescripcion.value = json.data.description || ''
    avisar(`Datos del rol #${id} cargados para editar`, json)
  } catch (e) {
    fallar(e)
  }
}

// Guardar actualización de rol
async function ejecutarActualizar() {
  const id = editarId.value.toString().trim()
  const nom = editarNombre.value.trim()

  if (!id) {
    error.value = 'Ingresa el ID del rol a actualizar'
    return
  }
  if (!nom) {
    error.value = 'El nombre no puede estar vacío'
    return
  }

  try {
    const json = await actualizarRol(id, {
      name: nom,
      description: editarDescripcion.value.trim() || null,
    })
    avisar(`Rol #${id} actualizado exitosamente`, json)
    editarId.value = ''
    editarNombre.value = ''
    editarDescripcion.value = ''
    await cargarRoles()
  } catch (e) {
    fallar(e)
  }
}

// Eliminar rol
async function ejecutarEliminar(rol) {
  if (!confirm(`¿Estás seguro de eliminar el rol "${rol.name}" (ID #${rol.id})?`)) return

  try {
    const json = await eliminarRol(rol.id)
    avisar(`Rol #${rol.id} eliminado correctamente`, json)
    if (rolConsultado.value && rolConsultado.value.id === rol.id) {
      rolConsultado.value = null
    }
    await cargarRoles()
  } catch (e) {
    fallar(e)
  }
}

onMounted(cargarRoles)
</script>

<template>
  <div class="panel">
    <header class="header">
      <h2>CRUD de Roles</h2>
      <p>22160984 - Acevedo García José Antonio</p>
    </header>

    <div v-if="mensaje" class="msg msg-ok">{{ mensaje }}</div>
    <div v-if="error" class="msg msg-err">{{ error }}</div>

    <div class="grid-cuadros">
      <section class="bloque">
        <h3>1. Nuevo Rol (Crear)</h3>
        <form @submit.prevent="ejecutarCrear" class="formulario">
          <div class="campo">
            <label>Nombre:</label>
            <input v-model="nuevoNombre" type="text" placeholder="Ej. supervisor" maxlength="30" required />
          </div>
          <div class="campo">
            <label>Descripción:</label>
            <input v-model="nuevaDescripcion" type="text" placeholder="Ej. Supervisa operaciones" />
          </div>
          <button type="submit">Crear Rol</button>
        </form>
      </section>

      <section class="bloque">
        <h3>2. Consultar Rol (Ver uno)</h3>
        <form @submit.prevent="ejecutarConsultar" class="formulario">
          <div class="campo">
            <label>ID del Rol:</label>
            <div class="fila">
              <input v-model="consultarId" type="number" min="1" placeholder="Ej. 1" class="input-grow" required />
              <button type="submit">Consultar</button>
            </div>
          </div>
        </form>

        <div v-if="rolConsultado" class="resultado-consulta">
          <p><strong>ID:</strong> {{ rolConsultado.id }}</p>
          <p><strong>Nombre:</strong> {{ rolConsultado.name }}</p>
          <p><strong>Descripción:</strong> {{ rolConsultado.description || 'Sin descripción' }}</p>
          <button type="button" class="btn-sm" @click="rolConsultado = null">Cerrar detalle</button>
        </div>
      </section>
    </div>

    <section class="bloque">
      <h3>3. Editar Rol (Actualizar)</h3>
      <form @submit.prevent="ejecutarActualizar" class="formulario">
        <div class="fila-tres">
          <div class="campo">
            <label>ID a editar:</label>
            <div class="fila">
              <input v-model="editarId" type="number" min="1" placeholder="ID" style="width: 80px;" required />
              <button type="button" @click="cargarDatosParaEditar">Cargar</button>
            </div>
          </div>
          <div class="campo input-grow">
            <label>Nombre actualizado:</label>
            <input v-model="editarNombre" type="text" placeholder="Nombre" maxlength="30" required />
          </div>
          <div class="campo input-grow">
            <label>Descripción actualizada:</label>
            <input v-model="editarDescripcion" type="text" placeholder="Descripción" />
          </div>
        </div>
        <div class="fila-btns">
          <button type="submit">Guardar Cambios</button>
          <button type="button" @click="editarId = ''; editarNombre = ''; editarDescripcion = ''">Limpiar</button>
        </div>
      </form>
    </section>

    <section class="bloque">
      <div class="fila-titulo">
        <h3>4. Listado de Roles ({{ roles.length }})</h3>
        <button @click="cargarRoles">Recargar lista</button>
      </div>

      <table>
        <thead>
          <tr>
            <th style="width: 60px;">ID</th>
            <th>Nombre</th>
            <th>Descripción</th>
            <th style="width: 100px; text-align: center;">Acción</th>
          </tr>
        </thead>
        <tbody>
          <tr v-if="roles.length === 0">
            <td colspan="4" style="text-align: center; color: #777;">
              No hay roles registrados.
            </td>
          </tr>
          <tr v-for="rol in roles" :key="rol.id">
            <td>#{{ rol.id }}</td>
            <td><strong>{{ rol.name }}</strong></td>
            <td>{{ rol.description || '-' }}</td>
            <td style="text-align: center;">
              <button class="btn-sm" @click="ejecutarEliminar(rol)">Eliminar</button>
            </td>
          </tr>
        </tbody>
      </table>
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
  max-width: 850px;
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

.fila {
  display: flex;
  gap: 8px;
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
  margin-bottom: 10px;
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

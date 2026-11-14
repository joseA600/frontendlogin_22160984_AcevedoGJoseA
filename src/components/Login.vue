<script setup>
import { ref } from 'vue'
import { iniciarSesion } from '../services/auth.service'

const emit = defineEmits(['login'])

const identifier = ref('')
const password = ref('')
const cargando = ref(false)
const error = ref('')

async function ejecutarLogin() {
  const id = identifier.value.trim()
  if (!id || !password.value) {
    error.value = 'Ingresa tu usuario/correo y contraseña'
    return
  }

  cargando.value = true
  error.value = ''
  try {
    const json = await iniciarSesion(id, password.value)
    emit('login', json.user)
  } catch (e) {
    error.value = e.message || 'No se pudo iniciar sesión'
  } finally {
    cargando.value = false
  }
}
</script>

<template>
  <div class="login-wrap">
    <section class="login-bloque">
      <header class="login-header">
        <h2>Iniciar Sesión</h2>
        <p>22160984 - Acevedo García José Antonio</p>
      </header>

      <div v-if="error" class="msg msg-err">{{ error }}</div>

      <form @submit.prevent="ejecutarLogin" class="formulario">
        <div class="campo">
          <label for="identifier">Usuario o correo:</label>
          <input
            id="identifier"
            v-model="identifier"
            type="text"
            placeholder="Ej. ana28 o ana@correo.com"
            autocomplete="username"
            required
          />
        </div>
        <div class="campo">
          <label for="password">Contraseña:</label>
          <input
            id="password"
            v-model="password"
            type="password"
            placeholder="••••••••"
            autocomplete="current-password"
            required
          />
        </div>
        <button type="submit" :disabled="cargando">
          {{ cargando ? 'Ingresando…' : 'Entrar' }}
        </button>
      </form>
    </section>
  </div>
</template>

<style scoped>
.login-wrap {
  min-height: 80vh;
  display: flex;
  align-items: center;
  justify-content: center;
}

.login-bloque {
  width: 100%;
  max-width: 400px;
  border: 1px solid #ccc;
  background: #fff;
  padding: 20px;
  display: flex;
  flex-direction: column;
  gap: 14px;
}

.login-header {
  border-bottom: 2px solid #111;
  padding-bottom: 8px;
}

.login-header h2 {
  font-size: 20px;
  margin-bottom: 2px;
}

.login-header p {
  font-size: 13px;
  color: #555;
}

.msg {
  padding: 8px 12px;
  border: 1px solid #111;
  font-size: 13px;
}

.msg-err {
  background: #ffffff;
  border-left: 5px solid #111;
  font-weight: 600;
}

.formulario {
  display: flex;
  flex-direction: column;
  gap: 12px;
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

</style>

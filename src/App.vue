<template>
  <router-view/>
</template>

<script>
export default {
  name: 'App'
}
</script>

<style>
/* Estilos Globales */
html {
  /* font-size: 100%; */ /* Se elimina la regla para usar el tamaño por defecto del navegador */
}

body {
  margin: 0;
  background: #121212;
  color: #fff;
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}
</style>

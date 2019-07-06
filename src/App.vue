<template>
  <div id="app">
    <div class="nav">
      <router-link class="router" to="/f1">Go to F1</router-link>
      <router-link class="router" to="/f2">Go to F2</router-link>
      <router-link class="router" to="/">Go to Index</router-link>
    </div>
    <keep-alive>
      <router-view></router-view>
    </keep-alive>
  </div>
</template>

<script>
// import HelloWorld from './components/HelloWorld.vue'

export default {
  name: 'app',
  components: {
    // HelloWorld
  }
}
</script>

<style>
#app {
  font-family: 'Avenir', Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
  margin-top: 60px;
}
.nav {
  text-align: left;
}
.router {
  display: block;
}
</style>

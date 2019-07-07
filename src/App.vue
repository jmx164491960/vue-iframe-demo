<template>
  <div id="app">
    <div class="nav">
      <router-link class="router" to="/f1">Go to F1</router-link>
      <router-link class="router" to="/f2">Go to F2</router-link>
      <router-link class="router" to="/index">Go to Index</router-link>
    </div>

    <iframe-router-view></iframe-router-view>
  </div>
</template>

<script>
import iframeRouterView from './components/iframe-router-view';
export default {
  name: 'app',
  components: {
    iframeRouterView
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

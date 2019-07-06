<template>
  <div id="app">
    <div class="nav">
      <router-link class="router" to="/f1">Go to F1</router-link>
      <router-link class="router" to="/f2">Go to F2</router-link>
      <router-link class="router" to="/index">Go to Index</router-link>
    </div>
    
    <!-- <keep-alive>
      <router-view></router-view>
    </keep-alive>
    
    <f1 v-show="$route.path == '/f1'"></f1>
    <f2 v-show="$route.path == '/f2'"></f2> -->
    <iframe-router-view></iframe-router-view>
  </div>
</template>

<script>
import iframeRouterView from './components/iframe-router-view';
import F1 from './components/f1';
import F2 from './components/f2';
export default {
  name: 'app',
  components: {
    F1,
    F2,
    iframeRouterView
  },
  watch: {
    $route() {
      if (this.$route.meta) {
        console.log(this.$route.path);
      }
    }
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

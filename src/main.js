import Vue from 'vue/dist/vue.js'
import App from './App.vue'
import VueRouter from 'vue-router';
// import f1 from './components/f1';
// import f2 from './components/f2';

const Index = { template: '<div>Index</div>' }
const routes = [
  {
    path: '/f1',
    name: 'f1',
    // component: f1,
    meta: {
      iframe: true
    }
  },
  {
    path: '/f2',
    name: 'f2',
    // component: f2,
    meta: {
      iframe: true
    }
  },
  {
    path: '/index',
    component: Index
  }
]

const router = new VueRouter({
  routes // （缩写）相当于 routes: routes
});
Vue.config.productionTip = false

Vue.use(VueRouter);
new Vue({
  render: h => h(App),
  router
}).$mount('#app')

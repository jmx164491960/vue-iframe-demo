## 前言
最近一个需求，需要在**Vue**项目中加入**含有iframe**的页面，同时在路由切换的过程中，要求iframe的内容**不会被刷新**。一开始使用了Vue自带的keep- alive发现没有用，于是自己研究了一下解决方案。。。。。。

## Vue的keep-alive原理
要实现对保持iframe页的状态。我们先搞清楚为什么Vue的keep-alive不能凑效。keep-alive原理是把组件里的节点信息保留在了**VNode**（在内存里），在需要渲染时候从Vnode渲染到真实DOM上。iframe页里的内容并不属于节点的信息，所以使用keep-alive依然会重新渲染iframe内的内容。**另外**，我也尝试有过想法：如果把整个iframe节点保存起来，然后需要切换时把它渲染到目标节点上，能否实现iframe页不被刷新呢？————也是不可行的，iframe每一次渲染就相当于打开一个新的网页窗口，即使把节点保存下来，在渲染时iframe页还是刷新的。

## 实现的思路
既然保持iframe页里的状态很难实现，在这个时候我想到了一个别的方法。能否在Vue的route-view节点上动点手脚？使得在切换**非iframe页**的时候使用Vue的路由，当切换**iframe页**时则使用**v-show**切换显示与隐藏，使得iframe节点**一直不被删除**，这样就能保持iframe的状态了。

我们简陋的实现一下以上的效果，上代码：

入口main.js:
```
import Vue from 'vue/dist/vue.js'
import App from './App.vue'
import VueRouter from 'vue-router';

const Index = { template: '<div>Index</div>' }
const routes = [
  // 含有iframe的两个页面
  {
    path: '/f1',
    name: 'f1'
  },
  // 含有iframe的两个页面
  {
    path: '/f2',
    name: 'f2'
  },
  {
    path: '/index',
    component: Index
  }
]

const router = new VueRouter({
  routes
});

Vue.use(VueRouter);
new Vue({
  render: h => h(App),
  router
}).$mount('#app')

```
根组件:

```
<template>
  <div id="app">
    <div class="nav">
      <router-link class="router" to="/f1">Go to F1</router-link>
      <router-link class="router" to="/f2">Go to F2</router-link>
      <router-link class="router" to="/index">Go to Index</router-link>
    </div>
    
    <keep-alive>
      <!-- Vue的路由 -->
      <router-view></router-view>
    </keep-alive>
    
    <!-- iframe页面 -->
    <f1 v-show="$route.path == '/f1'"></f1>
    <f2 v-show="$route.path == '/f2'"></f2>
  </div>
</template>

<script>
import F1 from './components/f1';
import F2 from './components/f2';
export default {
  name: 'app',
  components: {
    F1,
    F2
  },
  
}
</script>
```
上面代码简单来说，关键的地方首先是main.js初始化路由时，对iframe页不填写属性component，这样页面就是空白的。然后在**router-view**节点旁边渲染iframe页组件，使用$route.path判断当前路由的指向，控制iframe页的**显示与隐藏**。

上面代码简单的解决了问题，但还有一些地方可以优化：
1. iframe页在根节点App.vue一渲染时**已经渲染**了，对此iframe页可以做成**懒加载**，只有在进入过相应页面了触发渲染，并且渲染过之后就用v-show切换显示与隐藏
2. 每当增加一个iframe页都要增加一段的组件引入注册和调用的代码。比较**繁琐**。我们目标应该做到每增加一个iframe页，只需要添加尽量少的代码。这里思路是：
    1. 在路由配置中定义一个属性，用于**标识该页面是否含有iframe**的页面
    2. 根据标识，iframe页组件**自动动态注册和渲染**，无需再手写额外的代码
    3. router-view和iframe切换的逻辑封装成**新组件**，用它**替代原有的router-view**

我们先修改router的配置,增加一个属性名iframeComponent，用于标识是否包含iframe，该属性的值是组件文件引用

main.js:
```
import F1 from './components/f1';
import F2 from './components/f2';

const routes = [
  {
    path: '/f1',
    name: 'f1',
    iframeComponent: F1 // 用于标识是否含有iframe页
  },
  {
    path: '/f2',
    name: 'f2',
    iframeComponent: F2 // 用于标识是否含有iframe页
  },
  {
    path: '/index',
    component: { template: '<div>Index</div>' }
  }
]

const router = new VueRouter({
  routes // （缩写）相当于 routes: routes
});

new Vue({
  render: h => h(App),
  router
}).$mount('#app')

```

接下来我们第二步和第三步结合在一起，封装新的组件iframe-router-view.vue：
```
<template>
    <div>
        <!-- Vue的router-view -->
        <keep-alive>
            <router-view></router-view>
        </keep-alive>

        <!-- iframe页 -->
        <component
            v-for="item in hasOpenComponentsArr"
            :key="item.name"
            :is="item.name"
            v-show="$route.path === item.path"
        ></component>
    </div>
</template>

<script>
import Vue from 'vue/dist/vue.js'
export default {
    created() {
        // 设置iframe页的数组对象
        const componentsArr = this.getComponentsArr();
        componentsArr.forEach((item) => {
            Vue.component(item.name, item.component);
        });
        this.componentsArr = componentsArr;
        // 判断当前路由是否iframe页
        this.isOpenIframePage();
    },
    data() {
        return {
            componentsArr: [] // 含有iframe的页面
        }
    },
    watch: {
        $route() {
            // 判断当前路由是否iframe页
            this.isOpenIframePage();
        }
    },
    computed: {
        // 实现懒加载，只渲染已经打开过（hasOpen:true）的iframe页
        hasOpenComponentsArr() {
            return this.componentsArr.filter(item => item.hasOpen);
        }
    },
    methods: {
        // 根据当前路由设置hasOpen
        isOpenIframePage() {
            const target = this.componentsArr.find(item => {
                return item.path === this.$route.path
            });
            if (target && !target.hasOpen) {
                target.hasOpen = true;
            }
        },
        // 遍历路由的所有页面，把含有iframeComponent标识的收集起来
        getComponentsArr() {
            const router = this.$router;
            const routes = router.options.routes;
            const iframeArr = routes.filter(item => item.iframeComponent);
            
            return iframeArr.map((item) => {
                const name = item.name || item.path.replace('/', '');
                return {
                    name: name,
                    path: item.path,
                    hasOpen: false, // 是否打开过，默认false
                    component: item.iframeComponent // 组件文件的引用
                };
            });
        }
    }
}
</script>
```
1. 该组件主要做的是根据main.ja里的routes生成一个只含有iframe页的数组对象。
2. watch上监听$route，判断当前页面在iframe页列表里的话就设置hasOpen属性为true，渲染该组件
3. 用v-show="$route.path === item.path"切换iframe页的显示与隐藏。

逻辑并不复杂，这里就不多赘述。

## 结语
大家如果有更好的实现方法，或者我上面还有什么需要更正的错误，欢迎交流。
上面demo的代码放在了个人github上[https://github.com/jmx164491960/vue-iframe-demo](https://github.com/jmx164491960/vue-iframe-demo)
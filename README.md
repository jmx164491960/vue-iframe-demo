## 前言
最近需要在Vue中加入含有iframe的页面，同时在切换路由的过程中，保持iframe的状态。一开始直接使用了keep alive发现没有用，于是自己研究了一下解决方案。。。。。。

## Vue的keep-alive原理
要实现对保持含有iframe页面的状态。我们先搞清楚为什么Vue的keep-alive不能对含有iframe的页面凑效。keep-alive组件把DOM的节点信息保留在了VNode（在内存里），在需要渲染的时候再从Vnode渲染到真实DOM上。iframe网页里的内容并不属于节点的信息，所以keep-alive对其是无效的。如果把整个iframe节点保存起来，然后需要切换的时候把渲染到目标父节点上，能否实现iframe状态的保持呢？——也是不可行的，iframe每一次渲染就相当于打开一个新的网页窗口，即使把节点保存下来，渲染的时候还是iframe内的内容还是重新加载的。

## 实现的思路
既然iframe的状态保持很难实现，在这个时候我想到了一个别的方法。能否在Vue的route-view节点上动点手脚，使得在切换非iframe页的时候使用Vue的路由，当切换iframe页的时候则使用v-show实现显示与隐藏，使得iframe节点一直不被删除，这样就能保持iframe的状态了。

我们简陋的实现以下以上的效果，上代码：

main.js:
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
Vue.config.productionTip = false

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
上面代码简单来说，关键的地方首先是main.js设置路由的时候，不要对含有iframe填写属性component，这样页面就是空白的。然后我们再在router-view节点隔壁渲染我们的iframe页组件，同时用$route.path当前路由指向哪一个页面，实现对iframe页的显示隐藏。

上面的代码比较简陋：
1. iframe页在根节点一渲染的时候就已经渲染出来了，这里我们可以做成懒加载，只有在进入对应页面了才渲染，渲染一次之后用v-show切换显示与隐藏
2. 上面的实现，每增加一个iframe页都要增加一段组件的引入注册和调用的代码。比较繁琐。我们目标应该做到每增加一个iframe页，只需要修改一个参数。这里思路是：
    1. 在router配置中定义一个变量，标识该页面是否含有iframe的页面
    2. 根据标识，包含iframe的组件动态注册和渲染，无需再手写额外的代码
    3. router-view和iframe切换的逻辑封装成新组件，用它替代原有的router-view

我们先修改router的配置,增加一个属性名iframeComponent，用于标识是否包含iframe，该属性的值是组件文件引用

main.js:
```
import Vue from 'vue/dist/vue.js'
import App from './App.vue'
import VueRouter from 'vue-router';
import F1 from './components/f1';
import F2 from './components/f2';

const Index = { template: '<div>Index</div>' }
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
    component: Index,
    children: [
      {
        path: '/f3',
        iframe: true
      }
    ]
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
上面demo的代码放在了github 
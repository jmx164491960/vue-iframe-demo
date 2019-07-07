<template>
    <div>
        <keep-alive>
        <router-view></router-view>
        </keep-alive>

        <component
            v-for="com in hasOpenComponentsArr"
            :key="com.name"
            :is="com.name"
            v-show="$route.path === com.path"
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
            componentsArr: []
        }
    },
    watch: {
        $route() {
            this.isOpenIframePage();
        }
    },
    computed: {
        hasOpenComponentsArr() {
            return this.componentsArr.filter(item => item.hasOpen);
        }
    },
    methods: {
        isOpenIframePage(a) {
            const target = this.componentsArr.find(item => {
                return item.path === this.$route.path
            });
            if (target) {
                target.hasOpen = true;
            }
        },
        getComponentsArr() {
            const router = this.$router;
            const routes = router.options.routes;
            const iframeArr = routes.filter(item => item.iframeComponent);
            let componentsArr = [];
            iframeArr.forEach((item) => {
                const name = item.name || item.path.replace('/', '');
                componentsArr.push({
                    name: name,
                    path: item.path,
                    hasOpen: false,
                    component: item.iframeComponent
                });
            });
            return componentsArr;
        }
    }
}
</script>


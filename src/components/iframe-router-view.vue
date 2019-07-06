<template>
    <div>
        <keep-alive>
        <router-view></router-view>
        </keep-alive>

        <component
            v-for="com in componentsArr"
            :key="com.name"
            :is="com.name"
            v-if="com.hasOpen"
            v-show="$route.path === com.path"
        ></component>
    </div>
</template>

<script>
import Vue from 'vue/dist/vue.js'
export default {
    created() {
        const router = this.$router;
        const routes = router.options.routes;
        const iframeArr = routes.filter(item => item.iframe === true);
        let componentsArr = [];
        iframeArr.forEach((item) => {
            const name = item.name || item.path.replace('/', '');
            // const compoent = item.component;
            // 注册组件
            // Vue.components(name, compoent);
            componentsArr.push({
                name: name,
                path: item.path,
                hasOpen: false
            });
        });
        this.componentsArr = componentsArr;
    },
    data() {
        return {
            componentsArr: []
        }
    },
    watch: {
        $route() {
            const target = this.componentsArr.find(item => {
                return item.path === this.$route.path
            });
            if (target) {
                target.hasOpen = true;
            }
        }
    }
}
</script>


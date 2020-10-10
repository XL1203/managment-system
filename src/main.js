import Vue from 'vue'
import App from './App.vue'
import router from './router'
import axios from "axios"
import './plugins/element'
//导入字体图标
import './assets/fonts/iconfont.css'
//导入全局样式
import './assets/css/global.css'
//导入'vue-table-with-tree-grid'
import ZkTable from 'vue-table-with-tree-grid'

Vue.use(ZkTable)

// 配置请求的根路径
axios.defaults.baseURL = 'https://www.liulongbin.top:8888/api/private/v1/'

//axios请求拦截
axios.interceptors.request.use(config => {
    //为请求头对象添加 Token 验证的 Authorization 字段
    config.headers.Authorization = window.sessionStorage.getItem('token')
    return config
})
Vue.prototype.$http = axios;

Vue.config.productionTip = false

new Vue({
    router,
    render: h => h(App)
}).$mount('#app')
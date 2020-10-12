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
//导入 'vue-quill-editor'
import VueQuillEditor from 'vue-quill-editor'
// require styles
import 'quill/dist/quill.core.css'
import 'quill/dist/quill.snow.css'
import 'quill/dist/quill.bubble.css'

Vue.use(VueQuillEditor)
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

//给时间添加全局过滤器
Vue.filter('dateFormate', function(val) {
    const date = new Date(val)
    const year = date.getFullYear()
    const month = (date.getMonth() + 1 + '').padStart(2, '0')
    const day = (date.getDate() + '').padStart(2, '0')
    const hour = (date.getHours() + '').padStart(2, '0')
    const minutes = (date.getMinutes() + '').padStart(2, '0')
    const seconds = (date.getSeconds() + '').padStart(2, '0')

    return `${year}-${month}-${day} ${hour}:${minutes}:${seconds}`
})

new Vue({
    router,
    render: h => h(App)
}).$mount('#app')
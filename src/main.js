import Vue from 'vue';
import VueResource from 'vue-resource';
import Vuex from 'vuex'
import ElementUI from 'element-ui';
import 'element-ui/lib/theme-chalk/index.css';
import './assets/main.css';
import router from "./router";
import App from './App';

Vue.config.productionTip = false
Vue.use(ElementUI);
Vue.use(VueResource);
Vue.use(Vuex);

console.log("Powered by ControlCenter-web v1.0.2\nhttps://github.com/johnpoint/ControlCenter-web")
const store = new Vuex.Store({
    state: {
        jwt: '',
        isLogin: false,
        userInfo: null,
        ws:null
    },
    mutations: {
        setjwt(state, jwt) {
            state.jwt = jwt
        },
        setStatus(state, bool) {
            state.isLogin = bool
        },
        setUserInfo(state, data) {
            state.userInfo = data
        },
        setTimer(state, timer) {
            state.timer = timer
        },
        setServer(state, data) {
            state.viewServer = data
        }
    }
})

new Vue({
    router,
    store: store,
    render: h => h(App)
}).$mount('#app')
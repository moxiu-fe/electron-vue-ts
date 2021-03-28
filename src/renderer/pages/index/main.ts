import Vue from 'vue';
import Index from './Index.vue';
import router from './router';
import store from './store';
import http from '@renderer/common/http';
import Toast from '@renderer/plugins/toast.plugin';

import '@renderer/assets/styles/reset.css';
import '@renderer/configs/vue.config';

Vue.use(Toast);
Vue.prototype.$http = http;

new Vue({ router, store, render: h => h(Index) }).$mount('#app');

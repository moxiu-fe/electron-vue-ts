import Vue from 'vue';
import UpdateDownload from './updatedownload.vue';

import '@renderer/assets/styles/reset.css';
require('@renderer/configs/vue.config');

new Vue({ render: h => h(UpdateDownload) }).$mount('#app');

import Vue from 'vue';
import Update from './update.vue';

import '@renderer/assets/styles/reset.css';
require('@renderer/configs/vue.config');

new Vue({ render: h => h(Update) }).$mount('#app');

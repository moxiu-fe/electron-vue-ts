import Vue from 'vue';
import { timeFormat } from '@common/helper';
import { semanticTimeFormat } from '@renderer/common/helper';

Vue.filter('timeFormat', timeFormat); // 全局过滤器：时间格式化
Vue.filter('semanticTimeFormat', semanticTimeFormat); // 全局过滤器：时间语义化

import toast from '@renderer/components/Toast/Toast.vue';
import { isObject } from '@common/helper';

export interface ToastShowOptions {
  text: string;
  icon?: string;
  delay?: number;
}

export interface ToastInstance {
  show: (option: string | ToastShowOptions) => void
  hide: () => void
}

export default {
  install(Vue) {
    const Toast = Vue.extend(toast);
    const $vm = new Toast().$mount(document.createElement('div'));
    document.body.appendChild($vm.$el);

    Vue.prototype.$toast = {
      show(options: string | ToastShowOptions) {
        if (!isObject(options)) options = { text: options } as ToastShowOptions;
        $vm.show(options);
      },
      hide() {
        if ($vm) $vm.hide();
      }
    };
  }
};

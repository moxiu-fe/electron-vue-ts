import { HttpInstance } from '@renderer/common/http';
import { ToastInstance } from '@renderer/plugins/toast.plugin';

declare module 'vue/types/vue' {
  interface Vue {
    $http?: HttpInstance,
    $toast?: ToastInstance
  }
}

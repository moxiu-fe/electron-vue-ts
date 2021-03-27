<template>
  <transition name="toast-fade">
    <div class="toast-body" v-show="isShow">
      <i :class="icon" class="toast-body__icon" v-if="icon"></i>
      {{text}}
    </div>
  </transition>
</template>

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator';

interface Options {
  text: string;
  icon?: string;
  delay?: number;
}

@Component
export default class Toast extends Vue {
  isShow: boolean = false;

  text: string = '';

  icon: string = '';

  timer: number | null = null;

  show(options: Options): void {
    this.isShow = true;
    this.text = options.text || '';
    this.icon = options.icon || '';
    clearTimeout(this.timer);
    this.timer = window.setTimeout(() => {
      this.isShow = false;
      clearTimeout(this.timer);
    }, options.delay || 1500);
  }

  hide(): void {
    this.isShow = false;
    clearTimeout(this.timer);
  }
}
</script>

<style scoped>
.toast-fade-enter-active,
.toast-fade-leave-active {
  transition: all 400ms cubic-bezier(0.36, 0.66, 0.04, 1);
}

.toast-fade-leave-to {
  opacity: 0;
  transform: scale(0);
}

/* .toast-wrapper {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: transparent;
  z-index: 101;
} */

.toast-body {
  z-index: 101;
  position: fixed;
  box-sizing: border-box;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  background: rgba(0, 0, 0, 0.6);
  color: #fff;
  min-width: 80px;
  max-width: 80%;
  text-align: center;
  border-radius: 5px;
  padding: 10px;
  overflow: hidden;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  font-size: 12px;
  line-height: 14px;
  color: #fff;
  text-align: center;
}

.toast-body__icon {
  margin-right: 2px;
}
</style>

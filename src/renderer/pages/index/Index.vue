<template>
  <div id="app">
    <div id="nav">
      <router-link to="/">Home</router-link>|
      <router-link to="/about">About</router-link>
    </div>
    <router-view />
  </div>
</template>

<script lang="ts">
import { ipcRenderer } from 'electron';
import { Component, Vue } from 'vue-property-decorator';

@Component
export default class Index extends Vue {
  created() {
    ipcRenderer.on('did-finish-load-msg', (event: any, data: string) => {
      console.log(data);
    });
  }

  destroyed() {
    ipcRenderer.removeAllListeners('did-finish-load-msg');
  }
}
</script>

<style lang="scss">
#app {
  height: 100%;
  width: 100%;
  box-sizing: border-box;
  font-family: 'Microsoft YaHei', 'Avenir', Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  background: transparent;
}

#nav {
  padding: 30px;

  a {
    font-weight: bold;
    color: #2c3e50;

    &.router-link-exact-active {
      color: #42b983;
    }
  }
}
</style>

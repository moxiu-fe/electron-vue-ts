<template>
  <div class="home">
    <div class="logo-wrapper">
      <img alt="Vue logo" src="../../../assets/images/logo_vue.png" />
      <span class="plus-sign">+</span>
      <img alt="Electron logo" src="../../../assets/images/logo_electron.png" />
      <span class="plus-sign">+</span>
      <img alt="TypeScript logo" src="../../../assets/images/logo_typescript.png" />
    </div>

    <p class="title">Welcome to Your Electron + Vue.js + TypeScript App</p>

    <ul class="versions-list">
      <li class="versions-list__item">electron: v{{versions.electron}}</li>
      <li class="versions-list__item">vue.js: v2.6.12</li>
      <li class="versions-list__item">typescript: v3.8.3</li>
      <li class="versions-list__item">node: v{{versions.node}}</li>
      <li class="versions-list__item">chrome: v{{versions.chrome}}</li>
      <li class="versions-list__item">arch: {{arch}}</li>
      <li class="versions-list__item">platform: {{platform}}</li>
    </ul>
  </div>
</template>

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator';

@Component
export default class Home extends Vue {
  versions = process.versions;

  arch = process.arch;

  platform = process.platform;
}
</script>
<style>
.logo-wrapper {
  display: flex;
  flex-direction: row;
  justify-content: center;
  align-items: center;
}

.plus-sign {
  font-size: 36px;
  margin: 0 20px;
}

.title {
  margin: 40px 0;
}
.versions-list {
  margin: 40px 0 0 0;
}
.versions-list__item {
  margin: 10px 0;
}
</style>

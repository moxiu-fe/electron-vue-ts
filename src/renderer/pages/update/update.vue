<template>
  <div id="app" style="-webkit-app-region: drag">
    <img class="logo" src="../../assets/images/logo.png" />
    <div class="update-confirm">
      <el-card class="box-card" shadow="never" style="-webkit-app-region: drag">
        <div class="clearfix" slot="header">
          <span>检测到新版本V{{updateInfo.version}}，本次更新：</span>
        </div>
        <div :key="index" class="text" v-for="(note,index) in updateInfo.releaseNotes.split(',')">{{note}}</div>
      </el-card>
      <el-row class="btn-wrap">
        <el-button @click.prevent="cancel" round>下次再说</el-button>
        <el-button @click.prevent="update" round type="primary">立即更新</el-button>
      </el-row>
    </div>
  </div>
</template>

<script lang='ts'>
import { ipcRenderer } from 'electron';
import { Component, Vue } from 'vue-property-decorator';

@Component
export default class Update extends Vue {
  updateInfo: { version: String; releaseNotes: String } = { version: '', releaseNotes: '' };

  update() {
    ipcRenderer.send('download-update');
  }

  cancel() {
    ipcRenderer.send('handle-window', 'update', 'close');
  }

  mounted() {
    ipcRenderer.on('did-finish-load-msg', (event, msg) => {
      this.updateInfo = msg;
    });
  }

  destroyed() {
    ipcRenderer.removeAllListeners('did-finish-load-msg');
  }
}
</script>

<style lang="scss">
#app {
  position: relative;
  height: 100%;
  width: 100%;
  box-sizing: border-box;
  font-family: 'Microsoft YaHei', 'Avenir', Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #000000;
  user-select: none;
}

.watermark {
  user-select: none; /* CSS3属性 */
  pointer-events: none; /*阻止手势事件*/
}

.clearfix:before,
.clearfix:after {
  display: table;
  content: '';
}
.clearfix:after {
  clear: both;
}

.logo {
  position: absolute;
  left: 20px;
  top: 40px;
  display: inline-block;
  width: 80px;
  height: 80px;
}

.update-confirm {
  padding-left: 120px;
  padding-top: 30px;
  width: 100%;
  height: 100%;
  box-sizing: border-box;
  .box-card {
    text-align: left;
    width: 100%;
    background: transparent !important;
    border: 0 !important;
    .el-card__header {
      margin-top: 30px;
      border: 0;
      padding: 0;
    }
    .el-card__body {
      max-height: 200px;
      overflow-y: scroll;
      margin-top: 20px;
      padding: 0;
      // font-size: 14px;
      // line-height: 20px;
    }
    // color: #2c3e50 !important;
  }

  .text {
    font-size: 14px;
    line-height: 20px;
  }

  .btn-wrap {
    position: absolute !important;
    bottom: 20px;
    right: 20px;
  }
}
</style>

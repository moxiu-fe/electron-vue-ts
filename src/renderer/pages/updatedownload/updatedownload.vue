<template>
  <div id="app" style="-webkit-app-region: drag">
    <img class="logo" src="../../assets/images/logo.png" />
    <div class="update-download">
      <div class="text">版本{{updateInfo.version}}正在下载中: {{progress()}}</div>
      <el-progress :color="'#67c23a'" :percentage="updateDownloadProgress.percent" :status="updateError ? 'exception': (updateDownloaded ? 'success':'') "></el-progress>
      <p style="color:#f56c6c;margin:5px 0;line-height: 20px;">
        下载或安装失败？
        <br />其他安装渠道提示xxxxxxx
      </p>
      <el-row class="btn-wrap" v-if="updateDownloaded || updateError">
        <el-button @click.prevent="install" round type="primary">{{updateError ? '去其他安装渠道安装' : '立即安装' }}</el-button>
      </el-row>
    </div>
  </div>
</template>

<script lang='ts'>
import { ipcRenderer, remote } from 'electron';
import { Component, Vue } from 'vue-property-decorator';

@Component
export default class UpdateDownload extends Vue {
  updateInfo = {
    version: '',
  };
  updateDownloadProgress = {
    percent: 0,
    transferred: 0,
    total: 0,
  };
  updateDownloaded: boolean = false;
  updateError = null;

  progress() {
    const { transferred, total } = this.updateDownloadProgress;
    if (total) {
      const percentStr = transferred < 1048576 ? `${(transferred / 1024).toFixed(1)}KB` : `${(transferred / 1048576).toFixed(1)}MB`;
      const totalStr = total < 1048576 ? `${(total / 1024).toFixed(1)}KB` : `${(total / 1048576).toFixed(1)}MB`;
      return `${percentStr}/${totalStr}`;
    } else {
      return '';
    }
  }

  install() {
    if (!this.updateError) {
      this.quitAndInstall();
    } else {
      remote.app.quit(); // @TODO: 其他安装渠道提示xxxxxxx
    }
  }
  quitAndInstall() {
    ipcRenderer.send('quit-and-install');
  }

  mounted() {
    ipcRenderer.on('did-finish-load-msg', (event, msg) => {
      this.updateInfo = msg;
    });

    ipcRenderer.on('update-download-progress', (event, msg) => {
      this.updateDownloadProgress.percent = Math.round(msg.percent);
      this.updateDownloadProgress.transferred = msg.transferred;
      this.updateDownloadProgress.total = msg.total;
    });

    ipcRenderer.once('update-downloaded', (event, msg) => {
      this.updateDownloadProgress.percent = 100;
      this.updateDownloadProgress.transferred = this.updateDownloadProgress.total;
      this.updateDownloaded = true;
      const win = remote.getCurrentWindow();
      win.show();
      win.setAlwaysOnTop(true);
    });

    ipcRenderer.once('update-error', (event, msg) => {
      this.updateError = msg;
      const win = remote.getCurrentWindow();
      win.show();
      win.setAlwaysOnTop(true);
    });
  }

  destroyed() {
    ['did-finish-load-msg', 'update-download-progress', 'update-downloaded', 'update-error'].map((channel) => ipcRenderer.removeAllListeners(channel));
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
.update-download {
  padding-left: 120px;
  padding-top: 55px;
  width: 100%;
  height: 100%;
  box-sizing: border-box;
  text-align: left;
  .text {
    font-size: 14px;
    margin-bottom: 18px;
  }
  .btn-wrap {
    position: absolute !important;
    bottom: 20px;
    right: 20px;
  }
  .el-progress__text {
    color: #000000;
  }
}
</style>

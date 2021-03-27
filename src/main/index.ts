import { app, globalShortcut } from 'electron';
import { createWindow, handleWindow } from './winHelper';
import os from 'os';
import setTopMenu from './setTopMenu';
import { initTray } from './appTray';
import * as is from '@common/is';
import checkAndMoveToApplications from './moveToApplications';
import { ipcListener } from './ipc';

// @TODO:使用skipTaskbar、scrollBounce、<webview>的enableRemoteModule置为false (安全)
// @TODO:应用崩溃报告（主进程、渲染进程都需要）、应用CPU、Memory、网络、耗电监控
// @TODO:打开第三方url,禁止HTTP缓存、清除HTTP缓存session.defaultSession.clearCache(res=>console.log(res))、清除Web Storage数据 session.default.clearStorageData()、拒绝notification、geolaction等权限申请
// @TODO:第三方url:webContent.hasServiceWorker(callback)、webContent.unregisterServiceWorker(callback)

app.on('ready', () => {
  ipcListener();
  setTopMenu();
  initTray();

  createWindow('index');

  if (is.dev()) return;

  // hack: 通过快捷键打开devtools。只有测试环境或生产环境白名单内的用户可以打开
  const username = os.userInfo().username || '';
  const whiteList = ['moxiu-fe'];
  if (is.stg() || whiteList.indexOf(username.toUpperCase()) >= 0) {
    const shortcut = is.macOS() ? 'Command+Option+T' : 'Ctrl+Alt+T';
    if (!globalShortcut.isRegistered(shortcut)) {
      globalShortcut.register(shortcut, () => {
        const browserWindows = global.browserWindows || {};
        Object.keys(browserWindows).forEach(winName => {
          const win = browserWindows[winName];
          if (win && win.isFocused()) {
            win.webContents.openDevTools({ mode: 'detach' });
          }
        });
      });
    }
  }
  // 移动electron-vue-ts到ApplicationPath
  checkAndMoveToApplications();
});

app.on('activate', () => {
  const browserWindows = global.browserWindows || {};
  Object.keys(browserWindows).forEach(winName => {
    handleWindow(winName, 'show');
  });
});

app.on('before-quit', () => {
  const browserWindows = global.browserWindows || {};
  Object.keys(browserWindows).forEach(i => {
    if (browserWindows[i]) browserWindows[i].forceClose = true;
  });
});

app.on('will-quit', () => {
  globalShortcut.unregisterAll(); // 注销所有快捷键
});

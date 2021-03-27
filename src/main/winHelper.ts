import { app, BrowserWindow, Event, BrowserWindowConstructorOptions } from 'electron';
import { merge, cloneDeep } from 'lodash';
import * as winConf from './winConf';
import * as is from '@common/is';

/**
 * 警告：在渲染进程中处理BrowserWindow会同步阻塞,除非必要情况，否则请使用：ipcRenderer.send('handle-window', winName, action);
 * */

interface CreateWindowOptions {
  didFinishLoadMsg?: any;
  reload?: boolean;
  winOptions?: BrowserWindowConstructorOptions;
}
export class CustomBrowserWindow extends BrowserWindow {
  name?: string;
  forceClose?: boolean;
}

const browserWindows: { [winName: string]: CustomBrowserWindow } = (global.browserWindows = {}); // 缓存在全局

// @TODO:需再抽象一层，解决  ipcRenderer.send('handle-window', 'userInfo', 'create', { didFinishLoadMsg: this.mineProfile.id }) 无法获知是否已创建成功的问题，最好通过promise
export function createWindow(winName: string, options: CreateWindowOptions = {}): CustomBrowserWindow | boolean {
  if (!winName || !winConf[winName]) return false;
  const { didFinishLoadMsg, reload = false, winOptions = {} } = options;

  if (browserWindows[winName]) {
    if (reload) browserWindows[winName].reload(); // 当前窗口已创建，重新加载
    if (didFinishLoadMsg) browserWindows[winName].webContents.send('did-finish-load-msg', didFinishLoadMsg);
    browserWindows[winName].moveTop();
    return browserWindows[winName];
  }

  let win: CustomBrowserWindow = new BrowserWindow(merge(cloneDeep(winConf[winName].options), winOptions));
  win.name = winName;
  win.setMenuBarVisibility(!is.windows());
  win.loadURL(winConf[winName].url);

  if (didFinishLoadMsg) {
    win.webContents.on('did-finish-load', () => {
      win.webContents.send('did-finish-load-msg', didFinishLoadMsg);
    });
  }

  // 监听窗口事件
  win.once('ready-to-show', () => {
    win.show();
  });

  win.on('focus', (event: Event) => {
    win.webContents.send('window-focus');
  });

  win.on('blur', (event: Event) => {
    win.webContents.send('window-blur');
  });

  win.on('maximize', (event: Event) => {
    win.webContents.send('window-maximize');
  });

  win.on('unmaximize', (event: Event) => {
    win.webContents.send('window-unmaximize');
  });

  win.on('minimize', (event: Event) => {
    win.webContents.send('window-minimize');
  });

  win.on('restore', (event: Event) => {
    win.webContents.send('window-restore');
  });

  win.on('enter-full-screen', (event: Event) => {
    win.webContents.send('window-enter-full-screen');
  });

  win.on('leave-full-screen', (event: Event) => {
    win.webContents.send('window-leave-full-screen');
  });

  win.on('show', (event: Event) => {
    win.webContents.send('window-show');
  });

  win.on('hide', (event: Event) => {
    win.webContents.send('window-hide');
  });

  win.on('close', (event: Event) => {
    if (win.name === 'index' && !win.forceClose) { // 如果是登录窗口，且其他窗口已关闭，则退出app
      is.macOS() ? win.hide() : win.minimize();
      event.preventDefault();
    } else if (win.name === 'login') { // 如果是登录窗口，且其他窗口已关闭，则退出app
      const d = Object.keys(browserWindows).every(winName => {
        return !browserWindows[winName] || browserWindows[winName].name === 'login' || browserWindows[winName].forceClose;
      });
      if (d) app.quit();
    }
  });

  win.on('closed', (event: Event) => {
    const winName: string = win.name;
    browserWindows[winName] = null;
    if (winName === 'index') closeAllWindowsElse('login'); // 如果主窗口已关闭，除登录窗口外，其他窗口也需关闭
  });

  browserWindows[win.name] = win;

  return win;
}

export function handleWindow(winName: string, action: string, ...args: any[]): any {
  if (!winName || !browserWindows[winName]) return;
  const win: CustomBrowserWindow = browserWindows[winName];
  if (action === 'close') {
    win.forceClose = true;
    win.close();
  } else if (typeof win[action] === 'function') {
    return win[action](...args);
  }
}

export function closeAllWindowsElse(winName: string | string[]): void {
  if (!winName) return;
  if (!Array.isArray(winName)) winName = [winName];
  Object.keys(browserWindows).forEach(i => {
    if (winName.indexOf(i) === -1) handleWindow(i, 'close');
  });
}

export function closeAllWindows(): void {
  Object.keys(browserWindows).forEach(i => {
    handleWindow(i, 'close');
  });
}

export function getWindowProperty(winName: string, propertyName: string): any {
  if (!winName || !propertyName || !browserWindows[winName]) return;
  const win = browserWindows[winName];
  return win[propertyName];
}

export function sendMsgToWindow(winName: string, channel: string, msg: object = {}): void {
  if (!winName || !channel || !browserWindows[winName]) return;
  browserWindows[winName].webContents.send(channel, msg);
}

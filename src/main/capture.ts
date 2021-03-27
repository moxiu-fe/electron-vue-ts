import { BrowserWindow, ipcMain, globalShortcut, Display, IpcMainEvent } from 'electron';
import os from 'os';
import path from 'path';
import electronSettings from 'electron-settings';
import { handleWindow, sendMsgToWindow } from './winHelper';
import * as is from '@common/is';
import log from './main.log';
import { sleep, pathToFileURL } from '@common/helper';

const rendererDir: string = path.resolve(__dirname, '../renderer');
let captureWins: BrowserWindow[] = [];

async function captureScreen() {
  if (captureWins && captureWins.length) return;

  // 截图时是否显示主窗口
  if (!electronSettings.get('settings.showWinWhenCap')) {
    if (handleWindow('index', 'isFullScreen')) {
      handleWindow('index', 'setFullScreen', false);
      await sleep(800);
    }
    handleWindow('index', 'hide');
  }

  const { screen } = require('electron'); // Cannot require "screen" module before app is ready
  const displays: Display[] = screen.getAllDisplays();
  captureWins = displays.map(display => {
    const captureWin: BrowserWindow = new BrowserWindow({
      fullscreen: os.platform() === 'win32' || undefined, // window 使用 fullscreen,  mac 设置为 undefined, 不可为 false
      width: display.bounds.width,
      height: display.bounds.height,
      x: display.bounds.x,
      y: display.bounds.y,
      transparent: true,
      frame: false,
      titleBarStyle: 'hidden',
      movable: false,
      fullscreenable: false,
      closable: false,
      resizable: false,
      minimizable: false,
      maximizable: false,
      alwaysOnTop: true,
      skipTaskbar: false,
      autoHideMenuBar: true,
      fullscreenWindowTitle: false,
      enableLargerThanScreen: true,
      hasShadow: false,
      show: false, // ready-to-show 事件触发后再显示
      webPreferences: {
        webSecurity: !is.dev(),
        nodeIntegration: true, // 打开不受信的外部页面，此选项必须为false
        contextIsolation: false, // 打开不受信的外部页面，此选项必须为true
        enableRemoteModule: true, // 打开不受信的外部页面，此选项必须为false
        allowRunningInsecureContent: is.dev(),
        nodeIntegrationInWorker: true
      }
    });

    // 处理mac全屏下截图
    captureWin.setAlwaysOnTop(true, 'screen-saver');
    captureWin.setVisibleOnAllWorkspaces(true);

    const { bounds } = display;
    const { x, y } = screen.getCursorScreenPoint();
    if (
      x >= bounds.x &&
      x <= bounds.x + bounds.width &&
      y >= bounds.y &&
      y <= bounds.y + bounds.height
    ) {
      captureWin.focus();
    } else {
      captureWin.blur();
    }

    captureWin.once('ready-to-show', () => {
      captureWin.show();
    });

    captureWin.on('closed', () => {
      const indexWin = global.browserWindows && global.browserWindows.index ? global.browserWindows.index : null;
      if (indexWin && !indexWin.isVisible() && !indexWin.isMinimized()) { indexWin.show(); } // 显示主窗口
      globalShortcut.unregister('Esc'); // 注销Esc键
      const index: number = captureWins.indexOf(captureWin);
      if (index >= 0) captureWins.splice(index, 1);
      captureWins.forEach(win => win.destroy()); // 一个关闭，所有都关闭。 为何用destory，而不用close? 因为window中有remote.dialog.showSaveDialog会阻塞线程
    });

    const url: string = is.dev() ? 'http://localhost:9090/capture.html' : pathToFileURL(path.join(rendererDir, 'capture.html'));
    captureWin.loadURL(url);

    return captureWin;
  });

  globalShortcut.register('Esc', () => { // 注册Esc键
    if (!captureWins || !captureWins.length) return;
    captureWins.forEach(win => win.destroy());
    globalShortcut.unregister('Esc');
  });
}

export default function initCapture(): void {
  const shortcut: string = is.macOS() ? 'Command+Control+A' : 'Ctrl+Alt+A';
  globalShortcut.register(shortcut, captureScreen); // 截图快捷键
  ipcMain.on('capture-screen', (event: IpcMainEvent, data: { type?: string, error?: CustomError }) => {
    const { type = 'start' } = data;
    switch (type) {
      case 'start':
        captureScreen();
        break;
      case 'complete':
        captureWins.forEach(win => win.destroy()); // 为何用destroy，而不用close? 因为window中有remote.dialog.showSaveDialog会阻塞线程
        handleWindow('index', 'show');
        sendMsgToWindow('index', 'capture-screen', { type: 'complete' }); // 通知主窗口截图完成
        break;
      case 'save':
        captureWins.forEach(win => win.destroy());
        break;
      case 'cancel':
        captureWins.forEach(win => win.destroy());
        break;
      case 'select':
        break;
      case 'error':
        captureWins.forEach(win => win.destroy());
        log.error('截图异常：', data);
        break;
      default:
        break;
    }
  });
}

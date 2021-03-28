import { Tray } from 'electron';
import path from 'path';
import { handleWindow } from './winHelper';

let appTray: Tray | null;

export function initTray(): void {
  appTray = new Tray(path.resolve(__dirname, '../static/', 'logo_16x16@2x.png'));

  appTray.setToolTip('electron-vue-ts');

  // 点击显示主窗口
  appTray.on('click', () => {
    if (global.browserWindows.index) {
      handleWindow('index', 'show');
    } else {
      handleWindow('login', 'show');
    }
  });
}

export function setTrayTitle(str: string): void {
  if (appTray) appTray.setTitle(str);
}

export function destroyTray(): void {
  if (!appTray) return;
  appTray.destroy();
  appTray = null;
}

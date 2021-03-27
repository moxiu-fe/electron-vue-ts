import { ipcMain, BrowserWindow, IpcMainEvent } from 'electron';
import { downloadUpdate, quitAndInstall, checkForUpdate, cancelIntervalCheck } from './autoUpdate';
import { createWindow, handleWindow, getWindowProperty, sendMsgToWindow, CustomBrowserWindow } from './winHelper';

export function ipcListener() {
  ipcMain.on('handle-window', (event: IpcMainEvent, winName: string, action: string, ...args: any[]): void => {
    let res: CustomBrowserWindow | boolean | null = null;
    const browserWindow: CustomBrowserWindow = BrowserWindow.fromWebContents(event.sender);
    const currWinName: string = browserWindow.name;
    switch (action) {
      case 'create':
        res = createWindow(winName, ...args);
        break;
      case 'createAndCloseCurr':
        res = createWindow(winName, ...args);
        handleWindow(currWinName, 'close');
        break;
      case 'createAndDestroyCurr':
        res = createWindow(winName, ...args);
        handleWindow(currWinName, 'destroy');
        break;
      case 'closeCurr':
        handleWindow(currWinName, 'close');
        break;
      case 'destroyCurr':
        handleWindow(currWinName, 'destroy');
        break;
      default:
        res = handleWindow(winName, action, ...args);
        break;
    }
    event.sender.send('replay', { channel: 'handle-window', message: res, args: [winName, action, ...args] });
  });

  ipcMain.on('get-window-property', (event: IpcMainEvent, winName: string, propertyName: string): void => {
    const res = getWindowProperty(winName, propertyName);
    event.sender.send('replay', { channel: 'get-window-property', message: res, args: [winName, propertyName] });
  });

  ipcMain.on('send-msg-to-window', (event: IpcMainEvent, winName: string, channel: string, msg: object): void => {
    sendMsgToWindow(winName, channel, msg);
  });

  ipcMain.on('check-for-update', (event: IpcMainEvent): void => {
    checkForUpdate();
  });

  ipcMain.on('cancel-interval-check', (event: IpcMainEvent): void => {
    cancelIntervalCheck();
  });

  ipcMain.on('download-update', (event: IpcMainEvent): void => {
    handleWindow('update', 'close');
    downloadUpdate();
  });

  ipcMain.on('quit-and-install', (event: IpcMainEvent): void => {
    quitAndInstall();
  });
}

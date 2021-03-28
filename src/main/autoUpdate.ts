import { autoUpdater } from 'electron-updater';
import { createWindow, sendMsgToWindow } from './winHelper';
import * as is from '@common/is';
import log from './main.log';

let autoUpdateLock: boolean = false;
let newVersionInfo: object = {};
let timer: Timer = null;

autoUpdater.autoDownload = false;
autoUpdater.autoInstallOnAppQuit = true;
autoUpdater.allowDowngrade = true; // 允许向下更新

// 监听错误
autoUpdater.on('error', (err: Error) => {
  autoUpdateLock = false; // 释放锁
  newVersionInfo = {};
  sendMsgToWindow('updateDownload', 'update-error', err);
  log.error('自动更新发生错误', err);
});

// 当开始检查更新的时候触发
autoUpdater.on('checking-for-update', (message: object) => {
  autoUpdateLock = true;
});

// 检查到更新
autoUpdater.on('update-available', (info: object) => {
  autoUpdateLock = true;
  newVersionInfo = info;
  createWindow('update', {
    didFinishLoadMsg: info,
    reload: false,
    winOptions: {}
  });
  log.info('检测到新版本', info);
});

// 没有检查到更新
autoUpdater.on('update-not-available', (info: object) => {
  autoUpdateLock = false; // 释放锁
  newVersionInfo = {};
  log.info('未检测到新版本');
});

// 更新下载进度
autoUpdater.on('download-progress', (progress: object) => {
  autoUpdateLock = true;
  sendMsgToWindow('updateDownload', 'update-download-progress', progress);
  log.info('新版本下载进度', progress);
});

// 更新下载完成
autoUpdater.on('update-downloaded', (info: object) => {
  autoUpdateLock = true; // 释放锁
  sendMsgToWindow('updateDownload', 'update-downloaded', info);
  log.info('新版本下载完成', info);
});

// 启动查询,interval:间隔多久查询一次，传null不启动interval
export function checkForUpdate(interval: number = 4 * 60 * 60 * 1000) {
  if (is.dev()) return;

  autoUpdater.checkForUpdates();
  log.info('检测是否有新版本');

  if (!interval) return;
  if (timer) clearInterval(Number(timer));
  timer = setInterval(() => {
    if (!autoUpdateLock) {
      autoUpdater.checkForUpdates();
      log.info('检测是否有新版本');
    }
  }, interval);
}

export function downloadUpdate(): void {
  autoUpdater.downloadUpdate();
  // your download update progress bar
}

export function quitAndInstall(): void {
  // close all browserWindows
  const browserWindows = global.browserWindows || {};
  for (const winName in browserWindows) {
    const win = global.browserWindows[winName];
    if (win) win.forceClose = true;
  }
  autoUpdater.quitAndInstall();
}

export function cancelIntervalCheck(): void {
  if (timer) clearInterval(Number(timer));
}

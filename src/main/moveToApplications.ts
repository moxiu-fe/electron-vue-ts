import { app, dialog, shell, BrowserWindow } from 'electron';
import os from 'os';
import cp from 'child_process';
import path from 'path';
import fs from 'fs';
import * as is from '@common/is';
import log from './main.log';

const sudo = require('sudo-prompt'); // 没有声明文件

let lock: boolean = false;
let timer;

const exePath: string = app.getPath('exe');
const rootApplicationPath: string = '/Applications';
const userApplicationPath: string = path.join(
  app.getPath('home'),
  'Applications'
);

function getBundlePath(): string {
  const bundleExtension: string = '.app';
  const parts: string[] = exePath.split(bundleExtension);
  return `${parts[0]}${bundleExtension}`;
}

function canWrite(filePath: string, callback: (isWritable: boolean) => void) {
  fs.access(filePath, fs.constants.W_OK, err => {
    // eslint-disable-next-line standard/no-callback-literal
    if (typeof callback === 'function') callback(!err);
  });
}

function isInApplicationsFolder(): boolean {
  return (
    exePath.startsWith(rootApplicationPath) ||
    exePath.startsWith(userApplicationPath)
  );
}

function isInDownloadsFolder(): boolean {
  const downloadsPath: string = app.getPath('downloads');
  return exePath.startsWith(downloadsPath);
}

function preferredInstallLocation(): string {
  if (fs.existsSync(rootApplicationPath)) return rootApplicationPath;

  // 优先放userApplicationPath
  if (fs.existsSync(userApplicationPath)) {
    return userApplicationPath;
  } else {
    const creat: any = fs.mkdirSync(userApplicationPath);
    if (creat) return userApplicationPath;
  }
}

function moveToTrash(directory: string): boolean {
  if (!fs.existsSync(directory)) return true;
  return shell.moveItemToTrash(directory);
}

function getDialogMessage(needsAuthorization: boolean): string {
  let detail: string = '强烈建议您将electron-vue-ts移动到应用程序。';
  if (needsAuthorization) {
    detail += ' 注意：此操作可能需要您输入管理员密码。';
  } else if (isInDownloadsFolder()) {
    // detail += ' 以保持下载目录整洁。'
  }
  return detail;
}

function moveToApplications(): Promise<boolean> {
  const bundlePath: string = getBundlePath();
  const fileName: string = path.basename(bundlePath);
  const installDirectory: string = preferredInstallLocation();
  const installLocation: string = path.join(installDirectory, fileName);

  // We return a promise so that the parent application can await the result.
  return new Promise((resolve, reject) => {
    // If we're not on MacOS then we're done here.
    if (os.platform() !== 'darwin') {
      resolve(true);
      return;
    }

    // Skip if the application is already in some Applications folder
    if (isInApplicationsFolder()) {
      resolve(true);
      return;
    }

    // Check if the install location needs administrator permissions
    canWrite(installDirectory, isWritable => {
      const needsAuthorization: boolean = !isWritable;

      // 没有用户没有管理员账号和密码
      if (needsAuthorization) {
        reject(
          new Error(
            `将electron-vue-ts移动到应用程序（${installDirectory}）需要管理员密码，但用户没有管理员密码`
          )
        );
        return;
      }

      // show dialog requesting to move
      const detail: string = getDialogMessage(needsAuthorization);

      dialog.showMessageBox(global.browserWindows['index'], {
        type: 'question',
        buttons: ['移动', '取消'],
        message: '将electron-vue-ts移动到应用程序',
        detail,
        defaultId: 0,
        cancelId: 1
      }).then(({ response }) => {
        // user chose to do nothing
        if (response === 1) {
          resolve(false);
          return;
        }

        const moved = (error: CustomError) => {
          if (error) {
            reject(error);
            return;
          }

          // open the moved app
          const execName: string = path.basename(process.execPath);
          const execPath: string = path.join(
            installLocation,
            'Contents',
            'MacOS',
            execName
          );
          const child: cp.ChildProcess = cp.spawn(execPath, [], {
            detached: true,
            stdio: 'ignore'
          });
          child.unref();

          // quit the app immediately
          app.quit();
        };

        // move any existing application bundle to the trash
        if (!moveToTrash(installLocation)) {
          reject(new Error('将electron-vue-ts移动到回收站失败。'));
          return;
        }

        // move the application bundle
        const command: string = `mv ${bundlePath} ${installLocation}`;
        if (needsAuthorization) {
          sudo.exec(command, { name: app.getName() }, moved);
        } else {
          cp.exec(command, moved);
        }
      });
    });
  });
}

export default function checkAndMoveToApplications(interval: number = 3 * 60 * 60 * 1000) {
  if (!is.macOS()) return;

  if (!lock) {
    lock = true;
    moveToApplications()
      .then(() => {
        lock = false;
        clearInterval(timer);
      })
      .catch(err => {
        lock = false;
        log.error('移动electron-vue-ts到ApplicationPath失败', err);
      });
  }

  if (!interval) return;
  if (timer) clearInterval(Number(timer));
  timer = setInterval(() => {
    if (!lock) {
      lock = true;
      moveToApplications()
        .then(() => {
          lock = false;
          clearInterval(timer);
        })
        .catch(err => {
          lock = false;
          log.error('移动electron-vue-ts到userApplicationPath失败', err);
        });
    }
  }, interval);
}

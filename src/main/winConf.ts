import path from 'path';
import { BrowserWindowConstructorOptions } from 'electron';
import { merge, cloneDeep } from 'lodash';
import * as is from '@common/is';
import { pathToFileURL } from '@common/helper';

const rendererDir: string = path.resolve(__dirname, '../renderer');
const baseOptions: BrowserWindowConstructorOptions = {
  useContentSize: true,
  backgroundColor: '#ECF5FF',
  resizable: false,
  titleBarStyle: 'hidden',
  center: true,
  show: false, // ready-to-show事件触发后再显示
  autoHideMenuBar: is.windows(),
  webPreferences: {
    webSecurity: true,
    allowRunningInsecureContent: false,
    nodeIntegration: true,
    contextIsolation: false,
    enableRemoteModule: true,
    nodeIntegrationInWorker: true
  }
};

function buildUrl(basename: string): string {
  return is.dev() ? `http://localhost:9090/${basename}` : pathToFileURL(path.join(rendererDir, basename));
}

interface WinConf {
  url: string;
  options?: BrowserWindowConstructorOptions;
}

export const index: WinConf = {
  url: buildUrl('index.html'),
  options: merge(cloneDeep(baseOptions), {
    title: '首页',
    width: 800,
    height: 600,
    minWidth: 800,
    minHeight: 600,
    resizable: true,
    minimizable: true,
    maximizable: true
  })
};

export const update: WinConf = {
  url: buildUrl('update.html'),
  options: merge(cloneDeep(baseOptions), {
    width: 372,
    height: 382,
    titleBarStyle: 'default',
    title: '更新electron-vue-ts',
    closable: true,
    resizable: false,
    minimizable: false,
    maximizable: false,
    alwaysOnTop: true
  })
};

export const updateDownload: WinConf = {
  url: buildUrl('updateDownload.html'),
  options: merge(cloneDeep(baseOptions), {
    width: 500,
    height: 230,
    titleBarStyle: 'default',
    title: '安装新版本',
    closable: true,
    resizable: false,
    minimizable: true,
    maximizable: false
  })
};

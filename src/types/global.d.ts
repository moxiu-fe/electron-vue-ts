import { CustomBrowserWindow } from '@main/winHelper';

declare global {
  namespace NodeJS {
    interface Global {
      browserWindows: {
        [winName: string]: CustomBrowserWindow
      };
    }
  }
}

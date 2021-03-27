import { app, Menu } from 'electron';
import * as is from '@common/is';

export default function setTopMenu(): void {
  if (!is.macOS()) return;
  const menu: Menu = Menu.buildFromTemplate([
    {
      label: 'electron-vue-ts',
      submenu: [
        {
          label: '关于electron-vue-ts',
          role: 'about'
        },
        {
          type: 'separator'
        },
        {
          type: 'separator'
        },
        {
          label: '服务',
          role: 'services'
        },
        {
          type: 'separator'
        },
        {
          label: '隐藏electron-vue-ts',
          accelerator: 'Command+H',
          role: 'hide'
        },
        {
          label: '隐藏其它',
          accelerator: 'Command+Alt+H',
          role: 'hideOthers'
        },
        {
          label: '显示全部',
          role: 'unhide'
        },
        {
          type: 'separator'
        },
        {
          type: 'separator'
        },
        {
          label: '退出',
          accelerator: 'Command+Q',
          click() {
            app.quit();
          }
        }
      ]
    },
    {
      label: '编辑',
      submenu: [
        {
          label: '撤销',
          accelerator: 'CmdOrCtrl+Z',
          role: 'undo'
        },
        {
          label: '重做',
          accelerator: 'Shift+CmdOrCtrl+Z',
          role: 'redo'
        },
        {
          type: 'separator'
        },
        {
          label: '剪切',
          accelerator: 'CmdOrCtrl+X',
          role: 'cut'
        },
        {
          label: '复制',
          accelerator: 'CmdOrCtrl+C',
          role: 'copy'
        },
        {
          label: '粘贴',
          accelerator: 'CmdOrCtrl+V',
          role: 'paste'
        },
        {
          label: '全选',
          accelerator: 'CmdOrCtrl+A',
          role: 'selectAll'
        }
      ]
    },
    {
      label: '窗口',
      role: 'window',
      submenu: [
        {
          label: '最小化',
          accelerator: 'CmdOrCtrl+M',
          role: 'minimize'
        }, {
          label: '关闭',
          accelerator: 'CmdOrCtrl+W',
          role: 'close'
        }, {
          type: 'separator'
        }
      ]
    }
  ]);
  Menu.setApplicationMenu(menu);
}

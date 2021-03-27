import './capture.css';
import { ipcRenderer, clipboard, nativeImage, remote, desktopCapturer } from 'electron';
import fs from 'fs';
import { CaptureEditor } from './captureEditor';
import { getCurrentScreen } from './utils';

const $canvas = document.getElementById('js-canvas');
const $canvas2 = document.getElementById('js-canvas2');
const $bg = document.getElementById('js-bg');
const $jsMask = document.getElementById('js-mask');
const $sizeInfo = document.getElementById('js-size-info');
const $toolbar = document.getElementById('js-toolbar');

const $btnClose = document.getElementById('js-tool-close');
const $btnOk = document.getElementById('js-tool-ok');
const $btnSave = document.getElementById('js-tool-save');
const $btnReset = document.getElementById('js-tool-reset');
const $btnRect = document.getElementById('js-tool-rect');
const $toast = document.getElementById('js-tool-toast');
const $mainDiv = document.getElementById('main-div');

function init() {
  // 右键取消截屏
  document.body.addEventListener('mousedown', (e) => {
    if (e.button === 2) ipcRenderer.send('capture-screen', { type: 'cancel', screenId });
  }, false);

  const { id: screenId, bounds, scaleFactor } = getCurrentScreen();
  // eslint-disable-next-line no-unused-vars
  const { width: screenWidth, height: screenHeight, x: screenX, y: screenY } = bounds;

  // 获取屏幕截图
  desktopCapturer.getSources({ types: ['screen'], thumbnailSize: { width: screenWidth * scaleFactor, height: screenHeight * scaleFactor } })
    .then(sources => {
      const desktopCapturerSource = sources.find(item => item.display_id === '' + screenId);
      const imgSrc = desktopCapturerSource.thumbnail.toDataURL();
      const capture = new CaptureEditor($canvas, $canvas2, $bg, $jsMask, imgSrc, scaleFactor, screenWidth, screenHeight);
      const onDrag = (selectRect) => {
        $toolbar.style.display = 'none';
        $sizeInfo.style.display = 'block';
        $sizeInfo.innerText = `区域大小：${selectRect.w} x ${selectRect.h}`;
        if (selectRect.y > 35) {
          $sizeInfo.style.top = `${selectRect.y - 30}px`;
        } else {
          $sizeInfo.style.top = `${selectRect.y}px`;
        }
        $sizeInfo.style.left = `${selectRect.x}px`;
      };
      capture.on('start-dragging', onDrag);
      capture.on('dragging', onDrag);

      const onDragEnd = () => {
        if (!capture.selectRect) return;
        const { r, b } = capture.selectRect;
        $toolbar.style.display = 'flex';
        if (b >= (screenHeight - 30)) {
          $toolbar.style.top = `${b - 35}px`;
        } else {
          $toolbar.style.top = `${b + 15}px`;
        }
        $toolbar.style.right = `${window.screen.width - r}px`;
        ipcRenderer.send('capture-screen', { type: 'select', screenId });
      };
      capture.on('end-dragging', onDragEnd);

      capture.on('reset', () => {
        $toolbar.style.display = 'none';
        $sizeInfo.style.display = 'none';
      });

      $btnClose.addEventListener('click', () => {
        ipcRenderer.send('capture-screen', { type: 'cancel', screenId });
      }, false);

      $btnReset.addEventListener('click', () => capture.reset(), false);
      $btnRect.addEventListener('click', () => capture.draw(), false);

      const selectCapture = () => {
        if (!capture.selectRect) return;
        const dataUrl = capture.getImageUrl();
        clipboard.writeImage(nativeImage.createFromDataURL(dataUrl)); // 存储至剪切板

        // 弹窗提示
        $mainDiv.style.display = 'none';
        $toast.style.display = 'block';
        const timer = setTimeout(() => {
          $mainDiv.style.display = 'block';
          $toast.style.display = 'none';
          clearTimeout(timer);
        }, 1000);

        ipcRenderer.send('capture-screen', { type: 'complete', screenId });
      };
      $btnOk.addEventListener('click', selectCapture, false);
      window.addEventListener('keypress', (e) => {
        if (e.code === 'Enter') selectCapture();
      }, false);

      $btnSave.addEventListener('click', () => {
        const dataUrl = capture.getImageUrl();
        remote.dialog.showSaveDialog(remote.getCurrentWindow(), {
          filters: [{ name: 'Images', extensions: ['png', 'jpg'] }]
        })
          .then(({ canceled, filePath }) => {
            if (canceled) return;
            clipboard.writeImage(nativeImage.createFromDataURL(dataUrl)); // 存储至剪切板
            try { fs.writeFileSync(filePath, Buffer.from(dataUrl.replace('data:image/png;base64,', ''), 'base64')); } catch (err) { }
            ipcRenderer.send('capture-screen', { type: 'save', screenId, path: filePath });
          });
      }, false);

      remote.getCurrentWindow().on('blur', event => capture.reset());
    })
    .catch(error => {
      ipcRenderer.send('capture-screen', { type: 'error', screenId, error });
    });
}

init();

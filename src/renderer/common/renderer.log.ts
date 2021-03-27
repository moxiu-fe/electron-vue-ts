import path from 'path';
import * as is from '@common/is';
import { pathToFileURL } from '@common/helper';

const fileUrl = path.resolve(__dirname, is.dev() ? '../../../app/' : '../../app', 'worker/renderer.log.js');

const worker = new Worker(pathToFileURL(fileUrl));

const defaultModule = {
  error(...message: any[]) {
    worker.postMessage({
      type: 'log',
      content: {
        level: 'error',
        message
      }
    });
  },
  info(...message: any[]) {
    worker.postMessage({
      type: 'log',
      content: {
        level: 'info',
        message
      }
    });
  },
  warn(...message: any[]) {
    worker.postMessage({
      type: 'log',
      content: {
        level: 'warn',
        message
      }
    });
  },
  upload() {
    worker.postMessage({ type: 'upload' });
  }
};

export default defaultModule;

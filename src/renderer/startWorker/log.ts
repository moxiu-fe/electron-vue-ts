
import path from 'path';
import * as is from '@common/is';
import { pathToFileURL } from '@common/helper';

let worker: Worker;
let restartCount:number = 0;
const workerDir = is.dev() ? path.resolve(__dirname, '../../../app/worker') : path.resolve(__dirname, '../../worker');
const url = pathToFileURL(path.join(workerDir, 'log.js'));
worker = new Worker(url);

worker.addEventListener('error', event => {
  worker.terminate();
  worker = null;
  if (restartCount < 3) {
    restartCount++;
    worker = new Worker(url);
  }
});

window.addEventListener('beforeunload', event => {
  worker.terminate();
});

function consoleLog(level) {
  return function() {
    worker.postMessage({ level, message: [].slice.apply(arguments) });
  };
}

module.exports = {
  error: consoleLog('error'),
  warn: consoleLog('warn'),
  info: consoleLog('info'),
  verbose: consoleLog('verbose'),
  debug: consoleLog('debug'),
  silly: consoleLog('silly')
};

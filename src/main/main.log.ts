
import path from 'path';
import childProcess from 'child_process';

const fileUrl = path.resolve(__dirname, '../childProcess/main.log.js');
const child = childProcess.fork(fileUrl);

export default {
  error(...message: any[]) {
    child.send({ level: 'error', message });
  },
  info(...message: any[]) {
    child.send({ level: 'info', message });
  },
  warn(...message: any[]) {
    child.send({ level: 'warn', message });
  }
};

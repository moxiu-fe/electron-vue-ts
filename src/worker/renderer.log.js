/*
 * 使用electron-log记录日志到文件中，单文件最大2兆，存放在renderer文件夹，设置文件名，超过7天的文件会被删除
 */
const path = require('path');
const fse = require('fs-extra');
const fs = require('fs');
const log = require('electron-log');
const compressing = require('compressing');

log.transports.file.appName = 'electron-vue-ts'; // 设置文件目录名字
log.transports.file.fileName = 'renderer.log';
log.transports.file.maxSize = 2 * 1024 * 1024;
log.transports.file.archiveLog = (oldLogPath) => {
  const fileDir = path.resolve(oldLogPath, '../');
  const newPath = path.join(fileDir, `./renderer/${timeFormat(Date.now(), 'yyyy-MM-dd_hhmmss')}.renderer.log`);
  try { fse.moveSync(oldLogPath, newPath); } catch (err) { }
  fs.readdir(`${fileDir}/renderer`, (err, files) => {
    if (err) return;
    const sevenDayAgo = new Date(timeFormat(Date.now(), 'yyyy-MM-dd')).getTime() - 8 * 60 * 60 * 1000 - 7 * 24 * 60 * 60 * 1000;
    const reg = /^\d{4}-\d{2}-\d{2}_\d{6}\.renderer.log$/;
    files.forEach(file => {
      if (reg.test(file) && (new Date(file.split('_')[0]).getTime() < sevenDayAgo)) {
        fse.remove(path.join(`${fileDir}/renderer`, file), (err) => {
          if (err) return false;
          log.info(`删除日志文件${file}`);
        });
      }
    });
  });
};

function timeFormat(time, format = 'yyyy-MM-dd hh:mm:ss') {
  const dateObj = new Date(time).toString() !== 'Invalid Date' ? new Date(time) : new Date();
  const date = {
    'M+': dateObj.getMonth() + 1,
    'd+': dateObj.getDate(),
    'h+': dateObj.getHours(),
    'm+': dateObj.getMinutes(),
    's+': dateObj.getSeconds(),
    'q+': Math.floor((dateObj.getMonth() + 3) / 3),
    'S+': dateObj.getMilliseconds()
  };
  if (/(y+)/i.test(format)) {
    format = format.replace(
      RegExp.$1,
      (dateObj.getFullYear() + '').substr(4 - RegExp.$1.length)
    );
  }
  Object.keys(date).forEach(k => {
    if (new RegExp('(' + k + ')').test(format)) {
      format = format.replace(
        RegExp.$1,
        RegExp.$1.length === 1 ? date[k] : ('00' + date[k]).substr(('' + date[k]).length)
      );
    }
  });
  return format;
}

/**
 * @description: 打包操作
 * @param {String} source
 * @param {String} target
 * @return {Promise}
 */
function packageDir(source = '', target = '') {
  return compressing.tar.compressDir(source, target);
}

const event = {
  log(content) {
    const { level, message } = content;
    log[level] && log[level](...message);
  },
  async upload(content) {
    // 这里执行日志上报至服务器
  }
};

self.addEventListener('message', message => {
  const { type: methodType = 'log', content } = message.data;
  event[methodType] && event[methodType](content);
});

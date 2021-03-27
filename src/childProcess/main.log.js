const path = require('path');
const fse = require('fs-extra');
const fs = require('fs');
const log = require('electron-log');

/**
 * electron-log的再次封装，用法同electron-log
 * 1、日志文件放置app.getPath('logs')目录下
 * 2、日志文件以时间格式进行命名：yyyy-MM-dd_hhmmss.log
 * 3、日志异步写入文件
 * 4、日志文件自动拆分，拆分阈值大小2mb，并保存最近7天的日志文件
 * 用法 ：
 * log.error(msg1,meg2)
 * log.warn(msg1,meg2)
 * log.info(msg1,meg2)
 * log.verbose(msg1,meg2)
 * log.debug(msg1,meg2)
 * log.silly(msg1,meg2)
 *  */
log.transports.file.appName = 'electron-vue-ts'; // 设置文件目录名字
log.transports.file.sync = false; // 以异步方式写入文件
log.transports.file.fileName = 'main.log';
log.transports.file.maxSize = 2 * 1024 * 1024;
log.transports.file.archiveLog = (oldLogPath) => {
  const fileDir = path.resolve(oldLogPath, '../');
  const newPath = path.join(fileDir, `./main/${timeFormat(Date.now(), 'yyyy-MM-dd_hhmmss')}.main.log`);
  try {
    fse.moveSync(oldLogPath, newPath);
  } catch (err) { }
  fs.readdir(`${fileDir}/main`, (err, files) => {
    if (err) return;
    const sevenDayAgo = new Date(timeFormat(Date.now(), 'yyyy-MM-dd')).getTime() - 8 * 60 * 60 * 1000 - 7 * 24 * 60 * 60 * 1000;
    const reg = /^\d{4}-\d{2}-\d{2}_\d{6}\.main.log$/;
    files.forEach(file => {
      if (reg.test(file) && new Date(file.split('_')[0]).getTime() < sevenDayAgo) {
        fse.remove(path.join(`${fileDir}/main`, file), () => { });
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
  // eslint-disable-next-line no-unused-vars
  for (const k in date) {
    if (new RegExp('(' + k + ')').test(format)) {
      format = format.replace(
        RegExp.$1,
        RegExp.$1.length === 1 ? date[k] : ('00' + date[k]).substr(('' + date[k]).length)
      );
    }
  }
  return format;
}

process.on('message', (data) => {
  const { level = 'info', message = '' } = data;
  log[level] && log[level](...message);
});

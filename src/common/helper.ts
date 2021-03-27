import fs from 'fs';
import crypto from 'crypto';
import { execSync } from 'child_process';
import * as is from './is';
import { getMAC } from './getMac';
import { v1 as uuidv1 } from 'uuid';

const macAddress: string = getMAC('en0');

/**
 * 精确检查数据类型
 * @param {Any} param 要检查的数据
 * @return {String} 数据类型 undefined|boolean|number|string|array|null|function|JSON|其他
 */
export function typeOf(param: any): string {
  const str: string = Object.prototype.toString.call(param);
  const data: string[] | null = /\[object (\w+)\]/.exec(str);
  return data ? data[1].toLowerCase() : 'null';
}

export function isObject(value: any): boolean {
  return typeOf(value) === 'object';
}

export function isArray(value: any): boolean {
  return typeOf(value) === 'array';
}

export function isBoolean(value: any): boolean {
  return typeof value === 'boolean';
}

export function isString(value: any): boolean {
  return typeof value === 'string';
}

export function isNumber(value: any): boolean {
  return typeof value === 'number';
}

export function isDate(value: any): boolean {
  return typeOf(value) === 'date';
}

export function isRegExp(value: any): boolean {
  return typeOf(value) === 'regexp';
}

export function isFunction(value: any): boolean {
  return typeOf(value) === 'funciton';
}

/**
 * 判断是否为NaN   (isNaN(NaN) // true,isNaN("foo") // true,isNaN(undefined) // true,isNaN({}) // true,isNaN({a:1}) // true,  )
 * @param {Any} x 要判断的数据
 * @return {Boolean} 是否为NaN
 */
export function isReallyNaN(x: any): boolean {
  // eslint-disable-next-line no-self-compare
  return x !== x;
}

/**
 * 判断object不是空object
 * @param {Object} obj 要判断的对象
 * @return {Boolean} true:为空object
 */
export function isNotEmptyObj(obj: any): boolean {
  return typeOf(obj) === 'object' && Object.keys(obj).length > 0;
}

/**
 * 格式化时间
 * @param {Date} time 时间
 * @param {String} format 格式
 * @return {String} 格式化后的时间
 */
export function timeFormat(time: Date | string | number, format: string = 'yyyy-MM-dd hh:mm:ss'): string {
  const date: Date = isDate(new Date(time)) ? new Date(time) : new Date();
  const o = {
    'M+': date.getMonth() + 1,
    'd+': date.getDate(),
    'h+': date.getHours(),
    'm+': date.getMinutes(),
    's+': date.getSeconds(),
    'q+': Math.floor((date.getMonth() + 3) / 3),
    'S+': date.getMilliseconds()
  };
  if (/(y+)/i.test(format)) {
    format = format.replace(
      RegExp.$1,
      (date.getFullYear() + '').substr(4 - RegExp.$1.length)
    );
  }
  // eslint-disable-next-line no-unused-vars
  for (const k in o) {
    if (new RegExp('(' + k + ')').test(format)) {
      format = format.replace(
        RegExp.$1,
        RegExp.$1.length === 1 ? o[k] : ('00' + o[k]).substr(('' + o[k]).length)
      );
    }
  }
  return format;
}

/**
 * 过滤字符串前后空格
 * @param {String} str 要过滤的字符串
 * @return {String} 过滤后的字符串
 */
export function trim(str: string = ''): string {
  return str.replace(/^\s+/, '').replace(/\s+$/, '');
}

/**
 * 随机生成由大小写字母、数字组成的字符串
 * @param {Number} length 字符串长度，默认16
 * @return {String} 生成的字符串
 */
export function getRandomStr(length: number = 16): string {
  const chars: string[] = '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');
  let str: string = '';
  for (let i = 0; i < length; i++) {
    str += chars[Math.floor(Math.random() * 62)];
  }
  return str;
}

/**
 * 产生uuid（RFC4122规范）（RFC4122规范，因子：时间戳和随机数）
 * @return {String} uuid
 * */
// export function getUUID(): string {
//   let d: number = +new Date();
//   if (typeof performance !== 'undefined' && typeof performance.now === 'function') {
//     d += performance.now(); // use high-precision timer if available
//   }
//   return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
//     const r: number = (d + Math.random() * 16) % 16 | 0;
//     d = Math.floor(d / 16);
//     return (c === 'x' ? r : (r & 0x3) | 0x8).toString(16);
//   });
// }

export function getUUID(): string {
  return macAddress ? uuidv1({ node: macAddress.split(':').map(n => parseInt(n, 16)) }) : uuidv1();
}

/**
 * jsonBody转换为&=连接而成的字符串
 * @param {Object} json
 * @return {String} 字符串
 */
export function jsonBody2Str(json: object): string {
  let str: string = '';
  for (const p in json) {
    const value = json[p];
    // value = encodeURIComponent(value);
    str += '&' + p + '=' + value;
  }
  return str.substr(1);
}

/**
 * 功能:转义html脚本 < > & " '
 * @params string
 * return string
 */
export function escapeHTML(str?: string): string {
  if (!str) return '';
  return str.replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

/**
 * 功能: 还原html脚本 < > & ' '
 * @params string
 * return string
 */
export function unescapeHTML(str: string): string {
  if (!str) return '';
  return str.replace(/&lt;/g, '<').replace(/&gt;/g, '>');
}

/**
 * 数组转对象
 */
export function array2Obj(arr: any[], idName: string): object {
  const obj: object = {};
  arr.forEach((item, key) => {
    const attr = item[idName];
    obj[attr] = item;
  });
  return obj;
}

/**
 * 对象转为数组
 */
export function obj2Array(obj: object): any[] {
  const arr: any[] = [];
  Object.keys(obj).forEach(key => {
    arr.push(obj[key]);
  });
  return arr;
}

/**
 * 对象组成的数组去重,且倒叙（排在数组末尾的优先）
 * @param {T[]} objArr 对象组成的数组
 * @return {string} key 重复依据，即对象的key名称
 */
export function objArrUniq<T extends object>(objArr: T[], key: string): T[] {
  const obj: { [key: string]: 1 } = {};
  const arr: T[] = [];
  for (let i = objArr.length - 1; i >= 0; i--) {
    const item = objArr[i];
    const value = item[key];
    if (!obj[value]) arr.unshift(item);
    obj[value] = 1;
  }
  return arr;
}

/**
 * 版本比较
 * @param {String} v1 版本1
 * @param {String} v2 版本2
 * @return {Number} -1|1|0
 */
export function comparVersion(v1: string, v2: string): number {
  const v1Ary: string[] = v1.split('.');
  const v2Ary: string[] = v2.split('.');
  const len: number = Math.max(v1Ary.length, v2Ary.length);

  while (v1Ary.length < len) {
    v1Ary.push('0');
  }

  while (v2Ary.length < len) {
    v2Ary.push('0');
  }

  for (let i = 0; i < len; i++) {
    const num1: number = parseInt(v1Ary[i]);
    const num2: number = parseInt(v2Ary[i]);
    if (num1 > num2) {
      return 1;
    } else if (num1 < num2) {
      return -1;
    }
  }

  return 0;
}

/**
 * 计算hash
 * @param {String|Object} plainText  原始数据,如果是object将转为key&value形式
 * @param {String} arithmetic hash算法，默认sha1
 * @return {String} hash串
 */
export function hash(plainText: string | object, arithmetic: string = 'sha1'): string {
  let str: string = '';
  if (typeof plainText === 'string') {
    str = plainText;
  } else if (typeof plainText === 'object') {
    for (const p in plainText) {
      str += '&' + p + '=' + plainText[p];
    }
    str = str.substr(1);
  } else {
    str = String(plainText);
  }
  return crypto.createHash(arithmetic).update(str).digest('hex');
};

/**
 * 获取设备信息
 * @param {String|Object} plainText
 * @param {String} arithmetic hash算法，默认sha1
 * @return {String} hash串
 */
export function getDeviceInfo(): { hardwareUUID: string, serialNumber: string, modelName: string, computerName: string, systemVersion: string } {
  let hardwareUUID: string = '';
  let serialNumber: string = '';
  let modelName: string = '';
  let computerName: string = '';
  let systemVersion: string = '';
  if (is.macOS()) {
    const stdout: string = execSync('system_profiler SPHardwareDataType SPSoftwareDataType').toString();
    if (stdout) {
      hardwareUUID = stdout.split('Hardware UUID:')[1].split('\n')[0].replace(/^\s+|\s+$/g, '');
      serialNumber = stdout.split('Serial Number (system)')[1].split('\n')[0].replace(/^\s+|\s+$/g, '');
      modelName = stdout.split('Model Name:')[1].split('\n')[0].replace(/^\s+|\s+$/g, '');
      computerName = stdout.split('Computer Name:')[1].split('\n')[0].replace(/^\s+|\s+$/g, '');
      systemVersion = stdout.split('System Version:')[1].split('\n')[0].replace(/^\s+|\s+$/g, '');
    }
  }
  return { hardwareUUID, serialNumber, modelName, computerName, systemVersion };
}

export function sleep(time: number): Promise<string> {
  return new Promise(resolve => {
    let timer = setTimeout(() => {
      resolve(`sleep ${time} ms`);
      clearTimeout(Number(timer));
      timer = null;
    }, time);
  });
}

// 函数节流
export function throttle(fn: (...args: any[]) => any, interval: number): () => any {
  const _self = fn; // 保存需要被延迟执行的函数引用
  let timer; // 定时器
  let firstTime = true; // 是否初次调用
  // eslint-disable-next-line space-before-function-paren
  return function (...args: any[]) {
    const _me = this;

    if (firstTime) {
      //  如果是第一次调用，不需要延迟执行
      _self.apply(_me, args);
      firstTime = false;
      return;
    }

    if (timer) return; // 如果定时器还在，说明前一次延迟执行还没有完成
    // eslint-disable-next-line space-before-function-paren
    timer = setTimeout(function () {
      clearTimeout(timer);
      timer = null;
      _self.apply(_me, args);
    }, interval || 500);
  };
}

// 函数防抖
export function debounce(fn: (...args: any[]) => any, interval: number): () => any {
  const _self = fn;
  let timer;
  // eslint-disable-next-line space-before-function-paren
  return function (...args: any[]) {
    clearTimeout(timer);

    const _me = this; // 当前的this
    // eslint-disable-next-line space-before-function-paren
    timer = setTimeout(function () {
      clearTimeout(timer);
      _self.apply(_me, args);
    }, interval || 500);
  };
}

// path转为文件url
export function pathToFileURL(path: string): string {
  const prefix = process.platform === 'win32' ? 'file:///' : 'file://';
  return prefix + encodeURI(path.replace(/\\/g, '/'));
}

// 文件url转为path
export function fileURLToPath(fileURL: string): string {
  const prefix = process.platform === 'win32' ? /^file:\/\/\// : /^file:\/\//;
  return decodeURI(new URL(fileURL).href.replace(prefix, ''));
}

// async函数同步化
export function asyncWrap<T, U = any>(promise: Promise<T>): Promise<[U | null, T | null]> {
  return promise
    .then<[null, T]>((data: T) => [null, data])
    .catch<[U, null]>(err => [err, null]);
}

export function getEmailSuffixByCid(cid: string): string {
  if (!cid) return '';
  return cid.indexOf('@') >= 0 ? cid.slice(cid.indexOf('@')) : '';
}

export function fileExists(filePath: string): Promise<boolean> {
  return new Promise((resolve, reject) => {
    fs.stat(filePath, (err, stats) => {
      if (!err && stats && stats.isFile()) {
        resolve(true);
      } else {
        resolve(false);
      }
    });
  });
}

export function readFilePromise(filePath: string, options: { encoding: string | null, flag: string } | string = null): Promise<any> {
  return new Promise((resolve, reject) => {
    fs.readFile(filePath, options, (err, data) => {
      if (err) {
        reject(err);
      } else {
        resolve(data);
      }
    });
  });
}

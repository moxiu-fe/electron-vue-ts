import * as is from '../is';
import { sleep } from '../helper';
import sqlite3ELectron from 'sqlite3-electron';
import log from '../../main/main.log';
import path from 'path';
import fse from 'fs-extra';

const sqlite3 = is.dev() ? sqlite3ELectron.verbose() : sqlite3ELectron;
const Database = sqlite3.Database;

Database.prototype.__getPromise = normalizePromiseMethod(Database.prototype.get);
Database.prototype.__allPromise = normalizePromiseMethod(Database.prototype.all);
Database.prototype.__execPromise = normalizePromiseMethod(Database.prototype.exec);

function normalizePromiseMethod(fn) {
  // eslint-disable-next-line space-before-function-paren
  return function () {
    const args = Array.prototype.slice.call(arguments);
    const len = args.length;
    if (len && typeof args[len - 1] === 'function') args.pop();
    return new Promise((resolve, reject) => {
      // eslint-disable-next-line space-before-function-paren
      args.push(function (err, data) {
        if (err) {
          log.error('执行sql错误：', args[0], err);
          reject(err);
        } else {
          resolve(data);
          // if (is.dev()) log.info('执行sql成功：', args[0], data)
        }
      });
      fn.apply(this, args);
    });
  };
}

export function closeDB(dbFilePath) {
  if (cache[dbFilePath]) cache[dbFilePath].close();
  cache[dbFilePath] = null;
}

const cache: { [dbFilePath: string]: any } = {};

export async function openDb(dbFilePath: string, tag: string = 'OPEN_READWRITE'): Promise<any> {
  return new Promise((resolve, reject) => {
    fse.ensureDirSync(path.dirname(dbFilePath));

    const db = new sqlite3.Database(dbFilePath, tag, (err) => {
      if (err) {
        reject(err);
        log.error('sqlite3 打开失败', err);
      }
    });

    db.addListener('open', () => {
      log.info('sqlite3 已打开');
      cache[dbFilePath] = db;
      resolve(cache[dbFilePath]);
    });

    db.addListener('error', (err) => {
      log.error('sqlite3 发生错误', err);
    });

    db.addListener('close', () => {
      log.info('sqlite3 已关闭');
      cache[dbFilePath] = null;
    });
  });
}

export async function initTables(dbFilePath: string, tableStructure: { [version: string]: { indexes?: { [index: string]: string }, tables?: { [tableName: string]: string } } }): Promise<any> {
  let db;
  let currentDbTableVersion = 'v0';
  const tableV = Object.keys(tableStructure).sort((a, b) => Number(a.replace('v', '')) - Number(b.replace('v', '')));

  try {
    db = await openDb(dbFilePath);
    const rows = await db.__allPromise('select tbl_name,sql from sqlite_master where type="table"');
    const currTables = rows.map(ele => ele.tbl_name);

    if (!currTables.length || currTables.indexOf('T_SystemInfo') === -1) {
      currentDbTableVersion = 'v0';
    } else {
      const row = await db.__getPromise('select value from T_SystemInfo where keyId="dbTableVersion"'); // 从表T_SystemInfo中获取数据库表结构版本
      if (row && tableV.indexOf(row.value) !== -1) {
        currentDbTableVersion = row.value;
      } else {
        throw new Error(`表T_SystemInfo中dbTableVersion数据异常:${JSON.stringify(row)}`);
      }
    }
  } catch (err) { // 兜底,数据异常，直接删除本地数据库文件，重新初始化
    log.error('判断数据库表结构错误：', err);

    currentDbTableVersion = 'v0';
    closeDB(dbFilePath);
    await sleep(1000);
    await fse.remove(dbFilePath);
    db = openDb(dbFilePath);
    await sleep(1000);
  }

  log.info('当前数据库表结构版本：', currentDbTableVersion);

  // v1 --> v2 --> v3
  if (currentDbTableVersion !== tableV[tableV.length - 1]) { // 当前数据库表结构版本不是最新的版本
    let sqlTable = '';
    let sqlIndex = '';

    for (const i in tableV) {
      const v = tableV[i];
      if (Number(v.replace('v', '')) <= Number(currentDbTableVersion.replace('v', ''))) continue;
      const { tables, indexes } = tableStructure[v];
      if (tables && Object.keys(tables).length) {
        Object.keys(tables).forEach(item => {
          if (tables[item]) sqlTable += tables[item] + ';';
        });
      }
      if (indexes && Object.keys(indexes).length) {
        Object.keys(indexes).forEach(item => {
          if (indexes[item]) sqlIndex += indexes[item] + ';';
        });
      }
    }

    if (sqlTable) await db.__execPromise(`begin exclusive;${sqlTable}commit;`);
    if (sqlIndex) await db.__execPromise(`begin exclusive;${sqlIndex}commit;`); // 索引必须放后面更新

    await sleep(1000);
    await db.__execPromise(`insert or replace into T_SystemInfo (keyId, value, name) values ("dbTableVersion","${tableV[tableV.length - 1]}","数据库表结构版本");`);

    await sleep(1000);
  }
  return db;
}

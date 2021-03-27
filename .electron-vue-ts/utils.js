'use strict';

const glob = require('glob');

exports.getMultiWorkerEntry = () => {
  let entries = {};
  let entryJSPath = glob.sync('./src/worker/*.js');
  let entryTSPath = glob.sync('./src/worker/*.ts');

  [...entryJSPath, ...entryTSPath].forEach(entry => {
    const arr = entry.split('/');
    const fileName = arr.slice(-1).join('').replace(/\.(t|j)s$/, '')
    entries[fileName] = entry
  });

  return entries;
};

exports.getMultiChildProcessEntry = () => {
  let entries = {};
  let entryJSPath = glob.sync('./src/childProcess/*.js');
  let entryTSPath = glob.sync('./src/childProcess/*.ts');

  [...entryJSPath, ...entryTSPath].forEach(entry => {
    const arr = entry.split('/');
    const fileName = arr.slice(-1).join('').replace(/\.ts$/, '')
    entries[fileName] = entry
  });

  return entries;
};

const easyjson = require('easyjson');

easyjson.path('./package.json')
  .modify('name', 'electron-vue-ts-stg');

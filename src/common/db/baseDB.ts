import electron from 'electron';
import path from 'path';
import fse from 'fs-extra';

export function getDbPath(id: string): string {
  id = String(id).toUpperCase();
  const app = electron.app || electron.remote.app;
  const userData = app.getPath('userData');
  const dbDir = path.resolve(userData, id, './sqlite/');
  fse.ensureDirSync(dbDir);
  return path.join(dbDir, 'base.db');
}

export const tableStructure = {
  v2: {
    indexes: {
      I_T_User_umName: 'create index index_T_User_userName on T_User (userName)'
    }
  },
  v1: {
    tables: {
      T_User: 'create table T_User (id text primary key not null, userName text collate nocase, iconUrl text, sex text, signature text, createdAt text, updatedAt text)',
      T_SystemInfo: 'create table T_SystemInfo (keyId text primary key not null, value text, name text)'
    }
  }
};

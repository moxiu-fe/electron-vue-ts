// ⚠️：不能在登录Renderer中使用此模块，因为此时db尚未初始化完成
import { Sequelize, Model, ModelCtor, TEXT } from 'sequelize-electron';
import { getDbPath } from '@common/db/baseDB';
import * as is from '@common/is';
import { localStorage } from '../common/storage';

function initSequelize(id: string): Sequelize {
  return new Sequelize({
    database: 'base',
    dialect: 'sqlite',
    storage: getDbPath(id),
    logging: is.dev()
  });
}

function initModels(sequelize: Sequelize): { [key: string]: ModelCtor<Model> } {
  class User extends Model { };
  User.init({
    id: {
      type: TEXT,
      allowNull: false,
      primaryKey: true
    },
    userName: {
      type: TEXT
    },
    iconUrl: {
      type: TEXT
    },
    sex: {
      type: TEXT
    },
  }, {
    sequelize,
    timestamps: true,
    modelName: 'User',
    tableName: 'T_User', // 表名前面加'T_'标识符
    freezeTableName: true
  });

  class SystemInfo extends Model { };
  SystemInfo.init({
    keyId: {
      type: TEXT,
      allowNull: false,
      primaryKey: true
    },
    value: {
      type: TEXT
    },
    name: {
      type: TEXT
    }
  }, {
    sequelize,
    timestamps: false,
    modelName: 'SystemInfo',
    tableName: 'T_SystemInfo', // 表名前面加'T_'标识符
    freezeTableName: true
  });

  return sequelize.models;
}

const { id = '' } = localStorage.getItem('user') || {};
const baseDBSequelize = initSequelize(id);

export default baseDBSequelize;
export const baseDBModels = initModels(baseDBSequelize);

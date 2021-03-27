// token登录状态
export enum TOKEN_LOGIN_STATUS {
  PENDING = 'pending', // 进行中
  FULFILLED = 'fulfilled', // 已成功
  REJECTED = 'rejected' // 已失败
};

// webscoket连接状态
export enum SOCKET_CONNECT_STATUS {
  CONNECT_NOT_CREATED = '-1', // 连接未建立
  CONNECTED = '0', // 连接成功。
  CONNECTING = '1', // 连接中。
  DISCONNECTED = '2', // 断开连接。
  CONNECTION_CLOSING = '4', // 连接关闭中
  CONNECTION_CLOSED = '5', // 连接关闭。
  NETWORK_UNAVAILABLE = '7', // 网络不可用。
  CONNECTION_ERROR = '8', // 连接错误
  CONNECT_KICK = '9', // 已在另一设备登录，当前连接被踢下线
  CONNECT_EXPIRED = '10' // 登录已过期，连接中断
}

// 通用错误码
export enum ERROR_CODE {
  TIMEOUT = '-1',
  UNKNOWN = '-2',
  SUCCESS = '0',

  PARAMETERS_ERROR = '1001',
  SERVER_UNAVAILABLE = '1002',
  NETWORK_UNAVAILABLE = '1003',

  // 登录异常
  LOGIN_ERROR = '1101',
  LOGIN_ANOTHER_DEVICE = '1102',
  LOGIN_EXPIRED = '1103',
  LOGIN_KICK = '1104',

  // websocket异常
  CONNECT_NOT_CREATED = '1201',
  CONNECT_UNAVAILABLE = '1202',
  DISCONNECTED = '1203',
  CONNECT_TIMEOUT = '1204'
};

// 通用错误码中文对照
export enum ERROR_MESSAGE {
  TIMEOUT = '超时',
  UNKNOWN = '未知错误',
  SUCCESS = '操作成功',

  PARAMETERS_ERROR = '参数错误',
  SERVER_UNAVAILABLE = '服务不可用',
  NETWORK_UNAVAILABLE = '网络不可用',

  // 登录异常
  LOGIN_ERROR = '登录异常',
  LOGGED_ANOTHER_DEVICE = '已在其他设备登录，当前登录失败',
  LOGIN_EXPIRED = '登录已过期',
  LOGIN_KICK = '已在另一设备登录，当前登录被踢下线',

  // socket异常
  CONNECT_NOT_CREATED = 'websocket连接未建立',
  CONNECT_UNAVAILABLE = 'websocket连接不可用',
  DISCONNECTED = 'websocket已断开连接',
  CONNECT_TIMEOUT = 'websocket连接超时'
};

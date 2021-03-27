import axios, { AxiosInterceptorManager, AxiosRequestConfig, AxiosResponse } from 'axios';
import Qs from 'qs';
import { isObject } from '@common/helper';

// 请求数据类型: formData key=>value 形式
export const CONTENT_TYPE_FORM = 'application/x-www-form-urlencoded;charset=utf-8';
// 请求数据类型: json 格式
export const CONTENT_TYPE_JSON = 'application/json;charset=utf-8';
// 请求数据类型: formData multipart json 格式
export const CONTENT_TYPE_MULTIPART = 'multipart/form-data;charset=utf-8';
// Accept JSON
export const ACCEPT_JSON = 'application/json';

export interface HttpInstance {
  (config: AxiosRequestConfig): Promise<any>;
  interceptors: {
    request: AxiosInterceptorManager<AxiosRequestConfig>;
    response: AxiosInterceptorManager<AxiosResponse>;
  };
}

const instance: HttpInstance = axios.create({
  timeout: 60000,
  withCredentials: true, // 跨域携带cookie
  headers: {
    'Content-Type': CONTENT_TYPE_JSON // 默认以JSON格式发送请求体
  }
});

// request拦截器
instance.interceptors.request.use(
  config => {
    const { data, headers } = config;
    // json数据格式化
    if (isObject(data) && headers['Content-Type'] === CONTENT_TYPE_JSON) {
      config.data = JSON.stringify(config.data);
    } else if (isObject(data) && headers['Content-Type'] === CONTENT_TYPE_FORM) {
      // form表单数据格式化
      config.data = Qs.stringify(config.data);
    }
    return config;
  },
  error => Promise.reject(error)
);

// response拦截器
instance.interceptors.response.use(
  response => {
    const res = response.data || {};
    const code = +res.code;
    if (code === 200) {
      return res;
    } else {
      return Promise.reject(res);
    }
  },
  error => {
    const response = error.response;
    const msgs = {
      500: '服务器内部错误，无法完成请求',
      501: '服务器不支持请求的功能，无法完成请求',
      502: '网关错误',
      503: '由于超载或系统维护，服务器暂时的无法处理客户端的请求',
      504: '网关超时'
    };
    if (msgs[response.status]) error.message = msgs[response.status];
    return Promise.reject(error);
  }
);

export default instance;

import * as is from '@common/is';
import { AxiosRequestConfig } from 'axios';

export const baseUrl = is.prod() ? 'https://xxx.com' : 'https://test-xxx.com';

export const apiLogin: AxiosRequestConfig = {
  url: `${baseUrl}/login`,
  method: 'post'
};

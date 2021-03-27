const cookie = {
  _data: null,
  data(sourceData: { [propName: string]: object | string }): any {
    this._data = [];
    // 将json对象拼接成key=value的数组
    for (var attr in sourceData) {
      let _val = sourceData[attr];
      if (typeof _val === 'object') {
        _val = JSON.stringify(_val);
      }
      _val = encodeURIComponent(_val);
      this._data.push(`${attr}=${_val}`);
    }
    return this;
  },
  domain(domain: string = window.location.hostname): any {
    this._data = this._data.map(item => {
      return item + `; domain=${domain}`;
    });
    return this;
  },
  path(path: string = '/'): any {
    this._data = this._data.map(item => {
      return item + `; path=${path}`;
    });
    return this;
  },
  expire(expire: number = 24 * 60): any {
    // expire单位为分钟
    const date = new Date();
    date.setTime(date.getTime() + expire * 60 * 1000);
    this._data = this._data.map(item => {
      return item + `; expires=${date.toUTCString()}`;
    });
    return this;
  },
  store(): void {
    this._data.forEach(item => {
      document.cookie = item;
    });
    this._data = null;
  },
  /**
   *
   * @param {*cookie键值式的对象} data
   * @param {*cookie过期时间(分钟为单位),默认为一天(24*60分钟)} expireMinutes
   * @param {*cookie的存储路径,默认为网址当前路径,例如要存在根域名,则传'/'} cookiePath
   * @param {*cookie的存储域名} cookieDomain,默认为window.location.host
   * cookie机制,子域,根域同名cookie可共存,不同路径的cookie可共存不同路径彼此不可见
   */
  set(data: { [propName: string]: object | string }, expireMinutes?: number, cookiePath?: string, cookieDomain?: string): void {
    this.data(data)
      .expire(expireMinutes)
      .domain(cookieDomain)
      .path(cookiePath)
      .store();
  },
  get(cookieName: string): string | null {
    if (!cookieName) {
      return null;
    }
    if (document.cookie.indexOf(cookieName) !== -1) {
      const cs = document.cookie.split(';');
      for (let i = 0, len = cs.length; i < len; i++) {
        if (cs[i].split('=')[0].trim() === cookieName) {
          return decodeURIComponent(cs[i].split('=')[1]);
        }
      }
    }
    return null;
  },
  clearAll(path?: string, domain?: string): void {
    const cs = document.cookie.split(';');
    for (let i = 0, len = cs.length; i < len; i++) {
      const cookieData = {};
      const key = cs[i].split('=')[0];
      cookieData[key] = this.get(key);
      this.set(cookieData, -24 * 60, path, domain);
    }
  }
};

export default cookie;

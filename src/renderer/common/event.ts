/* eslint-disable space-before-function-paren */
// 发布订阅处理中心
export default (function () {
  const clientList = {};

  const addListener = function (key: string, fn: (...args: any[]) => any): void {
    if (!clientList[key]) clientList[key] = [];
    clientList[key].push(fn);
  };

  const triggerListener = function (...args: any[]): boolean | void {
    const key = args.shift();
    const fns = clientList[key];
    if (!fns || fns.length === 0) return false;
    for (let i = 0, len = fns.length; i < len; i++) {
      fns[i] && fns[i].apply(this, args);
    }
  };

  const removeListener = function (key: string, fn: (...args: any[]) => any): boolean | void {
    const fns = clientList[key];
    if (!fns) {
      return false;
    }
    if (!fn) {
      fns && (fns.length = 0);
    } else {
      for (let l = fns.length - 1; l >= 0; l--) {
        const _fn = fns[l];
        if (_fn === fn) fns.splice(l, 1);
      }
    }
  };

  const onceListener = function (key: string, fn: (...args: any[]) => any): void {
    const _fn = function (...args: any[]) {
      fn.apply(this, args);
      removeListener(key, _fn);
    };
    addListener(key, _fn);
  };

  return {
    addListener,
    triggerListener,
    removeListener,
    onceListener
  };
})();

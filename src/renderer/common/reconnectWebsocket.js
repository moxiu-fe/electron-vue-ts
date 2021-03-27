function ReconnectWebsocket(url, protocols = ['xmpp'], options = {}) {
  this.url = url;
  this.protocols = protocols;
  this.readyState = 'CLOSED'; // readyState:  0:CONNECTING、1:OPEN、2:CLOSING、3:CLOSED
  this.reconnectAttempts = 0;
  this.reconnectTimer = null;
  this.connectTimer = null;

  const settings = {
    debug: false,
    autoOpen: false, // 是否尝试建立连接
    connectTimeout: 10 * 1000, // 建立连接超时时间 ms
    reconnectInterval: 2 * 1000, // 尝试重新建立连接的延迟时间 ms
    maxReconnectInterval: 30 * 1000, // 尝试重新建立连接的最大延迟时间 ms
    reconnectDecay: 2, // 每次尝试重新建立连接时间的延迟时间增长系数
    maxReconnectAttempts: 10 // 最大尝试重新建立连接次数，为null时次数不限，为0时不重连
  };
  for (const key in settings) {
    if (typeof options[key] !== 'undefined') {
      this[key] = options[key];
    } else {
      this[key] = settings[key];
    }
  }

  let ws = null;
  let forcedClose = false;
  const self = this;
  const eventTarget = document.createElement('div');

  eventTarget.addEventListener('open', (event) => { self.onopen && self.onopen(event); }, false);
  eventTarget.addEventListener('closing', (event) => { self.onclosing && self.onclosing(event); }, false);
  eventTarget.addEventListener('close', (event) => { self.onclose && self.onclose(event); }, false);
  eventTarget.addEventListener('connecting', (event) => { self.onconnecting && self.onconnecting(event); }, false);
  eventTarget.addEventListener('message', (event) => { self.onmessage && self.onmessage(event); }, false);
  eventTarget.addEventListener('error', (event) => { self.onerror && self.onerror(event); }, false);

  this.addEventListener = eventTarget.addEventListener.bind(eventTarget);
  this.removeEventListener = eventTarget.removeEventListener.bind(eventTarget);
  this.dispatchEvent = eventTarget.dispatchEvent.bind(eventTarget);

  const generateEvent = (name, code, reason) => {
    let event;
    try {
      event = new Event(name, { bubbles: false, cancelable: true });
    } catch (error) {
      // compliant browsers and IE9 - IE11
      event = document.createEvent('Event');
      event.initEvent(name, false, true);
    }
    event.code = code;
    event.reason = reason;
    return event;
  };

  const removeWs = () => {
    if (ws) {
      // 监听移除, 内存回收
      ws.onopen = null;
      ws.onmessage = null;
      ws.onerror = null;
      ws.onclose = null;
      ws.close(1000);
      ws = null;
    }
  };

  this.open = (reconnectAttempt = false) => {
    removeWs();
    if (!reconnectAttempt) self.reconnectAttempts = 0;

    self.readyState = 'CONNECTING';
    eventTarget.dispatchEvent(generateEvent('connecting'));

    ws = new WebSocket(url, 'xmpp');

    // 连接超时主动关闭
    self.connectTimer = setTimeout(() => {
      ws && ws.close();
      clearTimeout(self.connectTimer);
    }, self.connectTimeout);

    ws.onopen = (event) => {
      if (self.debug) console.log('WebSocket is open now.', event);

      clearTimeout(self.connectTimer);
      self.connectTimer = null;

      clearTimeout(self.reconnectTimer);
      self.reconnectTimer = null;

      self.reconnectAttempts = 0;
      self.readyState = 'OPEN';
      eventTarget.dispatchEvent(generateEvent('open'));
    };
    ws.onclosing = (event) => {
      if (self.debug) console.log('WebSocket is closing now.', event);
    };
    ws.onclose = (event) => {
      if (self.debug) console.log('WebSocket is closed now.', event);

      clearTimeout(self.connectTimer);
      self.connectTimer = null;

      clearTimeout(self.reconnectTimer);
      self.reconnectTimer = null;

      removeWs();
      // 尝试重连
      if (!forcedClose && (self.maxReconnectAttempts === null || self.reconnectAttempts < self.maxReconnectAttempts)) {
        const timeout = self.reconnectInterval * Math.pow(self.reconnectDecay, self.reconnectAttempts);
        self.reconnectTimer = setTimeout(() => {
          self.reconnectAttempts++;
          self.open(true);
        }, timeout > self.maxReconnectInterval ? self.maxReconnectInterval : timeout);
      } else {
        self.readyState = 'CLOSED';
        eventTarget.dispatchEvent(generateEvent('close', event.code, event.reason));
      }
    };

    ws.onmessage = (event) => {
      if (self.debug) console.log('WebSocket message received:', event);
      const e = generateEvent('message');
      e.data = event.data;
      eventTarget.dispatchEvent(e);
    };

    ws.onerror = (event) => {
      if (self.debug) console.log('WebSocket error observed:', event);
      eventTarget.dispatchEvent(generateEvent('error'));
    };
  };

  if (this.autoOpen) this.open();

  /**
   * 发送消息
   * @param {String|ArrayBuffer|Blob} data
   */
  this.send = (data) => {
    if (ws) {
      return ws.send(data);
    } else {
      throw new Error('websocket invalid');
    }
  };

  /**
   * 尝试关闭websocket连接
   * @param {Number} code
   * @param {String} reason
   */
  this.close = (code = 1000, reason) => {
    forcedClose = true;
    self.readyState = 'CLOSING';
    eventTarget.dispatchEvent(generateEvent('closing'));
    if (ws) {
      return ws.close(code, reason);
    } else {
      self.readyState = 'CLOSED';
      eventTarget.dispatchEvent(generateEvent('close'));
    }
  };

  /**
   * 刷新websocket连接 close and re-open
   */
  this.refresh = () => {
    if (ws) {
      ws.close();
    }
  };
  /**
 * 刷新websocket连接 close and re-open
 */
  this.reopen = () => {
    if (ws) {
      ws.close();
    }
  };
}

ReconnectWebsocket.prototype.onopen = () => { };
ReconnectWebsocket.prototype.onclose = () => { };
ReconnectWebsocket.prototype.onconnecting = () => { };
ReconnectWebsocket.prototype.onmessage = () => { };
ReconnectWebsocket.prototype.onerror = () => { };

export default ReconnectWebsocket;

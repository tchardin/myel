// https://github.com/filecoin-shipyard/js-lotus-client-provider-browser/blob/31f07cfb87be4a27121e76eade6a2cc76ae6c5f0/index.js
class BrowserProvider {
  constructor(url, options = {}) {
    this.url = url;
    this.wsUrl =
      options.wsUrl || url.replace(/^https:/, 'wss:').replace(/^http:/, 'ws:');
    this.httpUrl =
      options.httpUrl ||
      url.replace(/^wss:/, 'https:').replace(/^ws:/, 'http:');
    this.importUrl =
      options.importUrl ||
      this.httpUrl.replace(/\/rpc\//, '/rest/') + '/import';
    this.transport = options.transport || (url.match(/^http/) ? 'http' : 'ws');
    this.id = 0;
    this.tag = options.tag;
    this.inflight = new Map();
    this.cancelled = new Map();
    this.subscriptions = new Map();
    if (typeof options.token === 'function') {
      this.tokenCallback = options.token;
    } else {
      this.token = options.token;
      if (this.token && this.token !== '') {
        this.url += `?token=${this.token}`;
      }
    }
    this.WebSocket = options.WebSocket || WebSocket;
    this.fetch = options.fetch || fetch;
  }

  connect() {
    if (!this.connectPromise) {
      const getConnectPromise = () => {
        return new Promise((resolve, reject) => {
          if (this.transport !== 'ws') return resolve();
          this.ws = new this.WebSocket(this.url);
          // FIXME: reject on error or timeout
          this.ws.onopen = function () {
            resolve();
          };
          this.ws.onerror = function () {
            reject(new Error('websocket error'));
          };
          this.ws.onmessage = this.receive.bind(this);
        });
      };
      if (this.tokenCallback) {
        const getToken = async () => {
          this.token = await this.tokenCallback();
          delete this.tokenCallback;
          if (this.token && this.token !== '') {
            this.url += `?token=${this.token}`;
          }
        };
        this.connectPromise = getToken().then(() => getConnectPromise());
      } else {
        this.connectPromise = getConnectPromise();
      }
    }
    return this.connectPromise;
  }

  send(request, schemaMethod) {
    const jsonRpcRequest = {
      jsonrpc: '2.0',
      id: this.id++,
      ...request,
    };
    if (this.transport === 'ws') {
      return this.sendWs(jsonRpcRequest);
    } else {
      return this.sendHttp(jsonRpcRequest);
    }
  }

  async sendHttp(jsonRpcRequest) {
    await this.connect();
    const headers = {
      'Content-Type': 'text/plain;charset=UTF-8',
      Accept: '*/*',
    };
    if (this.token) {
      headers.Authorization = `Bearer ${this.token}`;
    }
    const response = await this.fetch(this.httpUrl, {
      method: 'POST',
      headers,
      body: JSON.stringify(jsonRpcRequest),
    });
    // FIXME: Check return code, errors
    const {error, result} = await response.json();
    if (error) {
      // FIXME: Return error class with error.code
      throw new Error(error.message);
    }
    return result;
  }

  sendWs(jsonRpcRequest) {
    const promise = new Promise((resolve, reject) => {
      if (this.destroyed) {
        reject(new Error('WebSocket has already been destroyed'));
      }
      this.ws.send(JSON.stringify(jsonRpcRequest));
      // FIXME: Add timeout
      this.inflight.set(jsonRpcRequest.id, (err, result) => {
        if (err) {
          reject(err);
        } else {
          resolve(result);
        }
      });
    });
    return promise;
  }

  sendSubscription(request, schemaMethod, subscriptionCb) {
    let chanId = null;
    const json = {
      jsonrpc: '2.0',
      id: this.id++,
      ...request,
    };
    if (this.transport !== 'ws') {
      return [
        () => {},
        Promise.reject(
          new Error('Subscriptions only supported for WebSocket transport')
        ),
      ];
    }
    const promise = this.connect().then(() => {
      this.ws.send(JSON.stringify(json));
      // FIXME: Add timeout
      return new Promise((resolve, reject) => {
        this.inflight.set(json.id, (err, result) => {
          chanId = result;
          // console.info(`New subscription ${json.id} using channel ${chanId}`)
          this.subscriptions.set(chanId, subscriptionCb);
          if (err) {
            reject(err);
          } else {
            resolve();
          }
        });
      });
    });
    return [cancel.bind(this), promise];
    async function cancel() {
      await promise;
      this.inflight.delete(json.id);
      if (chanId !== null) {
        this.subscriptions.delete(chanId);
        await new Promise((resolve) => {
          // FIXME: Add timeout
          this.cancelled.set(chanId, {
            cancelledAt: Date.now(),
            closeCb: resolve,
          });
          if (!this.destroyed) {
            this.sendWs({
              jsonrpc: '2.0',
              method: 'xrpc.cancel',
              params: [json.id],
            });
          }
        });
        // console.info(`Subscription ${json.id} cancelled, channel ${chanId} closed.`)
      }
    }
  }

  receive(event) {
    try {
      const {id, error, result, method, params} = JSON.parse(event.data);
      // FIXME: Check return code, errors
      if (method === 'xrpc.ch.val') {
        // FIXME: Check return code, errors
        const [chanId, data] = params;
        const subscriptionCb = this.subscriptions.get(chanId);
        if (subscriptionCb) {
          subscriptionCb(data);
        } else {
          const {cancelledAt} = this.cancelled.get(chanId);
          if (cancelledAt) {
            if (Date.now() - cancelledAt > 2000) {
              console.warn(
                'Received stale response for cancelled subscription on channel',
                chanId
              );
            }
          } else {
            console.warn('Could not find subscription for channel', chanId);
          }
        }
      } else if (method === 'xrpc.ch.close') {
        // FIXME: Check return code, errors
        const [chanId] = params;
        const {closeCb} = this.cancelled.get(chanId);
        if (!closeCb) {
          console.warn(`Channel ${chanId} was closed before being cancelled`);
        } else {
          // console.info(`Channel ${chanId} was closed, calling callback`)
          closeCb();
        }
      } else {
        const cb = this.inflight.get(id);
        if (cb) {
          this.inflight.delete(id);
          if (error) {
            // FIXME: Return error class with error.code
            return cb(new Error(error.message));
          }
          cb(null, result);
        } else {
          console.warn(`Couldn't find request for ${id}`);
        }
      }
    } catch (e) {
      console.error('RPC receive error', e);
    }
  }

  async importFile(body) {
    await this.connect();
    const headers = {
      'Content-Type': body.type,
      Accept: '*/*',
      Authorization: `Bearer ${this.token}`,
    };
    const response = await this.fetch(this.importUrl, {
      method: 'PUT',
      headers,
      body,
    });
    // FIXME: Check return code, errors
    const result = await response.json();
    const {
      Cid: {'/': cid},
    } = result;

    return cid;
  }

  async destroy(code = 1000) {
    // List of codes: https://developer.mozilla.org/en-US/docs/Web/API/CloseEvent#Status_codes
    if (this.ws) {
      this.ws.close(code);
      this.destroyed = true;
    }
  }
}

export default BrowserProvider;

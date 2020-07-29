// https://github.com/filecoin-shipyard/js-lotus-client-rpc/blob/c6b2e90acfdc95182c84cc7c664ad1688931706a/index.js
//
const overrideSubs = {
  MpoolSub: true,
};

class LotusRPC {
  constructor(provider, {schema}) {
    this.provider = provider;
    this.schema = schema;
    return new Proxy(this, {
      get: (obj, prop) => {
        if (prop in obj) {
          return obj[prop];
        } else if (prop === Symbol.iterator) {
          return undefined;
        } else if (prop === Symbol.toStringTag) {
          return undefined;
        } else if (prop === '$$typeof') {
          return undefined;
        } else if (prop === 'then') {
          return undefined;
        } else {
          const method = prop.charAt(0).toUpperCase() + prop.slice(1);
          const schemaMethod = schema.methods[method];
          if (schemaMethod) {
            if (schemaMethod.subscription || overrideSubs[method]) {
              return this.callSchemaMethodSub.bind(this, method, schemaMethod);
            } else {
              return this.callSchemaMethod.bind(this, method, schemaMethod);
            }
          } else {
            // FIXME: throw?
            console.warn(`Unknown method ${method}`);
          }
        }
      },
    });
  }

  async callSchemaMethod(method, schemaMethod, ...args) {
    await this.provider.connect();
    const request = {
      method: `Filecoin.${method}`,
    };
    request.params = args;
    return this.provider.send(request, schemaMethod);
  }

  callSchemaMethodSub(method, schemaMethod, ...args) {
    // await this.provider.connect()
    const request = {
      method: `Filecoin.${method}`,
    };
    const cb = args[0];
    request.params = args.slice(1);
    return this.provider.sendSubscription(request, schemaMethod, cb);
  }

  async importFile(body) {
    return this.provider.importFile(body);
  }

  async destroy() {
    await this.provider.destroy();
  }
}

export default LotusRPC;

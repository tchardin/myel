// MyelRPC selects the relevant provider based on the method called

class MyelRPC {
  constructor(config) {
    const {myel, lotusFullNode, lotusStorageMiner} = config;
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
          if (method in myel.schema.methods) {
            this.provider = myel.provider;
            this.schema = myel.schema;
            this.tag = myel.tag;
          } else if (method in lotusFullNode.schema.methods) {
            this.provider = lotusFullNode.provider;
            this.schema = lotusFullNode.schema;
            this.tag = lotusFullNode.tag;
          } else if (method in lotusStorageMiner.schema.methods) {
            this.provider = lotusStorageMiner.provider;
            this.schema = lotusStorageMiner.schema.methods;
            this.tag = lotusStorageMiner.tag;
          } else {
            // FIXME: throw?
            console.warn(`Unknown method ${method}`);
          }
          const schemaMethod = this.schema.methods[method];
          if (schemaMethod.subscription) {
            return this.callSchemaMethodSub.bind(this, method, schemaMethod);
          } else {
            return this.callSchemaMethod.bind(this, method, schemaMethod);
          }
        }
      },
    });
  }
  async callSchemaMethod(method, schemaMethod, ...args) {
    await this.provider.connect();
    const request = {
      method: `${this.tag}.${method}`,
    };
    request.params = args;
    return this.provider.send(request, schemaMethod);
  }

  callSchemaMethodSub(method, schemaMethod, ...args) {
    // await this.provider.connect()
    const request = {
      method: `${this.tag}.${method}`,
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

export default MyelRPC;

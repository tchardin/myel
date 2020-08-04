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
          let provider;
          let schema;
          if (method in myel.schema.methods) {
            provider = myel.provider;
            schema = myel.schema;
          } else if (method in lotusFullNode.schema.methods) {
            provider = lotusFullNode.provider;
            schema = lotusFullNode.schema;
          } else if (method in lotusStorageMiner.schema.methods) {
            provider = lotusStorageMiner.provider;
            this.schema = lotusStorageMiner.schema.methods;
          } else {
            // FIXME: throw?
            console.warn(`Unknown method ${method}`);
          }
          const schemaMethod = schema.methods[method];
          if (schemaMethod.subscription) {
            return this.callSchemaMethodSub.bind(
              this,
              provider,
              method,
              schemaMethod
            );
          } else {
            return this.callSchemaMethod.bind(
              this,
              provider,
              method,
              schemaMethod
            );
          }
        }
      },
    });
  }
  async callSchemaMethod(provider, method, schemaMethod, ...args) {
    await provider.connect();
    const request = {
      method: `${provider.tag}.${method}`,
    };
    request.params = args;
    return provider.send(request, schemaMethod);
  }

  callSchemaMethodSub(provider, method, schemaMethod, ...args) {
    // await this.provider.connect()
    const request = {
      method: `${provider.tag}.${method}`,
    };
    const cb = args[0];
    request.params = args.slice(1);
    return provider.sendSubscription(request, schemaMethod, cb);
  }

  async importFile(body) {
    return this.provider.importFile(body);
  }

  async destroy() {
    await this.provider.destroy();
  }
}

export default MyelRPC;

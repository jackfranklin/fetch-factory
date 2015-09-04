import _ from 'lodash';

const DEFAULT_REQUEST_METHOD = 'GET';

const fetchFactory = {
  create: function(options, methods) {
    this.factory = {};

    this.defaultOptions = options;

    Object.keys(methods).forEach(function(method) {
      this.defineMethod(method, methods[method]);
    }, this);

    return this.factory;
  },
  defineMethod: function(methodName, methodConfig) {
    this.factory[methodName] = function(runtimeConfig) {
      runtimeConfig = runtimeConfig || {};
      var requestMethod = methodConfig.method || this.defaultOptions.method;

      var fetchOptions = {
        method: runtimeConfig.method || methodConfig.method || this.defaultOptions.method || DEFAULT_REQUEST_METHOD,
        headers: runtimeConfig.headers || {},
        body: null,
      }

      if (requestMethod === 'POST') {
        fetchOptions.headers['Accept'] = 'application/json';
        fetchOptions.headers['Content-Type'] = 'application/json';

        fetchOptions.body = JSON.stringify(runtimeConfig.data);
      }

      // no need to send headers if we don't have any
      if (_.isEmpty(fetchOptions.headers)) {
        fetchOptions.headers = null;
      }

      return fetch(
        runtimeConfig.url || methodConfig.url || this.defaultOptions.url,
        _.pick(fetchOptions, function(item) {
          return !!item;
        })
      );
    }.bind(this)
  }
};

export default fetchFactory;


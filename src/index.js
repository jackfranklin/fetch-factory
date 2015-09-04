import _ from 'lodash';
import queryString from 'query-string';

import UrlPattern from 'url-pattern';

const DEFAULT_REQUEST_METHOD = 'GET';

const fetchFactory = {
  create(options, methods) {
    this.factory = {};

    this.defaultOptions = options;

    Object.keys(methods).forEach(function(method) {
      this.defineMethod(method, methods[method]);
    }, this);

    return this.factory;
  },

  placeholdersInUrl(url) {
    const placeholderRegex = /(:\w+)/g;
    return (url.match(placeholderRegex) || []).map((key) => key.substring(1));
  },

  constructUrl(urlBase, params = {}) {
    const urlPattern = new UrlPattern(urlBase);
    const placeholdersInUrl = this.placeholdersInUrl(urlBase);
    const urlWithPlaceholdersFilled = urlPattern.stringify(params);

    const queryParams = _.pick(params, (val, paramKey) => {
      return placeholdersInUrl.indexOf(paramKey) === -1;
    });

    const stringifiedParams = queryString.stringify(queryParams);

    return urlWithPlaceholdersFilled + (stringifiedParams ? `?${stringifiedParams}` : '');
  },

  defineMethod(methodName, methodConfig) {
    this.factory[methodName] = function(runtimeConfig) {
      runtimeConfig = runtimeConfig || {};
      var requestMethod = methodConfig.method || this.defaultOptions.method;

      var fetchOptions = {
        method: runtimeConfig.method || methodConfig.method || this.defaultOptions.method || DEFAULT_REQUEST_METHOD,
        headers: runtimeConfig.headers || {},
        params: runtimeConfig.params || {},
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

      const baseUrl = runtimeConfig.url || methodConfig.url || this.defaultOptions.url;

      return fetch(
        this.constructUrl(baseUrl, fetchOptions.params),
        _.pick(fetchOptions, (val, key) => {
          const valExists = val != null && !_.isEmpty(val);

          return valExists && key !== 'params';
        })
      );
    }.bind(this)
  }
};

export default fetchFactory;


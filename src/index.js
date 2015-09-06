import _ from 'lodash';
import queryString from 'query-string';

import UrlPattern from 'url-pattern';

const DEFAULT_REQUEST_METHOD = 'GET';

const fetchFactory = {
  create(options, methods) {
    this.factory = {};

    this.defaultOptions = options;

    Object.keys(methods).forEach((method) => {
      this.defineMethod(method, methods[method]);
    });

    return this.factory;
  },

  placeholdersInUrl(url) {
    const placeholderRegex = /(:\w+)/g;
    return (url.match(placeholderRegex) || []).map((key) => key.substring(1));
  },

  constructUrl(urlBase, params = {}) {
    const protocolRegex = /^(http|https):\/\//i;

    const protocolMatch = urlBase.match(protocolRegex) && urlBase.match(protocolRegex)[0];

    // TODO: bit funky - UrlPattern can't deal with the protocol ?
    if (protocolMatch) {
      urlBase = urlBase.replace(protocolRegex, '');
    }

    const urlPattern = new UrlPattern(urlBase);
    const placeholdersInUrl = this.placeholdersInUrl(urlBase);

    const placeholderParams = placeholdersInUrl.reduce((obj, key) => {
      return _.merge(obj, { [key]: params[key] || '' });
    }, {});

    const urlWithPlaceholdersFilled = urlPattern.stringify(placeholderParams);

    const queryParams = _.pick(params, (val, paramKey) => {
      return placeholdersInUrl.indexOf(paramKey) === -1;
    });

    const stringifiedParams = queryString.stringify(queryParams);

    const fullUrl = urlWithPlaceholdersFilled + (stringifiedParams ? `?${stringifiedParams}` : '');

    if (protocolMatch) {
      return protocolMatch + fullUrl.replace(/\/$/, '');
    } else {
      return fullUrl.replace(/\/$/, '');
    }
  },

  defineMethod(methodName, methodConfig) {
    this.factory[methodName] = function(runtimeConfig) {
      runtimeConfig = runtimeConfig || {};
      var requestMethod = methodConfig.method || this.defaultOptions.method;

      var fetchOptions = {
        method: runtimeConfig.method || methodConfig.method || this.defaultOptions.method || DEFAULT_REQUEST_METHOD,
        headers: runtimeConfig.headers || methodConfig.headers || {},
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

      let responseInterceptors = _.get(this.defaultOptions, 'interceptors.response', [(response) => response.json()]);

      if (!Array.isArray(responseInterceptors)) {
        responseInterceptors = [responseInterceptors];
      }

      let fetchRequest = fetch(
        this.constructUrl(baseUrl, runtimeConfig.params),
        _.pick(fetchOptions, (val, key) => {
          return val != null && !_.isEmpty(val);
        })
      );

      return responseInterceptors.reduce((request, interceptor) => {
        return request.then(interceptor);
      }, fetchRequest);
    }.bind(this)
  }
};

export default fetchFactory;


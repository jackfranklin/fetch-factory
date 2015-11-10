import _ from 'lodash';
import queryString from 'query-string';
import UrlPattern from 'url-pattern';

const DEFAULT_REQUEST_METHOD = 'GET';

const fetchFactoryTemplates = {
  find: {
    method: 'GET',
  },
  create: {
    method: 'POST',
  },
  update: {
    method: 'PUT',
  },
};

const fetchFactory = {
  create(options, methods = {}) {
    this.factory = {};

    this.defaultOptions = options;

    const templateMethods = (options.methods || []).map((methodName) => {
      if (fetchFactoryTemplates[methodName]) {
        return { [methodName]: fetchFactoryTemplates[methodName] };
      } else {
        throw new Error(`Unknown method ${methodName}`);
      }
    }).reduce(_.extend, {});

    Object.keys(templateMethods).forEach((method) => {
      this.defineMethod(method, templateMethods[method]);
    });

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

  removeNullFetchOptions(options) {
    return _.pick(options, (v, k) => v != null && !_.isEmpty(v));
  },

  defineMethod(methodName, methodConfig) {
    this.factory[methodName] = (runtimeConfig = {}) => {
      const requestMethod = methodConfig.method || this.defaultOptions.method;

      const fetchOptions = {
        method: runtimeConfig.method || methodConfig.method || this.defaultOptions.method || DEFAULT_REQUEST_METHOD,
        headers: runtimeConfig.headers || methodConfig.headers || {},
        body: null,
      }

      if (requestMethod === 'POST' || requestMethod === 'PUT') {
        fetchOptions.headers['Accept'] = 'application/json';
        fetchOptions.headers['Content-Type'] = 'application/json';

        fetchOptions.body = JSON.stringify(runtimeConfig.data);
      }

      const baseUrl = runtimeConfig.url || methodConfig.url || this.defaultOptions.url;

      let responseInterceptors = _.get(this.defaultOptions, 'interceptors.response', [(response) => response.json()]);

      if (!Array.isArray(responseInterceptors)) {
        responseInterceptors = [responseInterceptors];
      }

      let requestInterceptors = _.get(this.defaultOptions, 'interceptors.request', []);

      if (!Array.isArray(requestInterceptors)) {
        requestInterceptors = [requestInterceptors];
      }

      let requestOptions = requestInterceptors.reduce((options, interceptor) => {
        return interceptor(options);
      }, fetchOptions);

      requestOptions = this.removeNullFetchOptions(requestOptions);

      const fetchRequest = fetch(
        this.constructUrl(baseUrl, runtimeConfig.params),
        requestOptions
      );

      return responseInterceptors.reduce((request, interceptor) => {
        return request.then(interceptor);
      }, fetchRequest);
    };
  }
};

export default fetchFactory;

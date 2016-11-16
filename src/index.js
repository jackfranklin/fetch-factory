import assign from 'lodash.assign';
import pickBy from 'lodash.pickBy';
import get from 'lodash.get';
import isEmpty from 'lodash.isEmpty';

import { constructUrl } from './url-parsing';

const DEFAULT_REQUEST_METHOD = 'GET';

const throwOnResponseError = (response) => {
  if (response.status >= 200 && response.status < 300) {
    return response;
  } else {
    const error = new Error(response.statusText);
    error.response = response;
    throw error;
  }
}

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

class FetchFactory {
  constructor(options, methods = {}) {
    this.factory = {};

    this.defaultOptions = options;

    const templateMethods = (options.methods || []).map((methodName) => {
      if (fetchFactoryTemplates[methodName]) {
        return { [methodName]: fetchFactoryTemplates[methodName] };
      } else {
        throw new Error(`Unknown method ${methodName}`);
      }
    }).reduce(assign, {});

    Object.keys(templateMethods).forEach((method) => {
      this.defineMethod(method, templateMethods[method]);
    });

    Object.keys(methods).forEach((method) => {
      this.defineMethod(method, methods[method]);
    });
  }

  removeNullFetchOptions(options) {
    return pickBy(options, (v, k) => v != null && !isEmpty(v));
  }

  getResponseInterceptors() {
    let responseInterceptors = get(
      this.defaultOptions,
      'interceptors.response',
      [throwOnResponseError, (response) => response.json()]
    );

    if (!Array.isArray(responseInterceptors)) {
      responseInterceptors = [responseInterceptors];
    }

    return responseInterceptors;
  }

  getRequestInterceptors() {
    let requestInterceptors = get(this.defaultOptions, 'interceptors.request', []);

    if (!Array.isArray(requestInterceptors)) {
      requestInterceptors = [requestInterceptors];
    }

    return requestInterceptors;
  }

  applyRequestInterceptors(interceptors, fetchOptions) {
    return interceptors.reduce((options, interceptor) => {
      return options.then(interceptor);
    }, Promise.resolve(fetchOptions));
  }

  applyResponseInterceptors(interceptors, fetchResult) {
    return interceptors.reduce((result, interceptor) => {
      return result.then(interceptor);
    }, fetchResult);
  }

  defineMethod(methodName, methodConfig) {
    this.factory[methodName] = (runtimeConfig = {}) => {
      const requestMethod = methodConfig.method || this.defaultOptions.method;

      const fetchOptions = {
        method: [
          this.defaultOptions,
          methodConfig,
          runtimeConfig,
        ].reduce((method, config) => config.method || method, DEFAULT_REQUEST_METHOD),
        headers: runtimeConfig.headers || methodConfig.headers || {},
        body: null,
      }

      if (requestMethod === 'POST' || requestMethod === 'PUT') {
        fetchOptions.headers['Accept'] = 'application/json';
        fetchOptions.headers['Content-Type'] = 'application/json';

        fetchOptions.body = JSON.stringify(runtimeConfig.data);
      }

      const baseUrl = runtimeConfig.url || methodConfig.url || this.defaultOptions.url;

      const requestInterceptors = this.getRequestInterceptors();
      const requestOptionsPromise = this.applyRequestInterceptors(
        requestInterceptors,
        fetchOptions
      );

      return requestOptionsPromise.then((requestOptions) => {
        return this.removeNullFetchOptions(requestOptions);
      }).then((requestOptions) => {
        const requestUrl = constructUrl(baseUrl, runtimeConfig.params);
        const fetchResult = fetch(requestUrl, requestOptions);
        const responseInterceptors = this.getResponseInterceptors();

        return this.applyResponseInterceptors(responseInterceptors, fetchResult);
      });
    };
  }
}

const fetchFactory = {
  create(options, methods = {}) {
    return new FetchFactory(options, methods).factory;
  },
};

export default fetchFactory;

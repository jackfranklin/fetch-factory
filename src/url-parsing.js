import UrlPattern from 'url-pattern';
import pickBy from 'lodash.pickBy';
import merge from 'lodash.merge';
import queryString from 'query-string';

export function placeholdersInUrl(url) {
  const placeholderRegex = /(:\w+)/g;
  return (url.match(placeholderRegex) || []).map((key) => key.substring(1));
}

export function constructUrl(urlBase, params = {}) {
  const portRegex = /:(\d+)/;

  const portMatch = urlBase.match(portRegex);

  const protocolRegex = /^(http|https):\/\//i;

  const protocolMatch = urlBase.match(protocolRegex) && urlBase.match(protocolRegex)[0];

  // TODO: bit funky - UrlPattern can't deal with the protocol ?
  if (protocolMatch) {
    urlBase = urlBase.replace(protocolRegex, '');
  }

  const urlPattern = new UrlPattern(urlBase);
  const placeholders = placeholdersInUrl(urlBase);

  const placeholderParams = placeholders.reduce((obj, key) => {
    return merge(obj, { [key]: params[key] || '' });
  }, {});

  if (portMatch) {
    placeholderParams[portMatch[1]] = portMatch[0];
  }

  const urlWithPlaceholdersFilled = urlPattern.stringify(placeholderParams);

  const queryParams = pickBy(params, (val, paramKey) => {
    return placeholders.indexOf(paramKey) === -1;
  });

  const stringifiedParams = queryString.stringify(queryParams);

  const fullUrl = urlWithPlaceholdersFilled + (stringifiedParams ? `?${stringifiedParams}` : '');

  if (protocolMatch) {
    return protocolMatch + fullUrl.replace(/\/$/, '');
  } else {
    return fullUrl.replace(/\/$/, '');
  }
}

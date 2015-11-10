import nock from 'nock';

export const BASE_URL = 'http://www.api.com';

export function defaultMock(slash = '/users') {
  return nock(BASE_URL).get(slash).reply(200, {
    name: 'jack'
  });
}

export function stubCalledBy(t, promise, stub) {
  promise.then(() => {
    t.ok(stub.isDone(), 'the stub was called');
  }).catch((err) => {
    console.log('TEST ERR', err.message, err.stack);
  });
}

export const JSON_HEADERS = {
  'Accept': 'application/json',
  'Content-Type': 'application/json',
};

// TODO: why is Nock giving back headers as an array?!
export const NOCK_JSON_HEADERS_MATCH = {
  'Accept': (v) => v[0] === 'application/json',
  'Content-Type': (v) => v[0] === 'application/json',
}

export function mockPostWithHeaders(slash = '/users', headers = {}, body) {
  let stub = nock(BASE_URL, { reqheaders: headers });
  stub = ( body ? stub.post(slash, body) : stub.post(slash) );
  stub = stub.reply(200, { name: 'jack' });
  return stub;
}

export function mockPostJson(slash = '/users', body = null) {
  return mockPostWithHeaders(slash, NOCK_JSON_HEADERS_MATCH, body);
}

export function mockPostJsonBody(slash = '/users') {
  return mockPostJson(slash, { name: 'jack' });
}

export function mockPutJsonBody(slash = '/users') {
  return nock(BASE_URL, { reqheaders: NOCK_JSON_HEADERS_MATCH })
    .put(slash, { name: 'jack' })
    .reply(201, { name: 'jack' });
}

// got to use Nock for these tests so rather than stubbing some complex
// chain of fetch promises, we can easily test the interceptors by letting them work on the data

import test from 'tape';
import 'isomorphic-fetch';
import nock from 'nock';
import fetchFactory from '../src/index';

test('you can define a request interceptor', (t) => {
  t.plan(2);
  const UserFactory = fetchFactory.create({
    url: 'http://www.api.com/users',
    method: 'GET',
    interceptors: {
      request: (request) => {
        request.headers['Foo'] = 'Test';
        return request;
      },
    },
  }, {
    findAll: {},
  });

  const stub = nock('http://www.api.com', {
    reqheaders: {
      'Foo': 'Test',
    },
  })
  .get('/users')
  .reply(200, { name: 'jack' });

  UserFactory.findAll().then((data) => {
    t.ok(stub.isDone(), 'the stub was called');
    t.deepEqual(data, { name: 'jack' });
  }).catch((err) => {
    console.log('err', err.message, err.stack);
  });
});

test('you can define multiple request interceptors', (t) => {
  t.plan(2);
  const UserFactory = fetchFactory.create({
    url: 'http://www.api.com/users',
    method: 'GET',
    interceptors: {
      request: [(request) => {
        request.headers['Foo'] = 'Test';
        return request;
      }, (request) => {
        request.headers['Foo'] = 'Test2';
        return request;
      }],
    },
  }, {
    findAll: {},
  });

  const stub = nock('http://www.api.com', {
    reqheaders: {
      'Foo': 'Test2',
    }})
    .get('/users')
    .reply(200, { name: 'jack' });

  UserFactory.findAll().then((data) => {
    t.ok(stub.isDone(), 'the stub was called');
    t.deepEqual(data, { name: 'jack' });
  });
});

test('multiple interceptors when some are async works', (t) => {
  t.plan(2);
  const UserFactory = fetchFactory.create({
    url: 'http://www.api.com/users',
    method: 'GET',
    interceptors: {
      request: [(request) => {
        request.headers['Foo'] = 'Test';
        return request;
      }, (request) => {
        request.headers['Foo'] = 'Test2';
        return Promise.resolve(request);
      }],
    },
  }, {
    findAll: {},
  });

  const stub = nock('http://www.api.com', {
    reqheaders: {
      'Foo': 'Test2',
    }})
    .get('/users')
    .reply(200, { name: 'jack' });

  UserFactory.findAll().then((data) => {
    t.ok(stub.isDone(), 'the stub was called');
    t.deepEqual(data, { name: 'jack' });
  });
});

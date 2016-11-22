// got to use Nock for these tests so rather than stubbing some complex
// chain of fetch promises, we can easily test the interceptors by letting them work on the data

import test from 'tape';
import 'isomorphic-fetch';
import nock from 'nock';
import fetchFactory from '../src/index';

test('the default response interceptor consumes the data as JSON', (t) => {
  t.plan(2);
  const UserFactory = fetchFactory.create({
    url: 'http://www.api.com/users',
    method: 'GET',
  }, {
    findAll: {},
  });

  const stub = nock('http://www.api.com')
                 .get('/users')
                 .reply(200, { name: 'jack' });

  UserFactory.findAll().then((data) => {
    t.ok(stub.isDone(), 'the stub was called');
    t.deepEqual(data, { name: 'jack' });
  });
});

test('the default response interceptor throws on response error', (t) => {
  t.plan(2);
  const UserFactory = fetchFactory.create({
    url: 'http://www.api.com/users',
    method: 'GET',
  }, {
    findAll: {},
  });

  const stub = nock('http://www.api.com')
                 .get('/users')
                 .reply(404);

  UserFactory.findAll().catch((error) => {
    t.ok(stub.isDone(), 'the stub was called');
    t.equal(error.response.status, 404);
  });
});

test('you can pass in a custom interceptor', (t) => {
  t.plan(2);

  const UserFactory = fetchFactory.create({
    url: 'http://www.api.com/users',
    method: 'GET',
    interceptors: {
      response: (data) => ({ name: 'bob' }),
    },
  }, {
    findAll: {},
  });

  const stub = nock('http://www.api.com')
    .get('/users')
    .reply(200, { name: 'jack' });

  UserFactory.findAll().then((data) => {
    t.ok(stub.isDone(), 'the stub was called');
    t.deepEqual(data, { name: 'bob' });
  });
});

test('the default error handler throws on respsonse error with a custom interceptor', (t) => {
  t.plan(2);

  const UserFactory = fetchFactory.create({
    url: 'http://www.api.com/users',
    method: 'GET',
    interceptors: {
      response: (data) => ({ name: 'bob' }),
    },
  }, {
    findAll: {},
  });

  const stub = nock('http://www.api.com')
    .get('/users')
    .reply(404);

  UserFactory.findAll().catch((error) => {
    t.ok(stub.isDone(), 'the stub was called');
    t.equal(error.response.status, 404);
  });
});

test('the default error handler does not throw with rejectOnBadResponse set to false', (t) => {
  t.plan(2);

  const UserFactory = fetchFactory.create({
    url: 'http://www.api.com/users',
    method: 'GET',
    rejectOnBadResponse: false,
    interceptors: {
      response: [
        (data) => ({ name: 'bob' }),
      ],
    },
  }, {
    findAll: {},
  });

  const stub = nock('http://www.api.com')
    .get('/users')
    .reply(404);

  UserFactory.findAll().then((data) => {
    t.ok(stub.isDone(), 'the stub was called');
    t.deepEqual(data, { name: 'bob' });
  });
});

test('you can have multiple interceptors', (t) => {
  t.plan(2);

  const UserFactory = fetchFactory.create({
    url: 'http://www.api.com/users',
    method: 'GET',
    interceptors: {
      response: [
        (data) => ({ name: 'bob' }),
        (data) => ({ name: 'pete' }),
      ],
    },
  }, {
    findAll: {},
  });

  const stub = nock('http://www.api.com')
                 .get('/users')
                 .reply(200, { name: 'jack' });

  UserFactory.findAll().then((data) => {
    t.ok(stub.isDone(), 'the stub was called');
    t.deepEqual(data, { name: 'pete' });
  });
});

test('you can have async interceptors', (t) => {
  t.plan(2);

  const UserFactory = fetchFactory.create({
    url: 'http://www.api.com/users',
    method: 'GET',
    interceptors: {
      response: [
        (data) => ({ name: 'bob' }),
        (data) => {
          return new Promise((resolve, reject) => {
            resolve({ name: 'pete' });
          });
        },
      ],
    },
  }, {
    findAll: {},
  });

  const stub = nock('http://www.api.com')
                 .get('/users')
                 .reply(200, { name: 'jack' });

  UserFactory.findAll().then((data) => {
    t.ok(stub.isDone(), 'the stub was called');
    t.deepEqual(data, { name: 'pete' });
  });
});

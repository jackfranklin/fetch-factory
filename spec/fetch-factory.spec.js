import test from 'tape';
import sinon from 'sinon';

import 'isomorphic-fetch';

import fetchFactory from '../src/index';

sinon.spy(global, 'fetch');

test('fetchFactory findAll makes the right request', (t) => {
  t.plan(1);
  global.fetch.reset();

  const UserFactory = fetchFactory.create({
    url: '/users',
    method: 'GET',
  }, {
    findAll: {},
  });

  UserFactory.findAll();

  t.deepEqual(global.fetch.args[0], ['/users', { method: 'GET' }]);
});


test('configuration can be overriden in the call of the method', (t) => {
  t.plan(1);
  global.fetch.reset();

  const UserFactory = fetchFactory.create({
    url: '/users',
    method: 'GET',
  }, {
    findAll: {},
  });

  UserFactory.findAll({ url: '/foo' });

  t.deepEqual(global.fetch.args[0], ['/foo', { method: 'GET' }]);
});

test('configuration can be overriden when defining a method', (t) => {
  t.plan(1);
  global.fetch.reset();

  const UserFactory = fetchFactory.create({
    url: '/users',
    method: 'GET',
  }, {
    create: { method: 'POST' },
  });

  UserFactory.create();

  t.deepEqual(global.fetch.args[0], [
    '/users',
    {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
      },
    },
  ]);
});

test('data for a POST request is serialized to JSON', (t) => {
  t.plan(1);
  global.fetch.reset();

  const UserFactory = fetchFactory.create({
    url: '/users',
    method: 'GET',
  }, {
    create: { method: 'POST' },
  });

  UserFactory.create({
    data: { name: 'jack' },
  });

  t.deepEqual(global.fetch.args[0], [
    '/users',
    {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ name: 'jack' }),
    }
  ]);
});

test('it can take query params', (t) => {
  t.plan(1);
  global.fetch.reset();

  const UserFactory = fetchFactory.create({
    url: '/users',
    method: 'GET',
  }, {
    findAll: {},
  });

  UserFactory.findAll({
    params: { id: 123 },
  });

  t.deepEqual(global.fetch.args[0], [
    '/users?id=123', { method: 'GET' },
  ]);
});


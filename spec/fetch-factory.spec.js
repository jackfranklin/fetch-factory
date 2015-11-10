import 'isomorphic-fetch';
import test from 'tape';

import {
  mockPostJson,
  stubCalledBy,
  defaultMock,
  BASE_URL,
  mockPostJsonBody
} from './helpers';

import fetchFactory from '../src/index';

test('fetchFactory findAll makes the right request', (t) => {
  t.plan(1);

  const stub = defaultMock();

  const UserFactory = fetchFactory.create({
    url: `${BASE_URL}/users`,
    method: 'GET',
  }, {
    findAll: {},
  });

  stubCalledBy(t, UserFactory.findAll(), stub);
});


test('configuration can be overriden in the call of the method', (t) => {
  t.plan(1);
  const stub = defaultMock('/foo');

  const UserFactory = fetchFactory.create({
    url: `${BASE_URL}/users`,
    method: 'GET',
  }, {
    findAll: {},
  });

  stubCalledBy(t, UserFactory.findAll({ url: `${BASE_URL}/foo` }), stub);
});

test('configuration can be overriden when defining a method', (t) => {
  t.plan(1);

  const stub = mockPostJson();

  const UserFactory = fetchFactory.create({
    url: `${BASE_URL}/users`,
    method: 'GET',
  }, {
    create: { method: 'POST' },
  });

  stubCalledBy(t, UserFactory.create(), stub);
});

test('data for a POST request is serialized to JSON', (t) => {
  t.plan(1);

  const stub = mockPostJsonBody();

  const UserFactory = fetchFactory.create({
    url: `${BASE_URL}/users`,
    method: 'GET',
  }, {
    create: { method: 'POST' },
  });

  stubCalledBy(t, UserFactory.create({ data: { name: 'jack' } }), stub);
});

test('it can take query params', (t) => {
  t.plan(1);

  const stub = defaultMock('/users?id=123');

  const UserFactory = fetchFactory.create({
    url: `${BASE_URL}/users`,
    method: 'GET',
  }, {
    findAll: {},
  });

  stubCalledBy(t, UserFactory.findAll({ params: { id: 123 } }), stub);
});

test('it can take a URL with placeholders for params', (t) => {
  t.plan(1);

  const stub = defaultMock('/users/123');
  const UserFactory = fetchFactory.create({
    url: `${BASE_URL}/users/:id`,
    method: 'GET',
  }, {
    findOne: {},
  });

  stubCalledBy(t, UserFactory.findOne({
    params: { id: 123 },
  }), stub);
});

test('it can take a URL with placeholders and query strings', (t) => {
  t.plan(1);

  const stub = defaultMock('/users/123?name=jack');

  const UserFactory = fetchFactory.create({
    url: `${BASE_URL}/users/:id`,
    method: 'GET',
  }, {
    findOne: {},
  });

  stubCalledBy(t, UserFactory.findOne({
    params: { id: 123, name: 'jack' },
  }), stub);
});



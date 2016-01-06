import test from 'tape';
import sinon from 'sinon';
import fetchFactory from '../src/index';

import {
  defaultMock,
  mockPostJson,
  stubCalledBy,
  BASE_URL,
  mockPutJsonBody,
} from './helpers';

import 'isomorphic-fetch';

test('fetch factory find shortcut', (t) => {
  t.plan(1);

  let stub = defaultMock('/users');

  const UserFactory = fetchFactory.create({
    url: `${BASE_URL}/users/:id`,
    methods: ['find', 'create', 'update'],
  });

  stubCalledBy(t, UserFactory.find(), stub);
});

test('fetch factory create shortcut', (t) => {
  t.plan(1);

  let stub = mockPostJson('/users');

  const UserFactory = fetchFactory.create({
    url: `${BASE_URL}/users/:id`,
    methods: ['find', 'create', 'update'],
  });

  stubCalledBy(t, UserFactory.create({
    data: { name: 'jack' },
  }), stub);
});

test('fetch factory update shortcut', (t) => {
  t.plan(1);

  let stub = mockPutJsonBody('/users/123');

  const UserFactory = fetchFactory.create({
    url: `${BASE_URL}/users/:id`,
    methods: ['find', 'create', 'update'],
  });

  stubCalledBy(t, UserFactory.update({
    params: { id: 123 },
    data: { name: 'jack' },
  }), stub);
});


test('when you give fetch factory an unkown shortcut', (t) => {
  t.plan(1);

  t.throws(() => {
    fetchFactory.create({
      url: '/users/:id',
      methods: ['foo'],
    });
  }, /unknown method foo/i);
});

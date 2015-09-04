import test from 'tape';
import sinon from 'sinon';

import 'isomorphic-fetch';

import httpFactory from '../index';

test('httpFactory', (t) => {
  t.plan(2);

  sinon.spy(global, 'fetch');

  const UserFactory = httpFactory.create({
    url: '/users',
    method: 'GET',
  }, {
    findAll: {},
  });

  UserFactory.findAll();

  t.ok(global.fetch.calledWith('/users', { method: 'GET' }));
});


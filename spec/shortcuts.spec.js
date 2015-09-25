import test from 'tape';
import sinon from 'sinon';
import fetchFactory from '../src/index';

import 'isomorphic-fetch';

if (!global.fetch.reset) {
  sinon.spy(global, 'fetch');
}

test('fetch factory shortcut methods', (t) => {
  t.plan(4);
  global.fetch.reset();

  const UserFactory = fetchFactory.create({
    url: '/users/:id',
    methods: ['findOne', 'findAll', 'create', 'update'],
  });

  UserFactory.findAll();
  t.deepEqual(global.fetch.args[0], ['/users', { method: 'GET' }]);

  UserFactory.findOne({
    params: { id: 1 },
  });
  t.deepEqual(global.fetch.args[1], ['/users/1', { method: 'GET' }]);

  UserFactory.create();
  t.deepEqual(global.fetch.args[2], [
    '/users',
    {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
      },
    },
  ]);

  UserFactory.update({
    params: { id: 1 },
  });
  t.deepEqual(global.fetch.args[3], [
    '/users/1',
    {
      method: 'PUT',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
      },
    },
  ]);
});

test('when you give fetch factory an unkown shortcut', (t) => {
  t.plan(1);
  global.fetch.reset();

  t.throws(() => {
    fetchFactory.create({
      url: '/users/:id',
      methods: ['foo'],
    });
  }, /unknown method foo/i);
});

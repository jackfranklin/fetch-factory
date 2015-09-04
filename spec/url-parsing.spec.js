import test from 'tape';

import fetchFactory from '../src/index';

test('#placeholdersInUrl', (t) => {
  t.plan(3);

  t.deepEqual(fetchFactory.placeholdersInUrl('/users/:id'), ['id']);
  t.deepEqual(fetchFactory.placeholdersInUrl('/users/:id/:name'), [
    'id', 'name'
  ]);
  t.deepEqual(fetchFactory.placeholdersInUrl('/users/:id/foo'), ['id']);
});

test('#constructUrl', (t) => {
  t.test('given a query param', (t) => {
    t.plan(1);

    const result = fetchFactory.constructUrl('/users', {
      id: 123,
    });

    t.equal(result, '/users?id=123');
  });

  t.test('given multiple query params', (t) => {
    t.plan(1);

    const result = fetchFactory.constructUrl('/users', {
      id: 123,
      name: 'jack',
    });

    t.equal(result, '/users?id=123&name=jack');
  });

  t.test('given a URL with a placeholder but no param', (t) => {
    t.plan(1);

    const result = fetchFactory.constructUrl('/users/:id', {});

    t.equal(result, '/users');
  });

  t.test('given a URL with a placeholder', (t) => {
    t.plan(1);

    const result = fetchFactory.constructUrl('/users/:id', {
      id: 123,
    });

    t.equal(result, '/users/123');
  });

  t.test('given a URL with a placeholder and query params', (t) => {
    t.plan(1);

    const result = fetchFactory.constructUrl('/users/:id', {
      id: 123,
      name: 'jack',
    });

    t.equal(result, '/users/123?name=jack');
  });
});

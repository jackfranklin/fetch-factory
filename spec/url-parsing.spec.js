import test from 'tape';

import { placeholdersInUrl, constructUrl } from '../src/url-parsing';

test('#placeholdersInUrl', (t) => {
  t.plan(3);

  t.deepEqual(placeholdersInUrl('/users/:id'), ['id']);
  t.deepEqual(placeholdersInUrl('/users/:id/:name'), [
    'id', 'name'
  ]);
  t.deepEqual(placeholdersInUrl('/users/:id/foo'), ['id']);
});

test('#constructUrl', (t) => {
  t.test('given a query param', (t) => {
    t.plan(1);

    const result = constructUrl('/users', {
      id: 123,
    });

    t.equal(result, '/users?id=123');
  });

  t.test('given multiple query params', (t) => {
    t.plan(1);

    const result = constructUrl('/users', {
      id: 123,
      name: 'jack',
    });

    t.equal(result, '/users?id=123&name=jack');
  });

  t.test('given a URL with a placeholder but no param', (t) => {
    t.plan(1);

    const result = constructUrl('/users/:id', {});

    t.equal(result, '/users');
  });

  t.test('given a URL with a placeholder', (t) => {
    t.plan(1);

    const result = constructUrl('/users/:id', {
      id: 123,
    });

    t.equal(result, '/users/123');
  });

  t.test('given a URL with a placeholder and query params', (t) => {
    t.plan(1);

    const result = constructUrl('/users/:id', {
      id: 123,
      name: 'jack',
    });

    t.equal(result, '/users/123?name=jack');
  });

  t.test('Given a port number in the URL', (t) => {
    t.plan(1);

    const result = constructUrl('http://foo.com:8000/users/:id', {
      id: 123,
    });

    t.equal(result, 'http://foo.com:8000/users/123');
  });
});

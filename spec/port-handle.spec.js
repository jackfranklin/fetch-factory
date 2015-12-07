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

test('it can take a URL with port number', (t) => {
  t.plan(1);

  const stub = defaultMock('/users/123');
  const UserFactory = fetchFactory.create({
    url: `${BASE_URL}:80/users/:id`,
    method: 'GET',
  }, {
    findOne: {},
  });

  stubCalledBy(t, UserFactory.findOne({
    params: { id: 123 },
  }), stub);
});

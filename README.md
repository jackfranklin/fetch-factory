# fetch-factory

A wrapper around the new `fetch` API to make creating services to talk to APIs easier.

## Example

```js
var fetchFactory = require('fetch-factory');

var UserFactory = fetchFactory.create({
  url: 'http://api.mysite.com/users/:id',
}, {
    find: { method: 'GET' },
    create: { method: 'POST' },
});

UserFactory.find(); // GET /users

UserFactory.find({
    params: { id: 123 },
}); // GET /users/123

UserFactory.create({
    data: {
        name: 'Jack',
    },
}); // POST /users with JSON stringified obj { name: 'jack' }
```

## Install

```
npm install fetch-factory
```

Consumable in the client through Browserify or jspm.

## Changelog


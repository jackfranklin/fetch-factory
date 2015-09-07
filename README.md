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

## Configuration

Configuration for a particular request can be set in one of three places:

- in the config object that's the first argument to `fetchFactory.create`
- in an object that you pass when telling fetch-factory what methods to create
- in the call to the method that fetch factory created

Configuration set further down the chain will override configuration set previously. For example:

```js
var UserFactory = fetchFactory.create({
    url: 'http://api.mysite.com/users/:id',
    method: 'GET',
}, {
    find: {},
    create: { method: 'POST' },
});
```

When `UserFactory.find` is called, it will make a `GET` request, because the default configuration for `UserFactory` was given `method: 'GET'`. However, when `UserFactory.create` is called, it will make a `POST` request, because configuration was passed that is specific to that method. Although in reality you never need to, you could call `UserFactory.find({ method: 'POST' })`, which would cause the `find` method to make a `POST` request that time, because configuration passed in when a method is invoked overrides any set before it.

## POST Requests

When a method defined by fetch-factory makes a `POST` request, it assumes that you'd like to POST JSON and sets some extra configuration:
- the `Accept` header of the request is set to `application/json`
- the `Content-Type` header of the request is set to `application/json`
- if you pass in a `data` parameter, that is converted into JSON and sent as the body of the request

## Interceptors

fetch-factory also supports the concept of interceptors that can take a request and manipulate it before passing it on.

### Request Interceptors

Coming Soon

### Response Interceptors

By default, fetch-factory will call its default response interceptor, which simply takes the stream returned by `fetch` and consumes it as JSON, returning a JavaScript object. You can override this by passing an `interceptors` object with a `response` key:

```js
var UserFactory = fetchFactory.create({
    url: 'http://api.mysite.com/users/:id',
    method: 'GET',
    interceptors: {
        response: function(data) {
            return { name: 'bob' };
        },
    },
}, {
    find: {},
});

UserFactory.find().then(function(data) {
    console.log(data.name) // 'bob'
});
```

A time when you might want to override the default response interceptor is if you need access to extra information on the response, such as headers. In this case fetch-factory's default interceptor will be insufficient.

```js
var UserFactory = fetchFactory.create({
    url: 'http://api.mysite.com/users/:id',
    method: 'GET',
    interceptors: {
        response: function(response) { return response; },
    },
}, {
    find: {},
});

UserFactory.find().then(function(response) {
    console.log(response.headers.get('Content-Type'));
});
```



## Changelog


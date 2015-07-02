describe('creating a factory', function() {
  it('defines methods that make the expected http requests', function() {
    spyOn(window, 'fetch');
    var UserFactory = httpFactory.create({
      url: '/users',
      method: 'GET'
    }, {
      findAll: {}
    });

    UserFactory.findAll();

    expect(window.fetch).toHaveBeenCalledWith('/users', {
      method: 'GET',
    });
  });

  it('lets you override config in the call to the method', function() {
    spyOn(window, 'fetch');
    var UserFactory = httpFactory.create({
      url: '/users',
    }, {
      findAll: {}
    });

    UserFactory.findAll({ url: '/foo' });

    expect(window.fetch).toHaveBeenCalledWith('/foo', {
      method: 'GET'
    });
  });

  it('lets you make a post request with some JSON', function() {
    spyOn(window, 'fetch');
    var UserFactory = httpFactory.create({
      url: '/users',
    }, {
      create: { method: 'POST' }
    });

    UserFactory.create({
      data: { name: 'jack' }
    });

    expect(window.fetch).toHaveBeenCalledWith('/users', {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ name: 'jack' })
    });
  });
});

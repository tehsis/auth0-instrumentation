module.exports = function(pkg, env) {
  if (!env.ERROR_REPORTER_URL) {
    return require('./stubs').errorReporter;
  }

  var raven = require('raven');
  var client = new raven.Client(env.ERROR_REPORTER_URL);


  function hapiErrorReporterBuilder(options) {
    return function hapiErrorReporter(request, event) {

      // extract err, id depends on the hapi version.
      // for >= hapi17:
      //            - event has a property error
      //            - the id is on `request.info.id`
      // for < hapi17:
      //            - event is the directly the error
      //            - the id is on `request.id`
      const err = event.isBoom ? event : event.error;
      const id = request.id ? request.id : request.info.id;

      client.captureError(err, {
        extra: {
          timestamp: request.info.received,
          id: id,
          method: request.method,
          path: request.path,
          payload: request.pre && request.pre._originalPayload,
          query: request.query,
          remoteAddress: request.info.remoteAddress,
          userAgent: request.raw.req.headers['user-agent']
        },
        tags: options.tags
      });
    }
  }
  var plugin = {
    register: function (server, options, next) {
      server.expose('client', client);
      server.on('request-error', hapiErrorReporterBuilder(options));
      next();
    }
  };

  plugin.register.attributes = { pkg: require('../package.json') };

  const pluginV17 = {
    pkg: require('../package.json'),
    register: function ErrorReporter(server, options) {
      server.expose('client', client);
      server.events.on({name: 'request', channels: 'error'}, hapiErrorReporterBuilder(options));
    }
  };

  client.hapi = {
    plugin: plugin,
    pluginV17: pluginV17
  };

  client.express = {
    requestHandler: raven.middleware.express.requestHandler(env.ERROR_REPORTER_URL),
    errorHandler: raven.middleware.express.errorHandler(env.ERROR_REPORTER_URL)
  };

  client.isActive = true;
  return client;
};

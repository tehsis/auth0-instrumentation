function hapiPluginBuilder(client) {
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
    pkg: require('../package.json'),
    register: function (server, options, next) {
      const hapiVersion = server.version || ""; // '17.0.0'
      const majorHapiVersion = parseInt(hapiVersion.split(".")[0]);

      server.expose('client', client);

      // depending on the hapi version use a different way to listen to the event
      if (majorHapiVersion >= 17) {
        server.events.on({name: 'request', channels: 'error' }, hapiErrorReporterBuilder(options));
      } else {
        server.on('request-error', hapiErrorReporterBuilder(options));
        next();
      }
    }
  };

  plugin.register.attributes = { pkg: require('../package.json') };

  return plugin
}

module.exports = hapiPluginBuilder;

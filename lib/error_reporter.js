const hapiPluginBuilder = require('./hapi_plugin_builder');

module.exports = function(pkg, env) { // ravenClient is only used for test
  if (!env.ERROR_REPORTER_URL) {
    return require('./stubs').errorReporter;
  }

  var raven = require('raven');
  var client = new raven.Client(env.ERROR_REPORTER_URL);

  client.hapi = {
    plugin: hapiPluginBuilder(client)
  };

  client.express = {
    requestHandler: raven.middleware.express.requestHandler(env.ERROR_REPORTER_URL),
    errorHandler: raven.middleware.express.errorHandler(env.ERROR_REPORTER_URL)
  };

  client.isActive = true;
  return client;
};

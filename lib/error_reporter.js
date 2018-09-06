/** @typedef {import('./configuration/logger-settings').SentryStreamSetting} Settings  */

const hapiPluginBuilder = require('./hapi_plugin_builder');

/**
 *
 * @param {Settings} settings
 */
module.exports = function (settings) {
  if (!settings.url) {
    return require('./stubs').errorReporter;
  }

  var raven = require('raven');
  var client = new raven.Client(settings.url);

  client.hapi = {
    plugin: hapiPluginBuilder(client)
  };

  client.express = {
    requestHandler: raven.middleware.express.requestHandler(settings.url),
    errorHandler: raven.middleware.express.errorHandler(settings.url)
  };

  client.isActive = true;
  return client;
};

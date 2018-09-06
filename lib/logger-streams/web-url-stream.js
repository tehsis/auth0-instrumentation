/** @typedef {import('../configuration/logger-settings').WebStreamSetting} Settings  */
const errorHandlers = require('./error-handlers');

const HttpWritableStream = require('auth0-common-logging').Streams.HttpWritableStream;

/**
 *
 * @param {Settings} settings
 */
module.exports = function webUrlStream(settings) {
  var httpStream = new HttpWritableStream(settings.url);

  httpStream.on('error', errorHandlers.webErrorHandler);

  return {
    name: 'web-url',
    stream: httpStream,
    level: settings.level
  };
};

const errorHandlers = require('./error-handlers');

const HttpWritableStream = require('auth0-common-logging').Streams
  .HttpWritableStream;

module.exports = function webUrlStream(url, logLevel) {
  var httpStream = new HttpWritableStream(url);

  httpStream.on('error', errorHandlers.webErrorHandler);

  return {
    name: 'web-url',
    stream: httpStream,
    level: logLevel
  };
};

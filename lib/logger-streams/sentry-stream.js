const Auth0SentryStream = require('./auth0-sentry-stream').Auth0SentryStream;

module.exports = function sentryStream(logLevel, errorReporter) {
  return {
    name: 'sentry',
    stream: new Auth0SentryStream(errorReporter),
    level: logLevel,
    type: 'raw'
  };
};

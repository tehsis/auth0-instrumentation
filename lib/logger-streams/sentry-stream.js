/** @typedef {import('../configuration/logger-settings').SentryStreamSetting} Settings  */
const Auth0SentryStream = require('./auth0-sentry-stream').Auth0SentryStream;
const ErrorReporter = require('../error_reporter');

/**
 *
 * @param {Settings} settings
 */
module.exports = function sentryStream(settings) {
  const errorReporter = settings.reporter || ErrorReporter(settings);

  return {
    name: 'sentry',
    stream: new Auth0SentryStream(errorReporter),
    level: settings.level,
    type: settings.streamType
  };
};

/** @typedef {import('./configuration/index').Configuration} Configuration  */

const bunyan = require('bunyan');
const loggingProcessInfo = require('auth0-common-logging').ProcessInfo;
const loggingSerializers = require('auth0-common-logging').Serializers;
const decorateLogger = require('./utils').decorateLogger;
const loggerStreams = require('./logger-streams');

/**
 * @param {object} pkg Package.json object from the client application
 * @param {Configuration} configuration Library configuration variables
 * @param {object} serializers Bunyan Serializers
 * @param {object} agent
 */
module.exports = function getLogger(pkg, configuration, serializers, agent) {
  const bunyan_streams = loggerStreams.getStreams(agent, pkg, configuration);
  const process_info = !configuration.flags.ignoreProcessInfo && getProcessInfo();

  const logger = bunyan.createLogger({
    name: pkg.name,
    process: process_info,
    region: configuration.service.region,
    service_name: configuration.service.name,
    environment: configuration.service.environment,
    purpose: configuration.service.purpose,
    channel: configuration.service.channel,
    streams: bunyan_streams,
    serializers: serializers || loggingSerializers
  });

  logger.on('error', function (err, stream) {
    console.error('Cannot write to log stream ' + stream.name + ' ' + (err && err.message));
  });

  return decorateLogger(logger);
};

function getProcessInfo() {
  return loggingProcessInfo && loggingProcessInfo.version !== '0.0.0'
    ? loggingProcessInfo
    : undefined;
}

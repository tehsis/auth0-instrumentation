const bunyan = require('bunyan');
const loggingProcessInfo = require('auth0-common-logging').ProcessInfo;
const loggingSerializers = require('auth0-common-logging').Serializers;
const decorateLogger = require('./utils').decorateLogger;
const loggerStreams = require('./logger-streams');

module.exports = function getLogger(pkg, env, serializers, agent) {
  const bunyan_streams = loggerStreams.getStreams(agent, pkg, env);
  const process_info = !env.IGNORE_PROCESS_INFO && getProcessInfo();

  const logger = bunyan.createLogger({
    name: pkg.name,
    process: process_info,
    region: env.AWS_REGION,
    service_name: env.SERVICE_NAME,
    environment: env.ENVIRONMENT,
    purpose: env.PURPOSE,
    channel: env.RELEASE_CHANNEL,
    streams: bunyan_streams,
    serializers: serializers || loggingSerializers
  });

  logger.on('error', function(err, stream) {
    console.error(
      'Cannot write to log stream ' + stream.name + ' ' + (err && err.message)
    );
  });

  return decorateLogger(logger);
};

function getProcessInfo() {
  return loggingProcessInfo && loggingProcessInfo.version !== '0.0.0'
    ? loggingProcessInfo
    : undefined;
}

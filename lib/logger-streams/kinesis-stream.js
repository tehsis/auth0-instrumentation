const KeepAliveAgentRegistry = require('./keep-alive-agent');
const KinesisWritable = require('aws-kinesis-writable');
const buildKinesisOptions = require('./kinesis-options');
const errorHandlers = require('./error-handlers');

module.exports = function kinesisStream(settings, agent) {
  const isProduction = settings['NODE_ENV'] === 'production';

  agent = agent || KeepAliveAgentRegistry(isProduction);
  const stream = new KinesisWritable(buildKinesisOptions(settings, agent));

  stream.on('error', errorHandlers.kinesisErrorHandler);
  return {
    name: 'kinesis',
    stream: stream,
    level: settings.LOG_TO_KINESIS_LEVEL,
    type: settings.LOG_TO_KINESIS_LOG_TYPE
  };
};

/** @typedef {import('../configuration/logger-settings').KinesisStreamSetting} Settings  */

const KeepAliveAgentRegistry = require('./keep-alive-agent');
const KinesisWritable = require('aws-kinesis-writable');
const buildKinesisOptions = require('./kinesis-options');
const errorHandlers = require('./error-handlers');

/**
 * Creates a Kinesis Bunyan Stream
 * @param {Settings} settings - The stream settings
 * @returns {object} Bunyan Stream
 */
module.exports = function kinesisStream(settings) {
  const agent = KeepAliveAgentRegistry(settings.isProduction);
  const stream = new KinesisWritable(buildKinesisOptions(settings, agent));

  stream.on('error', errorHandlers.kinesisErrorHandler);
  return {
    name: 'kinesis',
    stream: stream,
    level: settings.level,
    type: settings.logType
  };
};

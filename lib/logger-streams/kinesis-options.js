/** @typedef {import('../configuration/logger-settings').KinesisStreamSetting} Settings  */

/**
 *
 * @param {Settings} settings
 * @param {object} keepAliveAgent
 */
module.exports = function buildKinesisOptions(settings, keepAliveAgent) {
  return {
    accessKeyId: settings.accessKeyId,
    secretAccessKey: settings.accessKeySecret,
    sessionToken: settings.sessionToken,
    credentials: settings.credentials,
    streamName: settings.streamName,
    region: settings.region,
    partitionKey: function getPartitionKey() {
      return Date.now().toString() + Math.random();
    },
    httpOptions: {
      agent: keepAliveAgent
    },
    objectMode: settings.objectMode,
    buffer: settings.buffer
  };
};

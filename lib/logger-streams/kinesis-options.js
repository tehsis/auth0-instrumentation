module.exports = function buildKinesisOptions(settings, keepAliveAgent) {
  return {
    accessKeyId: settings.AWS_ACCESS_KEY_ID,
    secretAccessKey: settings.AWS_ACCESS_KEY_SECRET,
    sessionToken: settings.AWS_SESSION_TOKEN,
    credentials: settings.AWS_CREDENTIALS,
    streamName: settings.LOG_TO_KINESIS,
    region: settings.AWS_KINESIS_REGION || settings.AWS_REGION,
    partitionKey: function getPartitionKey() {
      return Date.now().toString() + Math.random();
    },
    httpOptions: {
      agent: keepAliveAgent
    },
    objectMode:
      typeof settings.KINESIS_OBJECT_MODE !== 'undefined'
        ? settings.KINESIS_OBJECT_MODE
        : true,
    buffer: {
      timeout: settings.KINESIS_TIMEOUT || 5,
      length: settings.KINESIS_LENGTH || 50,
      isPrioritaryMsg: function (entry) {
        return entry.level >= 40;
      }
    }
  };
};

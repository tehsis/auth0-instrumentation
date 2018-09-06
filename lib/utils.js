'use strict';

exports.buildKinesisOptions = function (configMap, keepAliveAgent) {
  return {
    accessKeyId: configMap.AWS_ACCESS_KEY_ID,
    secretAccessKey: configMap.AWS_ACCESS_KEY_SECRET,
    sessionToken: configMap.AWS_SESSION_TOKEN,
    credentials: configMap.AWS_CREDENTIALS,
    streamName: configMap.LOG_TO_KINESIS,
    region: configMap.AWS_KINESIS_REGION || configMap.AWS_REGION,
    partitionKey: function getPartitionKey() { return Date.now().toString() + Math.random(); },
    httpOptions: {
      agent: keepAliveAgent
    },
    objectMode: typeof configMap.KINESIS_OBJECT_MODE !== 'undefined' ? configMap.KINESIS_OBJECT_MODE : true,
    buffer: {
      timeout: configMap.KINESIS_TIMEOUT || 5,
      length: configMap.KINESIS_LENGTH || 50,
      isPrioritaryMsg: function (entry) {
        return entry.level >= 40;
      }
    }
  };
};



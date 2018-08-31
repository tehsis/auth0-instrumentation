module.exports = {
  file: function (streams, env) {
    if (env.LOG_FILE) {
      streams.push({ type: 'file', file: env.LOG_FILE, level: env.LOG_LEVEL });
    } else {
      streams.push({ type: 'console', level: env.LOG_LEVEL, niceFormat: !!env.CONSOLE_NICE_FORMAT });
    }
  },
  web: function (streams, env) {
    if (process.env.NODE_ENV === 'production' && env.LOG_TO_WEB_URL) {
      streams.push({ type: 'web', url: env.LOG_TO_WEB_URL, level: env.LOG_TO_WEB_LEVEL || 'error' });
    }
  },
  kinesis: function (streams, env) {
    if (env.LOG_TO_KINESIS) {
      streams.push({
        type: 'kinesis',
        accessKeyId: env.AWS_ACCESS_KEY_ID,
        accessKeySecret: env.AWS_ACCESS_KEY_SECRET,
        sessionToken: env.AWS_SESSION_TOKEN,
        credentials: env.AWS_CREDENTIALS,
        streamName: env.LOG_TO_KINESIS,
        region: env.AWS_KINESIS_REGION || env.AWS_REGION,
        objectMode:
          typeof env.KINESIS_OBJECT_MODE !== 'undefined'
            ? env.KINESIS_OBJECT_MODE
            : true,
        buffer: {
          timeout: env.KINESIS_TIMEOUT || 5,
          length: env.KINESIS_LENGTH || 50
        }
      });
    }
  },
  sentry: function (streams, env) {
    streams.push({ type: 'sentry', level: env.ERROR_REPORTER_LOG_LEVEL || 'error' });
  }
};

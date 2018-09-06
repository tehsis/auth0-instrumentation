module.exports = {
  file: function (env) {
    if (env.LOG_FILE) {
      return { type: 'file', file: env.LOG_FILE, level: env.LOG_LEVEL };
    } else {
      return { type: 'console', level: env.LOG_LEVEL, niceFormat: !!env.CONSOLE_NICE_FORMAT };
    }
  },
  web: function (env) {
    if (process.env.NODE_ENV === 'production' && env.LOG_TO_WEB_URL) {
      return { type: 'web', url: env.LOG_TO_WEB_URL, level: env.LOG_TO_WEB_LEVEL || 'error' };
    }
  },
  kinesis: function (env) {
    if (env.LOG_TO_KINESIS) {
      return {
        type: 'kinesis',
        isProduction: process.env.NODE_ENV === 'production',
        logType: env.LOG_TO_KINESIS_LOG_TYPE,
        level: env.LOG_TO_KINESIS_LEVEL || 'error',
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
          length: env.KINESIS_LENGTH || 50,
          isPrioritaryMsg: function (entry) {
            return entry.level >= 40;
          }
        }
      };
    }
  },
  sentry: function (env) {
    return { type: 'sentry', url: env.ERROR_REPORTER_URL, level: env.ERROR_REPORTER_LOG_LEVEL || 'error', streamType: 'raw' };
  }
};

/**
 * @typedef {object} FileStreamSetting
 * @property {string} type - Stream type
 * @property {string} level - Log level
 * @property {string} file - File path to save logs
 */

/**
* @typedef {object} ConsoleStreamSetting
* @property {string} type - Stream type
* @property {string} level - Log level
* @property {boolean} niceFormat - Use bunyan nice formatting
*/

/**
* @typedef {object} WebStreamSetting
* @property {string} type - Stream type
* @property {string} level - Log level
* @property {string} url - Use Web URL log reporter
*/

/**
* @typedef {object} KinesisStreamSetting
* @property {string} type - Stream type
* @property {string} level - Log level
* @property {boolean} isProduction - Indicates if the node env is "production"
* @property {string} logType - Sets the log type
* @property {string} accessKeyId - AWS Access Key ID
* @property {string} accessKeySecret - AWS Access Key Secret
* @property {string} sessionToken - AWS session token
* @property {string} credentials - AWS Credentials
* @property {string} streamName - AWS Kinesis stream name
* @property {string} region - AWS Kinesis stream region
* @property {boolean} objectMode - Object Mode
* @property {object} buffer - Buffer
*/

/**
 * @typedef {object} SentryStreamSetting
 * @property {string} type - Stream type
 * @property {string} level - Log level
 * * @property {string=} url - Sentry Reporter URL
 * @property {string} streamType - Sentry stream type
*/

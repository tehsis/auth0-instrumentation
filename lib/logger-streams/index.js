/** @typedef {import('../configuration/index').Configuration} Configuration  */

module.exports = {
  file: require('./file-stream'),
  console: require('./console-stream'),
  web: require('./web-url-stream'),
  kinesis: require('./kinesis-stream'),
  sentry: require('./sentry-stream'),
  /**
   * @param {Configuration} configuration - Configuration object
   */
  getStreams: function (configuration) {
    const bunyanStreams = [];

    Object.keys(configuration.logger.streams).forEach(key => {
      const stream = configuration.logger.streams[key];

      bunyanStreams.push(this[stream.type](stream));
    });

    return bunyanStreams;
  }
};

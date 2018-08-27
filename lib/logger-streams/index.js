const ErrorReporter = require('../error_reporter');

module.exports = {
  fileStream: require('./file-stream'),
  consoleStream: require('./console-stream'),
  webUrlStream: require('./web-url-stream'),
  kinesisStream: require('./kinesis-stream'),
  sentryStream: require('./sentry-stream'),
  getStreams: function (agent, pkg, env) {
    const bunyan_streams = [];
    const logLevel = env.CONSOLE_LOG_LEVEL || env.LOG_LEVEL;

    if (env.LOG_FILE) {
      bunyan_streams.push(this.fileStream(env.LOG_FILE, logLevel));
    } else {
      bunyan_streams.push(this.consoleStream(logLevel, !!env.CONSOLE_NICE_FORMAT));
    }

    if (process.env.NODE_ENV === 'production' && env.LOG_TO_WEB_URL) {
      bunyan_streams.push(this.webUrlStream(env.LOG_TO_WEB_URL, env.LOG_TO_WEB_LEVEL || 'error'));
    }

    if (env.LOG_TO_KINESIS) {
      bunyan_streams.push(this.kinesisStream(env, agent));
    }

    bunyan_streams.push(
      this.sentryStream(
        env.ERROR_REPORTER_LOG_LEVEL || 'error',
        ErrorReporter(pkg, env)
      )
    );
  }
};

const ErrorReporter = require('../error_reporter');

module.exports = {
  fileStream: require('./file-stream'),
  consoleStream: require('./console-stream'),
  webUrlStream: require('./web-url-stream'),
  kinesisStream: require('./kinesis-stream'),
  sentryStream: require('./sentry-stream'),
  getStreams: function (agent, pkg, env) {
    const bunyanStreams = [];
    const logLevel = env.CONSOLE_LOG_LEVEL || env.LOG_LEVEL;

    if (env.LOG_FILE) {
      bunyanStreams.push(this.fileStream(env.LOG_FILE, logLevel));
    } else {
      bunyanStreams.push(this.consoleStream(logLevel, !!env.CONSOLE_NICE_FORMAT));
    }

    if (process.env.NODE_ENV === 'production' && env.LOG_TO_WEB_URL) {
      bunyanStreams.push(this.webUrlStream(env.LOG_TO_WEB_URL, env.LOG_TO_WEB_LEVEL || 'error'));
    }

    if (env.LOG_TO_KINESIS) {
      bunyanStreams.push(this.kinesisStream(env, agent));
    }

    bunyanStreams.push(
      this.sentryStream(
        env.ERROR_REPORTER_LOG_LEVEL || 'error',
        ErrorReporter(pkg, env)
      )
    );

    return bunyanStreams;
  }
};

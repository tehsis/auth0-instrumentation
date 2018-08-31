const stubs = require('./lib/stubs');
const Logger = require('./lib/logger');
const ErrorReporter = require('./lib/error_reporter');
const Metrics = require('./lib/metrics');
const Profiler = require('./lib/profiler');
const Tracer = require('./lib/tracer');
const Configuration = require('./lib/configuration');

module.exports = {
  logger: stubs.logger,
  errorReporter: stubs.errorReporter,
  metrics: stubs.metrics,
  profiler: stubs.profiler,
  tracer: stubs.tracer,
  initialized: false,

  init: function (pkg, env, serializers, params) {
    if (this.initialized) { return; }

    const configuration = Configuration.build(env);

    this.logger = Logger(pkg, configuration, serializers);
    this.errorReporter = ErrorReporter(pkg, env);
    this.metrics = Metrics(pkg, env);
    this.profiler = new Profiler(this, pkg, env);
    this.tracer = Tracer(this, pkg, env);
    this.initialized = true;

    if (params && params.fileRotationSignal && env.LOG_FILE) {
      process.on(params.fileRotationSignal, () => {
        this.logger.reopenFileStreams();
        this.logger.info('The log file has been rotated.');
      });
    }
  }
};

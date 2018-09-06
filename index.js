/** @typedef {import('./lib/stubs').Logger} Logger  */

const stubs = require('./lib/stubs');
const Logger = require('./lib/logger');
const ErrorReporter = require('./lib/error_reporter');
const Metrics = require('./lib/metrics');
const Profiler = require('./lib/profiler');
const Tracer = require('./lib/tracer');
const Configuration = require('./lib/configuration');

/**
 * @property {Logger} logger - Logger functions
 */
module.exports = {
  logger: stubs.logger,
  errorReporter: stubs.errorReporter,
  metrics: stubs.metrics,
  profiler: stubs.profiler,
  tracer: stubs.tracer,
  initialized: false,

  /**
   * @param {object} pkg - Package.json object from the client service
   * @param {object} env - Environment variables to configure the instrumentation library
   * @param {object} serializers - Bunyan serializers
   * @param {object} params - Extra parameters
   */
  init: function (pkg, env, serializers, params) {
    if (this.initialized) { return; }

    const configuration = Configuration.build(pkg, env);

    this.logger = Logger(configuration, serializers);
    this.errorReporter = ErrorReporter(configuration.logger.streams.sentry);
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

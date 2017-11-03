var stubs = require('./lib/stubs');
var Logger = require('./lib/logger');
var ErrorReporter = require('./lib/error_reporter');
var Metrics = require('./lib/metrics');
var Profiler = require('./lib/profiler');


module.exports = {
  logger: stubs.logger,
  errorReporter: stubs.errorReporter,
  metrics: stubs.metrics,
  profiler: stubs.profiler,
  initialized: false,

  init: function(pkg, env, serializers) {
    if (!this.initialized) {
      this.logger = Logger(pkg, env, serializers);
      this.errorReporter = ErrorReporter(pkg, env);
      this.metrics = Metrics(pkg, env);
      this.profiler = new Profiler(this, pkg, env);
      this.initialized = true;
    }
  }
};

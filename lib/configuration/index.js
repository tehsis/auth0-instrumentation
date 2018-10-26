/**
 * @typedef {Object} Configuration
 * @property {object} package - a parsed package.json object
 * @property {Service} service - the Service settings to be instrumented
 * @property {Logger} logger - Logger settings to configure bunyan streams
 * @property {Metrics} metrics - Metrics collection settings
 * @property {Flags} flags - an optional number property of SpecialType
 */

const settings = require('./logger-settings');

module.exports = {
  /**
   * @param {object} pkg Package.json parsed object
   * @param {object} env Environment variables for the configuration object
   * @returns {Configuration} Configuration
   */
  build(pkg, env) {
    env.LOG_LEVEL = env.CONSOLE_LOG_LEVEL || env.LOG_LEVEL || 'error'; // Console log level takes precedence

    return {
      package: pkg,
      service: this.service(env),
      logger: this.logger(env),
      metrics: this.metrics(env, pkg),
      flags: this.flags(env)
    };
  },
  /**
   * @typedef {Object} Service
   * @property {string} name - Name of the instrumented service
   * @property {string} region - Region where the service is currently located. This represents an AWS region (e.g. us-west-1)
   * @property {string} environment - Represents an environment. Examples: Stage, Canary, Production, etc.
   * @property {string} purpose - Describes the purpose of the service
   * @property {string} channel - Represents a release channel. Examples: Preview, Stable, etc.
   */
  service: function(env) {
    return {
      name: env.SERVICE_NAME,
      region: env.AWS_REGION,
      environment: env.ENVIRONMENT,
      purpose: env.PURPOSE,
      channel: env.RELEASE_CHANNEL
    };
  },
  /**
   * @typedef {Object} Logger
   * @property {Object} streams - An Array of Logger Stream configuration objects
   */
  logger: function(env) {
    const streams = {};

    Object.keys(settings).forEach(key => {
      const streamSetting = settings[key](env);

      if (streamSetting) {
        streams[streamSetting.type] = streamSetting;
      }
    });

    return {
      streams: streams
    };
  },
  /**
   * @typedef {Object} Flags
   * @property {boolean} isProduction - Identifies if the NODE_ENV equals "production"
   * @property {boolean} ignoreProcessInfo - Indicates if process information must be skipped from logging
   */
  flags: function(env) {
    return {
      isProduction: process.env.NODE_ENV === 'production',
      ignoreProcessInfo: env.IGNORE_PROCESS_INFO
    };
  },

  /**
   * @typedef Metrics
   * @property {string} type - Defines the Metrics Collector type (e.g. 'statsd' or 'url')
   * @property {string} target - The location of the metrics collector
   * @property {string} hostname - Defines the hostname to override when collecting metrics
   * @property {string} prefix - Sets a prefix for every metric name
   * @property {string} flushInterval - Sets the flush interval for the agent collector
   * @property {boolean} usePkgAsServiceName - Indicates if a default tag using the service name should be used
   * @property {boolean} collectResourceUsage - Allows the collection of process resource usage
   * @property {number} collectResourceInterval - Sets the interval to collect resource usage
   */
  metrics: function(env, pkg) {
    return {
      type: env.STATSD_HOST ? 'statsd' : 'datadog',
      target: env.STATSD_HOST || env.METRICS_API_KEY,
      hostname: env.METRICS_HOST || require('os').hostname(),
      prefix: env.METRICS_PREFIX || pkg.name + '.',
      flushInterval: env.METRICS_FLUSH_INTERVAL || 15,
      usePkgAsServiceName: env.METRICS_PKG_AS_SERVICE_NAME,
      collectResourceUsage: env.COLLECT_RESOURCE_USAGE,
      collectResourceInterval: env.COLLECT_RESOURCE_USAGE_INTERVAL || 5000
    };
  }
};

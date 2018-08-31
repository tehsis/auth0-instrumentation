/**
 * @typedef {Object} Configuration
 * @property {Service} service - a string property of SpecialType
 * @property {Logger} logger - a number property of SpecialType
 * @property {Flags} flags - an optional number property of SpecialType
*/

module.exports = {
  /**
   *
   * @param {object} env Environment variables for the configuration object
   * @returns {Configuration} Configuration
   */
  build(env) {
    env.LOG_LEVEL = env.CONSOLE_LOG_LEVEL || env.LOG_LEVEL; // Console log level takes precedence

    return {
      service: this.service(env),
      logger: this.logger(env),
      flags: this.flags(env)
    };
  },
  /**
   * @typedef {Object} Service
   * @property {string} name - Name of the instrumented service
   * @property {string} region - Region where the service is currently located. This represents an AWS region (e.g. us-west-1)
   * @property {string} environment - Represents an environment. Examples: Stage, Canary, Production, etc.
   * @property {string} purpose - Describes the purpose of the service
   * @property {channel} channel - Represents a release channel. Examples: Preview, Stable, etc.
   */
  service: function (env) {
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
   * @property {Array} streams - An Array of Logger Stream configuration objects
   */
  logger: function (env) {
    const streams = [];
    const settings = require('./logger-settings');

    Object.keys(settings).forEach(key => settings[key](streams, env));
    return {
      streams: streams
    };
  },
  /**
   * @typedef {Object} Flags
   * @property {boolean} isProduction - Identifies if the NODE_ENV equals "production"
   * @property {boolean} ignoreProcessInfo - Indicates if process information must be skipped from logging
   */
  flags: function (env) {
    return {
      isProduction: process.env.NODE_ENV === 'production',
      ignoreProcessInfo: env.IGNORE_PROCESS_INFO
    }
  }
};

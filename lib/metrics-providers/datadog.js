/** @typedef {import('../configuration/index').Metrics} MetricsConfiguration  */

const datadog = require('datadog-metrics');

/** @param {MetricsConfiguration} configuration */
module.exports = function buildDatadog(configuration) {
  return new datadog.BufferedMetricsLogger({
    apiKey: configuration.target,
    host: configuration.hostname,
    prefix: configuration.prefix,
    flushIntervalSeconds: configuration.flushInterval
  });
};

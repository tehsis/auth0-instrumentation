/** @typedef {import('./configuration/index').Metrics} MetricsConfiguration  */

const metricsAgents = require('./metrics-providers');

/**
 * @param {MetricsConfiguration} configuration - Metrics configuration settings
 * */
exports.create = function(configuration) {
  if (!metricsAgents[configuration.type]) {
    throw new Error('Unable to find Agent for metrics collection');
  }

  return metricsAgents[configuration.type](configuration);
};

module.exports = exports;

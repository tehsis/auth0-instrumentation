/** @typedef {import('./configuration/index').Configuration} Configuration  */

const MetricsAgent = require('./metrics-agent');
const metricsFactory = require('./metrics_factory');
const stubs = require('./stubs').metrics;

/**
 * @param {Configuration} configuration Library configuration variables
 */
module.exports = function(configuration) {
  if (!configuration.metrics.target) {
    return stubs;
  }

  const agent = metricsFactory.create(configuration.metrics);
  const options = {
    collectResourceUsage: configuration.metrics.collectResourceUsage,
    collectResourceInterval: configuration.metrics.collectResourceInterval
  };

  const metricsAgent = new MetricsAgent(
    configuration.metrics.type,
    agent,
    options
  );

  // Set default tags
  if (configuration.service.name) {
    metricsAgent.defaultTags.push(`service_name:${configuration.service.name}`);
  } else if (configuration.metrics.usePkgAsServiceName) {
    metricsAgent.defaultTags.push(`service_name:${configuration.package.name}`);
  }

  return metricsAgent;
};

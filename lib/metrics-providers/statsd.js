/** @typedef {import('../configuration/index').Metrics} MetricsConfiguration  */

const url = require('url');
const StatsD = require('node-statsd');

/** @param {MetricsConfiguration} configuration The metrics configuration */
module.exports = function buildStatsDAgent(configuration) {
  const parsedURL = url.parse(configuration.target);

  const client = new StatsD({
    host: parsedURL.hostname,
    port: Number(parsedURL.port),
    prefix: configuration.prefix,
    cacheDns: true
  });

  client.socket.on('error', function noop() {});
  return client;
};

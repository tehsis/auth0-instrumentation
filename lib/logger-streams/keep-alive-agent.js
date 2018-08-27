// TODO: should be deprecated against receiving a service agent

const agents = {};
const http = require('http');
const https = require('https');

const protocols = {
  http: http,
  https: https
};

module.exports = function (isProduction) {
  const protocol = isProduction ? 'https' : 'http';

  if (!agents[protocol]) {
    agents[protocol] = new protocols[protocol].Agent({
      keepAlive: true
    });
  }

  return agents[protocol];
};

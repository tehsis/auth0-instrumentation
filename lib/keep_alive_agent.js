// TODO: should be deprecated against receiving a service agent

var agent = undefined;

module.exports = function(env) {
  if (!agent) {
    var mod = env['NODE_ENV'] === 'production' ? require('https') : require('http');
    agent = new mod.Agent({
      keepAlive: true
    });
  }

  return agent;
};

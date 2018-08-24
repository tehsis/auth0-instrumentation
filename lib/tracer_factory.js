const stubs = require('./stubs');

exports.create = (agent, pkg, env) => {
  if (env.TRACE_AGENT_CLIENT === 'jaeger') {
    const jaegerClient = require('jaeger-client');

    const config = {
      serviceName: pkg.name,
      reporter: {
        agentHost: env.TRACE_AGENT_HOST || 'udp://localhost:6831',
      },
      sampler: {
        type: 'const',
        param: 1,
      }
    };
    const options = { logger: agent.logger };

    const tracer = jaegerClient.initTracer(config, options);
    return tracer;
  }
  return stubs.tracer;
};

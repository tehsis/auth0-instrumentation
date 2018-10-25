const stubs = require('./stubs');
const constants = require('./constants');

exports.create = (agent, pkg, env) => {
  const serviceName = env.SERVICE_NAME || pkg.name;
  if (env.TRACE_AGENT_CLIENT === constants.TRACER_JAEGER) {
    const jaegerClient = require('jaeger-client');

    const config = {
      serviceName: serviceName,
      reporter: {
        agentHost: env.TRACE_AGENT_HOST,
        agentPort: env.TRACE_AGENT_PORT,
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
  if (env.TRACE_AGENT_CLIENT === constants.TRACER_LIGHTSTEP) {
    const lightstepClient = require('lightstep-tracer');
    const config = {
      access_token: env.TRACE_AGENT_API_KEY,
      collector_host: env.TRACE_AGENT_HOST,
      collector_port: env.TRACE_AGENT_PORT,
      collector_encryption: env.TRACE_AGENT_USE_TLS ? 'tls' : 'none',
      component_name: serviceName
    };
    const tracer = new lightstepClient.Tracer(config);
    return tracer;
  }
  return stubs.tracer;
};

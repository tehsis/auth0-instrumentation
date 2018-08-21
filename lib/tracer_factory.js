const stubs = require('./stubs');

exports.create = (agent, pkg, env) => {
  // for now, always return stubs.
  return stubs.tracer;
};

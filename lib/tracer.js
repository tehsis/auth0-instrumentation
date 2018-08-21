const tracing = require('opentracing');
const tracerFactory = require('./tracer_factory');

const noop = function() {};

module.exports = function Tracer(agent, pkg, env) {

  const tracer = tracerFactory.create(agent, pkg, env);

  const obj = {
    _tracer: tracer,
    _logger: agent.logger,
    FORMAT_HTTP_HEADERS: tracing.FORMAT_HTTP_HEADERS,
    FORMAT_TEXT_MAP: tracing.FORMAT_TEXT_MAP
  };

  obj.Tags = Object.assign({
    AUTH0_TENANT: 'auth0.tenant',
    AUTH0_ENVIRONMENT: 'auth0.environment',
    AUTH0_CHANNEL: 'auth0.channel'
  }, tracing.Tags);

  // Wrap the native opentracing 'span' object
  // with a reduced API that discourages the use
  // of features we don't want to use yet, while
  // also giving us a place to hook additional
  // functionality.
  obj._wrapSpan = function(srcSpan) {
    const span = Object.create(srcSpan);

    // Disable baggage.
    span.getBaggageItem = noop;
    span.setBaggageItem = noop;

    // Disable logging.
    span.log = noop;

    // Return our tracer impl instead of
    // the underlying tracer.
    span.tracer = function() {
      return obj;
    };

    return span;
  };

  obj.startSpan = function(name, spanOptions = {}) {
    return obj._wrapSpan(obj._tracer.startSpan(name, spanOptions));
  };

  obj.inject = function(spanOrContext, format, carrier) {
    obj._tracer.inject(spanOrContext, format, carrier);
  };

  obj.extract = function(format, carrier) {
    const span = obj._tracer.extract(format, carrier);
    return span ? obj._wrapSpan(span) : span;
  };

  obj.captureFunc = function(name, fn, parentSpan) {
    const span = obj.startSpan(name, {
      childOf: parentSpan
    });
    try {
      fn(span);
      span.finish();
    } catch (e) {
      span.setTag(obj.Tags.ERROR, true);
      span.finish();
      throw (e);
    }
  };

  obj.captureAsync = function(name, fn, parentSpan) {
    const span = obj.startSpan(name, {
      childOf: parentSpan
    });
    try {
      fn(span);
    } catch (e) {
      span.setTag(obj.Tags.ERROR, true);
      span.finish();
      throw (e);
    }
  };
  return obj;
};

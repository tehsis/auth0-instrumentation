const extend = require('extend');
const urlParse = require('url').parse;

function tagsForResponse(tracer, span, response) {
  const statusCode = response.statusCode;
  span.setTag(tracer.Tags.HTTP_STATUS_CODE, statusCode);
  if (response.error || statusCode >= 500) {
    span.setTag(tracer.Tags.ERROR, true);
  }
  span.setTag(tracer.Tags.HTTP_METHOD, response.req.method);
}

module.exports = function wrapper(tracer) {
  /** Wrap an outgoing call to request.js in a child span,
  * @param {Object} spanOpts - (optional) Options for the created span
  * @param {Object} spanOpts.spanTags - Additional tags to apply to the created span.
  * @param {Object} spanOpts.parentSpan - A parent span, if any.
  * @param {function} target - The target function (e.g. 'request', or 'request.get').
  */
  return function(spanOpts, target) {
    const spanOptions = {};
    if (typeof spanOpts === 'function') {
      target = spanOpts;
    } else {
      extend(spanOptions, spanOpts);
    }
    return function(uri, options, callback) {
      if (typeof options === 'function') {
        callback = options;
      }
      const params = {};
      if (typeof options === 'object') {
        extend(params, options, { uri: uri });
      } else if (typeof uri === 'string') {
        extend(params, {uri: uri})
      } else {
        extend(params, uri);
      }
      const parsed = urlParse(params.uri);
      const span = tracer.startSpan(parsed.pathname, { childOf: spanOptions.parentSpan });
      span.setTag(tracer.Tags.SPAN_KIND, tracer.Tags.SPAN_KIND_RPC_CLIENT);
      span.setTag(tracer.Tags.HTTP_URL, params.uri);
      if (spanOptions.spanTags) {
        span.addTags(spanOptions.spanTags);
      }
      params.callback = callback || params.callback;
      params.headers = params.headers || {};
      tracer.inject(span, tracer.FORMAT_HTTP_HEADERS, params.headers);

      if (!params.callback) {
        return target(params)
          .on('response', (response) => {
            tagsForResponse(tracer, span, response);
            span.finish();
          })
          .on('error', (err) => {
            span.setTag(tracer.Tags.ERROR, true);
            span.finish();
          });
      }
      const originalCallback = params.callback;
      params.callback = function(error, response, body) {
        if (error) {
          span.setTag(tracer.Tags.ERROR, true);
        }
        if (response) {
          tagsForResponse(tracer, span, response);
        }
        span.finish();
        originalCallback(error, response, body);
      }
      return target(params);
    };
  };
}

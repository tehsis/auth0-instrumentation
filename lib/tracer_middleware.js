const onFinished = require('on-finished');
const url = require('url');

module.exports = {
  express: function(tracer) {
    return (req, res, next) => {
      const wireCtx = tracer.extract(tracer.FORMAT_HTTP_HEADERS, req.headers);
      const pathname = url.parse(req.url).pathname;
      const span = tracer.startSpan(pathname, {
        childOf: wireCtx
      });
      span.setTag(tracer.Tags.HTTP_METHOD, req.method);
      span.setTag(tracer.Tags.SPAN_KIND, tracer.Tags.SPAN_KIND_RPC_SERVER);
      span.setTag(tracer.Tags.HTTP_URL, req.url);

      // Include the trace context in response headers, to facilitate debugging.
      const responseHeaders = {};
      tracer.inject(span, tracer.FORMAT_TEXT_MAP, responseHeaders);
      Object.keys(responseHeaders).forEach((key) => { res.setHeader(key, responseHeaders[key]); });


      // Assigns the span for use by the request.
      req.a0instrumentation = {
        span: span
      };

      onFinished(res, (err, res) => {
        if (res) {
          span.setTag(tracer.Tags.HTTP_STATUS_CODE, res.statusCode);
        }
        if (err || (res && res.statusCode >= 500)) {
          span.setTag(tracer.Tags.ERROR, true);
          span.setTag(tracer.Tags.SAMPLING_PRIORITY, 1);
        }
        span.finish();
      });

      next();
    };
  }
};

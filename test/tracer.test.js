const assert = require('assert');
const opentracing = require('opentracing');

describe('tracer stub', function() {
  var $mock;
  var $tracer;
  beforeEach(function() {
    $mock = new opentracing.MockTracer();
    $tracer = require('../lib/tracer')({}, {}, {}, $mock);
  });

  describe('when wrapped', function() {
    it('should contain standard format definitions', function() {
      assert.equal($tracer.FORMAT_HTTP_HEADERS, opentracing.FORMAT_HTTP_HEADERS);
      assert.equal($tracer.FORMAT_TEXT_MAP, opentracing.FORMAT_TEXT_MAP);
    });

    it('should contain standard tags', function() {
      assert.equal($tracer.Tags.ERROR, opentracing.Tags.ERROR);
      assert.equal($tracer.Tags.HTTP_METHOD, opentracing.Tags.HTTP_METHOD);
    });

    it('should define auth0 specific tags', function() {
      assert.hasOwnProperty($tracer.Tags, 'AUTH0_TENANT');
      assert.hasOwnProperty($tracer.Tags, 'AUTH0_ENVIRONMENT');
      assert.hasOwnProperty($tracer.Tags, 'AUTH0_REGION');
      assert.hasOwnProperty($tracer.Tags, 'AUTH0_CHANNEL');
    });
  });

  describe('wrapped spans', function() {
    it('should be able to be started and finished', function() {
      $tracer.startSpan('foo').finish();
      const report = $mock.report();
      assert.equal(1, report.spans.length);
    });

    it('should support tags', function() {
      const span = $tracer.startSpan('foo');
      span.setTag('test_tag', 'test_val');
      span.finish();
      assert.ok($mock.report().firstSpanWithTagValue('test_tag', 'test_val'));
    });

    it('should return the wrapped tracer for tracer()', function() {
      assert.hasOwnProperty(
        $tracer.startSpan('foo').tracer(), 'AUTH0_TENANT');
    });
  });

  describe('captured functions', function() {
    it('should automatically create spans', function() {
      const parentSpan = $tracer.startSpan('parent');
      $tracer.captureFunc('child_operation', function(span) {
        span.setTag('in_child', true);
      }, parentSpan);
      parentSpan.finish();
      const report = $mock.report();
      assert.equal(2, report.spans.length);
      assert.ok(report.firstSpanWithTagValue('in_child', true));
    });

    it('should support nesting', function() {
      const rootSpan = $tracer.startSpan('parent');
      $tracer.captureFunc('child1', function(child1) {
        $tracer.captureFunc('child2', function(child2) {
          child2.setTag('in_child_two', true);
        }, child1);
      }, rootSpan);
      rootSpan.finish();
      const report = $mock.report();
      assert.equal(3, report.spans.length);
      assert.ok(report.firstSpanWithTagValue('in_child_two', true));
    });

    it('should tag failed spans with errors', function() {
      const parentSpan = $tracer.startSpan('parent');
      const err = new Error('expected');
      assert.throws(function() {
        $tracer.captureFunc('child_operation', function() {
          throw err;
        });
      }, 'expected');
      parentSpan.finish();
      const report = $mock.report();
      assert.equal(2, report.spans.length);
      const child = report.firstSpanWithTagValue($tracer.Tags.ERROR, true);
      assert.ok(child);
      assert.equal('child_operation', child.operationName());
    });
  });
});


describe('tracer using jaeger-client', function() {
  var $tracer;
  beforeEach(function() {
    $tracer = require('../lib/tracer')({}, {
      name: 'auth0-service'
    }, {
      TRACE_AGENT_CLIENT: 'jaeger',
      TRACE_AGENT_HOST: 'jaeger.auth0.net',
      TRACE_AGENT_PORT: 6831
    });
  });

  describe('when wrapped', function() {
    it('should use the right service name', function() {
      assert.equal($tracer._tracer._process.serviceName, 'auth0-service');
    });

    it('should use a jaeger-client tracer', function() {
      assert.equal($tracer._tracer._process.tags.filter((t) => t.key === 'jaeger.version').length, 1);
    });

    it('should send spans to the right location', function() {
      assert.equal($tracer._tracer._reporter._sender._host, 'jaeger.auth0.net');
      assert.equal($tracer._tracer._reporter._sender._port, 6831);
    });

    it('should contain standard format definitions', function() {
      assert.equal($tracer.FORMAT_HTTP_HEADERS, opentracing.FORMAT_HTTP_HEADERS);
      assert.equal($tracer.FORMAT_TEXT_MAP, opentracing.FORMAT_TEXT_MAP);
    });

    it('should contain standard tags', function() {
      assert.equal($tracer.Tags.ERROR, opentracing.Tags.ERROR);
      assert.equal($tracer.Tags.HTTP_METHOD, opentracing.Tags.HTTP_METHOD);
    });

    it('should define auth0 specific tags', function() {
      assert.hasOwnProperty($tracer.Tags, 'AUTH0_TENANT');
      assert.hasOwnProperty($tracer.Tags, 'AUTH0_ENVIRONMENT');
      assert.hasOwnProperty($tracer.Tags, 'AUTH0_REGION');
      assert.hasOwnProperty($tracer.Tags, 'AUTH0_CHANNEL');
    });
  });
});

var assert = require('assert');
var sinon = require('sinon');

const configuration = {
  package: {
    name: 'test'
  },
  service: {
    name: 'test',
    channel: 'testing',
    purpose: 'test-purpose',
    environment: 'test-env',
    region: 'test-region'
  },
  metrics: {
    type: 'statsd',
    target: 'http://localhost:8125'
  },
  flags: {
    isProduction: false,
    ignoreProcessInfo: true
  }
};

var metrics = require('../lib/metrics')(configuration);
var tagUtils = require('../lib/tags');

describe('metrics', function() {
  it('should return isActive as true', function(done) {
    assert.equal(metrics.isActive, true);
    done();
  });

  it('should run gauge without throwing', function(done) {
    assert.doesNotThrow(function() {
      metrics.gauge('foo.bar', 14);
      metrics.gauge('foo.bar', 14, ['tag1:a', 'tag2:b']);
      metrics.gauge('foo.bar', 14, { tag1: 'a', tag2: 'b' });
    }, TypeError);
    done();
  });

  it('should run increment without throwing', function(done) {
    assert.doesNotThrow(function() {
      metrics.increment('foo.bar', 1);
      metrics.increment('foo.bar', 1, ['tag1:a', 'tag2:b']);
      metrics.increment('foo.bar', 1, { tag1: 'a', tag2: 'b' });
      metrics.increment('foo.bar');
      metrics.increment('foo.bar', ['tag1:a', 'tag2:b']);
      metrics.increment('foo.bar', { tag1: 'a', tag2: 'b' });
    }, TypeError);
    done();
  });

  it('should run track without throwing', function(done) {
    assert.doesNotThrow(function() {
      var id = metrics.time('foo.bar');
      assert.ok(id);
      metrics.endTime(id);
      id = metrics.time('foo.bar', ['tag1:a', 'tag2:b']);
      assert.ok(id);
      metrics.endTime(id, ['tag1:a', 'tag2:b']);
      id = metrics.time('foo.bar', { tag1: 'a', tag2: 'b' });
      metrics.endTime(id, { tag1: 'a', tag2: 'b' });
      assert.ok(id);
    }, TypeError);
    done();
  });

  it('should run histogram without throwing', function(done) {
    assert.doesNotThrow(function() {
      metrics.gauge('foo.bar', 5.5);
      metrics.gauge('foo.bar', 5.5, ['tag1:a', 'tag2:b']);
      metrics.gauge('foo.bar', 5.5, { tag1: 'a', tag2: 'b' });
    }, TypeError);
    done();
  });

  it('should run setDefaultTags without throwing', function(done) {
    assert.doesNotThrow(metrics.setDefaultTags.bind(metrics), TypeError);
    done();
  });

  it('should set default tags', function(done) {
    metrics.setDefaultTags({ color: 'red', region: 'west' });
    assert.deepEqual(metrics.defaultTags, ['color:red', 'region:west']);
    done();
  });

  describe('tagUtils.processTags', function() {
    it('should accept an array of strings', function(done) {
      assert.deepEqual(tagUtils.processTags(['foo:bar', 'bar:baz']), [
        'foo:bar',
        'bar:baz'
      ]);
      done();
    });

    it('should accept an object', function(done) {
      assert.deepEqual(tagUtils.processTags({ foo: 'bar', bar: 'baz' }), [
        'foo:bar',
        'bar:baz'
      ]);
      done();
    });

    it('should return an empty array otherwise', function(done) {
      assert.deepEqual(tagUtils.processTags(3), []);
      assert.deepEqual(tagUtils.processTags('lol'), []);
      assert.deepEqual(tagUtils.processTags(4.5), []);
      done();
    });
  });

  describe('incrementOne', function() {
    var metricsSpy;

    beforeEach(function() {
      metricsSpy = sinon.spy(metrics, 'increment');
    });

    afterEach(function() {
      metrics.increment.restore();
    });

    describe('when called with name', function() {
      it('should call metrics.increment with name and value 1', function() {
        metrics.incrementOne('foobar', undefined);
        metricsSpy.calledWithMatch('foobar', 1, [], undefined);
      });
    });

    describe('when called with name and tags', function() {
      it('should call metrics.increment with name, tags and value 1', function() {
        metrics.incrementOne('foobar', ['bar', 'foo']);
        metricsSpy.calledWithMatch('foobar', 1, ['bar', 'foo'], undefined);
      });
    });
  });

  describe('observeBucketed', function() {
    var metricsSpy;

    beforeEach(function() {
      metricsSpy = sinon.spy(metrics, 'increment');
    });

    afterEach(function() {
      metrics.increment.restore();
    });

    it('should assign tags based on buckets', function() {
      metrics.observeBucketed('foobar', 34, [20, 50, 100], []);
      metricsSpy.calledWith(
        'foobar',
        1,
        sinon.match.array.contains(['le:50', 'le:100', 'le:Inf'])
      );
    });

    it('should always set the Inf tag', function() {
      metrics.observeBucketed('foobar', 200, [20], []);
      metricsSpy.calledWith(
        'foobar',
        1,
        sinon.match.array.contains(['le:Inf'])
      );
    });

    it('should preserve existing tags', function() {
      metrics.observeBucketed(
        'foobar',
        95,
        [20, 50, 100],
        ['tag1', 'tag2:val2']
      );
      metricsSpy.calledWith(
        'foobar',
        1,
        sinon.match.array.contains(['le:100', 'le:Inf', 'tag1', 'tag2:val2'])
      );
    });
  });
});

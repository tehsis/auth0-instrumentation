var assert = require('chai').assert;
var sinon = require('sinon');

function getConfiguration() {
  return {
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
}

var tagUtils = require('../lib/tags');

describe('metrics', function() {
  var actual;

  function before(config) {
    actual = require('../lib/metrics')(config);
  }

  describe('instance', () => {
    describe('using service name', () => {
      const configuration = getConfiguration();
      // console.log(configuration);
      beforeEach(() => before(getConfiguration()));

      it('should set default tags using service name', () => {
        assert.deepEqual(actual.defaultTags, [
          `service_name:${configuration.service.name}`
        ]);
      });
    });

    describe('using package name', () => {
      const configuration = getConfiguration();

      configuration.service.name = undefined;
      configuration.metrics.usePkgAsServiceName = true;
      beforeEach(() => before(configuration));

      it('should set default tags if using package name', () =>
        assert.deepEqual(actual.defaultTags, [
          `service_name:${configuration.package.name}`
        ]));
    });

    describe('without specifying service or package name', () => {
      const configuration = getConfiguration();

      configuration.service.name = undefined;
      configuration.metrics.usePkgAsServiceName = false;
      beforeEach(() => before(configuration));

      it('should not set default tags if no service name specified', () =>
        assert.deepEqual(actual.defaultTags, []));
    });

    describe('default constructor', () => {
      beforeEach(() => before(getConfiguration()));
      it('should return isActive as true', () =>
        assert.equal(actual.isActive, true));
    });
  });

  describe('functions', () => {
    beforeEach(() => before(getConfiguration()));

    it('should run gauge without throwing', () =>
      assert.doesNotThrow(() => {
        actual.gauge('foo.bar', 14);
        actual.gauge('foo.bar', 14, ['tag1:a', 'tag2:b']);
        actual.gauge('foo.bar', 14, { tag1: 'a', tag2: 'b' });
      }, TypeError));

    it('should run increment without throwing', () =>
      assert.doesNotThrow(function() {
        actual.increment('foo.bar', 1);
        actual.increment('foo.bar', 1, ['tag1:a', 'tag2:b']);
        actual.increment('foo.bar', 1, { tag1: 'a', tag2: 'b' });
        actual.increment('foo.bar');
        actual.increment('foo.bar', ['tag1:a', 'tag2:b']);
        actual.increment('foo.bar', { tag1: 'a', tag2: 'b' });
      }, TypeError));

    it('should run track without throwing', () =>
      assert.doesNotThrow(function() {
        var id = actual.time('foo.bar');
        assert.ok(id);
        actual.endTime(id);
        id = actual.time('foo.bar', ['tag1:a', 'tag2:b']);
        assert.ok(id);
        actual.endTime(id, ['tag1:a', 'tag2:b']);
        id = actual.time('foo.bar', { tag1: 'a', tag2: 'b' });
        actual.endTime(id, { tag1: 'a', tag2: 'b' });
        assert.ok(id);
      }, TypeError));

    it('should run histogram without throwing', () =>
      assert.doesNotThrow(function() {
        actual.gauge('foo.bar', 5.5);
        actual.gauge('foo.bar', 5.5, ['tag1:a', 'tag2:b']);
        actual.gauge('foo.bar', 5.5, { tag1: 'a', tag2: 'b' });
      }, TypeError));

    it('should run setDefaultTags without throwing', () =>
      assert.doesNotThrow(actual.setDefaultTags.bind(actual), TypeError));

    describe('incrementOne', function() {
      var metricsSpy;

      beforeEach(function() {
        metricsSpy = sinon.spy(actual, 'increment');
      });

      afterEach(function() {
        actual.increment.restore();
      });

      describe('when called with name', function() {
        it('should call metrics.increment with name and value 1', function() {
          actual.incrementOne('foobar', undefined);
          metricsSpy.calledWithMatch('foobar', 1, [], undefined);
        });
      });

      describe('when called with name and tags', function() {
        it('should call metrics.increment with name, tags and value 1', function() {
          actual.incrementOne('foobar', ['bar', 'foo']);
          metricsSpy.calledWithMatch('foobar', 1, ['bar', 'foo'], undefined);
        });
      });
    });

    describe('observeBucketed', function() {
      var metricsSpy;

      beforeEach(function() {
        metricsSpy = sinon.spy(actual, 'increment');
      });

      afterEach(function() {
        actual.increment.restore();
      });

      it('should assign tags based on buckets', function() {
        actual.observeBucketed('foobar', 34, [20, 50, 100], []);
        metricsSpy.calledWith(
          'foobar',
          1,
          sinon.match.array.contains(['le:50', 'le:100', 'le:Inf'])
        );
      });

      it('should always set the Inf tag', function() {
        actual.observeBucketed('foobar', 200, [20], []);
        metricsSpy.calledWith(
          'foobar',
          1,
          sinon.match.array.contains(['le:Inf'])
        );
      });

      it('should preserve existing tags', function() {
        actual.observeBucketed(
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

    describe('set default tags', () => {
      beforeEach(() => {
        before(getConfiguration());
        actual.setDefaultTags({ color: 'red', region: 'west' });
      });

      it('should set default tags', () =>
        assert.deepEqual(actual.defaultTags, ['color:red', 'region:west']));
    });

    describe('flush', () => {
      var spy;

      describe('for non datadog type', () => {
        beforeEach(() => {
          before(getConfiguration());
          actual.metrics.flush = sinon.spy();
          actual.flush();
        });
        it('should not invoke flush', () =>
          assert.isFalse(actual.metrics.flush.called));
      });

      describe('for datadog type', () => {
        beforeEach(() => {
          var config = getConfiguration();
          config.metrics.type = 'datadog';
          config.metrics.target = 'test';
          before(config);
          spy = sinon.spy(actual.metrics, 'flush');
          actual.flush();
        });
        it('should invoke flush', () => assert.isTrue(spy.called));
        afterEach(() => spy.restore());
      });
    });
  });
});

describe('tagUtils.processTags', () => {
  var actualTags;

  function before(tags) {
    actualTags = tagUtils.processTags(tags);
  }

  function testProcessTags(description, tags, expectedTags) {
    beforeEach(() => before(tags));
    it(description, () => assert.deepEqual(actualTags, expectedTags));
  }

  describe('using array of strings', () =>
    testProcessTags(
      'should not throw',
      ['foo:bar', 'bar:baz'],
      ['foo:bar', 'bar:baz']
    ));
  describe('using an object', () =>
    testProcessTags('should not throw', { foo: 'bar', bar: 'baz' }, [
      'foo:bar',
      'bar:baz'
    ]));
  describe('using a Number', () =>
    testProcessTags('should return empty array', 3, []));
  describe('using a String', () =>
    testProcessTags('should return empty array', 'lol', []));
  describe('using a Float', () =>
    testProcessTags('should return empty array', 4.5, []));
});

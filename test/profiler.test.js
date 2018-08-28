const assert = require('assert');
var sinon = require('sinon');

var Profiler = require('../lib/profiler');

describe.skip('Profiler', function () {
  var profiler, agent;
  beforeEach(function () {
    agent = {
      metrics: {
        histogram: sinon.spy()
      },
      logger: {
        info: sinon.spy()
      }
    };
    profiler = new Profiler(agent, { name: 'test' }, { HUNT_MEMORY_LEAKS: true });
    // avoid having to create workers
    process.send = function () { };
  });

  afterEach(function () {
    process.send = undefined;
  });

  describe.skip('#createThrottledSnapshot', function (done) {
    it('should create a snapshot and log', function() {
      this.timeout(3000);
      profiler.createThrottledSnapshot('testing', () => {
        assert.equal(agent.logger.info.calledOnce, true);
        done();
      });
    });
  });

  describe.skip('#createProfile', function () {
    it('should create a profile', function (done) {
      this.timeout(3000);
      profiler.createProfile(1000, function (err, path) {
        assert.ifError(err);
        assert(path);
        done();
      });
    });
  });
});

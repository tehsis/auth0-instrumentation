var assert = require('assert');
var sinon = require('sinon');

var Profiler = require('../lib/profiler');

describe('Profiler', function() {
  var profiler, agent;
  beforeEach(function() {
    agent = {
      metrics: {
        histogram: sinon.spy()
      },
      logger: {
        info: sinon.spy()
      }
    };
    profiler = new Profiler(agent, {name: 'test'}, {HUNT_MEMORY_LEAKS: true});
    // avoid having to create workers
    process.send = function() {};
  });
  afterEach(function() {
    process.send = undefined;
  });
  describe('#createDebouncedSnapshot', function() {
    it('should create a snapshot and log', function(done) {
      this.timeout(3000);
      profiler.createDebouncedSnapshot('testing');
      setInterval(() => {
        assert(agent.logger.info.calledOnce);
        done();
      }, 1000);
    });
  });
});

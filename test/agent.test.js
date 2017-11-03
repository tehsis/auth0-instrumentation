'use strict';

const assert = require('assert');

const agent = require('../');

describe('agent', function() {
  describe('#init', function() {
    it('should be idempotent', function() {
      agent.init({ name: 'test' }, {});
      assert(agent.initialized);
      const logger = agent.logger;
      const metrics = agent.metrics;
      agent.init({ name: 'test' }, {});
      assert(logger === agent.logger);
      assert(metrics === agent.metrics);
    });
  });
});

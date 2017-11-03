'use strict';

const assert = require('assert');

const keepAliveAgentRegistry = require('../lib/keep_alive_agent');

describe('keepAliveAgentRegistry', function() {
  it('should ', function() {
    const agent = keepAliveAgentRegistry({});
    assert(agent === keepAliveAgentRegistry({ NODE_ENV: 'test'} ));
  });
});

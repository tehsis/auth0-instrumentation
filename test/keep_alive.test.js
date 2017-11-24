'use strict';

const assert = require('assert');

const keepAliveAgentRegistry = require('../lib/keep_alive_agent');

describe.only('keepAliveAgentRegistry', function() {
  it('should generate a http agent', function() {
    const agent = keepAliveAgentRegistry({});
    assert(agent === keepAliveAgentRegistry({ NODE_ENV: 'test'} ));
  });

  it('should generate an https agent', function() {
    const agent = keepAliveAgentRegistry({ });
    assert(agent !== keepAliveAgentRegistry({ NODE_ENV: 'production'} ));
  });
});

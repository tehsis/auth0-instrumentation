'use strict';

const assert = require('assert');

const keepAliveAgentRegistry = require('../../lib/logger-streams/keep-alive-agent');

describe('keepAliveAgentRegistry', function () {
  it('should generate a http agent', function () {
    const agent = keepAliveAgentRegistry(false);
    assert.deepEqual(agent, keepAliveAgentRegistry(false));
    assert.equal(agent.protocol, 'http:');
  });

  it('should generate an https agent', function () {
    const agent = keepAliveAgentRegistry(false);
    const httpsAgent = keepAliveAgentRegistry(true);
    assert.notDeepEqual(agent, httpsAgent);
    assert.equal(httpsAgent.protocol, 'https:');
  });
});

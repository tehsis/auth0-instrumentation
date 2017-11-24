'use strict';

const assert = require('assert');

const keepAliveAgentRegistry = require('../lib/keep_alive_agent');

describe('keepAliveAgentRegistry', function() {
  it('should generate a http agent', function() {
    const agent = keepAliveAgentRegistry({});
    assert(agent === keepAliveAgentRegistry({ NODE_ENV: 'test'} ));
    assert(agent.protocol === 'http:');
  });

  it('should generate an https agent', function() {
    const agent = keepAliveAgentRegistry({ });
    const httpsAgent = keepAliveAgentRegistry({ NODE_ENV: 'production'} );
    assert(agent !== httpsAgent);
    assert(httpsAgent.protocol === 'https:');
  });
});

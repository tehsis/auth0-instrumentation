const assert = require('chai').assert;

describe('sentryStream', () => {
  describe('with loglevel', () => {
    var actual;
    const level = 'error';

    beforeEach(() => {
      actual = require('../../lib/logger-streams/sentry-stream')(level);
    });

    it('should set name Sentry', () => assert.equal(actual.name, 'sentry'));
    it('should set loglevel', () => assert.equal(actual.level, level));
    it('should set raw type', () => assert.equal(actual.type, 'raw'));
    it('should set a Sentry stream', () => assert.instanceOf(actual.stream, require('../../lib/logger-streams/auth0-sentry-stream').Auth0SentryStream));
  });
});

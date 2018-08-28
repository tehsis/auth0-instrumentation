const assert = require('chai').assert;

describe('webUrlStream', () => {
  describe('with loglevel', () => {
    var actual;
    const url = 'http://test';
    const level = 'warning';

    beforeEach(() => {
      actual = require('../../lib/logger-streams/web-url-stream')(url, level);
    });

    it('should set name web-url', () => assert.equal(actual.name, 'web-url'));
    it('should set loglevel', () => assert.equal(actual.level, level));
    it('should set a HttpStream stream', () => assert.instanceOf(actual.stream, require('auth0-common-logging').Streams.HttpWritableStream));
  });
});

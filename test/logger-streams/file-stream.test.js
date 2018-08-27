const assert = require('chai').assert;

describe('fileStream', () => {
  describe('with loglevel', () => {
    var actual;
    const path = './test-path/';
    const level = 'error';

    beforeEach(() => {
      actual = require('../../lib/logger-streams/file-stream')(path, level);
    });

    it('should set loglevel', () => assert.equal(actual.level, level));
    it('should set path', () => assert.equal(actual.path, path));
  });
});

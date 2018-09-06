const assert = require('chai').assert;

describe('consoleStream', () => {
  var actual;

  describe('default values', () => {
    const expectedLevel = 'warning';

    beforeEach(() => {
      const consoleStream = require('../../lib/logger-streams/console-stream');
      actual = consoleStream({ level: 'warning' });
    });

    it('should set loglevel', () => assert.equal(actual.level, expectedLevel));
    it('should set process stdout as stream', () => assert.deepEqual(actual.stream, process.stdout));
  });

  describe('nice formatting uses bunyan', () => {
    const expectedLevel = 'warning';

    beforeEach(() => {
      const consoleStream = require('../../lib/logger-streams/console-stream');
      actual = consoleStream({ level: expectedLevel, niceFormat: true });
    });

    it('should set loglevel', () => assert.equal(actual.level, expectedLevel));
    it('should set stream', () => assert.isNotNull(actual.stream));
    it('should set bunyan stdin as stream', () => assert.notDeepEqual(actual.stream, process.stdout));
  });
});

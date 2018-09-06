const assert = require('chai').assert;

describe('logger-streams', () => {
  var actual;

  describe('default', () => {
    beforeEach(() => {
      actual = require('../../lib/logger-streams');
    });

    it('should have a fileStream function', () => assert.equal(actual.file, require('../../lib/logger-streams/file-stream')));
    it('should have a consoleStream function', () => assert.equal(actual.console, require('../../lib/logger-streams/console-stream')));
    it('should have a webUrlStream function', () => assert.equal(actual.web, require('../../lib/logger-streams/web-url-stream')));
    it('should have a kinesisStream function', () => assert.equal(actual.kinesis, require('../../lib/logger-streams/kinesis-stream')));
    it('should have a sentryStream function', () => assert.equal(actual.sentry, require('../../lib/logger-streams/sentry-stream')));
  });

  describe('getStreams', () => {

    function test(configuration) {
      actual = require('../../lib/logger-streams').getStreams(configuration);
    }

    describe('specifying file settings', () => {
      const streamSettings = { type: 'file', level: 'warning', file: 'test' };
      const configuration = { logger: { streams: { file: streamSettings } } };
      const expectedNumberOfStream = 1;

      beforeEach(() => test(configuration));
      it('should have the correct number of streams', () =>
        assert.equal(Object.keys(actual).length, expectedNumberOfStream));
      it('should include a stream', () => assert.equal(actual[0].name, 'file'));
    });

    describe('specifying console settings', () => {
      const streamSettings = { type: 'console', level: 'warning' };
      const configuration = { logger: { streams: { console: streamSettings } } };
      const expectedNumberOfStream = 1;

      beforeEach(() => test(configuration));
      it('should have the correct number of streams', () => assert.equal(actual.length, expectedNumberOfStream));
      it('should include a stream', () => assert.equal(actual[0].name, 'console'));
    });

    describe('specifying console settings with Nice Formatting', () => {
      const streamSettings = { type: 'console', level: 'warning', niceFormat: true };
      const configuration = { logger: { streams: { console: streamSettings } } };
      const expectedNumberOfStream = 1;

      beforeEach(() => test(configuration));
      it('should have the correct number of streams', () => assert.equal(actual.length, expectedNumberOfStream));
      it('should include a stream', () => assert.equal(actual[0].name, 'console'));
    });

    describe('specifying web settings', () => {
      const streamSettings = { type: 'web', level: 'warning', url: 'http://test/' };
      const configuration = { logger: { streams: { web: streamSettings } }, flags: { isProduction: true } };
      const expectedNumberOfStream = 1;

      beforeEach(() => test(configuration));
      it('should have the correct number of streams', () => assert.equal(actual.length, expectedNumberOfStream));
      it('should include a stream', () => assert.deepEqual(actual[0].name, 'web-url'));
    });

    describe('log to kinesis', () => {
      const streamSettings = { type: 'kinesis', level: 'warning', streamName: 'test-stream' };
      const configuration = { logger: { streams: { kinesis: streamSettings } }, flags: { isProduction: true } };
      const expectedNumberOfStream = 1;

      beforeEach(() => test(configuration));
      it('should have the correct number of streams', () => assert.equal(actual.length, expectedNumberOfStream));
      it('should include a stream', () => assert.equal(actual[0].name, 'kinesis'));
    });

    describe('log to sentry', () => {
      const streamSettings = { type: 'sentry', level: 'warning' };
      const configuration = { logger: { streams: { sentry: streamSettings } } };
      const expectedNumberOfStream = 1;

      beforeEach(() => test(configuration));
      it('should have the correct number of streams', () => assert.equal(actual.length, expectedNumberOfStream));
      it('should include a stream', () => assert.equal(actual[0].name, 'sentry'));
    });
  });
});

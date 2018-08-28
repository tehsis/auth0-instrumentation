const assert = require('chai').assert;

describe('logger-streams', () => {
  var actual;

  describe('default', () => {
    beforeEach(() => {
      actual = require('../../lib/logger-streams');
    });

    it('should have a fileStream function', () => assert.equal(actual.fileStream, require('../../lib/logger-streams/file-stream')));
    it('should have a consoleStream function', () => assert.equal(actual.consoleStream, require('../../lib/logger-streams/console-stream')));
    it('should have a webUrlStream function', () => assert.equal(actual.webUrlStream, require('../../lib/logger-streams/web-url-stream')));
    it('should have a kinesisStream function', () => assert.equal(actual.kinesisStream, require('../../lib/logger-streams/kinesis-stream')));
    it('should have a sentryStream function', () => assert.equal(actual.sentryStream, require('../../lib/logger-streams/sentry-stream')));
  });

  describe('getStreams', () => {

    function test(agent, pkg, env) {
      actual = require('../../lib/logger-streams').getStreams(agent, pkg, env);
    }

    describe('specifying FILE', () => {
      const env = { LOG_LEVEL: 'warning', LOG_FILE: 'test' };
      const expectedNumberOfStream = 2;

      beforeEach(() => test(null, null, env));
      it('should have the correct number of streams', () => assert.equal(actual.length, expectedNumberOfStream));
      it('should include a stream', () => assert.equal(actual[0].name, 'file'));

    });

    describe('not specifying FILE', () => {
      const env = { LOG_LEVEL: 'warning' };
      const expectedNumberOfStream = 2;

      beforeEach(() => test(null, null, env));
      it('should have the correct number of streams', () => assert.equal(actual.length, expectedNumberOfStream));
      it('should include a stream', () => assert.equal(actual[0].name, 'console'));
    });

    describe('not specifying FILE and Nice Formatting', () => {
      const env = { LOG_LEVEL: 'warning', CONSOLE_NICE_FORMAT: true };
      const expectedNumberOfStream = 2;

      beforeEach(() => test(null, null, env));
      it('should have the correct number of streams', () => assert.equal(actual.length, expectedNumberOfStream));
      it('should include a stream', () => assert.equal(actual[0].name, 'console'));
    });

    describe('is production and web URL set', () => {
      const env = { NODE_ENV: 'production', LOG_TO_WEB_LEVEL: 'warning', LOG_TO_WEB_URL: 'http://test/' };
      const expectedNumberOfStream = 3;
      process.env.NODE_ENV = 'production';

      beforeEach(() => test(null, null, env));
      it('should have the correct number of streams', () => assert.equal(actual.length, expectedNumberOfStream));
      it('should include a stream', () => assert.deepEqual(actual[1].name, 'web-url'));
    });

    describe('log to kinesis', () => {
      const env = { LOG_TO_KINESIS: 'test', LOG_TO_KINESIS_LEVEL: 'warning' };
      const expectedNumberOfStream = 3;

      beforeEach(() => test(null, null, env));
      it('should have the correct number of streams', () => assert.equal(actual.length, expectedNumberOfStream));
      it('should include a stream', () => assert.equal(actual[1].name, 'kinesis'));
    });

    describe('log to sentry', () => {
      const env = {};
      const expectedNumberOfStream = 2;

      beforeEach(() => test(null, null, env));
      it('should have the correct number of streams', () => assert.equal(actual.length, expectedNumberOfStream));
      it('should include a stream', () => assert.equal(actual[1].name, 'sentry'));
    });
  });
});

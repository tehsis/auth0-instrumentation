const assert = require('chai').assert;

describe('Configuration', () => {
  describe('logger settings using', () => {
    var actual, expectedStreams;
    var configurationFactory = require('../../lib/configuration');
    var test = (env, expectedCount) => {
      actual = configurationFactory.build(env);
      expectedStreams = expectedCount;
    };

    describe('console env variables', () => {
      beforeEach(() => test({ LOG_LEVEL: 'warning' }, 2));
      it('should include the expected count of streams', () => assert.equal(actual.logger.streams.length, expectedStreams));
      it('should include a console stream', () => assert.equal(actual.logger.streams[0].type, 'console'));
      it('should include a sentry stream', () => assert.equal(actual.logger.streams[1].type, 'sentry'));
    });

    describe('file env variables', () => {
      beforeEach(() => test({ LOG_FILE: 'test', LOG_LEVEL: 'warning' }, 2));
      it('should include the expected count of streams', () => assert.equal(actual.logger.streams.length, expectedStreams));
      it('should include a console stream', () => assert.equal(actual.logger.streams[0].type, 'file'));
      it('should include a sentry stream', () => assert.equal(actual.logger.streams[1].type, 'sentry'));
    });

    describe('web env variables', () => {
      beforeEach(() => test({ LOG_TO_WEB_URL: 'http://test' }, 3));
      it('should include the expected count of streams', () => assert.equal(actual.logger.streams.length, expectedStreams));
      it('should include a console stream', () => assert.equal(actual.logger.streams[0].type, 'console'));
      it('should include a web stream', () => assert.equal(actual.logger.streams[1].type, 'web'));
      it('should include a sentry stream', () => assert.equal(actual.logger.streams[2].type, 'sentry'));
    });

    describe('kinesis env variables', () => {
      beforeEach(() => test({ LOG_TO_KINESIS: 'test' }, 3));
      it('should include the expected count of streams', () => assert.equal(actual.logger.streams.length, expectedStreams));
      it('should include a console stream', () => assert.equal(actual.logger.streams[0].type, 'console'));
      it('should include a kinesis stream', () => assert.equal(actual.logger.streams[1].type, 'kinesis'));
      it('should include a sentry stream', () => assert.equal(actual.logger.streams[2].type, 'sentry'));
    });
  });
});

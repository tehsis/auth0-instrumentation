const assert = require('chai').assert;

describe('Configuration', () => {
  describe('logger settings using', () => {
    var actual, expectedStreams;
    var configurationFactory = require('../../lib/configuration');
    var test = (pkg, env, expectedCount) => {
      actual = configurationFactory.build(pkg, env);
      expectedStreams = expectedCount;
    };

    describe('console env variables', () => {
      beforeEach(() => test({}, { LOG_LEVEL: 'warning' }, 2));
      it('should include the expected count of streams', () =>
        assert.equal(Object.keys(actual.logger.streams).length, expectedStreams));
      it('should include a console stream', () => assert.equal(actual.logger.streams.console.type, 'console'));
      it('should include a sentry stream', () => assert.equal(actual.logger.streams.sentry.type, 'sentry'));
    });

    describe('file env variables', () => {
      beforeEach(() => test({}, { LOG_FILE: 'test', LOG_LEVEL: 'warning' }, 2));
      it('should include the expected count of streams', () => assert.equal(Object.keys(actual.logger.streams).length, expectedStreams));
      it('should include a console stream', () => assert.equal(actual.logger.streams.file.type, 'file'));
      it('should include a sentry stream', () => assert.equal(actual.logger.streams.sentry.type, 'sentry'));
    });

    describe('web env variables', () => {
      var nodeEnvironment;
      beforeEach(() => {
        nodeEnvironment = process.env.NODE_ENV;
        process.env.NODE_ENV = 'production';

      });
      beforeEach(() => test({}, { LOG_TO_WEB_URL: 'http://test' }, 3));
      afterEach(() => process.env.NODE_ENV = nodeEnvironment);
      it('should include the expected count of streams', () => assert.equal(Object.keys(actual.logger.streams).length, expectedStreams));
      it('should include a console stream', () => assert.equal(actual.logger.streams.console.type, 'console'));
      it('should include a web stream', () => assert.equal(actual.logger.streams.web.type, 'web'));
      it('should include a sentry stream', () => assert.equal(actual.logger.streams.sentry.type, 'sentry'));
    });

    describe('kinesis env variables', () => {
      beforeEach(() => test({}, { LOG_TO_KINESIS: 'test' }, 3));
      it('should include the expected count of streams', () => assert.equal(Object.keys(actual.logger.streams).length, expectedStreams));
      it('should include a console stream', () => assert.equal(actual.logger.streams.console.type, 'console'));
      it('should include a kinesis stream', () => assert.equal(actual.logger.streams.kinesis.type, 'kinesis'));
      it('should include a sentry stream', () => assert.equal(actual.logger.streams.sentry.type, 'sentry'));
    });
  });
});

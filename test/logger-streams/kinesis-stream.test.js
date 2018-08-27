const assert = require('chai').assert;

describe('kinesisStream', () => {
  var actual;
  const settings = {
    NODE_ENV: 'dev',
    LOG_TO_KINESIS_LEVEL: 'warning',
    LOG_TO_KINESIS_LOG_TYPE: 'test_type',
    AWS_ACCESS_KEY_ID: 'test',
    AWS_ACCESS_KEY_SECRET: 'test',
    AWS_SESSION_TOKEN: 'token',
    AWS_CREDENTIALS: 'creds',
    LOG_TO_KINESIS: 'test-stream',
    AWS_KINESIS_REGION: 'test'
  };

  function test(settings, agent, expectedAgent) {
    beforeEach(() => {
      const kinesisStream = require('../../lib/logger-streams/kinesis-stream');

      actual = kinesisStream(settings, agent);
    });

    it('should set stream name', () => assert.equal(actual.name, 'kinesis'));
    it('should set log level', () => assert.equal(actual.level, settings.LOG_TO_KINESIS_LEVEL));
    it('should set log type', () => assert.equal(actual.type, settings.LOG_TO_KINESIS_LOG_TYPE));
    it('should set stream', () => assert.isNotNull(actual.stream));
    it('should set the stream agent', () => assert.instanceOf(actual.stream.kinesis.config.httpOptions.agent, expectedAgent));
  }

  describe('using a mock agent', () => {
    const expectedAgent = function () { return this; };

    test(settings, new expectedAgent(), expectedAgent);
  });

  describe('using keep alive agent', () => {
    describe('NODE_ENV development', () => {
      settings.NODE_ENV = 'development';
      test(settings, undefined, require('http').Agent);
    });

    describe('NODE_ENV production', () => {
      settings.NODE_ENV = 'production';
      test(settings, undefined, require('https').Agent);
    });
  });
});

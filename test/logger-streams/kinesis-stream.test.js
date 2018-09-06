const assert = require('chai').assert;

describe('kinesisStream', () => {
  var actual;
  const settings = {
    isProduction: false,
    level: 'warning',
    logType: 'test_type',
    accessKeyId: 'test',
    accessKeySecret: 'test',
    sessionToken: 'token',
    credentials: 'creds',
    streamName: 'test-stream',
    region: 'test',
    objectMode: false,
    buffer: {}
  };

  function test(settings, expectedAgent) {
    beforeEach(() => {
      const kinesisStream = require('../../lib/logger-streams/kinesis-stream');

      actual = kinesisStream(settings);
    });

    it('should set stream name', () => assert.equal(actual.name, 'kinesis'));
    it('should set log level', () => assert.equal(actual.level, settings.level));
    it('should set log type', () => assert.equal(actual.type, settings.logType));
    it('should set stream', () => assert.isNotNull(actual.stream));
    it('should set the stream agent', () => assert.instanceOf(actual.stream.kinesis.config.httpOptions.agent, expectedAgent));
  }

  describe('using keep alive agent', () => {
    describe('NODE_ENV development', () => {
      settings.isProduction = false;
      test(settings, require('http').Agent);
    });

    describe('NODE_ENV production', () => {
      settings.isProduction = true;
      test(settings, require('https').Agent);
    });
  });
});

const assert = require('chai').assert;

describe('Logger Settings', () => {
  var actual;
  const loggerSettings = require('../../lib/configuration/logger-settings');
  const test = (type, env) => actual = loggerSettings[type](env);

  describe('file setting file value', () => {
    var env = { LOG_LEVEL: 'warning', LOG_FILE: 'test' };

    beforeEach(() => test('file', env));
    it('set the correct stream type', () => assert.equal(actual.type, 'file'));
    it('set the correct log level', () => assert.equal(actual.level, env.LOG_LEVEL));
    it('set the correct file', () => assert.equal(actual.file, env.LOG_FILE));
  });

  describe('file setting without file value', () => {
    var env = { LOG_LEVEL: 'warning' };

    beforeEach(() => test('file', env));
    it('set the correct stream type', () => assert.equal(actual.type, 'console'));
    it('set the correct log level', () => assert.equal(actual.level, env.LOG_LEVEL));
    it('set the nice format value', () => assert.isFalse(actual.niceFormat));
  });

  describe('file setting without file value and nice format', () => {
    var env = { LOG_LEVEL: 'warning', CONSOLE_NICE_FORMAT: true };

    beforeEach(() => test('file', env));
    it('set the correct stream type', () => assert.equal(actual.type, 'console'));
    it('set the correct log level', () => assert.equal(actual.level, env.LOG_LEVEL));
    it('set the nice format value', () => assert.isTrue(actual.niceFormat));
  });

  describe('web setting', () => {
    var nodeEnvironment;
    const env = { LOG_TO_WEB_URL: 'http://test', LOG_TO_WEB_LEVEL: 'warning' };

    beforeEach(() => {
      nodeEnvironment = process.env.NODE_ENV;
      process.env.NODE_ENV = 'production';

    });
    beforeEach(() => test('web', env));
    afterEach(() => process.env.NODE_ENV = nodeEnvironment);
    it('set the correct stream type', () => assert.equal(actual.type, 'web'));
    it('set the correct log level', () => assert.equal(actual.level, env.LOG_TO_WEB_LEVEL));
    it('set the web url value', () => assert.equal(actual.url, env.LOG_TO_WEB_URL));
  });

  describe('web setting with default log level', () => {
    var nodeEnvironment;
    var env = { LOG_TO_WEB_URL: 'http://test' };

    beforeEach(() => {
      nodeEnvironment = process.env.NODE_ENV;
      process.env.NODE_ENV = 'production';

    });
    beforeEach(() => test('web', env));
    afterEach(() => process.env.NODE_ENV = nodeEnvironment);
    it('set the correct stream type', () => assert.equal(actual.type, 'web'));
    it('set the correct log level', () => assert.equal(actual.level, 'error'));
    it('set the web url value', () => assert.equal(actual.url, env.LOG_TO_WEB_URL));
  });

  describe('skip web setting', () => {
    var env = {};

    beforeEach(() => test('web', env));
    it('should not define a stream', () => assert.isUndefined(actual));
  });

  describe('kinesis setting', () => {
    var env = { LOG_TO_KINESIS: 'test', AWS_ACCESS_KEY_ID: 'testid', AWS_ACCESS_KEY_SECRET: 'testsecret' };

    beforeEach(() => test('kinesis', env));
    it('set the correct stream type', () => assert.equal(actual.type, 'kinesis'));
    it('set the correct AWS key', () => assert.equal(actual.accessKeyId, env.AWS_ACCESS_KEY_ID));
    it('set the correct AWS secret', () => assert.equal(actual.accessKeySecret, env.AWS_ACCESS_KEY_SECRET));
    it('set the web url value', () => assert.equal(actual.url, env.LOG_TO_WEB_URL));
  });

  describe('skip kinesis setting', () => {
    var env = {};

    beforeEach(() => test('kinesis', env));
    it('should not define a stream', () => assert.isUndefined(actual));
  });

  describe('sentry setting', () => {
    var env = { ERROR_REPORTER_URL: 'http://test/', ERROR_REPORTER_LOG_LEVEL: 'warning' };

    beforeEach(() => test('sentry', env));
    it('set the correct stream type', () => assert.equal(actual.type, 'sentry'));
    it('set the correct log level', () => assert.equal(actual.level, env.ERROR_REPORTER_LOG_LEVEL));
    it('set the sentry url value', () => assert.equal(actual.url, env.ERROR_REPORTER_URL));
  });

  describe('sentry setting with default log level', () => {
    var env = { ERROR_REPORTER_URL: 'http://test/' };

    beforeEach(() => test('sentry', env));
    it('set the correct stream type', () => assert.equal(actual.type, 'sentry'));
    it('set the correct log level', () => assert.equal(actual.level, 'error'));
    it('set the sentry url value', () => assert.equal(actual.url, env.ERROR_REPORTER_URL));
  });
});

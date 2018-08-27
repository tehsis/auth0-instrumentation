const assert = require('chai').assert;
const sinon = require('sinon');
const Auth0SentryStream = require('../../lib/logger-streams/auth0-sentry-stream');

describe('Auth0SentryStream', () => {
  describe('constructor', () => {
    var actual;
    const client = { test: true };
    const level = 'error';

    beforeEach(() => {
      actual = new Auth0SentryStream(client, level);
    });

    it('should set type as "raw"', () => assert.equal(actual.type, 'raw'));
    it('should set the correct error level', () => assert.equal(actual.level, level));
    it('should set a Sentry stream', () => assert.instanceOf(actual.stream, Auth0SentryStream.Auth0SentryStream));
  });

  describe('write', () => {
    var actual, client;

    function before(record) {
      client = { captureMessage: sinon.spy(), captureException: sinon.spy() };
      actual = new Auth0SentryStream.Auth0SentryStream(client);
      actual.write(record);
    }

    describe('with log_type', () => {
      const record = { msg: 'test', log_type: 'testing', tags: { tag: 't' }, extra: true };
      const expectedTags = { tag: 't', log_type: 'testing' };

      beforeEach(() => before(record));
      it('should call client', () => assert.isTrue(client.captureMessage.calledOnce));
      it('should write message and extra params', () => assert.isTrue(client.captureMessage.calledWith(record.msg, { level: 'info', tags: expectedTags, extra: { extra: true, log_type: 'testing' } })));
    });

    describe('without log_type', () => {
      const record = { msg: 'test', tags: { tag: 't' }, extra: true };

      beforeEach(() => before(record));
      it('should call client', () => assert.isTrue(client.captureMessage.calledOnce));
      it('should write message and extra params', () => assert.isTrue(client.captureMessage.calledWith(record.msg, { level: 'info', tags: record.tags, extra: { extra: true } })));
    });

    describe('without tags', () => {
      const record = { msg: 'test', extra: true };

      beforeEach(() => before(record));
      it('should call client', () => assert.isTrue(client.captureMessage.calledOnce));
      it('should write message and extra params', () => assert.isTrue(client.captureMessage.calledWith(record.msg, { level: 'info', tags: {}, extra: { extra: true } })));
    });

    describe('with error', () => {
      const record = { level: 50, msg: 'test', err: new Error('testing'), extra: true };

      beforeEach(() => before(record));
      it('should capture exception', () => assert.isTrue(client.captureException.calledOnce));
      it('should not capture message', () => assert.isFalse(client.captureMessage.called));
      it('should write message and extra params', () => assert.isTrue(client.captureException.calledWith(record.err, { level: 'error', tags: {}, extra: { level: 50, msg: 'test', extra: true } })));
    });
  });
});

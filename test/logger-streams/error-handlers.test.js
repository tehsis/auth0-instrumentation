const assert = require('chai').assert;
const sinon = require('sinon');

describe('kinesisErrorHandler', () => {
  describe('handle error', () => {
    const err = { message: 'test error', records: {}, stack: {} };
    const expectedMessage = JSON.stringify({
      message: err.message,
      records: err.records,
      stack: err.stack
    });


    beforeEach(() => {
      const handler = require('../../lib/logger-streams/error-handlers').kinesisErrorHandler;

      sinon.stub(console, 'error');
      handler(err);
    });

    it('should call console.error once', () => assert.isTrue(console.error.calledOnce));
    it('should call console.error with error message', () => assert.isTrue(console.error.calledWith('Error on writing logs to Kinesis', expectedMessage)));
    afterEach(() => console.error.restore());
  });

  describe('without err object', () => {
    beforeEach(() => {
      const handler = require('../../lib/logger-streams/error-handlers').kinesisErrorHandler;

      sinon.stub(console, 'error');
      handler();
    });

    it('should call console.error once', () => assert.isTrue(console.error.calledOnce));
    it('should call console.error with error message', () => assert.isTrue(console.error.calledWith('Error on writing logs to Kinesis')));
    afterEach(() => console.error.restore());
  });
});

describe('webErrorHandler', () => {
  describe('handle error', () => {
    const err = { message: 'test error', records: {}, stack: {} };
    const expectedMessage = JSON.stringify({
      message: err.message,
      stack: err.stack
    });


    beforeEach(() => {
      const handler = require('../../lib/logger-streams/error-handlers').webErrorHandler;

      sinon.stub(console, 'error');
      handler(err);
    });

    it('should call console.error once', () => assert.isTrue(console.error.calledOnce));
    it('should call console.error with error message', () => assert.isTrue(console.error.calledWith('Error on writing logs to web url', expectedMessage)));
    afterEach(() => console.error.restore());
  });

  describe('without err object', () => {
    beforeEach(() => {
      const handler = require('../../lib/logger-streams/error-handlers').webErrorHandler;

      sinon.stub(console, 'error');
      handler();
    });

    it('should call console.error once', () => assert.isTrue(console.error.calledOnce));
    it('should call console.error with error message', () => assert.isTrue(console.error.calledWith('Error on writing logs to web url')));
    afterEach(() => console.error.restore());
  });
});

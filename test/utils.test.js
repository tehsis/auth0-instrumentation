'use strict';

const assert = require('assert');

const stubs = require('../lib/stubs');
const utils = require('../lib/utils');
const decorateLogger = utils.decorateLogger;
const loggerStub = stubs.logger;
const sinon = require('sinon');

const levels = ['trace', 'debug', 'info', 'warn', 'error', 'fatal'];

levels.forEach(function(lvl) {
  loggerStub[lvl] = sinon.spy();
});

describe('Utils', function() {
  describe('decorateLogger', function() {
    var logger = decorateLogger(loggerStub);

    beforeEach(function() {
      levels.forEach(function(lvl) {
        loggerStub[lvl].resetHistory();
      });
    });
    it('should not modify str logs', function() {
      levels.forEach(function(lvl) {
        logger[lvl]('test');
        assert(loggerStub[lvl].calledWith({}, 'test'));
      });
    });
    it('should not modify bunyan compatible logs', function() {
      levels.forEach(function(lvl) {
        logger[lvl](new Error(), 'test');
        assert(loggerStub[lvl].calledWith(sinon.match.instanceOf(Error), 'test'));
      });
    });
    it('should switch object to first index on winston style logs', function() {
      levels.forEach(function(lvl) {
        logger[lvl]('test', new Error());
        assert(loggerStub[lvl].calledWith(sinon.match.instanceOf(Error), 'test'));
      });
    });
    it('should proxy subsequent strings and args', function() {
      levels.forEach(function(lvl) {
        logger[lvl]('test', new Error(), 'some otherstrings');
        assert(loggerStub[lvl].calledWith(sinon.match.instanceOf(Error), 'test', 'some otherstrings'));
      });
    });
  });
});

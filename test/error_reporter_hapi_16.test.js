const Hapi16 = require('hapi16');
const sinon = require('sinon');
const assert = require('assert');
const hapiPluginBuilder = require('../lib/hapi_plugin_builder');

describe('error reporter with Hapi server < v17', function () {
  var server;
  var ravenClient = { captureError: sinon.stub() };
  var error = new Error();
  before(function (done) {
    server = new Hapi16.Server();
    server.connection({ port: 9879 });
    server.route({
      method: 'POST',
      path: '/niceRoute',
      handler: function (request, reply) {
        request.pre._originalPayload = 42;
        reply(error);
      }
    });

    var plugin = {
      register: hapiPluginBuilder(ravenClient),
      options: {
        tags: 't1'
      }
    };
    server.start(function (err) {
      if (err) {
        done('Failed to load Hapi plugin');
      }
      done();
    });

    server.register(plugin, function (err) {
      if (err) {
        done('Failed to load Hapi plugin');
      }
    });
  });

  after(function (done) {
    server.stop(done);
  });

  it('should log if a error happen in the server', function (done) {
    var request = { method: 'POST', url: `${server.info.uri}/niceRoute?p1=2` };
    server.inject(request, function (response) {
      setTimeout(function () {
        assert(500 === response.statusCode, 'expect a 500 error');
        assert(ravenClient.captureError.called, 'capture error should be called');

        const firstParam = ravenClient.captureError.getCall(0).args[0];
        const secondParam = ravenClient.captureError.getCall(0).args[1];

        assert(firstParam === error);

        assert(secondParam.extra.timestamp, 'timestamp must exist');
        assert(secondParam.extra.id, 'id must exist');
        assert(secondParam.extra.method === 'post', 'method must be POST');
        assert(secondParam.extra.path === '/niceRoute', 'path must be /niceRoute');
        assert(secondParam.extra.payload === 42, 'payload must be 42');
        assert(secondParam.extra.query.p1 === '2', 'must have a qs param called p1, and must be equals 2');
        assert(secondParam.extra.remoteAddress === '127.0.0.1', 'remote address must be 127.0.0.1');
        assert(secondParam.extra.userAgent === 'shot', 'user agent must be shot');
        assert(secondParam.tags === 't1', 'tags must be t1');

        done();
      }, 200);
    });
  });
});

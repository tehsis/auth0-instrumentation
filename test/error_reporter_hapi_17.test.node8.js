const Hapi17 = require('hapi17');
const sinon = require('sinon');
const assert = require('assert');
const hapiPluginBuilder = require('../lib/hapi_plugin_builder');

describe('error reporter with Hapi server >= v17', function () {
  var server;
  var error = new Error();
  var ravenClient = { captureError: sinon.stub() };

  before(async function() {
    server = new Hapi17.Server({ port: 9876 });
    server.route({
      method: 'POST',
      path: '/niceRoute',
      handler: async function(request) {
        request.pre._originalPayload = 42;
        throw error;
      }
    });

    await server.register({
      plugin: hapiPluginBuilder(ravenClient),
      options: { tags: 't1' }
    });
    return server.start();
  });

  after(function () {
    return server.stop();
  });

  it('should log if a error happen in the server', async function () {
    const response = await server.inject({
      method: 'POST',
      url: `${server.info.uri}/niceRoute?p1=2`,
    });
    assert(500 === response.statusCode, 'expect a 500 error');
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
  });

});

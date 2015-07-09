'use strict';

var test = require('tape');
var l = require('lodash');
var nockify = require('./nockify');

var httpWorker = require('../lib/worker_http');
// nockify does not support payloads yet
var scripts = [
  ['hello', require('./scripts/hello.json')],
  ['multiple_phases', require('./scripts/multiple_phases.json')]
];

l.each(scripts, function(script) {
  test(script[0], function(t) {
    var server = nockify(script[1].scenarios[0].flow, script[1].config, t);
    var scenario = httpWorker.create(script[1].scenarios[0].flow, script[1].config, {});
    scenario.on('error', function(err) {
      t.fail(err);
    });
    scenario.launch(function(err, context) {
      if (!server.isDone()) {
        console.error('pending mocks: %j', server.pendingMocks());
        t.fail(new Error());
      }
      server.done();
      t.error(err, 'Scenario completes without errors');
      t.ok(context, 'context is returned');
      t.end();
    });
  });
});
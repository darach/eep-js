var Eep = require('eep');
var events = require('events');
var testCase = require('nodeunit').testCase;

exports.read = testCase({
  setUp: function(cb) {
    this._openStdin = process.openStdin;
    this._log = console.log;
    this._exit = process.exit;

    var ev = this.ev = new events.EventEmitter();
    process.openStdin = function() { return er; }

    cb();
  },
  tearDown: function(cb) {
    process.openStdin = this._openStdin;
    process.exit = this._exit;
    console.log = this._log;

    cb();
  },
  'event world': function(assert) {
    var ew = Eep.EventWorld.make();
    assert.ok(ew != null);

    assert.done();
  },
});

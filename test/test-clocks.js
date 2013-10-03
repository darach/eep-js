var eep = require("eep");
var events = require('events');
var testCase = require('nodeunit').testCase;

var floatEquals = function (a,b) {
  var a1 = Math.round(parseFloat(a)*100)/100;
  var b2 = Math.round(parseFloat(b)*100)/100;
  return a1 == b2;
};

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
  'wall clock': function(assert) {
    var clock0 = new eep.WallClock(0);
    var clock1 = new eep.WallClock(5);
    assert.ok(clock0 != null);
    assert.ok(clock1 != null);
    var then = new Date().getTime();

    clock0.init();
    assert.ok(clock0.at() <= then);
    clock0.inc();
    assert.ok(clock0.tick());

    clock1.init();
    assert.ok(clock1.at() >= then);
    then = new Date().getTime();
    assert.ok(then >= clock1.at());
    clock1.inc();
    assert.ok(clock1.at() >= then);

    assert.done();
  },
  'counting clock': function(assert) {
    var clock0 = new eep.CountingClock();
    assert.ok(clock0 != null);
    var then = 0;

    clock0.init();
    assert.ok(clock0.at() <= then);
    assert.ok(!clock0.tick());
    assert.ok(!clock0.tock());
    assert.same(0, clock0.at());
    clock0.inc();
    assert.ok(clock0.tick());
    assert.ok(clock0.tock(0));
    assert.ok(!clock0.tock(1));
    clock0.inc();
    assert.ok(clock0.tick());
    assert.ok(clock0.tock(1));
    assert.ok(!clock0.tock(2));

    assert.done();
  }
});

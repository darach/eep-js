var eep = require('eep');

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
  'simple aggregate function': function(assert) {
    var avg = eep.Stats.mean;
    assert.ok(avg != null);

    avg.init();
    assert.ok(isNaN(avg.emit()));

    avg.accumulate(1);
    assert.equals(1, avg.emit());

    avg.accumulate(2);
    assert.equals(1.5, avg.emit());

    avg.accumulate(4);
    assert.ok(floatEquals(2.33, avg.emit()));

    avg.accumulate(8);
    assert.ok(floatEquals(3.75, avg.emit()));

    assert.done();
  },
});

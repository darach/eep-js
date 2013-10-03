var eep = require('eep');

var events = require('events');
var testCase = require('nodeunit').testCase;

function WindowFunctionsTest(win) {
  var self = this, n;
  self.name = "foobar";
  self.type = "ordered";
  self.init = function() { n = 0; };
  self.accumulate = function(ignored) { n += 1; };
  self.compensate = function(ignored) { n -= 1; };
  self.emit = function()  { return { max: win.max(), min: win.min(), size: win.size() } };
  self.make = function(win) { return new WindowFunctionsTest(win); };
}

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
  'window functions - ordered - sliding': function(assert) {
    var world = eep.EventWorld.make();
    var sliding = world.windows().sliding(new WindowFunctionsTest(undefined),10);
    var ordered = world.windows().ordered(sliding);

    var results = new Array();
    sliding.on('emit', function(data) { results.push(data); });
    for (i = 1; i < 15; i++) { ordered.enqueue(i); }

    assert.same(results, [{max:10, min:1, size:10 },{max:11, min:2, size:10},{max:12, min:3, size:10},{max:13, min:4, size:10},{max:14,min:5, size:10}]);

    assert.done();
  },

  'window functions - ordered - tumbling': function(assert) {
    var world = eep.EventWorld.make();
    var tumbling= world.windows().tumbling(new WindowFunctionsTest(undefined),10);
    var ordered = world.windows().ordered(tumbling);

    var results = new Array();
    tumbling.on('emit', function(data) { results.push(data); });
    for (i = 1; i <= 30; i++) { ordered.enqueue(i); }

    assert.same(results, [{max:10, min:1, size:10 },{max:20, min:11, size:10},{max:30, min:21, size:10}]);

    assert.done();
  },

  
});

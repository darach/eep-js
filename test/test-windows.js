var eep = require("eep");
var events = require('events');
var testCase = require('nodeunit').testCase;

var floatEquals = function (a,b) {
  var a1 = Math.round(parseFloat(a)*100)/100;
  var b2 = Math.round(parseFloat(b)*100)/100;
  return a1 == b2;
};

AvgFunction.prototype = new eep.AggregateFunction();
function AvgFunction() {
  var self = this; var sum = 0; var count = 0;

  self.init = function() { sum = 0; count = 0; };
  self.accumulate = function(value) { sum += value; count++; };
  self.compensate = function(value) { sum -= value; count--; };
  self.emit = function()  { return (count == 0) ? 0 : (sum / count); };
  self.make = function() { return new AvgFunction(); };
};

CountFunction.prototype = new eep.AggregateFunction();
function CountFunction() {
    var self = this; var count = 0;

    self.init = function() { count = 0; };
    self.accumulate = function() { count++; };
    self.compensate = function() { count--; };
    self.emit = function() { return count };
    self.make = function() { return new CountFunction(); };
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
  'tumbling window': function(assert) {
    var tumbling  = eep.EventWorld.make().windows().tumbling(new AvgFunction(), 2);
    assert.ok(tumbling != null);

    var results = new Array();
    tumbling.on('emit', function(v) {
      results.push(v);
    });
    tumbling.enqueue(1);
    tumbling.enqueue(2);
    tumbling.enqueue(3);
    tumbling.enqueue(4);
    tumbling.enqueue(5);
    tumbling.enqueue(6);
    assert.same([1.5,3.5,5.5], results);
    assert.done();
  },
  'sliding window': function(assert) {
    var sliding  = eep.EventWorld.make().windows().sliding(new AvgFunction(), 2);
    assert.ok(sliding != null);

    var results = [];
    sliding.on('emit', function(v) {
      results.push(v);
    });
    sliding.enqueue(1);
    sliding.enqueue(2);
    sliding.enqueue(3);
    sliding.enqueue(4);
    assert.same([1.5,2.5,3.5], results);

    var sliding  = eep.EventWorld.make().windows().sliding(new AvgFunction(), 3);
    assert.ok(sliding != null);

    var results = [];
    sliding.on('emit', function(v) {
      results.push(v);
    });
    sliding.enqueue(1);
    sliding.enqueue(2);
    sliding.enqueue(3);
    sliding.enqueue(4);
    sliding.enqueue(5);
    sliding.enqueue(6);
    assert.same([2,3,4,5], results);

    assert.done();
  },
  'periodic window': function (assert) {
    var periodic = eep.EventWorld.make().windows().periodic(new AvgFunction(), 0);
    assert.ok(periodic != null);

    var results = [];
    periodic.on('emit', function(v) {
      results.push(v);
    });

    periodic.enqueue(5);
    assert.same([], results);

    periodic.tick();
    assert.same([5], results);

    periodic.enqueue(4);
    periodic.enqueue(10);
    periodic.tick();
    assert.same([5, 7], results);

    periodic.enqueue(3);
    periodic.enqueue(9);
    periodic.enqueue(81);
    periodic.tick();
    assert.same([5, 7, 31], results);
    assert.done();
  },
  'monotonic window': function (assert) {
    var monotonic = eep.EventWorld.make().windows().monotonic(new AvgFunction(), new eep.WallClock(0));

    assert.ok(monotonic != null);

    var results = [];
    monotonic.on('emit', function(v) {
      results.push(v);
    });

    monotonic.enqueue(5);
    assert.same([], results);

    monotonic.tick();
    assert.same([5], results);

    monotonic.enqueue(4);
    monotonic.enqueue(10);
    monotonic.tick();
    assert.same([5, 7], results);

    monotonic.enqueue(3);
    monotonic.enqueue(9);
    monotonic.enqueue(81);
    monotonic.tick();
    assert.same([5, 7, 31], results);

    assert.done();
  },
  'periodic empty emit': function (assert) {
    assert.expect(2);
    var periodic = eep.EventWorld.make().windows().periodic(new CountFunction(), 100);
    assert.ok(periodic != null);

    var results = [];
    periodic.on('emit', function(v) {
      results.push(v);
    });

    function enqueueEvent() {
      periodic.enqueue({just: "an event"});
    }

    function triggerTick() {
      periodic.tick();
    }

    enqueueEvent();
    setTimeout(enqueueEvent, 20);
    setTimeout(enqueueEvent, 80);
    setTimeout(triggerTick, 100); //3
    setTimeout(triggerTick, 200); //empty window should be produced here
    setTimeout(triggerTick, 300); //empty window should be produced here
    setTimeout(enqueueEvent, 320);
    setTimeout(enqueueEvent, 380);
    setTimeout(triggerTick, 400); //2

    setTimeout(function() {
      assert.same([3, 0, 0, 2], results);
    }, 410);

    setTimeout(function() {
      assert.done();
    }, 450);
  }
});

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
  "ordering functions": function(assert) {

    // index of [assumes ordered]
    assert.equals(-1, eep.OrderedWindow.indexOf([1,2,3,4],0));
    assert.equals(0, eep.OrderedWindow.indexOf([1,2,3,4],1));
    assert.equals(1, eep.OrderedWindow.indexOf([1,2,3,4],2));
    assert.equals(2, eep.OrderedWindow.indexOf([1,2,3,4],3));
    assert.equals(3, eep.OrderedWindow.indexOf([1,2,3,4],4));
    assert.equals(-1, eep.OrderedWindow.indexOf([1,2,3,4],5));

    // remove [assumes ordered]
    var data = [1,2,3,4];
    eep.OrderedWindow.remove(data,5); assert.same([1,2,3,4],data);
    eep.OrderedWindow.remove(data,4); assert.same([1,2,3],data);
    eep.OrderedWindow.remove(data,1); assert.same([2,3],data);
    eep.OrderedWindow.remove(data,3); assert.same([2],data);
    eep.OrderedWindow.remove(data,2); assert.same([],data);
    eep.OrderedWindow.remove(data,0); assert.same([],data);

    // insert [assumes ordered]
    var data = [];
    eep.OrderedWindow.insert(data,1); assert.same([1],data);
    eep.OrderedWindow.insert(data,2); assert.same([1,2],data);
    eep.OrderedWindow.insert(data,2); assert.same([1,2,2],data);
    eep.OrderedWindow.insert(data,10); assert.same([1,2,2,10],data);
    eep.OrderedWindow.insert(data,7); assert.same([1,2,2,7,10],data);

    assert.done();
  },
  'window ordering sliding': function(assert) {
    var min = eep.Stats.min;
    var max = eep.Stats.max;
    var world = eep.EventWorld.make();
    var sliding_min = world.windows().ordered(world.windows().sliding(min, 2));
    var sliding_max = world.windows().ordered(world.windows().sliding(max, 2));

    var mins = []; var maxs = [];
    sliding_min.on('emit', function(x) { mins.push(x); });
    sliding_max.on('emit', function(x) { maxs.push(x); });

    for (i = 10; i < 15; i++) { 
      sliding_min.enqueue(i);
      sliding_max.enqueue(i);
    }
    
    assert.same([10,10,11,12], mins);
    assert.same([11,12,13,14], maxs);

    assert.done();
  },
  'window ordering tumbling': function(assert) {
    var min = eep.Stats.min;
    var max = eep.Stats.max;
    var world = eep.EventWorld.make();
    var tumbling_min = world.windows().ordered(world.windows().tumbling(min, 2));
    var tumbling_max = world.windows().ordered(world.windows().tumbling(max, 2));

    var mins = []; var maxs = [];
    tumbling_min.on('emit', function(x) { mins.push(x); });
    tumbling_max.on('emit', function(x) { maxs.push(x); });

    for (i = 10; i < 20; i++) {
      tumbling_min.enqueue(i);
      tumbling_max.enqueue(i);
    }

    assert.same([10,12,14,16,18], mins);
    assert.same([11,13,15,17,19], maxs);

    assert.done();
  },
  'window ordering monotonic': function(assert) {
    assert.done();
  },
  'window ordering periodic': function(assert) {
    var world = eep.EventWorld.make();
    var periodic_min = world.windows().ordered(world.windows().periodic(eep.Stats.min, 0));
    var periodic_max = world.windows().ordered(world.windows().periodic(eep.Stats.max, 0));

    var results_min = [];
    periodic_min.on('emit', function(v) { results_min.push(v); });

    var results_max = [];
    periodic_max.on('emit', function(v) { results_max.push(v); });

    periodic_min.enqueue(5);
    periodic_max.enqueue(5);
    assert.same([], results_min);
    assert.same([], results_max);

    periodic_min.tick();
    periodic_max.tick();
    assert.same([5], results_min);

    periodic_min.enqueue(4);
    periodic_min.enqueue(10);
    periodic_min.tick();
    assert.same([5, 4], results_min);

    periodic_max.enqueue(3);
    periodic_max.enqueue(81);
    periodic_max.enqueue(9);
    periodic_max.tick();
    assert.same([5, 81], results_max);
    assert.done();
  },
});

var util = require('util');
var events = require('events');

var Eep = require('eep');
var Stats = require('eep.fn.stats').Stats;
var Noop = require('eep.fn.noop').Noop;

var millis = 3000;

var monitor;

var MicroBench = function(max) {
  var self = this;
  self.n = 0;
  self.count = 0;

  self.run = function(spec, items, size, fn, cb) {
    var start = new Date().getTime();
    n = fn();
    var end = new Date().getTime();
    var delta = end - start;
    var rate = n / (delta / 1e3) / 1e6; // in millions
    self.emit('end', cb, size, spec, delta / 1e3, rate);
  };

  self.runSuite = function(op, size, fn) {
    n = 0; count = 0;
    var win = Eep.EventWorld.make().windows().periodic(op.make(), size);
    win.on('emit', function(value) {
      count++;
    }); 
    self.run('Inline Periodic', null, size, function() {
      var ticks = Math.floor(max / size);
      do {
        win.tick();
        win.enqueue(n++);
      } while(count < ticks);
      return n;
    }, fn);
  };

  self.suite = function(op, size, fn) {
    var context = self.runSuite(op, size, fn);
    return { context: context };
  };
};
util.inherits(MicroBench, events.EventEmitter);

var round = function(x) { return Math.round(x*100)/100; }

var sizes = [1000];

console.log('Micro Benching Embedded Event Processing');
console.log('\n');
console.log('Legend Keys:');
console.log(' 1 - Inline Periodic');

var bench = new MicroBench(millis);

bench.on('end', function(fn, size, spec, secs, rate) {
  fn(size, spec, secs, rate);
});

var results = [];
var record = function(size, spec, secs, rate) {
  console.log('s,s,s,r: ' + size + ', ' + spec + ', ' + secs + ', ' + rate);
      results.push({ size: size, name: spec, elapsed: secs, rate: rate });
};

console.log('1000\t100\t10\t1\top');
var ops = [Noop.noop, Stats.count, Stats.sum, Stats.min, Stats.max, Stats.mean, Stats.stdevs, Stats.vars, Stats.kurtosis];
var sizes = [1000, 100, 10, 1];
for (var o in ops) {
  results = [];
  for (var i in sizes) {
    var r = bench.suite(ops[o], sizes[i], record);
  }
  console.log(
    round(results[0].rate) + '\t' + 
      round(results[1].rate) + '\t' +
      round(results[2].rate) + '\t' +
      round(results[3].rate) + '\t' +
      ops[o].name + '\t'
  );
};

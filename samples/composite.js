var util = require('util');
var eep = require('eep');
var Stats = require('eep.fn.stats').Stats;

// A custom aggregate that inline composes aggregate functions.
var LeStatFunction = function() {
  var self = this;
  var count = Stats.count.make();
  var sum = Stats.sum.make();
  var min = Stats.min.make();
  var max = Stats.max.make();
  var mean = Stats.mean.make();
  var vars = Stats.vars.make();
  var stdevs = Stats.stdevs.make();
  var kurtosis = Stats.kurtosis.make();
  self.init = function() {
    count.init();
    sum.init();
    min.init();
    max.init();
    mean.init();
    vars.init();
    stdevs.init();
    kurtosis.init();
  };
  self.accumulate = function(v) {
    count.accumulate(v);
    sum.accumulate(v);
    min.accumulate(v);
    max.accumulate(v);
    mean.accumulate(v);
    vars.accumulate(v);
    stdevs.accumulate(v);
    kurtosis.accumulate(v);
  };
  self.emit = function() {
    return results = {
      count: count.emit(),
      sum: sum.emit(),
      min: min.emit(),
      max: max.emit(),
      mean: mean.emit(),
      vars: vars.emit(),
      stdevs: stdevs.emit(),
      kurtosis: kurtosis.emit()
    };
  };
  self.make = function() { return new LeStatFunction(); };
};
util.inherits(LeStatFunction, eep.AggregateFunction);
var stats = [ Stats.count, Stats.sum, Stats.min, Stats.max, Stats.mean, Stats.vars, Stats.stdevs, Stats.kurtosis ];
var headers = [ 'Count\t\t', 'Sum\t\t', 'Min\t\t', 'Max\t\t', 'Mean\t\t', 'Variance\t', 'Stdev\t\t', 'Kurtosis\t' ];

// Convenient. But should only be used for composing independant, not related functions
var m1= eep.EventWorld.make().windows().monotonic(new eep.CompositeFunction(stats), new eep.WallClock(0));

// Correct. The stats functions can be coalesced into a single function. Faster by 4X
var m2 = eep.EventWorld.make().windows().monotonic(Stats.all, new eep.CountingClock());

// Neither. Faster than m1, but slower than m2. Save some cycles, use m2!
var m3 = eep.EventWorld.make().windows().monotonic(new LeStatFunction(), new eep.CountingClock());

m1.on('emit', function(values) { 
  for (var i in values) {
    console.log(headers[i] + ':\t\t' + values[i]);
  }
});

m2.on('emit', function(values) {
  console.log(JSON.stringify(values));
});

m3.on('emit', function(values) {
  console.log(JSON.stringify(values));
});

if (process.argv.length != 3) {
  console.log('\n');
  console.log('Usage: ' + process.argv[1] + ' <items>\n');
  process.exit(-1);
}

var items = parseInt(process.argv[2]);

var start = new Date().getTime();
for (var i = 1; i <= items; i++) {
  m1.enqueue(i);
}
m1.tick();
var end = new Date().getTime();
console.log('V1. Elapsed: ' + (end - start) / 1e3 + ' meps: ' + ((end - start) / 1e3) / 1e6);

var start = new Date().getTime();
for (var i = 1; i <= items; i++) {
  m2.enqueue(i);
}
m2.tick();
var end = new Date().getTime();

console.log('V2. Elapsed: ' + (end - start) / 1e3 + ' meps: ' + ((end - start) / 1e3) / 1e6);

var start = new Date().getTime();
for (var i = 1; i <= items; i++) {
  m3.enqueue(i);
}
m3.tick();
var end = new Date().getTime();

console.log('V3. Elapsed: ' + ((end - start) / 1e3));

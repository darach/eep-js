// Include the EEP library, and optional statistics package
var eep = require('eep');
var stats = require('eep.fn.stats').Stats;

var values = [ 2, 4, 6, 8, 10, 13, 14, 15, 18, 20, 30, 14, 15, 10, 10, 9, 3, 1];


// Tumbling windows
var tumbling_count = eep.EventWorld.make().windows().tumbling(stats.count, values.length);
var tumbling_sum = eep.EventWorld.make().windows().tumbling(stats.sum, values.length);
var tumbling_min = eep.EventWorld.make().windows().tumbling(stats.min, values.length);
var tumbling_max = eep.EventWorld.make().windows().tumbling(stats.max, values.length);
var tumbling_mean = eep.EventWorld.make().windows().tumbling(stats.mean, values.length);
var tumbling_stdevs = eep.EventWorld.make().windows().tumbling(stats.stdevs, values.length);
var tumbling_vars = eep.EventWorld.make().windows().tumbling(stats.vars, values.length);
var tumbling_kurtosis = eep.EventWorld.make().windows().tumbling(stats.kurtosis, values.length);

// Register callbacks
tumbling_count.on('emit', function(value) { console.log('count:\t\t' + value); });
tumbling_sum.on('emit', function(value) { console.log('sum:\t\t' + value); });
tumbling_min.on('emit', function(value) { console.log('min:\t\t' + value); });
tumbling_max.on('emit', function(value) { console.log('max:\t\t' + value); });
tumbling_mean.on('emit', function(value) { console.log('mean:\t\t' + value); });
tumbling_stdevs.on('emit', function(value) { console.log('stdevs:\t\t' + value); });
tumbling_vars.on('emit', function(value) { console.log('vars:\t\t' + value); });
tumbling_kurtosis.on('emit', function(value) { console.log('kurtosis:\t' + value); });

console.log('\n\nIndividual tumbling windows\n\n');

// Pump data into the tumbling windows
for (var i in values) {
  tumbling_count.enqueue(values[i]);
  tumbling_sum.enqueue(values[i]);
  tumbling_min.enqueue(values[i]);
  tumbling_max.enqueue(values[i]);
  tumbling_mean.enqueue(values[i]);
  tumbling_stdevs.enqueue(values[i]);
  tumbling_vars.enqueue(values[i]);
  tumbling_kurtosis.enqueue(values[i]);
}

// Alternatively, use a composite aggregate function
var stats = [ stats.count, stats.sum, stats.min, stats.max, stats.mean, stats.vars, stats.stdevs, stats.kurtosis ];
var headers = [ 'Count\t\t', 'Sum\t\t', 'Min\t\t', 'Max\t\t', 'Mean\t\t', 'Variance\t', 'Stdev\t\t', 'Kurtosis\t' ];

// Create a composite function tumbling window
var tumbling = eep.EventWorld.make().windows().tumbling(new eep.CompositeFunction(stats), values.length);

// Register callback(s)
tumbling.on('emit', function(values) { 
  for (var i in values) {
    console.log(headers[i] + ':\t\t' + values[i]);
  }
});

console.log('\n\nComposite tumbling windows\n\n');

// Pump data into the tumbling window
for (var i in values) {
  tumbling.enqueue(values[i]);
}

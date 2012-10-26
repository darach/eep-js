var eep = require('eep');

var head = function(type, name) {
  console.log('Microbench - Window Type: ' + type + ' with function \'' + name + '\'\n');
  console.log('Type, Function, Size, Elapsed, Meps');
};

var foot = function() {
  console.log('\n');
};

var bench = function(type, name, win, size, items) {
  var start = new Date().getTime();
  for(var i = 0; i < items; i++) {
    win.enqueue(1);
  }
  var elapsed = new Date().getTime() - start;
  var secs = elapsed / 1e3; 
  console.log(type + ',' +  name + ',' + size + ',' + secs + ',' + ((items / secs) / 1e6));
};

var fns = [
  eep.Noop.noop, eep.Stats.count, eep.Stats.sum, eep.Stats.min, eep.Stats.max,
  eep.Stats.mean, eep.Stats.vars, eep.Stats.stdevs, eep.Stats.kurtosis
];
var sizes = [2,4,8,16,32,64,128,256,512];
var items = 10000000; // 10M

console.log('Tumbling is fast for most N');
for (var fn in fns) {
  head('tumbling', fns[fn].name);
  for (var size in sizes) {
    var tumbling = eep.EventWorld.make().windows().tumbling(fns[fn], sizes[size]);
    bench('tumbling', fns[fn].name, tumbling, sizes[size], items);
  }
  foot();
}

console.log('Sliding is fast enough for small N, but has complexity O(N^2)');
for (var fn in fns) {
  head('sliding', fns[fn].name);
  for (var size in sizes) {
    var sliding = eep.EventWorld.make().windows().sliding(fns[fn], sizes[size]);
    bench('sliding', fns[fn].name, sliding, sizes[size], items);
  }
  foot();
}

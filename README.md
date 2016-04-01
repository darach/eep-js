# **eep.js**  [![Build Status](https://travis-ci.org/darach/eep-js.png)](https://travis-ci.org/darach/eep-js)

> Embedding Event Processing for Node.js

## Overview

**eep.js** is a small lightweight subset of Complex Event Processing (CEP) that adds aggregate functions and windowed stream operations to Node.js.

**eep.js** was introduced at my talk on [Data Distribution in the Cloud with Node.js](http://bit.ly/R8bsWH) at the [Node Dublin](http://www.nodedublin.com) conference in October 2012.

I wrote **eep.js** as I find the lack of data-centric stream processing operations in OO and functional languages lacking. Data-centric stream or event processing rewires your brain to think in terms of data flow. Node.js is the 1st language, to my knowledge, that is tyrannically asynchronous, devilishly event-oriented and amazoidingly non-blocking. That's music to a CEP guys ears. Good music. Thin Lizzy good. An environment that makes event or stream processing natural is a big win. So thank you Node.js folk! Loving it.

Last, but not least, **eep.js** is fast. As a devotee, fan and practitioner of [Martin Thompson's 'Mechanical Sympathy'](http://mechanical-sympathy.blogspot.com/) I thought it would be fun to apply principles normally reserved for lower level languages such as C, Java or even assembly to a dynamic language like JavaScript, with the V8 powered Node.js in particular.

So **eep.js** is a thought experiment in applying the principles of mechanical sympathy to JavaScript.

## Simple Event Processing

There are a number of classes of stream operations already well supported by Node.js. It has streams and pipes for example. And **eep.js**'s bigger sister **CEP** has much more flexible stream operations and domain specific query algorithms to make expressing complex streaming operations as simple as it can be.

A good example of a complete and flexible environment is [RxJS](https://github.com/Reactive-Extensions/RxJS "RxJS"). Seriously, if you need bells and whistles, use this. It rocks.

Anyway, I think of streaming operations loosely and informally as follows:

1. Mapping. Operations on discrete in-flight units of data
2. Aggregation. Operations on streaming 'windows' or sets of in-flight data
3. Distribution. Filtering and branching operations
4. Memory. In memory state manipulation (eg: semi-joins)
5. Combinators. Combining multiple data streams in some way

Well, Node.js can handle 1, 3 and 4 natively. You have the full gamut of JavaScript at your disposal here. This leaves 2 and 5. And in my experience by far the most useful of these is windowed operations. So **eep.js** stops there. Let's add the simplest expression of windows and aggregate functions.

## Windows and Aggregate Functions

In a CEP there are lots of different types of windows. There are tumbling, sliding, landmark, predicate and many other possible window types. A CEP engine separates the window context from the analytic at hand. In this way you can reuse the functions in different operations reducing, in real-time an aggregate of events into a discrete scalar result.

You can express things like 'give me an average rate of ingestion of the last seconds worth of data, or the last 1000 events whichever happens first' tersely. This is good. In practice though windows of more than one dimension (time, number of events, moments of a clock) is hard to reason about. Humans are crap that way. Fact.

So, **eep.js**, doesn't bother with more than one dimension. If you need twilight zone operations use a real CEP engine! :) More correctly, the problem with CEP engines isn't the multi-dimensionality offered, it's the fact that those dimensions do not compose well. So let's dispense with the voodoo.

Sometimes academically worthy notions should stay in academia. Non-compositional hard-to-reason-about multi-dimensional wizardry is one of those notions. **eep.js** does the right things simply and exposes them in the right way: Make it easy, convenient to exploit.

Last, but not least, a nice feature in windowed operations in most CEP engines is to be able to dynamically refer to parts of the data stream in the window. You can get a reference to the first and last event or treat the window of events as a set or list. This is cool. But **eep.js** isn't trying to be cool. **eep.js** is simple. And simple is faster than cool **because** we can optimise more heavily, basically that's where the mechanical sympathy steps in.

## Statistics package

Sounds good, but **Wat** else?

Monitoring, alerting decision support and a lot of technical indicators in real-time trading use basic mathematics, basic algebra and high-school statistics on streams of in flight-data.

**eep.js** ships with:

1. Count - Counts all the things in a window
2. Sum - Adds (the value of) all the things in a window
3. Min - Gets the minimum value'd thing in a window
4. Max - Gets the maximum value'd thing in a window
5. Mean - Gets the statistical mean
6. Variance - Gets the sample variance
7. Standard deviation - Gets the standard deviation

These are very easy to use:

```
// Include the EEP library, and builtin packages
var eep = require('eep');
```

Create the windows for the desired operation:

```
// Tumbling windows
var tumbling_count = eep.EventWorld.make().windows().tumbling(eep.Stats.count, values.length);
var tumbling_sum = eep.EventWorld.make().windows().tumbling(eep.Stats.sum, values.length);
var tumbling_min = eep.EventWorld.make().windows().tumbling(eep.Stats.min, values.length);
var tumbling_max = eep.EventWorld.make().windows().tumbling(eep.Stats.max, values.length);
var tumbling_mean = eep.EventWorld.make().windows().tumbling(eep.Stats.mean, values.length);
var tumbling_stdevs = eep.EventWorld.make().windows().tumbling(eep.Stats.stdevs, values.length);
var tumbling_vars = eep.EventWorld.make().windows().tumbling(eep.Stats.vars, values.length);
```

Register callback functions to 'collect' your statistics. In the above
example this will occur when all values have been pumped in (by construction):

```
// Register callbacks
tumbling_count.on('emit', function(value) { console.log('count:\t\t' + value); });
tumbling_sum.on('emit', function(value) { console.log('sum:\t\t' + value); });
tumbling_min.on('emit', function(value) { console.log('min:\t\t' + value); });
tumbling_max.on('emit', function(value) { console.log('max:\t\t' + value); });
tumbling_mean.on('emit', function(value) { console.log('mean:\t\t' + value); });
tumbling_stdevs.on('emit', function(value) { console.log('stdevs:\t\t' + value); });
tumbling_vars.on('emit', function(value) { console.log('vars:\t\t' + value); });
```

Pump data at the windows:

```
// Pump data into the tumbling windows
for (var i in values) {
  tumbling_count.enqueue(values[i]);
  tumbling_sum.enqueue(values[i]);
  tumbling_min.enqueue(values[i]);
  tumbling_max.enqueue(values[i]);
  tumbling_mean.enqueue(values[i]);
  tumbling_stdevs.enqueue(values[i]);
  tumbling_vars.enqueue(values[i]);
}
```
When the last event hits the window will close, results emitted and a fresh window opened ready for another set of events. Just keep on pumping, basically.

Sample output:

```
count:          18
sum:            202
min:            1
max:            30
mean:           11.222222222222223
stdevs:         7.191134701884926
vars:           51.71241830065361
```

Of course, if you're like me, you likely want all of the above statistics and you're *good lazy* so you can express a composition of (compatible) functions:

```
// Alternatively, use a composite aggregate function
var stats = [ stats.count, stats.sum, stats.min, stats.max, stats.mean, stats.vars, stats.stdevs ];
var headers = [ 'Count\t\t', 'Sum\t\t', 'Min\t\t', 'Max\t\t', 'Mean\t\t', 'Variance\t', 'Stdev\t\t' ];

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
```

Convenient? Yes. But we can be more efficient. All these statistical functions are related You can get a 4X speedup by writing an aggregate function that implements all of the above functions inline. Saves on iteration and function call overhead.

If you wanted to get statistics on all the numbers from 1 to 1000000 inclusively you could use a monotonic window instead of a tumbling window as above if you don't know the size or length of the window ahead of time.

```
var util = require('util');
var eep = require('eep');

var stats = [ 
  eep.Stats.count, eep.Stats.sum, eep.Stats.min, eep.Stats.max, 
  eep.Stats.mean, eep.Stats.vars, eep.Stats.stdevs 
];
var headers = [ 'Count\t\t', 'Sum\t\t', 'Min\t\t', 'Max\t\t', 'Mean\t\t', 'Variance\t', 'Stdev\t\t' ];
var monotonic  = eep.EventWorld.make().windows().monotonic(Stats.all, new eep.CountingClock());

monotonic.on('emit', function(values) {
  console.log(JSON.stringify(values));
});

for (var i = 1; i <= 1000000; i++) {
  monotonic.enqueue(i);
}
monotonic.tick();
```

This will output a JSON tuple with all the stats:

```
{
  "count":1000000,
  "sum":500000500000,
  "min":1,
  "max":1000000,
  "mean":500000.5,
  "vars":83333416666.66666,
  "stdevs":288675.27893234405
}
```

## Noop package

Sometimes the ingress of an event or triggering a close on a window is useful enough information in its own right. So the 'noop' aggregate function supports exactly that.

```
var util = require('util');
var eep = require('eep');

var monotonic  = eep.EventWorld.make().windows().monotonic(eep.Noop.noop, new eep.CountingClock());

monotonic.on('emit', function(values) {
  console.log('A window closed. Do something useful!');
});

for (var i = 1; i <= 1000000; i++) {
  monotonic.enqueue(i);
}
monotonic.tick();
```

So after 1 million events in the example above you can do something. Simples.

## Roll your own functions

**eep.js** gives you four window types to work with:

1. Tumbling windows. Discrete non-overlapping fixed size subsets of events. Emits results every N events for the last N events.
2. Sliding windows. Per event overlapping fixed size subsets of events. Emits results after 1st N event for every subsequent event. Each emission then 'looks back' N events into the past.
3. Periodic windows. Emits results every N milliseconds
4. Monotonic windows. You define and provide a clock implementation. Emits when you 'tick the clock'.

Say, we wanted to implement Tim Bray's WideFinder benchmark from Beautiful Code. Easy. We define an aggregate function that expects strings and counts occurances of the first sub-group match in the regex. When a window closes it returns those results.

```
var WideFinderFunction = function(regex) {
  var self = this; var re = new RegExp(regex);
  var keys = {};
  self.init = function() { keys = {}; };
  self.accumulate = function(line) {
    var m = re.exec(line);
    if (m == null) return;
    var k = m[1]; // use 1st group as key
    var v = keys[k];
    if (v) keys[k] = v+1; else keys[k] = 1; // count by key
  };
  self.emit = function() {
    return keys;
  };
  self.make = function() { return new WideFinderFunction(regex); };
};
```

Let's use a monotonic window:

```
var win = eep.EventWorld.make().windows().monotonic(
  new WideFinderFunction(/GET \/ongoing\/When\/\d\d\dx\/(\d\d\d\d\/\d\d\/\d\d\/[^ .]+) /),
  new eep.CountingClock()
);
```

We just attach this to a stream of events (log lines from an apache weblog from the file system or network). I grabbed the sample file from Tim Bray's website and grok out the lines with byline: 

```
  var stream = fs.createReadStream(data);
  var stream = byline.createStream(stream);

  stream.on('data', function(line) { win.enqueue(line); });
  stream.on('end', function() { win.tick(); });
```

And of course, you registered an emit callback, right?


```
// On emit, log top 10 hits to standard output
win.on('emit', function(matches) {
  var all = [];
  for (var k in matches) {
    all.push({ url: k, n: matches[k] });
  }
  var sorted = all.sort(function(a,b) { return (b.n >= a.n) ? 1 : -1; });
  for (var i = 1; i <= ((all.length <=  10) ? all.length : 10); i++) {
    console.log(i + ':\t' + all[i].url + ' with ' + all[i].n + ' hits');
  }
});
```

And it should produce results as follows:

```
1:      2006/07/28/Open-Data with 20 hits
2:      2003/07/25/NotGaming with 13 hits
3:      2003/09/18/NXML with 8 hits
4:      2003/10/16/Debbie with 8 hits
5:      2006/01/31/Data-Protection with 8 hits
6:      2003/06/23/SamsPie with 7 hits
7:      2005/11/03/Cars-and-Office-Suites with 6 hits
8:      2005/07/27/Atomic-RSS with 6 hits
9:      2003/02/04/Construction with 6 hits
10:     2006/01/08/No-New-XML-Languages with 6 hits
```

I've embedded GPU-based analytics and run FFT's within aggregate functions in a prior life, so use your imagination. Windows and Aggregate functions are very powerful and aggregate function libraries designed for windowed operation removes a lot of the drudgery from real-time stream processing.

## Use it, Fork it, Add to it

There's only 1 rule. Just don't slow it down. Check out the tests and samples to get started. There's a little convenience script (called 'wat' :) to get up and running quickly.

## Wish list

1. **eep.js** in the browser too.
2. RxJS samples. I <3 those guys. Microsoft doing some great stuff there.
3. V8 folk. Learn me some tricks to make this even faster.
4. Contribute an aggregate function library.
5. Contribute a novel but useful window type.

## Enjoy!

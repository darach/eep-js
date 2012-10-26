// Copyright (c) Darach Ennis < darach at gmail dot com >.
//
// Permission is hereby granted, free of charge, to any person obtaining a
// copy of this software and associated documentation files (the
// "Software"), to deal in the Software without restriction, including
// without limitation the rights to use, copy, modify, merge, publish,
// distribute, sublicense, and/or sell copies of the Software, and to permit
// persons to whom the Software is furnished to do so, subject to the
// following conditions:
//
// The above copyright notice and this permission notice shall be included
// in all copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS
// OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
// MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN
// NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM,
// DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR
// OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE
// USE OR OTHER DEALINGS IN THE SOFTWARE.

var util = require('util');
var events = require('events');

// A sliding window. Sliding windows (here) have a fixed a-priori known size.
// Example: Sliding window of size 2 computing sum of values.
//
// <pre>
//
//     t0     t1      (emit)   t2             (emit)       tN
//   +---+  +---+---+          -...-...-
//   | 1 |  | 2 | 1 |   <3>    : x : x :
//   +---+  +---+---+          _...+---+---+               ...
//              | 2 |              | 2 | 3 |    <5>
//              +---+              +---+---+
//                                     | 4 |
//                                     +---+
// </pre>
//
// So, we only ever need N active windows to emit a result for every input event once
// all windows are open. Hence, use a ring buffer and preallocate the slots (functions).
//
// This is the only window implementation that actually needs a queue (ring buffer)
// in this simple embedded event processing engine.
//

var SlidingWindow = function(aggFn, n) {
  events.EventEmitter.call(this);

  var self = this, fn = aggFn, size = n, mark = size - 1, idx = 0, buf = new Array(n);

  // Preallocate slots
  for (var i = 0; i < size; i++) {
    buf[i] = fn.make();
    buf[i].init();
  }

  self.enqueue = function(v) {
    enqueue_perf(buf,v);
  };

  //
  // Sliding ring buffer, emit on 'close'
  var enqueue_perf = function(buffer,v) {
    var i = idx;
    // Accumulate event to current and any prior active slots
    do {
      buf[i-- % size].accumulate(v);
    } while(i + size > idx && i >= 0);
    // If we've hit our size 
    if (idx >= mark) {
      // Find the slot
      var x = (i+1) % size;
      // Emit the result
      var r = buf[x].emit();
      self.emit('emit',r);
      // 'close' the active window. 'open' a new window in that slot
      buf[x].init();
    }
    idx+=1;
  };
};
util.inherits(SlidingWindow, events.EventEmitter);


// Exports
module.exports.SlidingWindow = SlidingWindow;

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
// Logically, we only ever need N active elements to emit a result for every input event once
// all windows are open. Previous versions, used a ring buffer and preallocated the slots but
// performance was exponentially degrading with the size of the window. This version enhances
// aggregate functions with the notion of compensation. In this version the first accumulation
// occuring on closing of a window is effectively reversed when the next value is added
// effectively removing the influence of the now evicted element, but without incurring the
// overhead of cascading values for all open elements in the window. This cost is now constant
// and the resulting performance is linear w.r.t the size of the window.
//
//

var SlidingWindow = function(aggFn, n) {
  events.EventEmitter.call(this);
  var self = this;
  self.fn = aggFn.make(self);
  var size = n, idx = 0; var p = new Array(size);

  self.fn.init();

  self.min = function() { throw "Unordered sliding window"; };
  self.max = function() { throw "Unordered sliding window"; };
  self.size = function() { return n; };

  self.enqueue = function(v) {
    self.fn.accumulate(v);
    if (idx >= (size - 1)) {
      var po = (idx+1) % size;
      self.emit('emit', self.fn.emit());
      var evictee = p[po];
      self.fn.compensate(p[po]);
      p[(idx) % size]=v;
      self.emit('drop', evictee); // required for correctness when using ordering
    } else {
      p[idx] = v;
    }
    idx+=1;
  };
};
util.inherits(SlidingWindow, events.EventEmitter);


// Exports
module.exports.SlidingWindow = SlidingWindow;

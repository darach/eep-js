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

// A tumbling window. Tumbling windows (here) have a fixed a-priori known size.
// Example: Tumbling window of size 2 computing sum of values.
//
// <pre>
//
//     t0     t1      (emit)    t2            t3         (emit)    t4
//   +---+  +---+---+         -...-...-
//   | 1 |  | 2 | 1 |   <3>   : x : x :
//   +---+  +---+---+         -...+---+---+   +---+---+            ...
//                                    | 3 |   | 4 | 3 |    <7>
//                                    +---+   +---+---+
//                                         
// </pre>
//
// So, we only ever need 1 active window to emit a result for every set of N input events.
//
// This is the only window implementation that actually needs a queue (ring buffer)
// in this simple embedded event processing engine.
//
var TumblingWindow = function(aggFn, n) {
  events.EventEmitter.call(this);

  var self = this, size = n, mark = size - 1, idx = 0; var p = new Array();
  self.fn = aggFn.make(self);

  self.fn.init();

  self.min = function() { throw "Unordered sliding window"; };
  self.max = function() { throw "Unordered sliding window"; };
  self.size = function() { return n; }

  self.enqueue = function(v) {
    self.fn.accumulate(v);
    p.push(v);
    idx+=1;
    if (idx == size) {
      var r = self.fn.emit();
      self.emit('emit',r);
      var i = 0;
      if (self.fn.type === "ordered") {
        // has a high perf cost so only run if fn requires ordering
        while(p.length > 0) {
          self.emit('drop', p.shift());
        };
      }
      self.fn.init();
      idx = 0;
    }
  };  
};
util.inherits(TumblingWindow, events.EventEmitter);

// Exports
module.exports.TumblingWindow = TumblingWindow;

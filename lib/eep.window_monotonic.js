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
var Temporal = require('./eep.core').Temporal;
var TemporalFunction = require('./eep.core').TemporalFunction;

// A monotonic window. Client should call tick monotonically and use with a monotonic clock implementation.
var MonotonicWindow = function(aggFn, clock) {
  events.EventEmitter.call(this);
  var self = this;
  self.fn = TemporalFunction.make(aggFn,clock.init(),self);
  var idx = 0;

  self.fn.init();

  self.enqueue = function(v) {
    self.fn.accumulate(Temporal.make(v, clock.inc()));
  };

  self.tick = function() {
    // If time hasn't passed, we're done
    if (!clock.tick()) return;

    // Otherwise, emit
    if (clock.tock(self.fn.at())) {
      self.emit('emit', self.fn.emit().value());
      // for ordering, send a 'drop all' event
      self.emit('clear');
      // 'close' current window and 'open' a new one
      self.fn.init();
    }
  };
};
util.inherits(MonotonicWindow, events.EventEmitter);

// Exports
module.exports.MonotonicWindow = MonotonicWindow;

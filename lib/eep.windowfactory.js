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

var TumblingWindow = require('./eep.window_tumbling').TumblingWindow;
var SlidingWindow = require('./eep.window_sliding').SlidingWindow;
var PeriodicWindow = require('./eep.window_periodic').PeriodicWindow;
var MonotonicWindow = require('./eep.window_monotonic').MonotonicWindow;
var OrderedWindow = require('./eep.window_ordered').OrderedWindow;

//
// A factory class for creating instances of windowed stream operations
//
var WindowFactory = function() {
  var self = this;

  // Given an aggregate function and a size, create a tumbling event stream window
  self.tumbling = function(aggFn, n) {
    return new TumblingWindow(aggFn, n);
  }

  // Given an aggregate function and a size, create a sliding event stream window
  self.sliding = function(aggFn, n) {
    return new SlidingWindow(aggFn, n);
  }

  // Given an aggregate function and an interval in milliseconds, create a periodic
  // (wall clock driven) event stream window
  self.periodic = function(aggFn, intervalMillis) {
    return new PeriodicWindow(aggFn, intervalMillis);
  }

  // Given an aggregate function and an interval in milliseconds, create a monotonic
  // event stream window - with a custom monotonic clock (eg: eep.CountingClock)
  self.monotonic = function(aggFn, clock) {
    return new MonotonicWindow(aggFn, clock); 
  }

  // Given a simple window, return a window that orders data
  self.ordered = function(win) {
    return new OrderedWindow(win);
  }
};

// A factory factory
WindowFactory.make = function() {
    return new WindowFactory();
};

// Exports
module.exports.WindowFactory = WindowFactory;

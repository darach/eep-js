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

// Constraints computations on event streams to a simple functional contract
function AggregateFunction() {
  var self = this;
  // invoked when a window opens - should 'reset' or 'zero' a windows internal state
  self.init = function() { throw "Must subclass"; };
  // invoked when an event is enqueued into a window
  self.accumulate = function(value) { throw "Must subclass"; };
  // invoked when a window closes
  self.emit = function() { throw "Must subclass"; };
  // used by window implementations variously to preallocate function instances - makes things 'fast', basically
  self.make = function() { throw "Must subclass"; };
}

// Conveniance. Computations on a set of (independant) aggregate functions. Use wisely.
function CompositeFunction(fxs) {
  var self = this, fx = fxs;
  self.init = function() { for(var i in fxs) { fx[i] = fxs[i].make(); fx[i].init(); } };
  self.accumulate = function(value) { for (var i in fx) { fx[i].accumulate(value); } };
  self.emit = function() { var a = []; for (var i in fx) { a.push(fx[i].emit()); }; return a; };
  self.make = function() {
    return new CompositeFunction(fx);
  };
}
util.inherits(CompositeFunction, AggregateFunction);

// Exports
module.exports.AggregateFunction = AggregateFunction;
module.exports.CompositeFunction = CompositeFunction;

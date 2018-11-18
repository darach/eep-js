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

// Monotemporal value wrapper. Tracks origin time of an event.
// Value can be updated. 
// Updating a value does not update the origin.
var Temporal = function (initialValue, instant) {
  var self = this; var v = initialValue; var at = instant;

  self.value = function() {
    return v;
  };

  self.at = function() {
    return instant;
  };

  self.update = function(newValue) {
    self.v = newValue;
    return self;
  };
};

// Factory function turns regular data into temporal data
Temporal.make = function(initialValue, instant) {
  return new Temporal(initialValue, instant);
};

// A (degenerated) temporal aggregate function. Useful for temporal stream operators
var TemporalFunction = function(aggFn,instant, win) {
  var self = this; var inner = aggFn.make(win); var t;
  self.init =  function() { inner.init(); t = Temporal.make(inner.emit(), instant); };
  self.accumulate =  function(value) { t = t.update(inner.accumulate(value.value())); };
  self.emit = function()  { return Temporal.make(inner.emit()); };
  self.at = function() { return t.at(); };
}; 

// Factory function for turning regular aggregate functions into temporal ones
TemporalFunction.make = function(aggFn, at, win) {
  return new TemporalFunction(aggFn, at, win);
};

// Exports
module.exports.Temporal = Temporal;
module.exports.TemporalFunction = TemporalFunction;

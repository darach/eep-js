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
var AggregateFunction = require('./eep.aggregate_function').AggregateFunction;

// Do nothing with all the things.
//
// Useful when you simply want to exploit window 'emit' events
// to perform some action
//
var NoopFunction = function() {
  var self = this;
  self.name = 'noop';
  self.init = function() { };
  self.accumulate = function(value) { };
  self.emit = function()  { return null; };
  self.make = function() { return new NoopFunction(); };
};
util.inherits(NoopFunction, AggregateFunction);

// eep.js Noop package
var Noop = function() {};

// Register Noop package aggregate functions
Noop.noop = new NoopFunction();

// Export the Noop package
module.exports.Noop = Noop;

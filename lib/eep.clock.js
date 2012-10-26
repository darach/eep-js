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

// Clocks tick and they tock, but not all clocks are equal
function ClockSource(params) {
  var self = this;
  // every clock deserves a name, eg: (wall clock, logical clock, vector clock, ...)
  self.name = 'crock';
  // returns the current time according to this type of clock
  self.at = function() { throw "Must subclass"; }
  // initializes a clock
  self.init = function() { throw "Must subclass"; }
  // increments the current clocks time by a single moment
  self.inc  = function() { throw "Must subclass"; }
  // stream operators call tick when they want to know if the clock has advanced since last checked
  self.tick = function() { throw "Must subclass"; }
  // stream operators call tock with a time x. if x happened now or before, returns true
  self.tock = function(x) { throw "Must subclass"; }
}

// Exports
module.exports.ClockSource = ClockSource;

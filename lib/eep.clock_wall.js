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
var ClockSource = require('./eep.clock').ClockSource;

// Wall clock. Watch out for NTP/PTP shenanigans
function WallClock(interval) {
  var self = this, at, mark = null;

  self.at = function() {
    return at;
  };

  self.init = function() {
    at = new Date().getTime();
    return at;
  };

  self.inc = function() {
    at = new Date().getTime();
  };

  self.tick = function() {
    self.inc();
    if (mark === null) {
      mark = at + interval;
    }

    return ((at - mark) >= interval);
  };

  self.tock = function(elapsed) {
    var d = at - elapsed;
    if ( d >= interval) {
      mark += interval;
      return true;
    }
    return false;
  };
}
util.inherits(WallClock, ClockSource);

// Exports
module.exports.WallClock = WallClock;

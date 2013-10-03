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

//
// eep.js Embedded Event Processing core
//

// A namespace to package all eep.js core facilities
var eep = {};

// Register eep.js core facilities
eep.WindowFactory = require('./eep.windowfactory').WindowFactory;
eep.EventWorld = require('./eep.eventworld').EventWorld;
eep.AggregateFunction = require('./eep.aggregate_function').AggregateFunction;
eep.CompositeFunction = require('./eep.aggregate_function').CompositeFunction;
eep.ClockSource = require('./eep.clock').ClockSource;
eep.WallClock = require('./eep.clock_wall').WallClock;
eep.CountingClock = require('./eep.clock_counting').CountingClock;
eep.TumblingWindow = require('./eep.window_tumbling').TumblingWindow;
eep.SlidingWindow = require('./eep.window_sliding').SlidingWindow;
eep.Periodicwindow = require('./eep.window_periodic').PeriodicWindow;
eep.MonotonicWindow = require('./eep.window_monotonic').MonotonicWindow;
eep.OrderedWindow = require('./eep.window_ordered').OrderedWindow;

// Register optional packages
eep.Noop = require('./eep.fn.noop').Noop;
eep.Stats = require('./eep.fn.stats').Stats;

// Export the eep package
module.exports = eep;

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

// Count all the things
function CountFunction() {
  var self = this, n;
  self.name = "count";
  self.init = function() { n = 0; };
  self.accumulate = function(ignored) { n += 1; };
  self.compensate = function(ignored) { n -= 1; };
  self.emit = function()  { return n; };
  self.make = function() { return new CountFunction(); };
}
util.inherits(CountFunction, AggregateFunction);

// Sum all the things
function SumFunction() {
  var self = this, s;
  self.name = "sum";
  self.init = function() { s = 0; };
  self.accumulate = function(v) { s += v; };
  self.compensate = function(v) { s -= v; };
  self.emit = function()  { return s; };
  self.make = function() { return new SumFunction(); };
}
util.inherits(SumFunction, AggregateFunction);

// Get the smallest of all the things
function MinFunction() { 
  var self = this, r;
  self.name = "min";
  self.init = function() { r = null; };
  self.accumulate = function(v) { if (v == null) { return; } if (r == null) { r = v; return; } r = (v < r) ? v : r; };
  self.compensate = function(v) { if (v == null) { return; } if (v != null) { return; } else  r = (v < r) ? r : v; };
  self.emit = function()  { return r; };
  self.make = function() { return new MinFunction(); };
}
util.inherits(MinFunction, AggregateFunction);

// Get the biggest of all the things
function MaxFunction() { 
  var self = this, r;
  self.name = "max";
  self.init = function() { r = null; };
  self.accumulate = function(v) { if (v == null) { return; } if (r == null) { r = v; return; } r = (v > r) ? v : r; };
  self.compensate = function(v) { if (v == null) { return; } if (v != null) { return; } else  r = (v > r) ? r : v; };
  self.emit = function()  { return r; };
  self.make = function() { return new MaxFunction(); };
}
util.inherits(MaxFunction, AggregateFunction);

// Get the average of all the things
function MeanFunction() {
  var self = this, m, d, n;
  self.name = "mean";
  self.init = function() { m = 0; d = 0; n = 0; };
  self.accumulate = function(v) { n+=1; d = v - m; m = d/n + m; };
  self.compensate = function(v) { n-=1; d = m - v; m = m + d/n; };
  self.emit = function()  { return m; };
  self.make = function() { return new MeanFunction(); };
}
util.inherits(MeanFunction, AggregateFunction);

// Get the sample variance of all the things
function VarianceFunction() {
  var self = this, m, m2, d, n;
  self.name = "vars";
  self.init = function() { m = 0; m2 = 0; d = 0; n = 0; };
  self.accumulate = function(v) { n+=1; d = v - m; m = d/n + m; m2 = m2 + d*(v - m); };
  self.compensate = function(v) { n-=1; d = m - v; m = m + d/n; m2 = d*(v - m) + m2; };
  self.emit = function()  { return m2/(n-1); };
  self.make = function() { return new VarianceFunction(); };
}
util.inherits(VarianceFunction, AggregateFunction);

// Get the standard deviation of all the things
function StdevFunction() {
  var self = this, m, m2, d, n;
  self.name = "stdevs";
  self.init = function() { m = 0, m2 = 0, d = 0, n = 0; };
  self.accumulate = function(v) {
    n+=1; 
    d = v - m;
    m = m + d/n;
    m2 = m2 + d*(v-m);
  };
  self.compensate = function(v) {
    n-=1;
    d = m - v;
    m = d/n + m;
    m2 = d*(v-m) + m2;
  };
  self.emit = function()  { return Math.sqrt(m2/(n-1)); };
  self.make = function() { return new StdevFunction(); };
}
util.inherits(StdevFunction, AggregateFunction);

function AllStatsFunction() {
  var self = this, m, m4, m3, m3, d, n, s, min, max;
  self.name = "all";
  self.init = function() { 
    m = 0, m2 = 0, d = 0, n = 0, s = 0, min = null, max = null;
  };
  self.accumulate = function(v) {
    if (v == null) return;
    var o = n;
    s+=v;
    if (v != null) { if (min == null) { min = v; } else { min = (v < min) ? v : min; } };
    if (v != null) { if (max == null) { max = v; } else { max = (v > max) ? v : max; } };
    n+=1;
    d = v - m;
    var dn = d / n, t1 = d * dn *  o;
    m = m + dn;
    m2 = m2 + t1;
  };
  self.compensate = function(v) {
    if (v == null) return;
    var o = n;
    s-=v;
    if (v == null) { return; } if (v != null) { return; } else  min = (v < min) ? min : v;
    if (v == null) { return; } if (v != null) { return; } else  max = (v < max) ? max : v;
    n-=1;
    d = m - v;
    var dn = d / n, t1 = d * dn * o;
    m = dn;
    m2 = m2 - t1;
  };
  self.emit = function()  { 
    var variance = m2/(n-1);
    return results = {
      count: n,
      sum: s,
      min: min,
      max: max,
      mean: m,
      vars: variance,
      stdevs:  Math.sqrt(variance)
    };
  };
  self.make = function() { return new AllStatsFunction(); };
}
util.inherits(AllStatsFunction, AggregateFunction);

// eep.js Statistics package
var Stats = function() {};

// Register statistics aggregate functions
Stats.count = new CountFunction();
Stats.sum = new SumFunction();
Stats.min = new MinFunction();
Stats.max = new MaxFunction();
Stats.mean = new MeanFunction();
Stats.vars = new VarianceFunction();
Stats.stdevs = new StdevFunction();
Stats.all = new AllStatsFunction();

// Export the Statistics package
module.exports.Stats = Stats;

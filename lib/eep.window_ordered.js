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

var indexOf = function(data,candidate) {
  var min = 0;
  var max = data.length - 1;
  var pivot;
  var value;

  while (min <= max) {
    pivot = (min + max) / 2 | 0;
    value = data[pivot];
    if (value < candidate) {
      min = pivot + 1;
    } else if (value > candidate) {
      max = pivot - 1;
    } else {
      return pivot;
    }
  }

  return -1;
};

var remove = function(data,value) {
   var idx = indexOf(data,value);
   if (idx >= 0) {
    data.splice(idx, 1);
   }
};

var insert = function(data,value) {
  var hi = n = data.length, lo = 0;
  var pivot = Math.floor(n/2);

  do {
    if (value > data[pivot]) {
      lo = pivot + 1;
    } else if (value < data[pivot]) {
      hi = pivot;
    } else break;

    pivot = Math.floor(lo + ((hi - lo) / 2));
  } while (lo < hi);

  data.splice(pivot,0, value);
};

// A window decorator that supports ordering. Leverages an insertion sort.
// Use wisely. Order is not a requirement for most algorithms and has a
// significant performance cost associated with it.
//
var OrderedWindow = function(win) {
  events.EventEmitter.call(this);
  var self = this; var s = new Array();

  self.min = function() { return s[0]; };
  self.max = function() { return s[s.length-1]; };
  self.size = function() { return s.length; };

  // override
  win.min = self.min;
  win.max = self.max;
  win.size = self.size;

  if (win.tick) self.tick = win.tick;

  win.on('drop', function(x) { remove(s, x);  });
  win.on('clear', function() { 
    for (var i = 0; i < s.length; i++) { 
      // emit drop event for each collected event
      self.emit('drop', s[i]); 
    }
    // clear array 'cheaply'
    s.length = 0;
  });
  win.on('emit', function(x) { self.emit('emit',x); });
  self.enqueue = function(x) { insert(s, x); win.enqueue(x); };
};
util.inherits(OrderedWindow, events.EventEmitter);


// Exports
module.exports.OrderedWindow = OrderedWindow;

// For testing
module.exports.OrderedWindow.indexOf = indexOf;
module.exports.OrderedWindow.remove = remove;
module.exports.OrderedWindow.insert = insert;

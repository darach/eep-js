var http = require('http');
var fs = require('fs');
var lr = require('line-reader');

var eep = require('eep');
var data = __dirname + '/data.txt';

//  Widefinder aggregate function
var WideFinderFunction = function(regex) {
  var self = this; var re = new RegExp(regex);
  var keys = {};
  self.init = function() { keys = {}; };
  self.accumulate = function(line) {
    var m = re.exec(line);
    if (m == null) return;
    var k = m[1]; // use 1st group as key
    var v = keys[k];
    if (v) keys[k] = v+1; else keys[k] = 1; // count by key
  };
  self.emit = function() {
    return keys;
  };
  self.make = function() { return new WideFinderFunction(regex); };
};

var win = eep.EventWorld.make().windows().monotonic(
  new WideFinderFunction(/GET \/ongoing\/When\/\d\d\dx\/(\d\d\d\d\/\d\d\/\d\d\/[^ .]+) /),
  // new eep.CountingClock()
  new eep.WallClock(0)
);

// On emit, log top 10 hits to standard output
win.on('emit', function(matches) {
  var all = [];
  for (var k in matches) {
    all.push({ url: k, n: matches[k] });
  }
  var sorted = all.sort(function(a,b) { return (b.n >= a.n) ? 1 : -1; });
  for (var i = 1; i <= ((all.length <=  10) ? all.length : 10); i++) {
    console.log(i + ':\t' + all[i].url + ' with ' + all[i].n + ' hits');
  }
});


var fetch = function(cb) {
  var options = {
    host: 'www.tbray.org',
    port: '80',
    path: '/tmp/o10k.ap',
  };
  console.log('Fetching data file http://' + options.host + '/' + options.path);
  var request = http.get(options, function(response) {
    var d = '';
    response.on('data', function (chunk) { d += chunk; });
    response.on('end', function () { cb(d); });
  });
  request.on('error', function(error) {
    console.log("Request error: " + error.message);
  });
};

var widefinder = function() {
  lr.eachLine(data, function(line, last) {
    win.enqueue(line);
    if (last) {
      win.tick();
      return false;
    }
  });
};

//
// Run widefinder
//
fs.exists(data, function(exists) {
  if (!exists) {
    fetch(function(d) {
      var df = fs.createWriteStream(data);
      df.write(d);

      // Run widefinder
      widefinder();
    });
  } else {
    // Run widefinder
    widefinder();
  }
});

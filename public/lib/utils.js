
function testRunTime(startTime) {
    return timer() - startTime;
}

function timer() {
    return window.performance.now();
}

function simpleMovingAverage() {
    this.smaCount++;
    const differential = (this.curSpeed - this.smaMean) / this.smaCount
    const newMean = this.smaMean + differential;
    this.smaMean = newMean;
    return this.smaMean;
}

function calculateSpeedMbps(bytes, milliSeconds) {
    return bytes / (125 * milliSeconds);
}

function abortAllRequests() {
    console.log('abortAllRequests');
    for (var i = 0; i < this.activeTests.length; i++) {
        if (typeof(this.activeTests[i] !== 'undefined')) {
            this.activeTests[i].xhr._request.abort();
        }
    }
}

var websocket;
var count = 0;
var str = test();
var startTime;
var deviation = 0;
var prevResult = 0;
//stosat-plfi-01.sys.comcast.net.prod.hosts.ooklaserver.net:8080/ws
//qoecnf-csnt-03.sys.comcast.net:5003/ws
  function testWebSocket()
  {
    websocket = new WebSocket("ws://qoecnf-csnt-03.sys.comcast.net:5003/ws");
    websocket.onopen = function(evt) { onOpen(evt) };
    websocket.onclose = function(evt) { onClose(evt) };
    websocket.onmessage = function(evt) { onMessage(evt) };
    websocket.onerror = function(evt) { onError(evt) };
    websocket.onpong = function(evt) { onPong(evt) };
  }

  function onOpen(evt)
  {
    // console.log(evt);
    console.log("CONNECTED");
    startTime = window.performance.now();
    doSend("HI");
  }

  function onClose(evt)
  {
    console.log(evt);
  }

  function onMessage(evt)
  {
    var latency_rtt = Date.now() - +evt.data.split(" ")[1];
    var endTime = window.performance.now();
    var rtt = endTime - startTime;
    // startTime = endTime;
    // console.log(rtt);
    displayLatency(latency_rtt);

    count++;
    if (count < 50) {
      setTimeout(function() {
          startTime = window.performance.now();
        doSend(pingMessage())
      },250)
      // doSend(str)
    } else {
      test();
      websocket.close();
    }
    
  }

  function onError(evt)
  {
    console.log(evt);
  }

  function doSend(message)
  {
    websocket.send(message);
  }

//   function onPong(evt) {
//     console.log("EXectued from pong event");
//     console.log(evt);
//   }

  function pingMessage() {
    return "PING" + " " + Date.now().toString();
  }

  function byteCount(s) {
    return encodeURI(s).split(/%..|./).length - 1;
  }

  function test() {
    var x = "12345";
    var iterations = 2;
    for (var i = 0; i < iterations; i++) {
      x += x+x;
    }
    return x;
    console.log(byteCount(x));
  }

  function displayLatency(latency_rtt) {
    if (!isNaN(latency_rtt)) {
        // console.log("Latency " +latency_rtt + " ms");
        if (prevResult !== 0) {
            var jitter = Math.abs(latency_rtt - prevResult);
            console.log("Latency " + latency_rtt + " Jitter " +jitter + " ms");
        }
        prevResult = latency_rtt;
    }
  }

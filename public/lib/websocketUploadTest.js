/*
 * *
 *  Copyright 2014 Comcast Cable Communications Management, LLC
 *
 *  Licensed under the Apache License, Version 2.0 (the "License");
 *  you may not use this file except in compliance with the License.
 *  You may obtain a copy of the License at
 *
 *  http://www.apache.org/licenses/LICENSE-2.0
 *
 *  Unless required by applicable law or agreed to in writing, software
 *  distributed under the License is distributed on an "AS IS" BASIS,
 *  WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 *  See the License for the specific language governing permissions and
 *  limitations under the License.
 * /
 */

(function () {
    'use strict';
    /**
     * extend webSocket
     * @param string url address for request
     * @param integer size of download
     * @param integer timeout timeout for request
     * @param function callback for onloaded function
     * @param function callback for onerror function
     */
    function websocketUploadTest(url, transferSize, callbackOnMessage, callbackOnError) {
        this.url = 'ws://69.252.75.2:5003/ws';
        this.transferSize = transferSize;
        this.callbackOnMessage = callbackOnMessage;
        this.callbackOnError = callbackOnError;
        //unique id or test
        this._testIndex = 0;
        this.totalBytes = 0;
        //array for packet loss;
        this.packetLossArray = [];
        //array for results
        this.resultsArray = [];
        //start time data capture
        this.payload = null;
        //store multiple websockets
        this.webSockets = [];
        //concurrent runs. number of websockets connections
        this.concurrentRuns = 3;
        this.uploadStartTime = Date.now();

    }

    websocketUploadTest.prototype.createWebSocket = function (id) {

        var webSocket = new window.webSocketData(this.url,this.onTestOpen.bind(this),
            this.onMessageComplete.bind(this),this.onTestError.bind(this));
        webSocket.start(id);
        this.webSockets.push(webSocket);



        //for (var i = 0; i < 1; i++) {
        //    console.log(this.url[i]);
        //    //this.url = 'ws://69.252.86.194:5003';
        //    this._request = new WebSocket(this.url[i]);
        //}
        //this.start();

    };

    /**
     * Initiate the request
     */
    websocketUploadTest.prototype.start = function () {
        for (var i = 0; i <= this.concurrentRuns; i++) {
            this.createWebSocket(i);
        }
    };

    websocketUploadTest.prototype.onTestOpen = function (id) {
        if (this.payload === null) {
            this.payload = test(this.transferSize);
        }

        this.webSockets[id].sendMessage(this.payload);


        //this.sendStartTime = Date.now();

        //var data = {
        //    id: 1,
        //    data: this.payload
        //};
        //
        //var data1 = JSON.stringify(data);
        //
        //var data2 = str2ab(data1);
        //
        //function str2ab(str) {
        //    var buf = new ArrayBuffer(str.length*2); // 2 bytes for each char
        //    var bufView = new Uint8Array(buf);
        //    for (var i=0, strLen=str.length; i<strLen; i++) {
        //        bufView[i] = str.charCodeAt(i);
        //    }
        //    return buf;
        //}
        //
        //function ab2str(buf) {
        //    return String.fromCharCode.apply(null, new Uint8Array(buf));
        //}
        //
        //ABToStr = ab =>
        //    new Uint8Array(ab).reduce((p, c) =>
        //    p + String.fromCharCode(c), '');
        //debugger;
        //
        //this.actualSize = data2.byteLength;
        //this._request.send(data2);
        //this._request.send(this.payload);
        //var uploadData = getRandomData(this.transferSize);
        //this.startTime = Date.now();
        //console.log('size: ' +uploadData.length);
        //var data = {'data':uploadData,'flag':'upload', time: this.startTime, mask: true};
        //this._sendMessage(uploadData);
    };

    websocketUploadTest.prototype._sendMessage = function (message) {
        console.log(typeof message);
      this._request.send(message)
    };

    websocketUploadTest.prototype.onMessageComplete = function (result) {
        console.log(result);
        //var serverTime = (Date.now() - JSON.parse(event.data).time)/1000;
            var sendTime = (Date.now() - result.startTime) / 1000;
        this.totalBytes += this.transferSize;
        console.log('******** Transfer Speed Total Bytes ************');
        console.log((this.totalBytes * 8 * 1000)/((Date.now() - this.uploadStartTime) * 1000000));
        console.log('############');

            //console.log('sent ' + this.size.toFixed(3) + ' MB, took ' + sendTime.toFixed(3) + ' seconds');
            //console.log('upload speed in mbps: ' +(this.size/sendTime) * 8);
        //console.log('upload speed time: '+(this.transferSize * 8)/(serverTime * 1000000));
            console.log('upload speed: '+(this.transferSize * 8)/(sendTime * 1000000));
        if (Date.now() - this.uploadStartTime < 12000) {
            console.log('********************************************');
            //this.transferSize = this.transferSize * 2;
            this.onTestOpen(result.id);
        } else {
            this.close();
        }

        //this._controller(event);
    };

    websocketUploadTest.prototype._controller = function (event) {
        console.log(event);
        var serverTime = JSON.parse(event.data).time;
        //console.log('serber: ' +serverTime);
        var duration = (Date.now() - serverTime)/1000;
        var transferSizeMbs = (this.transferSize * 8) / 1000000;
        console.log('speed:' +transferSizeMbs/duration);
        this.totalBytes += this.transferSize;

        //console.log(this.transferSize * 8 * 1000/(JSON.parse(event.timeStamp)*1000000));
        var uploadresult = Math.round((this.transferSize/duration)/1000000).toFixed(2);
        clearInterval(this.interval);


        //console.log('upload:' +uploadresult);

    };

    /**
     * webSocket onMessage error Event
     */
    websocketUploadTest.prototype.onTestError = function (event) {
        this.callbackOnError(event);
    };

    /**
     * webSocket close Event
     */
    websocketUploadTest.prototype._handleOnClose = function (event) {
        if ((event !== null) && (event.code === 1006)) {
            this.callbackOnError('connection error');
        }
    };

    /**
     * close webSocket
     */
    websocketUploadTest.prototype.close = function () {
        this._request.close();
    };

    websocketUploadTest.prototype.monitor = function () {
        var data = test(0.2);
        this.sendStartTime = Date.now();
        this._request.send(data);




        //this.calculateResults();
        //console.log (this._request.bufferedAmount);
        //this._request.bufferedAmount();
    };

    websocketUploadTest.prototype.calculateResults = function () {
        var time = Date.now() - this.startTime;
      //console.log(((this.transferSize - this._request.bufferedAmount) * 8 * 1000)/(time * 1000000));
    };


    /**
     * close webSocket
     */
    websocketUploadTest.prototype.close = function () {
        for (var i = 0; i < this.webSockets.length; i++) {
            this.webSockets[i].close();
        }
    };

    function getRandomData(size) {

        function getData() {
            return Math.random().toString();
        }

        var count = size / 2;
        var result = getData();

        while (result.length <= count) {
            result += getData();
        }

        result = result + result.substring(0, size - result.length);
        return result;
        //var blob;
        //try {
        //    blob = new Blob([result], {type: "application/octet-stream"});
        //} catch (e) {
        //    var bb = new BlobBuilder; // jshint ignore:line
        //    bb.append(result);
        //    blob = bb.getBlob("application/octet-stream");
        //}
        //return blob;
    }

    //function test(sizeInMB, callback) {
    //    var data = new Uint8Array(sizeInMB * 1024 * 1024);
    //    for (var j = 0; j < data.length; j++) {
    //        data[j] = 32 + Math.random() * 95;
    //    }
    //    var sendStart = Date.now();
    //    var sendTime;
    //    console.log('sending ' + sizeInMB.toFixed(3) + ' MB');
    //    onmessage = function(data) {
    //        var totalTime = (Date.now() - sendStart) / 1000;
    //        console.log(data + ', took ' + totalTime.toFixed(3) + ' seconds');
    //        times.push({ sizeInMB: sizeInMB, sendTime: sendTime, totalTime: totalTime });
    //        setTimeout(callback, 500);
    //    };
    //    ws.send(data, function() {
    //        sendTime = (Date.now() - sendStart) / 1000;
    //        console.log('sent ' + sizeInMB.toFixed(3) + ' MB, took ' + sendTime.toFixed(3) + ' seconds');
    //    });
    //}

    function test(size) {
        //console.log('size: ' +size);
        //var a  = Math.round(size * 1024 * 1024);
        var uploadData = new Uint8Array(size);
        for (var i = 0; i < uploadData.length; i++) {
            uploadData[i] = 32 + Math.random() * 95;
        }
        return uploadData;
    }



    window.websocketUploadTest = websocketUploadTest;

})();
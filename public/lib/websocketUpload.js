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
    function websocketUpload(url, transferSize, callbackOnMessage, callbackOnError) {
        //this.url = 'ws://192.168.43.62:8081';
        this.url = url;
        //this.url = 'ws://127.0.0.1:8081';
        this.transferSize = transferSize;
        this.callbackOnMessage = callbackOnMessage;
        this.callbackOnError = callbackOnError;
        this.concurrentRuns = 0;
        this.testLength = 10000;
        //unique id or test
        this._testIndex = 1;
        //array for packet loss;
        this.packetLossArray = [];
        //array for results
        this.resultsArray = [];
        //start data capture time
        this.startDataCapture;
        //array for results and time from test start
        this.resultsTimeArray = [];
        //monitor interval
        this.interval = null;
        //start time of test suite
        this.beginTime;
        //time for monitor to calcualte stats
        this.monitorInterval = 100;
        //results object array
        this.results =[];
        //boolean on whether test  suite is running or not
        this._running = true;
        //webSockets array
        this.webSockets = [];
        //track total bytes transferred
        this.totalBytes = 0;
    }

    /**
     * Initiate the request
     */
    websocketUpload.prototype.start = function () {
        for (var g = 0; g <= this.concurrentRuns; g++) {
            this.createSocket(g);
        }
        var self = this;
        this.beginTime = Date.now();
        this.interval = setInterval(function () {
            self.monitor();
        }, this.monitorInterval);

    };

    /**
     * Initiate the request
     */
    websocketUpload.prototype.createSocket = function (g) {
        var webSocket = new window.webSocketData(this.url,this.onTestOpen.bind(this),
            this.onMessageComplete.bind(this),this.onTestError.bind(this));
        webSocket.start(g);
        this.webSockets.push(webSocket);
    };

    /**
     * onError method
     * @return abort object
     */
    websocketUpload.prototype.onTestOpen = function (id) {
        this.sendMessage(id);
    };

    /**
     * onError method
     * @return abort object
     */
    websocketUpload.prototype.onTestError = function (error) {
        console.log(error);
    };

    /**
     * onMessageComplete method
     * @return message object
     */
    websocketUpload.prototype.onMessageComplete = function (result) {
        this.controller(result);
    };

    /**
     * send message for current webSocket
     */
    websocketUpload.prototype.sendMessage = function (id) {

        if(this._running){

            var uploadData = getRandomData(this.transferSize);
            //console.log('size: ' +uploadData.length);
            var data = {'data':uploadData,'flag':'upload', time: this.startTime, 'id': id, mask: true};
            this.startTime = Date.now();
            this.webSockets[id].sendMessage(uploadData);

        }
    };

    /**
     * webSocket onMessage error Event
     */
    websocketUpload.prototype.controller = function (event) {
        if(!this._running){
            console.log('stopRunning');
            return;
        }

        //console.log(event.data);
        var value = event.data;
        var id = (JSON.parse(value).id);
        var duration = (Date.now() - this.startTime)/1000;
        var transferSizeMbs = (this.transferSize * 8) / 1000000;
        console.log('speed:' +transferSizeMbs/duration + 'id: ' +id);
        this.totalBytes += this.transferSize;
        console.log('#######################');
        console.log(this.totalBytes);
        console.log('this.totalBytes: ' +((this.totalBytes * 8 * 1000)/((Date.now() - this.startTime) * 1000000)));
        //console.log(this.transferSize * 8 * 1000/(JSON.parse(event.timeStamp)*1000000));
        //var uploadresult = Math.round((this.transferSize/duration)/1000000).toFixed(2);
        clearInterval(this.interval);
        if (Date.now() - this.beginTime < 12000) {
            //this.transferSize = this.transferSize * 2;
            this.sendMessage(id);
        } else {
            this.close();
        }
    };

    /**
     * Monitor testSeries
     */
    websocketUpload.prototype.monitor = function () {
        this.calculateResults();
    };

    websocketUpload.prototype.calculateResults = function () {
        var time = Date.now() - this.startTime;
        //console.log(((this.transferSize - this._request.bufferedAmount) * 8 * 1000)/(time * 1000000));
    };


    /**
     * webSocket onMessage error Event
     */
    websocketUpload.prototype._handleOnError = function (event) {
        this.callbackOnError(event);
    };

    /**
     * close webSocket
     */
    websocketUpload.prototype.close = function () {
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


    window.websocketUpload = websocketUpload;

})();

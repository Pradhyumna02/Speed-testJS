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
        this.url = url;
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

    }

    websocketUploadTest.prototype.createWebSocket = function () {
        for (var i = 0; i < 4; i++) {
            console.log(this.url[i]);
            //this.url = 'ws://69.252.86.194:5003';
            this._request = new WebSocket(this.url[i], 'json', {'force new connection':true} );
        }
        this.start();

    };

    /**
     * Initiate the request
     */
    websocketUploadTest.prototype.start = function () {
        console.log('in here');
        //if (this._request === null ||
        //    typeof this._request === 'undefined') {
            console.log(this.url);
            this._request.onopen = this._handleOnOpen.bind(this);
            this._request.onmessage = this._handleOnMessage.bind(this);
            this._request.onclose = this._handleOnClose.bind(this);
            this._request.onerror = this._handleOnError.bind(this);
            this.uploadStartTime = Date.now();
            var self = this;
            this.interval = setInterval(function () {
                self.monitor();
            }, 50);
        //}

    };

    websocketUploadTest.prototype._handleOnOpen = function () {
        var uploadData = getRandomData(this.transferSize);
        this.startTime = Date.now();
        console.log('size: ' +uploadData.length);
        var data = {'data':uploadData,'flag':'upload', time: this.startTime, mask: true};
        this._sendMessage(data);
    };

    websocketUploadTest.prototype._sendMessage = function (message) {
      this._request.send(JSON.stringify(message));
    };

    websocketUploadTest.prototype._handleOnMessage = function (event) {
        this._controller(event);
    };

    websocketUploadTest.prototype._controller = function (event) {
        console.log(event);
        var duration = (Date.now() - this.startTime)/1000;
        var transferSizeMbs = (this.transferSize * 8) / 1000000;
        console.log('speed:' +transferSizeMbs/duration);
        this.totalBytes += this.transferSize
        console.log(this.totalBytes/duration);
        //console.log(this.transferSize * 8 * 1000/(JSON.parse(event.timeStamp)*1000000));
        var uploadresult = Math.round((this.transferSize/duration)/1000000).toFixed(2);
        clearInterval(this.interval);
        if (Date.now() - this.uploadStartTime < 12000) {
            //this.transferSize = this.transferSize * 2;
            this._handleOnOpen();
        } else {
            this.close();
        }

        //console.log('upload:' +uploadresult);

    };

    /**
     * webSocket onMessage error Event
     */
    websocketUploadTest.prototype._handleOnError = function (event) {
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
        this.calculateResults();
        //console.log (this._request.bufferedAmount);
        //this._request.bufferedAmount();
    };

    websocketUploadTest.prototype.calculateResults = function () {
        var time = Date.now() - this.startTime;
      console.log(((this.transferSize - this._request.bufferedAmount) * 8 * 1000)/(time * 1000000));
    };


    /**
     * close webSocket
     */
    websocketUploadTest.prototype.close = function () {
        this._request.close();
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

    window.websocketUploadTest = websocketUploadTest;

})();
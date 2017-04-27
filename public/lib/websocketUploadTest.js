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
    function websocketUploadTest(url, transferSize, callbackOnComplete, callbackOnProgress, callbackOnError) {
        this.url = 'ws://69.252.75.2:5003/ws';
        this.transferSize = transferSize;
        this.callbackOnComplete = callbackOnComplete;
        this.callbackOnProgress = callbackOnProgress;
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

        var webSocket = new window.webSocketData(this.url, this.onTestOpen.bind(this),
            this.onMessageComplete.bind(this), this.onTestError.bind(this));
        webSocket.start(id);
        this.webSockets.push(webSocket);

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
    };

    websocketUploadTest.prototype.onMessageComplete = function (result) {
        var sendTime = (Date.now() - result.startTime) / 1000;
        this.totalBytes += this.transferSize;
        console.log('******** Transfer Speed Total Bytes ************');
        console.log((this.totalBytes * 8 * 1000) / ((Date.now() - this.uploadStartTime) * 1000000));
        var uploadSpeed = ((this.totalBytes * 8 * 1000) / ((Date.now() - this.uploadStartTime) * 1000000));
        this.callbackOnProgress(uploadSpeed);
        console.log('******** Upload Chunk Speed ************');
        console.log('upload speed: ' + (this.transferSize * 8) / (sendTime * 1000000));
        if (Date.now() - this.uploadStartTime < 12000) {
            this.onTestOpen(result.id);
        } else {
            this.callbackOnComplete(uploadSpeed);
            this.close();
        }

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

    /**
     * close webSocket
     */
    websocketUploadTest.prototype.close = function () {
        for (var i = 0; i < this.webSockets.length; i++) {
            this.webSockets[i].close();
        }
    };

    function test(size) {
        var uploadData = new Uint8Array(size);
        for (var i = 0; i < uploadData.length; i++) {
            uploadData[i] = 32 + Math.random() * 95;
        }
        return uploadData;
    }


    window.websocketUploadTest = websocketUploadTest;

})();
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
        //array for packet loss;
        this.packetLossArray = [];
        //array for results
        this.resultsArray = [];
        //start time data capture

    }

    /**
     * Initiate the request
     */
    websocketUploadTest.prototype.start = function () {
        console.log('in here');
        if (this._request === null ||
            typeof this._request === 'undefined') {
            console.log(this.url);
            this.url = 'ws://69.252.70.100:5003';
            this._request = new WebSocket(this.url);
            this._request.onopen = this._handleOnOpen.bind(this);
            this._request.onmessage = this._handleOnMessage.bind(this);
            this._request.onclose = this._handleOnClose.bind(this);
            this._request.onerror = this._handleOnError.bind(this);
        }
    };

    websocketUploadTest.prototype._handleOnOpen = function () {
        var uploadData = getRandomData(this.transferSize);
        this.startTime = Date.now();
        var data = {'data':uploadData,'flag':'upload', time: this.startTime};
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
        console.log(transferSizeMbs/duration);
        console.log(this.transferSize/JSON.parse(event.timeStamp));
        var uploadresult = Math.round((this.transferSize/duration)/1000000).toFixed(2);
        console.log('upload:' +uploadresult);
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



    ///**
    // * webSocket onOpen Event
    // */
    //websocketUploadTest.prototype._handleOnOpen = function () {
    //    this._testIndex++;
    //    var obj = {'data': getRandomData(this.transferSize), 'flag': 'upload', id:this._testIndex,size: this.transferSize};
    //    this.startTime = Date.now();
    //    this.sendMessage(obj);
    //};
    //
    ///**
    // * send message for current webSocket
    // */
    //websocketUploadTest.prototype.sendMessage = function (message) {
    //    //var obj = {'data': this.transferSize, 'flag': 'download'};
    //    //var uploadData = getRandomData(100000);
    //    this._request.send(JSON.stringify(message), {mask: true});
    //};
    //
    ///**
    // * webSocket onMessage received Event
    // */
    //websocketUploadTest.prototype._handleOnMessage = function (event) {
    //    this.controller(event);
    //};
    //
    //
    ///**
    // * webSocket onMessage error Event
    // */
    //websocketUploadTest.prototype.controller = function (event) {
    //    var data = JSON.parse(event.data);
    //    console.log(event.data);
    //
    //    var duration = (JSON.parse(event.data) - this.startTime)/1000;
    //    //console.log('size of the array: ', uploadData.length);
    //    var uploadresult = Math.round((this.transferSize/duration)/1000000).toFixed(2);
    //    console.log('upload result:', uploadresult);
    //    var filesize = uploadData.length/1000000;
    //    console.log('Upload Speed in Megabytes/sec', (filesize/duration).toFixed(2));
    //    console.log('Upload Speed in Megabytes/sec :', ((filesize/duration)*8).toFixed(2));
    //    console.log('time', + duration);
    //
    //    console.log('########################');
    //    var id = data.id;
    //    var packetLoss = (parseFloat(data.binary.data.length) - parseFloat(data.dataLength));
    //    console.log(packetLoss);
    //    if(packetLoss>0){
    //        this.packetLossArray.push(packetLoss);
    //    }
    //    var dataInMb  =(data.binary.data.length* 8) / 1000000;
    //    var timeInSeconds = (Date.now() -data.startTime) /1000;
    //    var bandwidthMbs = dataInMb/timeInSeconds;
    //    this.resultsArray.push(bandwidthMbs);
    //    if(this._testIndex< 10){
    //        this._testIndex++;
    //        this.transferSize = this.transferSize*2;
    //        var obj = {'data': this.transferSize, 'flag': 'download', id:this._testIndex,size: this.transferSize};
    //        this.sendMessage(obj);
    //    }
    //    else{
    //        this.close();
    //        console.log(this.resultsArray);
    //        console.log(this.packetLossArray);
    //    }
    //
    //};
    //
    //
    ///**
    // * webSocket onMessage error Event
    // */
    //websocketUploadTest.prototype._handleOnError = function (event) {
    //    this.callbackOnError(event);
    //};
    //
    ///**
    // * webSocket close Event
    // */
    //websocketUploadTest.prototype._handleOnClose = function (event) {
    //    if ((event !== null) && (event.code === 1006)) {
    //        this.callbackOnError('connection error');
    //    }
    //};

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
        var blob;
        try {
            blob = new Blob([result], {type: "application/octet-stream"});
        } catch (e) {
            var bb = new BlobBuilder; // jshint ignore:line
            bb.append(result);
            blob = bb.getBlob("application/octet-stream");
        }
        return blob;
    }

    window.websocketUploadTest = websocketUploadTest;

})();
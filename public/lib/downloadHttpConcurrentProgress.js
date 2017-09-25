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
     * download testing based on httpRequests
     * @param string server endpoint for upload testing
     * @param string post or get request
     * @param integer number of concurrentRuns
     * @param integer timeout of the request
     * @param integer length of the testLength
     * @param integer when to calculate moving average
     * @param function callback function for test suite complete event
     * @param function callback function for test suite progress event
     * @param function callback function for test suite abort event
     * @param function callback function for test suite timeout event
     * @param function callback function for test suite error event
     **/
    function downloadHttpConcurrentProgress(urls,  type, concurrentRuns, timeout, testLength, movingAverage, callbackComplete, callbackProgress, callbackAbort,
                                            callbackTimeout, callbackError, size, progressIntervalDownload, monitorInterval) {
        this.urls = urls;
        this.size = size;
        this.type = type;
        this.concurrentRuns = concurrentRuns;
        this.timeout = timeout;
        this.testLength = testLength;
        this.movingAverage = movingAverage;
        //time to capture onProgressEvent
        this.progressIntervalDownload = progressIntervalDownload;
        //time for monitor to calcualte stats
        this.monitorInterval = monitorInterval;
        //unique id or test
        this._testIndex = 0;
        //array holding active tests
        this._activeTests = [];
        this.clientCallbackComplete = callbackComplete;
        this.clientCallbackProgress = callbackProgress;
        this.clientCallbackAbort = callbackAbort;
        this.clientCallbackTimeout = callbackTimeout;
        this.clientCallbackError = callbackError;
        //start time of test suite
        this._beginTime = Date.now();
        //boolean on whether test  suite is running or not
        this._running = true;
        //array holding  results
        this.finalResults = [];
        //monitor interval
        this.interval = null;
        //total probe bytes
        this.totalBytes = 0;
        //results object array
        this.results =[];
        //results count
        this.resultsCount = 0;
        //results to send to client
        this.downloadResults = [];
        this.prevDownloadSpeed = [];
        this.prevDownloadTime = [];
        this.currentDownloadSpeed = [];
        this.currentDownloadTime = [];
        this.count = 0;
        this.actualSpeedArray = [];
        this.totalBytesDownloaded = 0;
        this.prevTime = 0;
        this.prevBytes = 0;
    }

    /**
     * onError method
     * @return error object
     */
    downloadHttpConcurrentProgress.prototype.onTestError = function (result) {
        if (this._running) {
            this.clientCallbackError(result);
            clearInterval(this.interval);
            this._running = false;
        }
    };
    /**
     * onAbort method
     * @return abort object
     */
    downloadHttpConcurrentProgress.prototype.onTestAbort = function (result) {
      this._storeResults(result);
      this.totalBytes = this.totalBytes + result.loaded;
    };
    /**
     * onTimeout method
     * @return timeout object
     */
    downloadHttpConcurrentProgress.prototype.onTestTimeout = function () {
        if(this._running) {
            if ((Date.now() - this._beginTime) > this.testLength) {
                clearInterval(this.interval);
                if (this.downloadResults && this.downloadResults.length) {
                  this.clientCallbackComplete(this.downloadResults);
                } else {
                    this.clientCallbackError('no measurements obtained');
                }
                this._running = false;
            }

        }
    };

    /**
     * onComplete method
     */
    downloadHttpConcurrentProgress.prototype.onTestComplete = function (result) {

        if (!this._running) {
            return;
        }

        //store results
        this._storeResults(result);
        this.start();
        };



    /**
     * onProgress method
     */
    downloadHttpConcurrentProgress.prototype.onTestProgress = function (result) {
        if (!this._running) {
            return;
        }
        if (this.count === 0) {
            this.actualStartTime = result.startTime;
        }
        // this.count++;
        this.totalBytesDownloaded += result.chunkLoad;
        this.currentDownloadSpeed[result.id-1] = result.loaded;
        this.currentDownloadTime[result.id-1] = result.totalTime;
        this.totalBytes = this.totalBytes + result.loaded;
        this._storeResults(result);

    };

    /**
     * Start the test
     */
    downloadHttpConcurrentProgress.prototype.start = function () {
      if (!this._running) {
            return;
      }

            for (var g = 1; g <= this.concurrentRuns; g++) {
                this.currentDownloadSpeed[this._testIndex] = 0;
                this.currentDownloadTime[this._testIndex] = 0;
                this.prevDownloadSpeed[this._testIndex] = 0;
                this.prevDownloadTime[this._testIndex] = 0;
                this._testIndex++;
                var request = new window.xmlHttpRequest('GET', this.urls[g]+ this.size +  '&r=' + Math.random(), this.timeout, this.onTestComplete.bind(this), this.onTestProgress.bind(this),
                    this.onTestAbort.bind(this), this.onTestTimeout.bind(this), this.onTestError.bind(this),this.progressIntervalDownload);
                this._activeTests.push({
                    xhr: request,
                    testRun: this._testIndex
                });
                request.start(0, this._testIndex);
            }

    };

    /**
     * Cancel the test
     */
    downloadHttpConcurrentProgress.prototype.abortAll = function () {
        clearInterval(this.interval);
        for (var i = 0; i < this._activeTests.length; i++) {
            if (typeof(this._activeTests[i]) !== 'undefined') {
                this._activeTests[i].xhr._request.abort();
            }
        }
    };

    /**
     * store speedtest measurements
     * @param result
     * @private
     */
    downloadHttpConcurrentProgress.prototype._storeResults = function (result) {
      this.results.push(result);
    };


    /**
     * Monitor testSeries
     */
    downloadHttpConcurrentProgress.prototype._monitor = function () {
        var intervalBandwidth = 0;
        var totalLoaded = 0;
        var totalTime = 0;
        var intervalCounter = 0;
        this.resultsCount++;
        var totalSpeed = 0;
        var actualTotalSpeed = 0;

        for (var i = 0; i < this.concurrentRuns; i++) {
            var sampleBandwidth = this.currentDownloadSpeed[i] - this.prevDownloadSpeed[i];
            var time = Math.abs(this.currentDownloadTime[i] - this.prevDownloadTime[i]);
            console.log('********' + ' bytes' + i + ':' +sampleBandwidth + ' time: ' +time + ' **************');
            if (sampleBandwidth !== 0 && time !== 0) {
                var speed = calculateSpeedMbps(sampleBandwidth, 1000);
                var actualSpeed = calculateSpeedMbps(sampleBandwidth, time);
                // console.log('speed' + i + ': ' + speed + ' time ' +time + ' bytes ' +sampleBandwidth);
                totalSpeed += speed;
                actualTotalSpeed += actualSpeed;
                // console.log('speed' + i + ': ' + speed + 'time ' +time + ' actualSpeed: ' +actualSpeed);
                // console.log('current SPeed: ' +this.prevDownloadSpeed[i] + 'current: ' +this.currentDownloadSpeed[i] + 'i ' +i);
                this.prevDownloadSpeed[i] = this.currentDownloadSpeed[i];
                this.prevDownloadTime[i] = this.currentDownloadTime[i];
            }
            //*** Needs to be removed ***
            if (time === 0) {
                //needs to be changed to max time of this.currentDownloadSpeed
                var checkTime = Date.now() - this.actualStartTime;
                this.prevDownloadTime[i] = (Date.now() - this.actualStartTime);
            }

        }

        if (i === this.concurrentRuns) {
            var time = Date.now() - this.actualStartTime;
            var bytes = this.totalBytesDownloaded - this.prevBytes;
            var totalBytesDownloaded = calculateSpeedMbps(bytes, (time-this.prevTime));
            this.prevTime = time;
            this.prevBytes = this.totalBytesDownloaded;
            console.log('totalSpeed: ' +totalSpeed + ' actualSpeed: ' +actualTotalSpeed + 'totalBytesDownloaded: ' +totalBytesDownloaded);
            if (!isNaN(totalSpeed)) {
                this.downloadResults.push(totalSpeed);
                this.actualSpeedArray.push(actualTotalSpeed);
                this.clientCallbackProgress(totalSpeed);
            }
        }

        // if (this.results.length > 0) {
        //     for (var i = 0; i < this.results.length; i++) {
        //         if (this.results[i].timeStamp > (Date.now() - this.monitorInterval)) {
        //             intervalBandwidth = intervalBandwidth + parseFloat(this.results[i].bandwidth);
        //             totalLoaded = totalLoaded + this.results[i].chunckLoaded;
        //             totalTime = totalTime + this.results[i].totalTime;
        //             intervalCounter++;
        //         }
        //     }
        //     if (!isNaN(intervalBandwidth / intervalCounter)) {
        //         var transferSizeMbs = (totalLoaded * 8) / 1000000;
        //         var transferDurationSeconds = this.monitorInterval / 1000;
        //         this.finalResults.push(transferSizeMbs / transferDurationSeconds);
        //         var lastElem = Math.min(this.finalResults.length, this.movingAverage);
        //         if (lastElem > 0) {
        //             var singleMovingAverage = 0;
        //             for (var j = 1; j <= lastElem; j++) {
        //                 if (isFinite(this.finalResults[this.finalResults.length - j])) {
        //                     singleMovingAverage = singleMovingAverage + this.finalResults[this.finalResults.length - j];
        //
        //                 }
        //             }
        //             singleMovingAverage = singleMovingAverage / lastElem;
        //             if (singleMovingAverage > 0) {
        //                 this.downloadResults.push(singleMovingAverage);
        //                 this.clientCallbackProgress(singleMovingAverage);
        //             }
        //         }
        //
        //     }
        //
        // }
        //check for end of test
        if ((Date.now() - this._beginTime) > (this.testLength)) {
            this._running = false;
            clearInterval(this.interval);
            if (this.downloadResults && this.downloadResults.length) {
                console.log(this.actualSpeedArray);
                this.actualSpeedArray = this.actualSpeedArray.slice(4, this.actualSpeedArray.length-1);
                var sum = this.actualSpeedArray.reduce(function (a, b) {
                    return a + b;
                }, 0);
                var mean = sum / this.actualSpeedArray.length;
                console.log('mean: ' +mean);
                this.clientCallbackComplete(this.downloadResults);
            } else {
                this.clientCallbackError('no measurements obtained');
            }
            this.abortAll();
        }

    };

    function calculateSpeedMbps(bytes, milliSeconds) {
        return bytes / (125 * milliSeconds);
    }

    /**
     * reset test variables
     */
    downloadHttpConcurrentProgress.prototype.initiateTest = function(){
        this._testIndex = 0;
        this.finalResults.length=0;
        this._running = true;
        this.interval = null;
        this.downloadResults.length = 0;
        this.totalBytes = 0;
        this.start();
        var self = this;
        this.interval = setInterval(function () {
          self._monitor();
        }, this.monitorInterval);
    };

    window.downloadHttpConcurrentProgress = downloadHttpConcurrentProgress;
})();
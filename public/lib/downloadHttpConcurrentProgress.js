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
    function downloadHttpConcurrentProgress(urls, url, type, concurrentRuns, timeout, testLength, movingAverage, callbackComplete, callbackProgress, callbackAbort,
                                            callbackTimeout, callbackError) {
        this.url = url;
        this.urls = urls;
        this.type = type;
        this.concurrentRuns = concurrentRuns;
        this.timeout = timeout;
        this.testLength = testLength;
        this.movingAverage = 10;
        //unique id or test
        this._testIndex = 0;
        //array holding all results
        this._results = [];
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
        //object holding all test progress measurements
        this._progressResults = {};
        //count of progress events
        this._progressCount = 0;
        //flag on whether to collect measurements-All request need to be running at the same time
        this._collectMovingAverages = false;
        //monitor interval
        this.interval = null;
        this.timestamp  = {};
        this.bandwidthData = {};
        this.currentTime = {};
        this.testResults = {};
        this.totalBytes = 0;
        this.sampleStartTime;
    }

    /**
     * onError method
     * @return error object
     */
    downloadHttpConcurrentProgress.prototype.onTestError = function (result) {
        if (this._running) {
            this.clientCallbackError(result);
            clearInterval(this.interval);
            clearInterval(this.newinterval);
            this._running = false;
        }
    };
    /**
     * onAbort method
     * @return abort object
     */
    downloadHttpConcurrentProgress.prototype.onTestAbort = function () {
        if(this._running) {
            if ((Date.now() - this._beginTime) > this.testLength) {
              clearInterval(this.interval);
                clearInterval(this.newinterval);
                if (this.finalResults && this.finalResults.length) {
                    console.log('reahce here');
                    this.clientCallbackComplete(this.finalResults);
                } else {
                    this.clientCallbackError('no measurements obtained');
                }
                this._running = false;
            }

        }

    };
    /**
     * onTimeout method
     * @return timeout object
     */
    downloadHttpConcurrentProgress.prototype.onTestTimeout = function () {
        if(this._running) {
            if ((Date.now() - this._beginTime) > this.testLength) {
                clearInterval(this.interval);
                clearInterval(this.newinterval);
                if (this.finalResults && this.finalResults.length) {
                    console.log('onTestTimeout');
                    this.clientCallbackComplete(this.finalResults);
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
        this._collectMovingAverages = false;
        //pushing results to an array
        this._results.push(result);
        //cancel remaining tests
        for (var i = 0; i < this._activeTests.length; i++) {
            if (typeof(this._activeTests[i]) !== 'undefined') {
                this._activeTests[i].xhr._request.abort();
            }
        }
        //reset Active Tests array
        this._activeTests.length =0;
        //checking if we can continue with the test
        if ((Date.now() - this._beginTime) < this.testLength) {
            this.start();
        }
        else {
            //check this._running flag again since it may have been reset in abort
            if (this._running) {
                clearInterval(this.interval);
                clearInterval(this.newinterval);
                this._running = false;
                if (this.finalResults && this.finalResults.length) {
                    console.log('on test complete');
                    this.clientCallbackComplete(this.finalResults);
                } else {
                    this.clientCallbackError('no measurements obtained');
                }
            }
        }
    };

    /**
     * onProgress method
     */
    downloadHttpConcurrentProgress.prototype.onTestProgress = function (result) {

        //console.log('startTime: ' + result.startTime);

        //console.log(result.id + 'band: ' +result.bandwidth);
        //console.log((result.loaded * 8 * 1000)/(result.time * 1000000));
        if (!this._running) {
            return;
        }

        if ((Date.now() - this._beginTime) > this.testLength) {
            clearInterval(this.interval);
            clearInterval(this.newinterval);
            this.abortAll();
            if (this.finalResults && this.finalResults.length) {
                this.clientCallbackComplete(this.finalResults);
            } else {
                this.clientCallbackError('no measurements obtained');
            }
            this._running = false;
        }

        if(!this._collectMovingAverages){
            return;
        }
        //update progress count
        this._progressCount++;

        if (this._progressCount === 1) {
            this.sampleStartTime = Date.now();
        }
        //populate array
        this._progressResults['arrayProgressResults' + result.id].push(result.loaded);
        this.totalBytes += result.loaded;
        //console.log(this.totalBytes);
        var movingAverage = (this.totalBytes * 8 * 1000/((result.currentTime - this.sampleStartTime) * 1000000));
        //console.log(this.totalBytes * 8 * 1000/((result.currentTime - this.sampleStartTime) * 1000000));
        this.clientCallbackProgress(movingAverage);
        //this.bandwidthData[result.id] = (result.loaded);
        //this.currentTime[result.id] = result.currentTime;
        //this.testResults[result.id] = (result.loaded * 8 * 1000)/((result.currentTime - this.timestamp[result.id]) * 1000000);
        //
        //
        //    // do some stuff
        //var self = this;
        //this.newinterval = setInterval(function () {
        //    self.calculateStatistics();
        //}, 25);



        //calculate moving average
        //if (this._progressCount % this.movingAverage === 0) {
        //    this.calculateStats();
        //}
    };


    downloadHttpConcurrentProgress.prototype.calculateStatistics = function () {
        var singleMovingAverage = 0;
        var totalMovingAverage = 0;
        var example = this.testResults;
        for (var i = 1; i <= this.concurrentRuns; i++) {
            singleMovingAverage += example[i];
            //console.log('single: ' +singleMovingAverage);
        }
        totalMovingAverage += singleMovingAverage;
        this.clientCallbackProgress(totalMovingAverage);
        this.finalResults.push(totalMovingAverage);
        //console.log(totalMovingAverage);
    };


    /**
     * calculateStats method
     */
    downloadHttpConcurrentProgress.prototype.calculateStats = function () {
        //var a = this._progressResults['arrayProgressResults' + 1][this._progressResults['arrayProgressResults' + 1].length - 1];
        //var b = this._progressResults['arrayProgressResults' + 2][this._progressResults['arrayProgressResults' + 2].length - 1];
        //var c = this._progressResults['arrayProgressResults' + 3][this._progressResults['arrayProgressResults' + 3].length - 1];
        //var d = this._progressResults['arrayProgressResults' + 4][this._progressResults['arrayProgressResults' + 4].length - 1];
        //var e = this._progressResults['arrayProgressResults' + 5][this._progressResults['arrayProgressResults' + 5].length - 1];
        //var f = this._progressResults['arrayProgressResults' + 6][this._progressResults['arrayProgressResults' + 6].length - 1];
        ////console.log(a+b+c+d+e+f);
        //var total = (a+b+c+d+e+f);
        //if (isFinite(total)) {
        //    this.clientCallbackProgress(total);
        //    this.finalResults.push(total);
        //}

        //loop thru active tests to calculate totalMovingAverage
        var totalMovingAverage = 0;
        for (var i = 0; i < this.concurrentRuns; i++) {
            // get array size and loop thru size of moving average series or array length
            var id = this._testIndex -i;
            var arrayData = 'arrayProgressResults' + id;

            var lastElem = Math.min(this._progressResults[arrayData].length, this.movingAverage);
            if (lastElem > 0) {
                var singleMovingAverage = 0;
                for (var j = 1; j <= lastElem; j++) {
                    if (isFinite(this._progressResults[arrayData][this._progressResults[arrayData].length - j])) {
                        singleMovingAverage = singleMovingAverage + this._progressResults[arrayData][this._progressResults[arrayData].length - j];
                    }
                }
                singleMovingAverage = singleMovingAverage / lastElem;
                totalMovingAverage = totalMovingAverage + singleMovingAverage;
            }

        }
            this.clientCallbackProgress(totalMovingAverage);
            this.finalResults.push(totalMovingAverage);
    };

    /**
     * Start the test
     */
    downloadHttpConcurrentProgress.prototype.start = function () {
        if (!this._running) {
            return;
        }

        if (this.type === 'GET') {
            for (var g = 1; g <= this.concurrentRuns; g++) {
                this._testIndex++;
                this['arrayResults' + this._testIndex] = [];
                this.bandwidthData[g] = [];
                this._progressResults['arrayProgressResults' + this._testIndex] = [];
                var request = new window.xmlHttpRequest('GET', this.urls[g-1] + '&r=' + Math.random(), this.timeout, this.onTestComplete.bind(this), this.onTestProgress.bind(this),
                    this.onTestAbort.bind(this), this.onTestTimeout.bind(this), this.onTestError.bind(this));
                this._activeTests.push({
                    xhr: request,
                    testRun: this._testIndex
                });
                this.timestamp[g] = (Date.now());
                request.start(0, this._testIndex);
            }
            this._collectMovingAverages = true;
        }
        else {
            for (var p = 1; p <= this.concurrentRuns; p++) {
                this._testIndex++;
                this._activeTests.push(this._testIndex);
                this['testResults' + this._testIndex] = [];
                this.test.start(this.size, this._testIndex);
            }
        }
    };

    /**
     * Cancel the test
     */
    downloadHttpConcurrentProgress.prototype.abortAll = function () {
        this._running = false;
        for (var i = 0; i < this._activeTests.length; i++) {
            if (typeof(this._activeTests[i]) !== 'undefined') {
                this._activeTests[i].xhr._request.abort();
            }
        }
    };

    /**
     * Monitor testSeries
     */
    downloadHttpConcurrentProgress.prototype._monitor = function () {
      if ((Date.now() - this._beginTime) > (this.testLength)) {
        this._running = false;
        this._collectMovingAverages = false;
        clearInterval(this.interval);
          clearInterval(this.newinterval);
        if (this.finalResults && this.finalResults.length) {
            //console.log(this._progressResults['arrayProgressResults' + 1].join("\",\""));
            //console.log(this._progressResults['arrayProgressResults' + 2].join("\",\""));
            //console.log(this._progressResults['arrayProgressResults' + 3].join("\",\""));
            //console.log(this._progressResults['arrayProgressResults' + 4].join("\",\""));
            //console.log(this._progressResults['arrayProgressResults' + 5].join("\",\""));
            //console.log(this._progressResults['arrayProgressResults' + 6].join("\",\""));

          this.clientCallbackComplete(this.finalResults);
        } else {
          this.clientCallbackError('no measurements obtained');
        }
      this.abortAll();
      }
    };

    /**
     * reset test variables
     */
    downloadHttpConcurrentProgress.prototype.initiateTest = function(){
        this._testIndex = 0;
        this._results.length=0;
        this.finalResults.length=0;
        this._activeTests.length=0;
        this._progressResults = {};
        this._progressCount = 0;
        this._running = true;
        this.interval = null;
        this.start();
        var self = this;
        this.interval = setInterval(function () {
          self._monitor();
        }, 100);
    };

    window.downloadHttpConcurrentProgress = downloadHttpConcurrentProgress;
})();
(function() {
    'use strict';

    function smallFileSize(urls, size, threads, duration, intervalTimer, 
            callbackProgress, callbackComplete, callbackError, callbackAbort) {

        this.urls = urls;
        this.size = size;
        this.threads = threads;
        this.duration = duration;
        this.intervalTimer = intervalTimer;
        this.callbackProgress = callbackProgress;
        this.callbackComplete = callbackComplete;
        this.callbackError = callbackError;
        this.callbackAbort = callbackAbort;   
    }

    smallFileSize.prototype.initiateTest = function() {
        this.activeTests = [];
        this.totalBytesTransferred = 0;
        this.totalTime = [];

        this.downloadResults = [];
        this.timedOutReqCount = 0;

        // TODO items to be removed
        this.smaCount = 0;
        this.smaMean = 0;
        this.hasRampedUp = false;
        // Remove above items
        
        this.startTime = timer();
        this.start();
        this.intervalId = setInterval(this.monitor.bind(this), this.intervalTimer);
    }

    smallFileSize.prototype.start = function() {
        for (var i = 0; i < this.threads; i++) {
            // Calling the xmlhttprequest to create the http connection.
            var request = new window.xmlHttpRequest('GET', this.urls[i]+ this.size +  '&r=' + Math.random(), 
            this.duration, this.onTestComplete.bind(this), this.onTestProgress.bind(this),
            this.onTestAbort.bind(this), this.onTestTimeout.bind(this), this.onTestError.bind(this),
            null);
            request.start(0, i);
            this.activeTests.push({
                xhr: request,
            });
        }
    }

    smallFileSize.prototype.onTestComplete = function() {
        // TODO Needs to figure out what we need to do once the request is completed
        // Probably start another request 
        // Or end the test
    }

    smallFileSize.prototype.onTestProgress = function(event) {
        this.totalBytesTransferred += event.chunckLoaded;
    }

    smallFileSize.prototype.onTestAbort = function(event) {
        console.log("Request Aborted");
    }

    smallFileSize.prototype.onTestTimeout = function(event) {
        this.timedOutReqCount++;
        if (this.timedOutReqCount === this.threads) {
            this.stopTest();
        }
    }

    smallFileSize.prototype.onTestError = function(event) {
        this.callbackError(event)
    }

    smallFileSize.prototype.monitor = function() {
        if (testRunTime(this.startTime) > this.duration) {
            console.log("Triggered from monitor");
            this.stopTest();
            return;
        }

        if (this.totalBytesTransferred === 0) {
            return;
        }

        this.downloadResults.push({
            bytes : this.totalBytesTransferred,
            time : timer() - this.startTime
        });

        this.calculateSpeed();
    }

    smallFileSize.prototype.calculateSpeed = function() {
        this.curSpeed = this.calcIntervalSpeed();

        if (this.curSpeed === 0) {
            return
        }

        if (!this.hasRampedUp) {
            this.checkRampUp();
            this.callbackProgress(this.curSpeed);
            return;
        }
        // console.log("cur speed " +this.curSpeed);
        var val = simpleMovingAverage.call(this);
        this.callbackProgress(val);

    }

    smallFileSize.prototype.calcIntervalSpeed = function() {
        var dataLength = this.downloadResults.length;

        if (dataLength <= 2) {
            return 0;
        }

        var prevData = this.downloadResults[dataLength - 2];
        var curData = this.downloadResults[dataLength - 1];
        var bytes = curData.bytes - prevData.bytes;
        var time = curData.time - prevData.time;

        return calculateSpeedMbps(bytes, time);
    }

    smallFileSize.prototype.checkRampUp = function() {
        var val = this.curSpeed/this.prevSpeed;
        if (!isNaN(val) && Math.round(val) <= 1) {
            this.hasRampedUp = true;
            // debugger;
        }
        this.prevSpeed = this.curSpeed;
    }

    smallFileSize.prototype.stopTest = function() {

        if (this.intervalId) {
            clearInterval(this.intervalId);
        }

        abortAllRequests.call(this);
        this.callbackComplete({
            value: this.smaMean,
            arr: this.downloadResults
        });
    }

    window.smallFileSize = smallFileSize;

})();
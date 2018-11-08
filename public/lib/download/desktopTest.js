(function() {
    'use strict';

    function desktopTest(urls, size, threads, duration, intervalTimer, 
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

    desktopTest.prototype.initiateTest = function() {
        this.activeTests = [];
        this.totalBytesTransferred = [];
        this.totalTime = [];
        this.prevBytesTransferred = [];
        this.prevTime = [];
        this.downloadResults = [];
        this.timedOutReqCount = 0;

        // TODO items to be removed
        this.sma_count = 0;
        this.sma_mean = 0;
        // Remove above items
        
        this.startTime = timer();
        this.start();
        this.intervalId = setInterval(this.monitor.bind(this), this.intervalTimer);
    }

    desktopTest.prototype.start = function() {
        for (var i = 0; i < this.threads; i++) {

            // Setting timers and bytes download for each thread.
            this.totalBytesTransferred[i] = 0;
            this.totalTime[i] = 0;
            this.prevBytesTransferred[i] = 0;
            this.prevTime[i] = 0;

            // Calling the xmlhttprequest to create the http connection.
            var request = new window.xmlHttpRequest('GET', this.urls[i]+ this.size +  '&r=' + Math.random(), 
            this.duration, this.onTestComplete.bind(this), this.onTestProgress.bind(this),
            this.onTestAbort.bind(this), this.onTestTimeout.bind(this), this.onTestError.bind(this),
            null, false);
            request.start(0, i);
            this.activeTests.push({
                xhr: request,
            });
        }
    }

    desktopTest.prototype.onTestComplete = function() {
        // TODO Needs to figure out what we need to do once the request is completed
        // Probably start another request 
        // Or end the test
    }

    desktopTest.prototype.onTestProgress = function(event) {
        this.totalBytesTransferred[event.id] += event.chunckLoaded;
        this.totalTime[event.id] = event.totalTime;
    }

    desktopTest.prototype.onTestAbort = function() {
        console.log("Request Aborted");
    }

    desktopTest.prototype.onTestTimeout = function(event) {
        this.timedOutReqCount++;
        if (this.timedOutReqCount === this.threads) {
            this.stopTest();
        }
    }

    desktopTest.prototype.onTestError = function(event) {
        this.callbackError(event)
    }

    desktopTest.prototype.monitor = function() {
        if (testRunTime(this.startTime) > this.duration) {
            console.log("Triggered from monitor");
            this.stopTest();
            return;
        }

        this.calcIntervalSpeed();
    }

    desktopTest.prototype.calcIntervalSpeed = function() {
        this.cummulativeSpeed = 0
        for (var j = 0; j < this.threads; j++) {
            var bytesTransferred = this.totalBytesTransferred[j] - this.prevBytesTransferred[j];
            var time = this.totalTime[j] - this.prevTime[j];

            if (bytesTransferred !== 0 || time !== 0) {
                // console.log("Id" + j + " Bytes " +bytesTransferred + " time " +time);
                var speed = calculateSpeedMbps(bytesTransferred, time);
                this.cummulativeSpeed += speed;
                this.prevBytesTransferred[j] = this.totalBytesTransferred[j];
                this.prevTime[j] = this.totalTime[j];
            }

        }
        this.downloadResults.push(+this.cummulativeSpeed.toFixed(2));
        this.reportIntervalSpeed();
        // console.log("Total Speed " +totalSpeed);
    }

    desktopTest.prototype.reportIntervalSpeed = function() {
        if (this.downloadResults.length < 4) {
            this.callbackProgress(this.cummulativeSpeed);
            return;
        }
        this.callbackProgress(calcMovingAverage.call(this));
    }

    desktopTest.prototype.stopTest = function() {

        if (this.intervalId) {
            clearInterval(this.intervalId);
        }

        abortAllRequests.call(this);
        this.callbackComplete({
            value: this.sma_mean,
            arr: this.downloadResults
        });
    }

    window.desktopTest = desktopTest;

})();
(function () {

    function adaptiveDownload(url, size, prevDownloadSize, concurrentRuns, timeout, testLength, callbackComplete,
                              callbackProgress, callbackAbort, callbackTimeout, callbackError) {
        this.url = url;
        this.size = size;
        this.prevDownloadSize = prevDownloadSize;
        this.concurrentRuns = concurrentRuns;
        this.timeout = timeout;
        this.testLength = testLength;
        this.running = true;
        this.testIndex = 0;
        this.progressResults = {};
        //array holding active tests
        this.activeTests = [];
        this.trackingOnComplete = {};
        this.finalResults = [];
        this.progressCount = 0;
        this.callbackComplete = callbackComplete;
        this.callbackProgress = callbackProgress;
        this.callbackAbort = callbackAbort;
        this.callbackTimeout = callbackTimeout;
        this.callbackError = callbackError;
        this.firstrun = 0;
        this.connection = {};
    }

    adaptiveDownload.prototype.start = function () {
        if (!this.running) {
            return;
        }

        for (var i = 0; i < this.concurrentRuns; i++) {
            this.testIndex++;
            this.progressResults['arrayProgressResults' + this.testIndex] = [];
            var request = new window.xmlHttpRequest('GET', this.url + this.size + '&r=' + Math.random(), this.timeout, this.onTestComplete.bind(this),
                this.onTestProgress.bind(this), this.onTestAbort.bind(this), this.onTestTimeout.bind(this), this.onTestError.bind(this));
            this.activeTests.push({
                xhr: request,
                testRun: this.testIndex
            });
            request.start(0, this.testIndex);
        }

    };

    adaptiveDownload.prototype.onTestComplete = function (result) {

        if (!this.running) {
            return;
        }
        console.log('insideon test download adap' +this.finalResults.length);
        //if (this.firstrun === 0) {
        //    console.log('reached here');
        //    this.firstrun++;
        //    this.finalResults = [];
        //}

        if (this.running) {
            this.abortAll();
            this.timeout -= result.time;
            this.trackingOnComplete.timeout = this.timeout;
            console.log(this.timeout);
            var downloadSize = (this.timeout * result.loaded/result.time);
            //var downloadSize = this.size * 2;
            console.log('downloadSize: ' +downloadSize/1000000);
            console.log('prevSize: ' + this.prevDownloadSize/1000000);
            if (downloadSize > this.prevDownloadSize) {
                this.size = downloadSize;
                this.prevDownloadSize = downloadSize;
                this.trackingOnComplete.size = this.size;
                this.trackingOnComplete.prevDownloadSize = this.prevDownloadSize;
                this.trackingOnComplete.calculateResults = false;
                //this.trackingOnComplete.downloadData = this.finalResults;
                this.callbackComplete(this.trackingOnComplete);
                this.progressCount = 0;
            } else {
                this.abortAll();
                //console.log(this.progressResults['arrayProgressResults' + 1]);
                //console.log(this.progressResults['arrayProgressResults' + 2]);
                //console.log(this.progressResults['arrayProgressResults' + 3]);
                //console.log(this.progressResults['arrayProgressResults' + 4]);
                this.trackingOnComplete.calculateResults = true;
                //this.trackingOnComplete.finalResults = this.finalResults;
                this.callbackComplete(this.trackingOnComplete);
            }
        }

    };

    adaptiveDownload.prototype.onTestProgress = function (result) {
        this.progressCount++;
        this.progressResults['arrayProgressResults' + result.id].push({
            loaded: result.loaded,
            time: result.time
        });

        var len1 = this.progressResults['arrayProgressResults' + 1].length;
        var len2 = this.progressResults['arrayProgressResults' + 2].length;
        var len3 = this.progressResults['arrayProgressResults' + 3].length;
        var len4 = this.progressResults['arrayProgressResults' + 4].length;
        //var len5 = this.progressResults['arrayProgressResults' + 5].length;
        //var len6 = this.progressResults['arrayProgressResults' + 6].length;

        if (len1 > 0 && len2 > 0 && len3 > 0 && len4 > 0) {
            var b = (this.progressResults['arrayProgressResults' + 1][len1-1].loaded) * 8 * 1000;
            var c = (this.progressResults['arrayProgressResults' + 1][len1-1].time) * 1000000;
            var d = (this.progressResults['arrayProgressResults' + 2][len2-1].loaded) * 8 * 1000;
            var e = (this.progressResults['arrayProgressResults' + 2][len2-1].time) * 1000000;
            var f = (this.progressResults['arrayProgressResults' + 3][len3-1].loaded) * 8 * 1000;
            var g = (this.progressResults['arrayProgressResults' + 3][len3-1].time) * 1000000;
            var h = (this.progressResults['arrayProgressResults' + 4][len4-1].loaded) * 8 * 1000;
            var i = (this.progressResults['arrayProgressResults' + 4][len4-1].time) * 1000000;
            //var j = (this.progressResults['arrayProgressResults' + 5][len5-1].loaded) * 8 * 1000;
            //var k = (this.progressResults['arrayProgressResults' + 5][len5-1].time) * 1000000;
            //var l = (this.progressResults['arrayProgressResults' + 6][len6-1].loaded) * 8 * 1000;
            //var m = (this.progressResults['arrayProgressResults' + 6][len6-1].time) * 1000000;
        }

        //if (this.progressCount > 200) {
        //
        //    if (this.running) {
        //        this.abortAll();
        //        console.log('time: ' +result.time);
        //        this.timeout -= result.time;
        //        this.trackingOnComplete.timeout = this.timeout;
        //        this.size = this.size * 1.25;
        //        this.trackingOnComplete.size = this.size;
        //        this.trackingOnComplete.calculateResults = false;
        //        this.callbackComplete(this.trackingOnComplete);
        //        this.progressCount = 0;
        //        //var downloadSize = this.timeout * result.loaded/result.time;
        //        console.log('downloadSize: ' +downloadSize);
        //        //if (downloadSize > this.prevDownloadSize) {
        //        //    this.size = downloadSize;
        //        //    this.prevDownloadSize = downloadSize;
        //        //    this.trackingOnComplete.size = this.size;
        //        //    this.trackingOnComplete.calculateResults = false;
        //        //    this.callbackComplete(this.trackingOnComplete);
        //        //    this.progressCount = 0;
        //        //}
        //    }
        //}
        //console.log('arrayProgressResults' + result.id);
        //if (this.progressResults['arrayProgressResults' + 1].length > 120 ) {
        //    this.abortAll();
        //    this.trackingOnComplete.calculateResults = true;
        //    this.trackingOnComplete.finalResults = this.finalResults;
        //    this.callbackComplete(this.trackingOnComplete);
        //}
        //console.log(this.progressResults['arrayProgressResults' + 1]);
        //console.log(this.progressResults['arrayProgressResults' + 2]);
        //console.log(this.progressResults['arrayProgressResults' + 3]);
        //console.log(this.progressResults['arrayProgressResults' + 4]);
        //var len1 = this.progressResults['arrayProgressResults' + 1].length;
        //console.log('len1: ' +len1);
        //var b = (this.progressResults['arrayProgressResults' + 1][len1-1].loaded) * 8 * 1000;
        //var c = (this.progressResults['arrayProgressResults' + 1][len1-1].time) * 1000000;
        //var len2 = this.progressResults['arrayProgressResults' + 2].length;
        //console.log('len2: ' +len2);
        //var d = (this.progressResults['arrayProgressResults' + 2][len2-1].loaded) * 8 * 1000;
        //var e = (this.progressResults['arrayProgressResults' + 2][len2-1].time) * 1000000;
        //var len3 = this.progressResults['arrayProgressResults' + 3].length;
        //console.log('len3: ' +len3);
        //var f = (this.progressResults['arrayProgressResults' + 3][len3-1].loaded) * 8 * 1000;
        //var g = (this.progressResults['arrayProgressResults' + 3][len3-1].time) * 1000000;
        //var len4 = this.progressResults['arrayProgressResults' + 4].length;
        //console.log('len4: ' +len4);
        //var h = (this.progressResults['arrayProgressResults' + 4][len4-1].loaded) * 8 * 1000;
        //var i = (this.progressResults['arrayProgressResults' + 4][len4-1].time) * 1000000;
        //var len5 = this.progressResults['arrayProgressResults' + 5].length;
        //var j = (this.progressResults['arrayProgressResults' + 5][len5-1].loaded) * 8 * 1000;
        //var k = (this.progressResults['arrayProgressResults' + 5][len5-1].time) * 1000000;
        //var len6 = this.progressResults['arrayProgressResults' + 6].length;
        //var l = (this.progressResults['arrayProgressResults' + 6][len6-1].loaded) * 8 * 1000;
        //var m = (this.progressResults['arrayProgressResults' + 6][len6-1].time) * 1000000;
        //console.log(b/c);
        //console.log(d/e);
        //console.log(d/e);
        //console.log(h/i);
        var total = (b/c) + (d/e) + (f/g) + (h/i);
        if (isFinite(total)) {
            this.finalResults.push(total);
            this.callbackProgress(total);
        }
        //console.log('total: ' + total);


    };

    adaptiveDownload.prototype.onTestError = function (result) {
        if (this.running) {
            this.callbackError(result);
            this.running = false;
        }
    };

    adaptiveDownload.prototype.onTestAbort = function () {
        if (this.running) {

            this.abortAll();
            //console.log(this.progressResults['arrayProgressResults' + 1]);
            //console.log(this.progressResults['arrayProgressResults' + 2]);
            //console.log(this.progressResults['arrayProgressResults' + 3]);
            //console.log(this.progressResults['arrayProgressResults' + 4]);
            this.trackingOnComplete.calculateResults = true;
            //this.trackingOnComplete.finalResults = this.finalResults;
            this.callbackComplete(this.trackingOnComplete);
            //console.log('on TestAbort');
            //if (this.finalResults && this.finalResults.length) {
            //    this.callbackComplete(this.finalResults);
            //} else {
            //    this.callbackError('no measurements obtained');
            //}
            //this.clientCallbackError('OnTestAbort');
            this.running = false;
        }
    };

    adaptiveDownload.prototype.onTestTimeout = function () {
        if (this.running) {
            console.log('on TestTimeout');
            if (this.finalResults && this.finalResults.length) {
                this.callbackComplete(this.finalResults);
            } else {
                this.callbackError('no measurements obtained');
            }
            //this.clientCallbackError('onTestTimeout');
            this.running = false;
        }
    };

    adaptiveDownload.prototype.abortAll = function () {
        this.running = false;
        for (var j = 0; j < this.activeTests.length; j++) {
            if (typeof(this.activeTests[j]) !== 'undefined') {
                this.activeTests[j].xhr._request.abort();
            }
        }
    };

    window.adaptiveDownload = adaptiveDownload;

})();

(function() {

    function downloadProgress(threads, urls, callback) {
        this.threads = 20;
        this.active_tests = [];
        this.total_time = 0;
        this.download_speed_array = [];
        this.urls = urls;
        this.size = 20000000;
        this.callback = callback;

        this.results = [];

        // TODO need to delete
        this.alpha = 0.1;
        this.mean = 0;
        this.variance = 0;
        this.beta = this.getBeta();

        // this.multiplier = [1, 1.2, 1.3, 1.4, 1.5, 1.6]

        // simple moving average values
        this.sma_count = 0;
        this.sma_mean = 0;
    }
    // http://atlanta.speed.googlefiber.net:3022/download?size=10000000
    downloadProgress.prototype.initiateTest = function() {
        this.total_bytes_downloaded = 0;
        this.prev_total_bytes = 0;
        this.prev_total_time = 0;
        this.test_start_time = timer();
        this.test_time = Date.now();
        this.start();
        // this.interval = setInterval(this.monitor.bind(this), 200);
        this.sma_interval = setInterval(this.smaMonitor.bind(this), 100);
        // var self = this;
        // this.interval = setInterval(function () {
        //   self.monitor();
        // }, 1000);
    }

    downloadProgress.prototype.start = function() {
        // console.log("Test Start Time ************* " +this.test_start_time * (1 + i/10));
        for (var i = 0; i < this.threads; i++) {
            // this.size = this.size * (1 + i/10);
            var xmlhttp = new window.xmlhttp(this.onProgress.bind(this), this.onLoad.bind(this),
            this.urls[i], this.test_start_time, this.size);
            xmlhttp.start(i);
            this.active_tests.push({
                xhr: xmlhttp,
            });
        }
    }

    downloadProgress.prototype.onProgress = function(event) {
        // console.log(event);
        if (event.chunk_loaded < 0) {
            console.log('@@@@@@@@@@@@@@@@@@ Got Negative Bytes @@@@@@@@@@@@@@@@@@ ' +event.chunk_loaded);
            return;
        }
        this.total_bytes_downloaded += event.chunk_loaded;
        this.total_time += event.chunk_loaded_time;
        this.time = event.total_time;
        // this.cur_time = timer();
        // var time = this.cur_time - this.prev_total_time;
        // this.prev_total_time = this.cur_time;
        // console.log('total bytes ' +this.total_bytes_downloaded + ' time ' +this.total_time);
        // this.showSpeed();
        // this.runMovingAverage();
    }

    downloadProgress.prototype.onLoad = function(event) {

        // this.total_bytes_downloaded += event.loaded;
        // console.log('This total bytes download on load event: ' +this.total_bytes_downloaded + ' time ' +this.total_time);
        // this.abortAll();
        // console.log("Reached here");
        // this.threads = 1;
        // this.start();
    }

    downloadProgress.prototype.showSpeed = function() {
        // console.log('Total Bytes ' +this.total_bytes_downloaded);
        this.avgSpeed = calSpeedInMbps(this.total_bytes_downloaded, this.time);
        this.download_speed_array.push(this.avgSpeed);
        
        // console.log('*********** Speed  ********* ' +(speed) + ' bytes ' +this.total_bytes_downloaded + ' time ' +time);

        if ((timer() - this.test_start_time) > 15000) {
            this.abortAll();
        }

        this.callback(this.avgSpeed);

    }

    downloadProgress.prototype.monitor = function() {

        if ((timer() - this.test_start_time) > 15500) {
            console.log(this.download_speed_array);
            this.endTest();
            // this.abortAll();
            return;
        }

        var cur_bytes = this.total_bytes_downloaded;
        var cur_time = timer();
        var bytes = cur_bytes - this.prev_total_bytes;
        var time = 0;
        if (this.prev_total_time === 0) {
            time = cur_time - this.test_start_time;
        } else {
            time = cur_time - this.prev_total_time;
        }
         
        this.prev_total_bytes = cur_bytes;
        this.prev_total_time = cur_time;
        if (bytes === 0 || time === 0) {
            console.log('*********** Something went wrong ***********');
            console.log(this.total_time);
            console.log(this.total_bytes_downloaded);
            return;
        }
        var speed = calSpeedInMbps(bytes, time);
        this.download_speed_array.push(speed);
        console.log('Total speed after one sec ' +speed + ' in seconds ' +(window.performance.now() - this.test_start_time) + " Actual TIme " +time + " Bytes " +bytes);
    }

    downloadProgress.prototype.abortAll = function() {
        for (var i = 0; i < this.active_tests.length; i++) {
            if (typeof(this.active_tests[i]) !== 'undefined') {
                this.active_tests[i].xhr.request.abort();
            }
        }
    }

    downloadProgress.prototype.endTest = function() {
        // clearInterval(this.interval);
        this.abortAll();
        if (this.download_speed_array && this.download_speed_array.length) {
            var arr = this.download_speed_array;
            //TODO needs to remove the above line not needed
            // this.download_speed_array = this.download_speed_array.slice(3, this.download_speed_array.length);
            console.log(this.download_speed_array);
            var sum = this.download_speed_array.reduce(function (a, b) {
                return a + b;
            }, 0);
            var mean = sum / this.download_speed_array.length;
            console.log('mean: ' +mean);
            // this.clientCallbackComplete(this.downloadResults);
        } else {
            this.clientCallbackError('no measurements obtained');
        }
        // this.abortAll();
      };




    function calSpeedInMbps(bytes, ms) {
        return bytes / (125 * ms);
    }

    function setInterval(fname, time) {
        return window.setInterval.apply(this.window, arguments);
    }

    function timer() {
        return window.performance.now();
    }

    // ***********************************************
    // simple moving average *******************************************************************************

    downloadProgress.prototype.smaMonitor = function() {
        if ((timer() - this.test_start_time) > 15000) {
            clearInterval(this.sma_interval);
            this.endTest();
            // this.abortAll();
            return;
        }
        if (this.total_bytes_downloaded === 0) {
            return;
        }
        this.results.push({
            bytes : this.total_bytes_downloaded,
            time : timer() - this.test_start_time
        });
        // console.log(this.results);
        // debugger;
        this.simpleMovingAverage();
    }

    downloadProgress.prototype.calculateChunkSpeed = function() {
        var data_length = this.results.length;
        var prev_data = this.results[data_length - 2];
        var cur_data = this.results[data_length - 1];
        var bytes = cur_data.bytes - prev_data.bytes;
        var time = cur_data.time - prev_data.time;
        return calSpeedInMbps(bytes, time);
    }

    downloadProgress.prototype.simpleMovingAverage = function() {

        var data_length = this.results.length;
        if (data_length === 0) {
            return 0;
        }

        if (data_length <= 25) {
            this.callback(calSpeedInMbps(this.results[data_length - 1].bytes, this.results[data_length - 1].time));
            return;
        }

        var newValue = this.calculateChunkSpeed();
        // console.log('Chunk Speed ' +newValue);
        if (newValue === 0) {
            return;
        }
        this.download_speed_array.push(newValue);
        this.sma_count++;
        const differential = (newValue - this.sma_mean) / this.sma_count
        const newMean = this.sma_mean + differential;
        this.sma_mean = newMean;
        // console.log('Mean: ' +this.sma_mean);
        // this.bufferSize();
        this.callback(this.sma_mean);
    }

    downloadProgress.prototype.chopOffAverage = function() {
        
    }

    downloadProgress.prototype.bufferSize = function() {
        var size = (Date.now() - this.test_time)/6;
        // console.log('Cal Buf Size ' +size);
    }

    // Relate to the moving average

    downloadProgress.prototype.runMovingAverage = function() {
        var speed = calSpeedInMbps(this.total_bytes_downloaded, this.time);
        // console.log(speed);
        this.ema(speed);
    }

    downloadProgress.prototype.getBeta = function() {
        return 1 - this.alpha;
    }

    downloadProgress.prototype.ema = function(newValue) {
        const redistributedMean = this.beta * this.mean
        const meanIncrement = this.alpha * newValue
        const newMean = redistributedMean + meanIncrement
        const varianceIncrement = this.alpha * (newValue - this.mean)**2
        const newVariance = this.beta * (this.variance + varianceIncrement)
        this.mean = newMean
        this.variance = newVariance
        console.log('***************** Stats ***************** ' + this.mean + ' variance ' +this.variance + ' Average speed ' +this.avgSpeed);
    }

    

    window.downloadProgress = downloadProgress;
})();
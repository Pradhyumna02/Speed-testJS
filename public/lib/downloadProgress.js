(function() {

    function downloadProgress(threads, urls, callback) {
        this.threads = threads;
        this.active_tests = [];
        this.total_time = 0;
        this.download_speed_array = [];
        this.urls = urls;
        this.size = 10000000;
        this.callback = callback;
    }

    downloadProgress.prototype.initiateTest = function() {
        this.total_bytes_downloaded = 0;
        this.prev_total_bytes = 0;
        this.prev_total_time = 0;
        this.start();
        this.interval = setInterval(this.monitor.bind(this), 1000);
        // var self = this;
        // this.interval = setInterval(function () {
        //   self.monitor();
        // }, 1000);
    }

    downloadProgress.prototype.start = function() {
        this.test_start_time = timer();
        var time = this.test_start_time;
        console.log("Test Start Time ************* " +this.test_start_time);
        for (var i = 0; i < this.threads; i++) {
            console.log('TIME: ' +this.test_start_time);
            var xmlhttp = new window.xmlhttp(this.onProgress.bind(this), this.onLoad.bind(this),
            this.urls[i]+ this.size +  '&r=' + Math.random(), time);
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
        // this.cur_time = timer();
        // var time = this.cur_time - this.prev_total_time;
        // this.prev_total_time = this.cur_time;
        // console.log('total bytes ' +this.total_bytes_downloaded + ' time ' +this.total_time);
        // this.showSpeed();
    }

    downloadProgress.prototype.onLoad = function(event) {
        // this.total_bytes_downloaded += event.loaded;
        // console.log('This total bytes download on load event: ' +this.total_bytes_downloaded + ' time ' +this.total_time);
        // this.abortAll();
    }

    downloadProgress.prototype.showSpeed = function() {
        var time = timer() - this.test_start_time;
        // console.log('Total Bytes ' +this.total_bytes_downloaded);
        var speed = calSpeedInMbps(this.total_bytes_downloaded, time);
        this.download_speed_array.push(speed);
        
        // console.log('*********** Speed  ********* ' +(speed) + ' bytes ' +this.total_bytes_downloaded + ' time ' +time);
        // if (speed > 550) {
        //     console.log('*********** Speed  ********* ' +(speed) + ' bytes ' +this.total_bytes_downloaded + ' time ' +this.total_time);
        // }

        if ((timer() - this.test_start_time) > 15000) {
            this.abortAll();
        }

        this.callback(speed);

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

    downloadProgress.prototype.run_monitor = function() {
        var time = timer() - this.test_start_time;
    }

    downloadProgress.prototype.endTest = function() {
        clearInterval(this.interval);
        this.abortAll();
        if (this.download_speed_array && this.download_speed_array.length) {
            var arr = this.download_speed_array;
            //TODO needs to remove the above line not needed
            this.download_speed_array = this.download_speed_array.slice(3, this.download_speed_array.length);
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

    

    window.downloadProgress = downloadProgress;
})();
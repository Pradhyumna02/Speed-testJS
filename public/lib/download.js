(function() {

    function download(threads, urls) {
        this.threads = threads;         // determines the number of http connections we are creating for a test.
        this.urls = urls
        this.active_tests = [];         // holds all the active thread requests.


        this.cur_download_bytes = []     // current downloaded bytes for each connection after a sec.
        this.prev_download_bytes = []    //  previous download bytes for each connection before a sec.
        this.cur_total_time = []         // total time taken for a connection while caluclating the bytes for a sec.
        this.prev_total_time = []
        this.final_array = []; // TODO remove or rename
        this.size = 1000000;
    }

    download.prototype.onLoad = function(event) {
        // console.log(event);
        // console.log('Got after time in ms ' +(window.performance.now() - this.download_start_time)); 
        this.cur_download_bytes[event.id] += event.bytes_downloaded;
        this.cur_total_time[event.id] += event.total_time;

        // console.log(this.cur_download_bytes[event.id])
    }

    download.prototype.start = function() {
        for (var i = 0; i < this.threads; i++) {

            this.cur_download_bytes[i] = 0;     // current downloaded bytes for each connection after a sec.
            this.prev_download_bytes[i] = 0;    //  previous download bytes for each connection before a sec.
            this.cur_total_time[i] = 0;         // total time taken for a connection while caluclating the bytes for a sec.
            this.prev_total_time[i] = 0;

            var http = new window.http(this.onLoad.bind(this), this.urls[i]+ this.size +  '&r=' + Math.random());
            http.start(i);
            this.active_tests.push({
                xhr: http,
            });
        }
    }

    download.prototype.monitor = function() {

        if (window.performance.now() - this.download_start_time > 16000) {
            clearInterval(this.interval);
            this.endTest();
            return;
        }

        var cummulative_bandwidth = 0;
        for (var j = 0; j < this.threads; j++) {
            var individual_bandwidth = 0;
            var individual_time = 0;
            individual_bandwidth = this.cur_download_bytes[j] - this.prev_download_bytes[j];
            individual_time = this.cur_total_time[j] - this.prev_total_time[j];

            if (individual_bandwidth !==0 && individual_time !==0) { // todo need to check for postive
                this.prev_total_time[j] = this.cur_total_time[j];
                this.prev_download_bytes[j] = this.cur_download_bytes[j];
    
                var speed = calculateSpeedInMbps(individual_bandwidth, individual_time);
                cummulative_bandwidth += speed;
            }

        }
        this.final_array.push(cummulative_bandwidth);
        console.log('Total speed after one sec ' +cummulative_bandwidth + ' in seconds ' +(window.performance.now() - this.download_start_time));
    }

    download.prototype.endTest = function() {
        this.abortAll();
        if (this.final_array && this.final_array.length) {
            //TODO needs to remove the above line not needed
            console.log(this.final_array);
            var arr = this.final_array.slice(3, this.final_array.length);
            console.log(arr);
            var sum = arr.reduce(function (a, b) {
                return a + b;
            }, 0);
            var mean = sum / arr.length;
            console.log('mean: ' +mean);
        } else {
            this.clientCallbackError('no measurements obtained');
        }
    }

    download.prototype.abortAll = function() {
        for (var i = 0; i < this.active_tests.length; i++) {
            if (typeof(this.active_tests[i]) !== 'undefined') {
                this.active_tests[i].xhr.request.abort();
            }
        }
    }

   function calculateSpeedInMbps(bytes, ms) {
       return bytes / (125 * ms);
    }
    
    download.prototype.initiateTest = function() {
        this.start();
        this.download_start_time = window.performance.now();
         var self = this;
        this.interval = setInterval(function () {
          self.monitor();
        }, 1000);
    }

    window.download = download;

})();
(function() {
    
        function downloadProgress1(threads) {
            this.threads = threads;
            this.active_tests = [];
            this.total_time = 0;
            this.download_speed_array = [];
            this.cur_download_bytes = [];
            this.prev_download_bytes = [];
            this.cur_total_time = [];
            this.prev_total_time = [];
        }
    
        downloadProgress1.prototype.initiateTest = function() {
            // this.total_bytes_downloaded = 0;
            this.start();
            this.download_start_time = timer();
            var self = this;
            this.test_start_time = timer();
            this.interval = setInterval(function () {
              self.monitor();
            }, 250);
        }
    
        downloadProgress1.prototype.start = function() {
            for (var i = 0; i < this.threads; i++) {

                this.cur_download_bytes[i] = 0;     // current downloaded bytes for each connection after a sec.
                this.prev_download_bytes[i] = 0;    //  previous download bytes for each connection before a sec.
                this.cur_total_time[i] = 0;         // total time taken for a connection while caluclating the bytes for a sec.
                this.prev_total_time[i] = 0;

                var xmlhttp = new window.xmlhttp(this.onProgress.bind(this), this.onLoad.bind(this));
                xmlhttp.start(i);
                this.active_tests.push({
                    xhr: xmlhttp,
                });
            }
        }
    
        downloadProgress1.prototype.onProgress = function(event) {
            // console.log(event);
            if (event.chunk_loaded < 0) {
                console.log('@@@@@@@@@@@@@@@@@@ Got Negative Bytes @@@@@@@@@@@@@@@@@@ ' +event.chunk_loaded);
                return;
            }
            this.cur_download_bytes[event.id] += event.chunk_loaded;
            this.cur_total_time[event.id] += event.chunk_loaded_time;
            // console.log('total bytes ' +this.total_bytes_downloaded + ' time ' +this.total_time);
            // this.monitor();
        }
    
        downloadProgress1.prototype.onLoad = function(event) {
            // this.total_bytes_downloaded += event.loaded;
            // console.log('This total bytes download on load event: ' +this.total_bytes_downloaded + ' time ' +this.total_time);
            // this.abortAll();
        }

        downloadProgress1.prototype.monitor = function() {
            
            if (window.performance.now() - this.download_start_time > 15000) {
                clearInterval(this.interval);
                this.abortAll();
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
                
                    var speed = calSpeedInMbps(individual_bandwidth, individual_time);
                    cummulative_bandwidth += speed;
                }
            
            }
            // this.final_array.push(cummulative_bandwidth);
            console.log('Total speed after one sec ' +cummulative_bandwidth + ' in seconds ' +(window.performance.now() - this.download_start_time));
        }
    
        downloadProgress1.prototype.showSpeed = function() {
            var total_bytes = 0;
            for (var j = 0; j < threads; j++) {
                var bytes = this.total_bytes_downloaded[j];
                var time = this.total_time[j];
                total_bytes += bytes;
            }



            // console.log('Total Bytes ' +this.total_bytes_downloaded);
            var speed = calSpeedInMbps(this.total_bytes_downloaded, this.total_time);
            this.download_speed_array.push(speed);
            
            // console.log('*********** Speed  ********* ' +(speed * this.threads) + ' bytes ' +this.total_bytes_downloaded + ' time ' +this.total_time);
            if ((speed * this.threads) > 500) {
                console.log('Value: ' +speed)
                console.log('*********** Speed  ********* ' +(speed * this.threads) + ' bytes ' +this.total_bytes_downloaded + ' time ' +this.total_time);
            }
    
            if ((timer() - this.test_start_time) > 15000) {
                this.abortAll();
            }
    
        }
    
        downloadProgress1.prototype.abortAll = function() {
            // console.log('After on load event total bytes ' +this.total_bytes_downloaded + ' time ' +this.total_time);
            // console.log('#################################');
            console.log(this.download_speed_array);
            for (var i = 0; i < this.active_tests.length; i++) {
                if (typeof(this.active_tests[i]) !== 'undefined') {
                    this.active_tests[i].xhr.request.abort();
                }
            }
        }
    
        function calSpeedInMbps(bytes, ms) {
            return bytes / (125 * ms);
        }
    
        function timer() {
            return window.performance.now();
        }
    
        
    
        window.downloadProgress1 = downloadProgress1;
    })();
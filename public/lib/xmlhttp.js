(function() {
    'use strict';

    function xmlhttp(callbackOnProgress, callbackOnLoad, url, downloadStartTime) {
        this.id = null;
        this.request = null;
        this.callbackOnProgress = callbackOnProgress;
        this.callbackOnLoad = callbackOnLoad;
        this.url = url;
        this.download_start_time = downloadStartTime;
    }

    xmlhttp.prototype.initiateRequest = function() {
        if (this.request === null) {
            this.request = new XMLHttpRequest();
            this.request.onloadstart = this.handleLoadstart.bind(this);
            this.request.onload = this.handleLoad.bind(this);
            this.request.onprogress = this.handleOnProgress.bind(this);
            this.request.onloadend = this.handleLoadEnd.bind(this);
        }
    }

    xmlhttp.prototype.sendRequest = function() {
        this.request.open("GET", this.url);
        // this.request.setRequestHeader('Range', bytes);  // TODO add bytes configurable
        this.request.send(null);
    }

    xmlhttp.prototype.handleLoadstart = function() {
        this.start_time =  timer();
        this.prev_time = this.start_time;
// console.log("***** Actual Start Time from Xml HTTP ******" +this.s);
        // setting the variables here because when we reuse the connection with the new size
        // we need to reset these variables
        this.prev_load = 0;
        this.progressCount = 0;
        // this.prev_time = 0;
    }

    xmlhttp.prototype.handleLoad = function(event) {
        if (!event.lengthComputable) {
            // console.log(this.request.response.size);
            // console.log(event);
            // console.log(timer() - this.start_time);
            // this.sendRequest();
            this.callbackOnLoad({
                loaded: event.loaded
            });
        }
    }

    xmlhttp.prototype.handleOnProgress = function(event) {
        if (!event.lengthComputable) {

            this.progressCount++;
            var cur_time = timer();
            var chunk_loaded = event.loaded - this.prev_load;
            
            var chunk_loaded_time = cur_time - this.prev_time;
            this.prev_load = event.loaded;
            this.prev_time = cur_time;

            // if (!(this.progressCount > 1)) {
            //     return;
            // }

            // if (event.loaded === 1000000) {
            //     // this.url = "http://69.252.86.198:5020/api/downloads?bufferSize=5000000";
            //     this.sendRequest();
            // }

            // console.log('chunk loaded ' +chunk_loaded);
            this.callbackOnProgress({
                id: this.id,
                loaded: event.loaded,
                chunk_loaded: chunk_loaded,
                chunk_loaded_time: chunk_loaded_time
            });
        }
    }

    xmlhttp.prototype.handleLoadEnd = function() {
        // console.log((timer() - this.download_start_time));
        if ((timer() - this.download_start_time) > 15500) {
           return; 
        }
        this.sendRequest();
    }

    function timer() {
        return window.performance.now()
    }

    xmlhttp.prototype.start = function(id) {
        this.initiateRequest();
        this.id = id;
        this.sendRequest();
    }

    window.xmlhttp = xmlhttp;

})();
(function() {
    'use strict';

    function httpget(callbackOnProgress) {
        this.id = null;
        this.request = null;
        this.callbackOnProgress = callbackOnProgress;
        // this.callbackOnLoad = callbackOnLoad;
    }

    httpget.prototype.initiateRequest = function() {
        if (this.request === null) {
            this.request = new XMLHttpRequest();
            this.request.onloadstart = this.handleLoadstart.bind(this);
            this.request.onload = this.handleLoad.bind(this);
            this.request.onprogress = this.handleOnProgress.bind(this);
        }
    }

    httpget.prototype.sendRequest = function() {
        this.request.open("GET", this.url, true);
        // this.request.setRequestHeader('Range', bytes);  // TODO add bytes configurable
        this.request.send(null);
    }

    httpget.prototype.handleLoadstart = function() {
        this.start_time =  timer();
        this.prev_time = this.start_time;

        // setting the variables here because when we reuse the connection with the new size
        // we need to reset these variables
        this.prev_load = 0;
        this.progressCount = 0;
        // this.prev_time = 0;
        console.log('***************** Triggered when startedt a new one *****************')
    }

    httpget.prototype.handleLoad = function(event) {
        if (!event.lengthComputable) {
            console.log(event);
            // console.log(timer() - this.start_time);
            // this.sendRequest();
            // this.callbackOnLoad({
            //     loaded: event.loaded
            // });
        }
    }

    httpget.prototype.handleOnProgress = function(event) {
        this.progressCount++;
        if (!event.lengthComputable) {
            console.log(event);
            var cur_time = timer();
            var chunk_loaded = event.loaded - this.prev_load;
            var chunk_loaded_time = cur_time - this.prev_time;
            this.prev_load = event.loaded;
            this.prev_time = cur_time;

            var speed = calSpeedInMbps(chunk_loaded, chunk_loaded_time);
            var loaded_speed = calSpeedInMbps(event.loaded, (cur_time - this.start_time));

            if (!(this.progressCount > 1)) {
                console.log('Inside this');
                console.log(chunk_loaded_time);
                return;
            }

            // console.log(loaded_speed);
            this.callbackOnProgress({
                id: this.id,
                speed: speed,
                loaded_speed: loaded_speed,
                chunk_loaded: chunk_loaded,
                loaded: event.loaded,
                chunk_loaded_time: chunk_loaded_time
            });

            // console.log('Actual timer ' +(cur_time - this.start_time));
            // console.log('chunk loaded ' +chunk_loaded);
            // this.callbackOnProgress({
            //     id: this.id,
            //     loaded: event.loaded,
            //     chunk_loaded: chunk_loaded,
            //     chunk_loaded_time: chunk_loaded_time
            // });
        }
    }

    function timer() {
        return window.performance.now()
    }

    function calSpeedInMbps(bytes, ms) {
        return bytes / (125 * ms);
    }

    httpget.prototype.start = function(id) {
        this.initiateRequest();
        this.id = id;
        this.url = "http://69.252.86.198:5020/api/downloads?bufferSize=1000000";
        this.sendRequest();
    }

    window.httpget = httpget;

})();
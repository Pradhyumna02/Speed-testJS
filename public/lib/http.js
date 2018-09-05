(function() {
    'use strict';

    function http(callbackOnLoad, url) {
        this.id = null;                                             // id of the rquest
        this.request = null;                                       // has information of the request
        this.url = url; 
        this.total_bytes_downloaded = 0;                            // total bytes downloaded for each request
        this.callbackOnLoad = callbackOnLoad;
        this.count = 0;
    }

    http.prototype.initiateRequest = function() {
        if (this.request === null) {
            this.request = new XMLHttpRequest();
            this.request.onloadstart = this.handleLoadstart.bind(this);
            this.request.onload = this.handleLoad.bind(this);
            // this.request.onreadystatechange = this.handleReadyStateChange.bind(this);
        } 
    }

    http.prototype.handleLoadstart = function() {
        this.start_time = this.timer();
        // console.log(' ######### start time ########## ' +this.start_time + ' for id: ' +this.id);
    }

    // http.prototype.handleLoad = function(response) {
    //     if (response.lengthComputable) {
    //         this.count++;
    //         var onload_end_time = window.performance.now();
    //         this.total_bytes_downloaded += response.loaded;
    //         var bytes_downloaded = response.loaded;
    //         var download_speed = bytes_downloaded / ((onload_end_time - this.start_time) * 125);
    //         console.log(' ######### end time ########## ' +onload_end_time + ' for id: ' +this.id);
    //         // console.log('download speed ' +download_speed + ' in ' +((onload_end_time - this.start_time)/1000) + ' for ' +this.id);
    //         if (this.count < 10) {
    //             this.sendRequest('bytes=1000001-3000000');
    //         }
    //         this.callbackOnLoad({
    //             id: this.id,
    //             speed: download_speed
    //         });
    //     }
    // }

    http.prototype.handleLoad = function(event) {
        if (!event.lengthComputable) {
            this.count++;
            var total_time = this.timer() - this.start_time;
            this.total_bytes_downloaded += event.loaded;
            this.sendRequest();
            // if (this.count < 40) {
            //     this.sendRequest('bytes=1000001-5000000');
            // } else {
            //     console.log('id: ' + this.id + ' ' +this.total_bytes_downloaded);
            // }
            this.callbackOnLoad({
                id: this.id,
                bytes_downloaded: event.loaded,
                total_time: total_time,
                total_bytes: this.total_bytes_downloaded // not needed remove it
            });
        }
    }

    http.prototype.sendRequest = function(bytes) {
        this.request.open("GET", this.url, true);
        // this.request.setRequestHeader('Range', bytes);  // TODO add bytes configurable
        this.request.send(null);
    }

    http.prototype.timer = function() {
        return window.performance.now()
    }

    http.prototype.start = function(id) {
        this.initiateRequest();
        this.id = id;
        // this.url = "http://96.116.165.235:5020/download?bufferSize=230483949";
        // this.url = "http://69.252.86.198:5020/api/downloads?bufferSize=2000000";
        this.sendRequest('bytes=1-1000000');
    }

    // http.prototype.handleReadyStateChange = function() {

    // }

    window.http = http;
})();

// function callXhr() {
//     var http = new XMLHttpRequest();
//     var startTime = window.performance.now();
//     var handleLoadStarTime = window.performance.now();
//     http.open("GET", "http://localhost/download?bufferSize=230483949", true);
//     http.setRequestHeader('Range', 'bytes=1-1000000');

//     http.onload = function(response) {
//         var handleLoadBytes = response.loaded;
//         if (response.loaded > 0) {
//             var handleLoadCurTime = window.performance.now();
//             var time = handleLoadCurTime - handleLoadStarTime;
//             handleLoadStarTime = handleLoadCurTime;
//             console.log('Handle Load Time taken to download ' +handleLoadBytes + ' in ' +time);
//             var speed = (3000000) / (time * 125);
//             arr.push(speed);
//             console.log("speed " +speed);
//             console.log(arr);
//         }
//     }

//     http.onreadystatechange = function()
//     {
//         var bytes = (parseInt(http.getResponseHeader("Content-Length")));
//         // console.log(parseInt(http.getResponseHeader("Content-Length")));
//         var currentTime = window.performance.now();
//         var timer = currentTime - startTime;
//         startTime = currentTime;
//         // console.log('Time taken to download ' +bytes + ' in ' +timer);
//         if (http.readyState == 4)
//         {
//             // http.abort();
//             http.open("GET", "http://localhost/download?bufferSize=230483949", true);
//             http.setRequestHeader('Range', 'bytes=1000001-3000000');
//             http.onreadystatechange = function()
//             {
//                 // console.log(parseInt(http.getResponseHeader("Content-Length")));
//             }
//             http.send(null);
//         }
//     };
//     http.send(null);
// }
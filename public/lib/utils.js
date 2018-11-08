
function testRunTime(startTime) {
    return timer() - startTime;
}

function timer() {
    return window.performance.now();
}

function calcMovingAverage() {
    this.sma_count++;
    const differential = (this.cummulativeSpeed - this.sma_mean) / this.sma_count
    const newMean = this.sma_mean + differential;
    this.sma_mean = newMean;
    return this.sma_mean;
}

function calculateSpeedMbps(bytes, milliSeconds) {
    return bytes / (125 * milliSeconds);
}

function abortAllRequests() {
    console.log('abortAllRequests');
    for (var i = 0; i < this.activeTests.length; i++) {
        if (typeof(this.activeTests[i] !== 'undefined')) {
            this.activeTests[i].xhr._request.abort();
        }
    }
}

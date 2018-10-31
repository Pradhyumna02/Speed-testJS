
function testRunTime(startTime) {
    return timer() - startTime;
}

function timer() {
    return window.performance.now();
}
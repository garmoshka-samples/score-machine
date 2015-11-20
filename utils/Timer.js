module.exports = Timer;

/*
 * Timer with ability to pause and skip time (for testing purposes)
 * 
 * Usage:
 * 
 *  var timer = new Timer();
 *  timer.timeoutInSeconds(15);
 *  timer.start(function() { console.log('15 seconds passed!') });
 *  
 */

function Timer() {

    var self = this,
        timeoutHandler, timeoutStarted,
        timeLeft, timeout,
        callback, done = true;

    self.running = false;

    self.start = function(cb) {
        done = false;
        callback = cb;
        timeLeft = timeout;
        self.resume();
    };

    self.timeoutInSeconds = function(seconds) {
        timeout = seconds * 1000;
    };

    function launch() {
        done = true;
        self.running = false;
        callback();
    }

    self.stop = function() {
        done = true;
        self.running = false;
        clearTimeout(timeoutHandler);
    };

    self.pause = function(forNSeconds) {
        if (done) return;
        clearTimeout(timeoutHandler);
        self.running = false;
        timeLeft -= Date.now() - timeoutStarted;
        if (forNSeconds)
            setTimeout(self.resume, forNSeconds * 1000);
    };

    self.resume = function() {
        if (done) return;
        clearTimeout(timeoutHandler);
        timeoutStarted = Date.now();
        timeoutHandler = setTimeout(launch, timeLeft);
        self.running = true;
    };

    self.skip = function(seconds) {
        if (done) return;
        self.pause();
        timeLeft -= seconds * 1000;
        self.resume();
    };

    self.restart = function() {
        self.stop();
        done = false;
        timeLeft = timeout;
        self.resume();
    };

}
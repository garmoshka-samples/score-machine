module.exports = {
    Seed: Seed
};

var _ = require("underscore");

function Seed(bestrafeMich, userSession, channel, idx) {

    var seedPower = 3,
        self = this;

    self.timer = new Timer();

    self.dry = function() {
        seedPower--;
        assignTimeout();
    };

    self.plant = function() {
        assignTimeout();
        self.timer.start(rise);
    };

    function assignTimeout() {
        // 30 40 50
        self.timer.timeoutInSeconds(60 - seedPower * 10);
    }

    function rise() {
        if (seedPower < 2) return;

        if (!userSession.vegetabilityStrafe)
            userSession.vegetabilityStrafe = 3;

        var flags;
        if (userSession.vegetabilityStrafe > 4)
            flags = ['recommendManure'];

        var payload = {};
        bestrafeMich(
            payload, userSession.vegetabilityStrafe++, 'vegetability', flags
        );

        userSession.emitStrafe(channel, payload, idx);
    }
}

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


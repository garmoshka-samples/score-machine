module.exports = {
    Seed
};

var _ = require("underscore");
var Timer = require("Timer");
var config = require('config');

/* 
 * Vegetability - the state of a person being vegetable.
 * 
 * Seed "planted" for each participant at the beginning of a chat.
 * If participant do not perform chatting -
 * then "vegetable growing" and penalty applied finally
 */

function Seed(userSession, channel, bestrafeMich) {

    var seedPower = config("vegetability.seedPower"),
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
        // The less power seed has - 
        // the bigger pause allowed before penalization will triggered
        self.timer.timeoutInSeconds(60 - seedPower * 10);
    }

    function rise() {
        var c = config("vegetability");
        
        if (seedPower < c['minimalLifePower']) return;

        if (!userSession.vegetabilityStrafe)
            userSession.vegetabilityStrafe = c["initialStrafe"];

        var flags;
        if (userSession.vegetabilityStrafe > c["giveRecommendationsAfterStrafe"])
            flags = ['giveRecommendations'];

        var payload = {};
        
        // Trigger penalization
        bestrafeMich(
            payload, userSession.vegetabilityStrafe++, 'vegetability', flags
        );

        userSession.emitStrafe(channel, payload);
    }
}




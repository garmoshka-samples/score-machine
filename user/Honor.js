module.exports = Honor;

var log = require('mo-log');
var Accumulator = require('./Accumulator');

/*
 * Honor of user is collected for all of his dialogs
 * and saved in persistent storage
 */

function Honor(userSession) {
    var self = this;

    self.add = function(newAcc) {
        var value = newAcc.getScore();

        // ignore micro increments of honor
        if (value < 0 || value > 1) {
            userSession.incrementHonor(value, afterIncrement);
        }

        function afterIncrement(resultHonor) {
            userSession.emitToUser('honor', {
                score: resultHonor,
                recentScore: value
            });
        }

    };

}


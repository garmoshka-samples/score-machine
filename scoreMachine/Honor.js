module.exports = Honor;

var users = require('../db/users');
var log = require('mo-log');
var Accumulator = require('./Accumulator');

function Honor(user_id, userSession) {
    var self = this;

    self.add = function(newAcc) {
        var value = newAcc.getScore();

        if (value < 0 || value > 1) {
            users.incrementHonor(user_id, value, afterIncrement);
        }

        function afterIncrement(honor, data) {
            checkLevels(honor, data);
            
            //self.honor = honor;
            userSession.emitToUser('honor', {
                score: honor,
                recentScore: value
            });
        }

        function checkLevels(honor, data) {

            /*
             * data: {
             *   honor: { base: 10, maxLevel: 3 }
             * }
             * */

            if (honor > 5) {
                // todo: посмотреть на тенденции, как люди собирают хоноры
                // и в зависимости от этого написать логику

            }

        }

    };

}


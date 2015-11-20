module.exports = ChatSide;

var termination = require('./termination');
var vegetability = require('./vegetability');
var Accumulator = require('./Accumulator');

/*
 * ChatSide - represents participant of a chat.
 * Since user may participate several chats, he may have few ChatSide instances at a time.
 * 
 * Params:
 *   idx - anonymous index of user in chat
 *   userSession - session of user
 *   init_score - initial score
 *   channel - channel of a chat
 * 
 */

function ChatSide(idx, userSession, init_score, channel) {

    var self = this,
        closed = false,
        lastAuthor, startTime,
        rows = 0,
        hisLastMessageTime,
        myWorkedIncentives = 0, // How many times interlocutor reacted on my messages
        myIncentiveValue = 0, // Value of current messages, which user sent to interlocutor.
                              // If interlocutor will react - this value will be added to my score
        acc = new Accumulator(init_score);

    this.hisRows = 0;
    this.myRows = 0;

    // When chat started - "vegetability" seed is planted
    // so guys should talk to not let it grow
    var seed = new vegetability.Seed(userSession, channel, bestrafeMich);
    seed.plant();

    var timer = seed.timer;

    // External behavior events:

    this.began = function() {
        if (closed) return;

        startTime = Date.now();
    };

    this.onMyMessage = function(payload) {
        if (closed) return;

        timer.stop();
        rows++;
        this.myRows++;
        myIncentiveValue += getValueOfText(payload.text);
        lastAuthor = 'me';
    };

    this.onSomeoneTyping = function(typing) {
        if (closed) return;

        if (typing)
            timer.pause();
        else
            timer.resume();
    };

    this.onPartnerReaction = function(payload) {
        if (closed) return;

        timer.restart();
        rows++;
        this.hisRows++;
        hisLastMessageTime = Date.now();
        if (lastAuthor == 'me') {
            myWorkedIncentives++;
            //console.log('onPartnerReaction', idx, myWorkedIncentives);
            seed.dry();
            incrementMyScore();
        }

        function incrementMyScore() {
            if (myIncentiveValue < 1 && acc.getScore() < 10) myIncentiveValue = 1;
            var s = acc.applyAndTakeScores(myIncentiveValue);
            attachMyScores(payload, s);
            myIncentiveValue = 0;
        }

        lastAuthor = 'he';
    };

    this.finished = function(payload, byPartner) {
        closed = true;

        timer.stop();
        var strafe = termination.calculateTerminationStrafe(
                self, byPartner, getDuration(startTime), getDuration(hisLastMessageTime)
            );

        if (strafe > 0)
            bestrafeMich(payload, strafe, 'termination');
    };

    // PRIVATE:

    function attachMyScores(payload, scores) {
        if (!payload.scores) payload.scores = {};
        payload.scores[idx] = scores;
    }

    function bestrafeMich(payload, value, reason, flags) {
        myIncentiveValue = 0;
        acc.resetGift();
        var scores = acc.applyAndTakeScores(-value);
        scores.strafe = reason;
        scores.flags = flags;
        attachMyScores(payload, scores);
    }

    function getValueOfText(text) {
        var longWords = 0;
        var words = text.split(" ");
        words.map(function (w) {
            if (w.length > 3) longWords++;
        });
        return longWords / 3;
    }

    function getDuration(from) {
        return (Date.now() - from)/1000;
    }

    // Testing utils:

    this.getVegetabilitySeed = function() {
        return seed;
    };

    this.substitutePastTime = function(t) {
        startTime = t;
        hisLastMessageTime = t;
    };

}



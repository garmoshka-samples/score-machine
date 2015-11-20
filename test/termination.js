require('./init');

var chai = require("chai"),
    assert = chai.assert;

var machinist = require('../scoreMachine/machinist');


describe('termination', function() {

    var participants = [
            {id: 'el', user_id: 'elvis'},
            {id: 'de', user_id: 'debora'}
        ],
        conversation, conversationIndex = 0,
        deborasSide, elvisSide;

    function sendMsg(sender, msg) {
        machinist.processEnvelope(conversation, participants, {
            event: 'message',
            payload: {
                sender_idx: sender,
                text: msg
            }
        });
    }

    function wait(seconds) {
        deborasSide.substitutePastTime(Date.now() - seconds * 1000);
        elvisSide.substitutePastTime(Date.now() - seconds * 1000);
    }

    beforeEach(function(done) {
        conversationIndex++;
        conversation = 'termination conversation' + conversationIndex;

        var receiver = { emitToUser: function() {} };
        machinist.setEmitter(receiver);
        machinist.processEnvelope(conversation, participants,
            {event: 'chat_ready', talk_params: {a: {}, b: {}}, payload: {}});

        deborasSide = machinist.chats[conversation].sides['de'];
        elvisSide = machinist.chats[conversation].sides['el'];
        done();
    });

    it('skips fast terminator', function (done) {
        sendMsg('el', 'Hey, debora!');
        var e = {event: 'chat_empty', payload: {sender_idx: 'de'}};
        machinist.processEnvelope(conversation, participants, e);
        assert.isUndefined(e.payload.scores);
        done();
    });

    it('bestrafe for fast self termination', function (done) {
        wait(9);
        var e = {event: 'chat_empty', payload: {sender_idx: 'el'}};
        machinist.processEnvelope(conversation, participants, e);
        assert.equal(e.payload.scores['el'].strafe, 'termination');
        assert.equal(e.payload.scores['el'].recentScore, -10);
        assert.equal(e.payload.scores['el'].score, -10);
        done();
    });

    it('bestrafe for impatience', function (done) {
        sendMsg('el', 'Hey, debora!');
        wait(47);
        var e = {event: 'chat_empty', payload: {sender_idx: 'el'}};
        machinist.processEnvelope(conversation, participants, e);
        assert.equal(e.payload.scores['el'].strafe, 'termination');
        assert.equal(e.payload.scores['el'].recentScore, -1);
        assert.equal(e.payload.scores['el'].score, -1);
        done();
    });

    it('bestrafe for ignoring', function (done) {
        sendMsg('de', 'Who is here? I am Debora');
        wait(57);
        var e = {event: 'chat_empty', payload: {sender_idx: 'de'}};
        machinist.processEnvelope(conversation, participants, e);
        assert.equal(e.payload.scores['el'].strafe, 'termination');
        assert.equal(e.payload.scores['el'].recentScore, -7);
        done();
    });

    it('bestrafe both for no messages', function (done) {
        wait(57);
        var e = {event: 'chat_empty', payload: {sender_idx: 'de'}};
        machinist.processEnvelope(conversation, participants, e);
        assert.equal(e.payload.scores['el'].strafe, 'termination');
        assert.equal(e.payload.scores['el'].recentScore, -3);
        assert.equal(e.payload.scores['de'].strafe, 'termination');
        assert.equal(e.payload.scores['de'].recentScore, -3);
        done();
    });

});
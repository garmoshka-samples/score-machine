require('./init');

var chai = require("chai"),
    assert = chai.assert;

var machinist = require('../scoreMachine/machinist');


describe('vegetability', function() {

    var participants = [
            {id: 'el', user_id: 'elvis'},
            {id: 'de', user_id: 'debora'}
        ],
        conversation, conversationIndex = 0,
        deborasSeed, elvisSeed,
        receiver;

    function sendMsg(sender, msg) {
        machinist.processEnvelope(conversation, participants, {
            event: 'message',
            payload: {
                sender_idx: sender,
                text: msg
            }
        });
    }

    beforeEach(function(done) {
        conversationIndex++;
        conversation = 'vegetability' + conversationIndex;

        receiver = {};
        machinist.setEmitter(receiver);
        sendMsg('el', 'Hey, debora!');

        deborasSeed = machinist.chats[conversation].sides['de'].getVegetabilitySeed();
        elvisSeed = machinist.chats[conversation].sides['el'].getVegetabilitySeed();
        done();
    });

    it('bestrafe for slow reaction', function (done) {

        receiver.emitToChat = function(channel, event, e) {
            assert.equal(event, 'scores');
            assert.equal(e.payload.scores['de'].strafe, 'vegetability');
            assert.equal(e.payload.scores['de'].score, -3);
            assert.equal(e.payload.scores['de'].recentScore, -3);
            assert.isUndefined(e.payload.scores['de'].flags);
            send2();
        };

        deborasSeed.timer.skip(29.99);

        function send2() {
            sendMsg('el', 'Heeeeey');

            receiver.emitToChat = function(channel, event, e) {
                assert.equal(event, 'scores');
                assert.equal(e.payload.scores['de'].strafe, 'vegetability');
                assert.equal(e.payload.scores['de'].score, -7);
                assert.equal(e.payload.scores['de'].recentScore, -4);
                assert.isUndefined(e.payload.scores['de'].flags);
                send3();
            };

            deborasSeed.timer.skip(29.99);
        }

        function send3() {
            sendMsg('el', 'you here?');

            receiver.emitToChat = function(channel, event, e) {
                assert.equal(event, 'scores');
                assert.equal(e.payload.scores['de'].strafe, 'vegetability');
                assert.equal(e.payload.scores['de'].score, -12);
                assert.equal(e.payload.scores['de'].recentScore, -5);
                assert.equal(e.payload.scores['de'].flags[0], 'recommendManure');
                send4();
            };

            deborasSeed.timer.skip(29.99);
        }

        function send4() {
            receiver.emitToChat = function(channel) {
                console.error('Unexpected to', channel);
                assert.isFalse('unexpected to');
            };

            sendMsg('de', 'Yep im here!');
            elvisSeed.timer.skip(20);

            // This should restart elvisSeed.timer:
            sendMsg('de', 'You here me? Im here!');
            elvisSeed.timer.skip(39.99); // 40 - because elvis seed should be dried

            // This should pause elvis strafe:
            machinist.processTyping(conversation, 'elvis', true);

            setTimeout(function() {
                receiver.emitToChat = function(channel, event, e) {
                    assert.equal(event, 'scores');
                    assert.equal(e.payload.scores['el'].strafe, 'vegetability');
                    assert.equal(e.payload.scores['el'].score, 2 - 3); // 2 scores for debora's answer
                    assert.equal(e.payload.scores['el'].recentScore, -3);
                    assert.isUndefined(e.payload.scores['el'].flags);
                    done();
                };

                machinist.processTyping(conversation, 'elvis', false);
            }, 500);
        }

    });

    it('stop seed timer on answer', function (done) {
        receiver.emitToChat = function(channel) {
            console.error('Unexpected to', channel);
            assert.isFalse('unexpected to');
        };

        sendMsg('de', 'Yes, Elvis, howdy!');
        deborasSeed.timer.skip(29.99);

        setTimeout(done, 500);
    });


});
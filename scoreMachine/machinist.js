var ChatSide = require('./ChatSide'),
    Honor  = require('./Honor'),
    spamFilter = require('../spamFilter');

var usersSessions = {}, // todo: clean sessions
    chats = {}, // todo: clean chats
    emitter;

module.exports = {
    usersSessions: usersSessions,
    chats: chats,
    processEnvelope: processEnvelope,
    processTyping: processTyping,
    setEmitter: setEmitter
};

function processEnvelope(channel, participants, envelope) {
    var chat;

    console.log('processEnvelope: ', channel, participants, envelope);

    if (chats[channel])
        chat = chats[channel];
    else {
        if (envelope.event == 'chat_empty') return;
        
        chat = chats[channel] = {
            sides: {}
        };
        participants.map(function(p) {
            chat.sides[p.id] = createSide(p.id, p.user_id);
        });
    }

    function createSide(idx, user_id) {
        var c = new ChatSide(idx, getSession(user_id), 1, channel);
        c.idx = idx;
        c.user_id = user_id;
        return c;
    }

    function getSession(user_id) {
        if (usersSessions[user_id])
            return usersSessions[user_id];
        else {
            var user_uuid = envelope.event == 'chat_ready' ?
                 envelope.talk_params.a.client_id :
                 envelope.payload['sender_uuid'];

            return usersSessions[user_id] =
                new UserSession(user_id, user_uuid);
        }
    }

    var processor, filter,
        payload = envelope.payload;

    if (envelope.event == 'chat_ready') {

        processor = processBeginning;

        var client_id;
         if (envelope.talk_params)
             client_id  = envelope.talk_params.a.client_id;

        filter = spamFilter.chatCreation.bind(null,
            channel,
            client_id,
            envelope.talk_params);

    } else if (envelope.event == 'message') {

        processor = processMessage;

        var text = payload['text'];

        if (payload['sender_idx'] == 'he')
            text = '>> ' + text;

        filter = spamFilter.chatMessage.bind(null,
            channel, payload['sender_uuid'], text);

    } else if (envelope.event == 'chat_empty') {
        processor = processTermination;

        var prefix = payload['sender_idx'] == 'he' ? '>> ' : '';

        filter = spamFilter.chatTermination.bind(null,
            channel,
            payload['sender_uuid'],
            payload['feedback'],
            prefix);

    } else {
        console.log('Unknown envelope type ', envelope);
        throw 'Unknown envelope type ' + envelope.event;
    }

    var isOwner;
    Object.keys(chat.sides).map(function(idx){
        isOwner = payload && payload.sender_idx == idx;
        processor(chat.sides[idx], isOwner);
    });

    function processMessage(side, isOwner) {
        if (isOwner)
            side.onMyMessage(payload);
        else
            side.onPartnerReaction(payload);
    }

    function processTermination(side, isOwner) {
        side.finished(payload, !isOwner);
    }

    function processBeginning(side) {
        side.began();
    }

    filter(payload['scores']);

    return chat;
}

function processTyping(channel, user_id, typing) {
    var c = chats[channel];
    if (!c) return;
    Object.keys(c.sides).map(function(side_idx) {
        //if (c.sides[side_idx].user_id == user_id)
        c.sides[side_idx].onSomeoneTyping(typing);
    });
}

function setEmitter(e) {
    emitter = e;
}

function UserSession(user_id, user_uuid) {
    this.user_id = user_id;
    this.user_uuid = user_uuid;

    this.honor = new Honor(user_id, this);

    this.emitToUser = function(event, e){
        emitter.emitToUser(user_id, event, e);
    };

    this.emitToChat = function(channel, event, e){
        emitter.emitToChat(channel, event, e);
    };

    this.emitStrafe = function(channel, payload, idx) {
        // patch for external chat:
        if (idx == 'me' || idx == 'he')
            this.emitToUser('scores', { channel, payload });
        else
            this.emitToChat(channel, 'scores', { channel, payload });

        spamFilter.strafe(channel,
            this.user_uuid,
            payload['scores']);
    }

}
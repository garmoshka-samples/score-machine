var ChatSide = require('./user/ChatSide');
var UserSession = require('./user/UserSession');

var usersSessions = {}, 
    chats = {};

module.exports = {
    usersSessions: usersSessions,
    chats: chats,
    processEnvelope: processEnvelope,
    processTyping: processTyping
};

/*
 * Machinist - module for processing user messages
 * and triggering appropriate ChatSide behavior methods
 * in accordance to message types
 */

function processEnvelope(channel, participants, envelope) {
    var chat;

    console.log('processEnvelope: ', channel, participants, envelope);

    // if chat exists - use if
    if (chats[channel])
        chat = chats[channel];
    else {
        // init chat
        chat = chats[channel] = {
            sides: {}
        };
        // create createSide for each participant
        participants.map(function(p) {
            chat.sides[p.id] = createSide(p.id, p.user_id, channel);
        });
    }

    var payload = envelope.payload;
    var processor = getProcessor(payload, envelope.event);
        
    if (!processor) {
        console.log('Unknown envelope type ', envelope);
        throw 'Unknown envelope type ' + envelope.event;
    }

    // apply processor defined by event to each side:
    Object.keys(chat.sides).map(function(idx){
        var isOwner = payload && payload.sender_idx == idx;
        processor(chat.sides[idx], isOwner);
    });

    return chat;
}

// create instance of ChatSide for each user
function createSide(idx, user_id, channel, envelope) {
    var c = new ChatSide(idx, getSession(user_id, envelope), 1, channel);
    c.idx = idx;
    c.user_id = user_id;
    return c;
}

// session for user (one per user in system)
function getSession(user_id, envelope) {
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

// map behavior method to event type
function getProcessor(payload, event) {
    var processors = {
        chat_ready: processBeginning,
        message: processMessage,
        chat_empty: processTermination
    };
    
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
    
    return processors[event];
}

// process "user typing..."
function processTyping(channel, user_id, typing) {
    var c = chats[channel];
    if (!c) return;
    Object.keys(c.sides).map(function(side_idx) {
        c.sides[side_idx].onSomeoneTyping(typing);
    });
}


module.exports = {
    UserSession,
    setEmitter,
    setStorage
};

var Honor = require('./Honor');

/*
* UserSession - session of user
* provides access to events emitter (socket.io)
* and user's persistent storage
*/

function UserSession(user_id, user_uuid) {
    this.user_id = user_id;
    this.user_uuid = user_uuid;

    this.honor = new Honor(this);

    this.emitToUser = function(event, e){
        emitter.emitToUser(user_id, event, e);
    };

    this.emitToChat = function(channel, event, e){
        emitter.emitToChat(channel, event, e);
    };

    this.emitStrafe = function(channel, payload) {
        this.emitToChat(channel, 'scores', { channel, payload });
    };
    
    this.incrementHonor = function (value, callback) {
        storage.incrementHonor(value, callback);
    };
}

// To set emitter & storage from external modules:
var emitter, storage;

function setEmitter(e) {
    emitter = e;
}

function setStorage(s) {
    storage = s;
}
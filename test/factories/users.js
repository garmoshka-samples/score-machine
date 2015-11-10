var factory = require('factory-girl')
    , User    = require('../../db/models').User;

factory.define('user', User, {
    name: 'user',
    access_token: function() {return 'access_token'+Math.random()},
    uuid: function() {return 'uuid'+Math.random()},
    score: 10,
    safe_id: function() {return 'safe-id'+Math.random()}
});

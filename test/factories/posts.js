var factory = require('factory-girl')
    , Post    = require('../../db/models').Post;

factory.define('post', Post, {
    is_public: 'yes',
    title: 'Втащили по клюву!',
    recent_score: 1,
    score: 2,
    idx: 1,
    created_at: Date.now(),
    updated_at: Date.now(),
    safe_id: function() {return 'safe-id'+Math.random()},
    category: 'link'
});



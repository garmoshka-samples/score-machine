var factory = require('factory-girl')
    , UserRatesPosts = require('../../db/models').UserRatesPosts;

factory.define('user_rates_posts', UserRatesPosts, {
    user_id: null,
    post_id: null,
    score: 1
});



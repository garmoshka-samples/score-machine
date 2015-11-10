var query = require('mo-pg').query;

module.exports = function clean(callback) {

    query(
        "TRUNCATE posts CASCADE;" +
        "TRUNCATE users CASCADE; "

    ,callback);

};

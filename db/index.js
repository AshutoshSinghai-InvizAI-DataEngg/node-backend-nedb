const Datastore = require('nedb')

class Database {
    init() {
        this.users = new Datastore({ filename: './db/users.db', autoload: true });
        this.audios = new Datastore({ filename: './db/audios.db', autoload: true });
    }
}

module.exports = new Database

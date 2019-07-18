
const Storage = require('./storage')
const conf_storage = new Storage('confs')

class Conf {

    static load_all_as_array(done) {
        let confs = []
        conf_storage.get_all(null, (clist) => {
            clist.forEach((entry) => confs[entry.id] = entry)
            done(confs)
        })
    }

}

module.exports = Conf

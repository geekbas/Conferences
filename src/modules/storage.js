
const db = require('./firestore')
const moment = require('moment')

class Storage {
    constructor(coll_name) {
        this.coll = db.collection(coll_name)
    }

    add(entry, f) {
        this.coll
            .add(entry)
            .then((doc) => {
                f(doc.id)
            })
    }

    fix_types(d) {
        if (d.datevalue) {
            // TODO: "YYYY-MM-DD TZ"
//            console.log('dv', d.datevalue)
//            console.log('dv-s', d.datevalue.toString())
            if (typeof(d.datevalue) === 'object') {
                const m = moment.unix(d.datevalue._seconds)
//                console.log('m-timestamp', m)
                d.datevalue = m.format("YYYY-MM-DD")
            } else {
                const m = moment.unix(d.datevalue / 1000)
//                console.log('m-unix', m)
                d.datevalue = m.format("YYYY-MM-DD")
            }
        }
        return d
    }

    get_all(asc_order, f) {
        let q = this.coll
        if (asc_order) {
            q = q.orderBy(asc_order, 'asc')
        }
        q.get()
            .then((snapshot) => {
                var list = []
                snapshot.docs.forEach((entry) => {
//                console.log(entry.id, entry.data());
                    const d = this.fix_types(entry.data())
                    list.push(Object.assign({id: entry.id }, d))
                })
                if (list.length > 0) {
                    f(list)
                }
            })
    }

    get_by_id(id, f) {
        this.coll
            .doc(id)
            .get()
            .then((doc) => {
                console.log(doc.id, doc.data())
                f(Object.assign({id: id}, doc.data()))
            })
    }

    get_all_by_key(conditions, params, f) {
        let q = this.coll
        conditions.forEach((c) => {
            q = q.where(c.key_name, '==', c.value)
        })
        if (params) {
            if (params.asc) {
                q = q.orderBy(params.asc, 'asc')
            }
            if (params.desc) {
                q = q.orderBy(params.desc, 'desc')
            }
            if (params.limit) {
                q = q.limit(params.limit)
            }
        }
        q.get()
            .then((snapshot) => {
                var docs = []
                snapshot.docs.forEach((entry) => {
                    const d = this.fix_types(entry.data())
                    docs.push(Object.assign({id: entry.id}, d))
                })
                f(docs)
            })
    }

    update(id, updates, f) {
        this.coll
            .doc(id)
            .update(updates)
            .then((doc) => {
                f(id)
            })
    }

    del(id, f) {
        this.coll
            .doc(id)
            .delete()
            .then((doc) => {
                f(doc)
            })
    }

}

module.exports = Storage

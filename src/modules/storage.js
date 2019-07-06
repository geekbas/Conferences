
const db = require('./firestore')

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

    get_all(asc_order, f) {
        let q = this.coll
        if (asc_order) {
            q = q.orderBy(asc_order, 'asc')
        }
        q.get()
            .then((snapshot) => {
                var list = []
                snapshot.docs.map((entry) => {
//                console.log(entry.id, entry.data());
                    list.push(Object.assign({id: entry.id }, entry.data()))
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

    get_all_by_key(key_name, value, desc_order, f) {
        let q = this.coll
            .where(key_name, '==', value)
        if (desc_order) {
            q = q.orderBy(desc_order, 'desc')
        }
        q.get()
            .then((snapshot) => {
                var docs = []
                snapshot.docs.map((entry) => {
                    docs.push(Object.assign({id: entry.id}, entry.data()))
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

const db = require('./firestore');
const coll = db.collection('instances');

let get_for_conf = function(id, f) {
    coll
        .where('conf_id', '==', id)
        .orderBy('year', 'desc')
        .get()
        .then((snapshot) => {
            var docs = [];
            snapshot.docs.map((entry) => {
                docs.push(Object.assign({ id: entry.id }, entry.data()));
            });
            f(docs);
        });
};

let get_by_id = function(id, f) {
//    console.log(`look for id \`${id}'`);
    coll
        .doc(id)
        .get()
        .then((doc) => {
            console.log(doc.id, doc.data());
            f(Object.assign({id: id}, doc.data()));
        });
};

let add = function(entry, f) {
    coll
        .add(entry)
        .then((doc) => {
            f(doc);
        })
};

let update = function(id, updates, f) {
    console.log('update with', updates);
    coll
        .doc(id)
        .update(updates)
        .then((doc) => {
            f({id: id});
        });
};

let del = function(id, f) {
    coll
        .doc(id)
        .delete()
        .then((doc) => {
            f(doc);
        })
};

module.exports = {
    add: add,
    delete: del,
    get_for_conf: get_for_conf,
    get_by_id: get_by_id,
    update: update
};

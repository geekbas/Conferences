const db = require('./firestore');
const coll = db.collection('tracks');

const get_for_instance = function(instance_id, f) {
    coll
        .where('instance_id', '==', instance_id)
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
    coll
        .doc(id)
        .get()
        .then((doc) => {
            console.log('loaded track', doc.id, 'with fields', doc.data());
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
            f(Object.assign({id: id}));
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
    get_for_instance: get_for_instance,
    get_by_id: get_by_id,
    update: update
};

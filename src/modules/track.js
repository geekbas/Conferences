const db = require('./firestore');

const get_for_instance = function(instance_id, f) {
    db.collection('tracks')
        .where('instance_id', '==', instance_id)
        .get()
        .then((snapshot) => {
            var docs = [];
            snapshot.docs.map((entry) => {
                var d = entry.data();
                docs.push({
                    id: entry.id,
                    name: d.name,
                    url: d.url,
                    page_limit: d.page_limit,
                });
            });
            f(docs);
        });

};

let get_by_id = function(id, f) {
    db.collection('tracks')
        .doc(id)
        .get()
        .then((doc) => {
            console.log('loaded track', doc.id, 'with fields', doc.data());
            f(Object.assign({id: id}, doc.data()));
        });
};

let add = function(instance_id, name, f) {
    db.collection('tracks')
        .add({instance_id: instance_id, name: name})
        .then((doc) => {
            f(doc);
        })
};

let update = function(id, updates, f) {
    console.log('update with', updates);
    db.collection('tracks')
        .doc(id)
        .update(updates)
        .then((doc) => {
            f(Object.assign({id: id}));
        });
};

let del = function(id, f) {
    db.collection('tracks')
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

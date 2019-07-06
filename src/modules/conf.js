
const db = require('./firestore');
const instances = require('./instance');
const coll = db.collection('confs');

let get = function(f) {
    coll
        .orderBy('name', 'asc')
        .get()
        .then((snapshot) => {
        var confs = [];
        snapshot.docs.map((entry) => {
//            console.log(entry.id, entry.data());
            confs.push(Object.assign({id: entry.id }, entry.data()));
        });
        if (confs.length > 0) {
            f(confs);
        }
    });
};

let get_by_id = function(id, f) {
//    console.log(`look for id \`${id}'`);
    coll
        .doc(id)
        .get()
        .then((doc) => {
//            console.log(doc.id, doc.data());
            instances.get_for_conf(id, (list) => {
                console.log('got conf list', list);
                f(Object.assign({id: id}, doc.data()), list);
            });
        });
};

let add = function(name, f) {
    coll
        .add({name: name})
        .then((doc) => {
            f(doc);
        })
};

let del = function(id, f) {
    coll
        .doc(id)
        .delete()
        .then((doc) => {
            f(doc);
        })
};

let update = function(id, updates, f) {
    console.log('update confs with', updates);
    coll
        .doc(id)
        .update(updates)
        .then((doc) => {
            f({id: id});
        });
};

module.exports = {
    add: add,
    delete: del,
    get: get,
    get_by_id: get_by_id,
    update: update
};

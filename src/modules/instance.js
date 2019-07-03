var db = require('./firestore');

let get_for_conf = function(id, f) {
    db.collection('instances')
        .where('conf_id', '==', id)
        .orderBy('year', 'desc')
        .get()
        .then((snapshot) => {
            var docs = [];
            snapshot.docs.map((entry) => {
                var d = entry.data();
                docs.push({id: entry.id, year: d.year, url: d.url});
            });
            f(docs);
        });
};

let get_by_id = function(id, f) {
//    console.log(`look for id \`${id}'`);
    db.collection('instances')
        .doc(id)
        .get()
        .then((doc) => {
            console.log(doc.id, doc.data());
            f(Object.assign({id: id}, doc.data()));
        });
};

let add = function(conf_id, year, f) {
    db.collection('instances')
        .add({conf_id: conf_id, year: year})
        .then((doc) => {
            f(doc);
        })
};

let update = function(params, f) {
    let updates = {};
    if (params.year) {
        updates = Object.assign(updates, { year: params.year });
    }
    if (params.url) {
        updates = Object.assign(updates, { url: params.url });
    }
    console.log('update with', updates);
    db.collection('instances')
        .doc(params.id)
        .update(updates)
        .then((doc) => {
            f(Object.assign({id: params.id}));
        });
};

module.exports = {
    add: add,
    get_for_conf: get_for_conf,
    get_by_id: get_by_id,
    update: update
};

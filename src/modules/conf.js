// TODO: to db.js
var admin = require('firebase-admin');
var serviceAccount = require("./conferences-77da0-firebase-adminsdk-eht10-e246d33a60.json");
admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    databaseURL: "https://conferences-77da0.firebaseio.com"
});
var db = admin.firestore();

let get = function(f) {
    db.collection('confs')
        .orderBy('name', 'asc')
        .get()
        .then((snapshot) => {
        var confs = [];
        snapshot.docs.map((entry) => {
//            console.log(entry.id, entry.data());
            var d = entry.data();
            confs.push({id: entry.id, name: d.name, acronym: d.acronym});
        });
        if (confs.length > 0) {
            f(confs);
        }
    });
};

let get_by_id = function(id, f) {
//    console.log(`look for id \`${id}'`);
    db.collection('confs')
        .doc(id)
        .get()
        .then((doc) => {
//            console.log(doc.id, doc.data());
            f(doc.data());
        });
};

module.exports = {
    get: get,
    get_by_id: get_by_id,
};

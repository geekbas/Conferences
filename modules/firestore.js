var admin = require('firebase-admin');
var serviceAccount = require("./firebase-auth.json");
admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    databaseURL: "https://conferences-77da0.firebaseio.com"
});

module.exports = admin.firestore();

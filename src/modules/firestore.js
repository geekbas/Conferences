var admin = require('firebase-admin');
var serviceAccount = require("./conferences-77da0-firebase-adminsdk-eht10-e246d33a60.json");
admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    databaseURL: "https://conferences-77da0.firebaseio.com"
});

module.exports = admin.firestore();

var admin = require('firebase-admin')
var serviceAccount = JSON.parse(process.env.FIREBASE_AUTH)
admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    databaseURL: "https://conferences-77da0.firebaseio.com"
})

module.exports = admin.firestore()

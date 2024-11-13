const admin = require('firebase-admin');
//Replace with own ServiceAccount Key
const serviceAccount = require('../diginifi-firebase-adminsdk-i8chu-1adcc39419.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  //Need a databaseURL
  databaseURL: 'https://<your-database-name>.firebaseio.com'
});

const db = admin.firestore();

module.exports = db;
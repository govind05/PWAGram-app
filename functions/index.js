const functions = require('firebase-functions');
const admin = require('firebase-admin');
const cors = require('cors')({ origin: true });
const webpush = require('web-push');

// // Create and Deploy Your First Cloud Functions
// // https://firebase.google.com/docs/functions/write-firebase-functions
//

var serviceAccount = require("./pwagram-key.json");

admin.initializeApp({
  databaseURL: 'https://pwagram-41a48.firebaseio.com/',
  credential: admin.credential.cert(serviceAccount)
});
exports.storePostData = functions.https.onRequest((request, response) => {
  cors(request, response, () => {
    admin.database().ref('posts').push({
      id: request.body.id,
      title: request.body.title,
      location: request.body.location,
      image: request.body.image,
    })
      .then(() => {
        webpush.setVapidDetails('mailto:govind050796@gmail.com',
          'BBcTAbEiBRhckv-vwL8FiYrv1HLBGB34WFYBLcYf-QUYKyc_rwU_fI35wKC7lpG_YPLPjE7tbxyFCjA3GG327uk',
          'tC2dwPBS5uhIvkfTaR4TAI3EBAvKUPdGxkYlnO74AIw');
        return admin.database().ref('subscriptions').once('value');
      })
      .then(subscriptions => {
        subscriptions.forEach(sub => {
          let pushConfig = {
            endpoint: sub.val().endpoint,
            keys: {
              auth: sub.val().keys.auth,
              p256dh: sub.val().keys.p256dh
            }
          };
          webpush.sendNotification(pushConfig, JSON.stringify({
            title: 'New Post', 
            content: 'New Post added!',
            openUrl: '/help'
          }))
            .catch(err => console.log(err));
        });
        response.status(201).json({message: 'Data stored', id: request.body.id});
      })
      .catch((err) => response.status(500).json({ error: err }));
  });
});

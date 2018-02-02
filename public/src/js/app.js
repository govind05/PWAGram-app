
var deferredPrompt;
let enableNotificationButtons = document.querySelectorAll('.enable-notifications');

if (!window.Promise) {
  window.Promise = Promise;
}

if ('serviceWorker' in navigator) {
  navigator.serviceWorker
    .register('/sw.js')
    .then(function () {
      console.log('Service worker registered!');
    })
    .catch(function (err) {
      console.log(err);
    });
}

window.addEventListener('beforeinstallprompt', function (event) {
  console.log('beforeinstallprompt fired');
  event.preventDefault();
  deferredPrompt = event;
  return false;
});

function displayConfirmNotification() {
  if ('serviceWorker' in navigator) {
    let options = {
      body: 'You have successfully subscribed to out notification service',
      icon: '/src/images/icons/app-icon-96x96.png',
      image: '/src/images/sf-boat.jpg',
      lang: 'en-US',
      dir: 'ltr',
      vibrate: [100, 50, 200],
      badge: '/src/images/icons/app-icon-96x96.png',
      tag: 'confirm-notification',
      renotify: true,
      actions: [
        { action: 'confirm', title: 'Okay', icon:'/src/images/icons/app-icon-96x96.png'},
        { action: 'cancel', title: 'Cancel', icon:'/src/images/icons/app-icon-96x96.png'}
      ]
    }
    navigator.serviceWorker.ready
      .then(swreg => {
        swreg.showNotification('Successfully Subscribed!', options)
      })
  }
}

function configurePushSub(){
  if(!('serviceWorker' in navigator)){
    return;
  }

  let reg;
  navigator.serviceWorker.ready
  .then(swreg => {
    reg = swreg;
    return swreg.pushManager.getSubscription();
  })
  .then(sub => {
    if(sub === null){
      let vapidPublicKey = 'BBcTAbEiBRhckv-vwL8FiYrv1HLBGB34WFYBLcYf-QUYKyc_rwU_fI35wKC7lpG_YPLPjE7tbxyFCjA3GG327uk';
      let convertedVapidPublicKey = urlBase64ToUint8Array(vapidPublicKey);
      // console.log(convertedVapidPublicKey);
      return reg.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: convertedVapidPublicKey
      });
    }else{
      
    }
  })
  .then(newSub => {
    return fetch('https://pwagram-41a48.firebaseio.com/subscriptions.json', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: JSON.stringify(newSub)
    })
  })
  .then(res => {
    if(res.ok){
      displayConfirmNotification();
    }
  }).catch(err => console.log(err));
} 

function askForNotificationPermission() {

  Notification.requestPermission(function (result) {
    // If the user accepts, let's create a notification

    console.log('User choice', result);
    if (result !== 'granted') {
      console.log('Permission denied');
    } else {
      for (i = 0; i < enableNotificationButtons.length; i++) {
        enableNotificationButtons[i].style.display = 'none';
      }
      configurePushSub();
      // displayConfirmNotification();
    }
  })
}


if ('Notification' in window && 'serviceWorker' in navigator) {
  // if (Notification.permission === 'granted') {
  //   for (i = 0; i < enableNotificationButtons.length; i++) {
  //     enableNotificationButtons[i].style.display = 'none';
  //   }
  // } else {
  for (i = 0; i < enableNotificationButtons.length; i++) {
    enableNotificationButtons[i].style.display = 'inline-block';
    enableNotificationButtons[i].addEventListener('click', askForNotificationPermission);
  }
  // }
}

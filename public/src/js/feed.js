var shareImageButton = document.querySelector('#share-image-button');
var createPostArea = document.querySelector('#create-post');
var closeCreatePostModalButton = document.querySelector('#close-create-post-modal-btn');
var sharedMomentsArea = document.querySelector('#shared-moments');
var form = document.querySelector('form');
let titleInput = document.querySelector('#title');
let locationInput = document.querySelector('#location');
let videoPlayer = document.querySelector('#player');
let canvasElement = document.querySelector('#canvas');
let captureButton = document.querySelector('#capture-btn');
let imagePicker = document.querySelector('#image-picker');
let imagePickerArea = document.querySelector('#pick-image');
let picture;
let locationBtn = document.querySelector('#location-btn');
let locationLoader = document.querySelector('#location-loader');
let fetchedLocation = { lat: 0, lng: 0 };

locationBtn.addEventListener('click', (e) => {
  if (!('geolocation' in navigator)) {
    return;
  }
  let sawAlert = false;
  locationBtn.style.display = 'none';
  locationLoader.style.display = 'block';

  navigator.geolocation.getCurrentPosition((pos) => {
    locationBtn.style.display = 'inline';
    locationLoader.style.display = 'none';
    fetchedLocation = { lat: pos.coords.latitude, lng: pos.coords.longitude };
    fetch(`https://maps.googleapis.com/maps/api/geocode/json?latlng=${fetchedLocation.lat},${fetchedLocation.lng}&key=AIzaSyDkVK1C2effkHFUjct8zQkh5P5t0l9v6hk`)
      .then(res => res.json())
      .then(data => locationInput.value = data.results[0].formatted_address)
      .catch(err => err);
    document.querySelector('#manual-location').classList.add('is-focused');

  }, (err) => {
    console.log(err);
    locationBtn.style.display = 'inline';
    locationLoader.style.display = 'none';
    if (!sawAlert) {
      sawAlert = true;
      alert('Couldnt fetch location, please try manually');
    }
    fetchedLocation = { lat: 0, lng: 0 };
  }, {
      timeout: 7000
    });
});

const initializeLocation = () => {
  if (!('geolocation' in navigator)) {
    locationBtn.style.display = 'none';
  }
};

function initializeMedia() {
  if (!('mediaDevices' in navigator)) {
    navigator.mediaDevices = {};
  }

  if (!('getUserMedia' in navigator.mediaDevices)) {
    navigator.mediaDevices.getUserMedia = (constraints) => {
      let getUserMedia = navigator.webkitGetUserMedia || navigator.mozGetUserMedia;

      if (!getUserMedia) {
        return new Promise.reject(new Error('getUserMedia is not implemented!'));
      }

      return new Promise((resolve, reject) => {
        getUserMedia.call(navigator, constraints, resolve, reject);
      });
    }
  }

  navigator.mediaDevices.getUserMedia({ video: true })
    .then((stream) => {
      videoPlayer.srcObject = stream;
      videoPlayer.style.display = 'block';
      captureButton.style.display = 'inline';
    })
    .catch(err => {
      captureButton.style.display = 'none';

      imagePickerArea.style.display = 'block';
    });
}

imagePicker.addEventListener('change', (e) => {
  picture = e.target.files[0];
})

captureButton.addEventListener('click', (e) => {
  canvasElement.style.display = 'block';
  videoPlayer.style.display = 'none';
  captureButton.style.display = 'none';
  let context = canvasElement.getContext('2d');
  context.drawImage(videoPlayer, 0, 0, canvas.width, canvas.height);
  // console.log(videoPlayer.videoHeight, canvas.width, videoPlayer.videoWidth, canvas.height, videoPlayer.videoHeight / (videoPlayer.videoWidth / canvas.width))
  videoPlayer.srcObject.getVideoTracks().forEach(track => {
    track.stop();
  });
  picture = dataURItoBlob(canvasElement.toDataURL());
})

function openCreatePostModal() {
  // createPostArea.style.display = 'block';
  // setTimeout(() => {
  setTimeout(() => {
    createPostArea.style.transform = 'translateY(0)';
  }, 1)
  initializeMedia();
  initializeLocation();

  // }, 1);
  if (deferredPrompt) {
    deferredPrompt.prompt();

    deferredPrompt.userChoice.then(function (choiceResult) {
      console.log(choiceResult.outcome);

      if (choiceResult.outcome === 'dismissed') {
        console.log('User cancelled installation');
      } else {
        console.log('User added to home screen');
      }
    });

    deferredPrompt = null;
  }

  // if ('serviceWorker' in navigator) {
  //   navigator.serviceWorker.getRegistrations()
  //     .then(function (registrations) {
  //       for (let i = 0; i < registrations.length; i++) {
  //         registrations[i].unregister();
  //       }
  //     })
  // }
}

function closeCreatePostModal() {

  videoPlayer.style.display = 'none';
  imagePickerArea.style.display = 'none';
  canvasElement.style.display = 'none';
  locationBtn.style.display = 'inline';
  locationLoader.style.display = 'none';
  if (videoPlayer.srcObject) {
    videoPlayer.srcObject.getVideoTracks().forEach(track => track.stop())
  }
  setTimeout(() => {
    createPostArea.style.transform = 'translateY(100vh)';
  }, 1)
  // createPostArea.style.display = 'none';
}
//To save to cache on user request, currently disabled

function onSaveButtonClicked(event) {
  console.log('clicked');
  if ('caches' in window) {
    caches.open('user-requested')
      .then(cache => {
        cache.add('https://httpbin.org/get')
        cache.add('/src/images/sf-boat.jpg');
      })
  }
}

shareImageButton.addEventListener('click', openCreatePostModal);

closeCreatePostModalButton.addEventListener('click', closeCreatePostModal);

function clearCards() {
  while (sharedMomentsArea.hasChildNodes()) {
    sharedMomentsArea.removeChild(sharedMomentsArea.lastChild);
  }
}

function createCard(data) {
  var cardWrapper = document.createElement('div');
  cardWrapper.className = 'shared-moment-card mdl-card mdl-shadow--2dp';
  var cardTitle = document.createElement('div');
  cardTitle.className = 'mdl-card__title';
  cardTitle.style.backgroundImage = 'url(' + data.image + ')';
  cardTitle.style.backgroundSize = 'cover';
  cardWrapper.appendChild(cardTitle);
  var cardTitleTextElement = document.createElement('h2');
  cardTitleTextElement.style.color = 'white';
  cardTitleTextElement.className = 'mdl-card__title-text';
  cardTitleTextElement.textContent = data.title;
  cardTitle.appendChild(cardTitleTextElement);
  cardTitle.style.backgroundPosition = 'center';
  var cardSupportingText = document.createElement('div');
  cardSupportingText.className = 'mdl-card__supporting-text';
  cardSupportingText.textContent = data.location;
  cardSupportingText.style.textAlign = 'center';
  // var cardSaveButton = document.createElement('button');
  // cardSaveButton.textContent = 'Save';
  // cardSupportingText.appendChild(cardSaveButton);
  // cardSaveButton.addEventListener('click', onSaveButtonClicked);
  cardWrapper.appendChild(cardSupportingText);
  componentHandler.upgradeElement(cardWrapper);
  sharedMomentsArea.appendChild(cardWrapper);
}

function updateUI(data) {
  for (let i = 0; i < data.length; i++) {
    createCard(data[i]);
  }
}

let url = 'https://pwagram-41a48.firebaseio.com/posts.json';
let networkDataReceived = false;

fetch(url)
  .then(function (res) {
    return res.json();
  })
  .then(function (data) {
    networkDataReceived = true;
    console.log('From web', data);
    let dataArray = [];
    for (let key in data) {
      dataArray.push(data[key]);
    }
    clearCards();
    updateUI(dataArray);
  });

if ('indexedDB' in window) {
  readAllData('posts')
    .then(data => {
      if (!networkDataReceived) {
        console.log('from cache', data);
        updateUI(data);
      }
    });
}

function sendData() {
  let id = new Date().toISOString();
  let postData = new FormData();
  postData.append('id', id);
  postData.append('title', titleInput.value);
  postData.append('location', locationInput.value);
  postData.append('rawLocationLat', fetchedLocation.lat);
  postData.append('rawLocationLng', fetchedLocation.lng);
  postData.append('picture', picture, id + '.png');

  fetch('https://us-central1-pwagram-41a48.cloudfunctions.net/storePostData', {
    method: 'POST',
    body: postData
  })
    .then(res => {
      console.log('sent data', res)
      updateUI();
    });

}

form.addEventListener('submit', (event) => {
  event.preventDefault();

  if (titleInput.value.trim() === '' || locationInput.value.trim() === '') {
    alert('Please enter valid data');
    return;
  }

  closeCreatePostModal();

  if ('serviceWorker' in navigator && 'SyncManager' in window) {
    navigator.serviceWorker.ready
      .then(sw => {
        let post = {
          id: new Date().toISOString(),
          title: titleInput.value,
          location: locationInput.value,
          picture: picture,
          rawLocation: fetchedLocation
        };
        writeData('sync-posts', post)
          .then(() => {
            console.log('registering sync event');
            return sw.sync.register('sync-new-posts');
          })
          .then(() => {
            let snackbarContainer = document.querySelector('#confirmation-toast');
            let data = { message: 'Your post was saved for syncing' };
            snackbarContainer.MaterialSnackbar.showSnackbar(data);
          })
          .catch(err => console.log(err));
      });
  } else {
    sendData();
  }
});
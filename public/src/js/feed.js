var shareImageButton = document.querySelector('#share-image-button');
var createPostArea = document.querySelector('#create-post');
var closeCreatePostModalButton = document.querySelector('#close-create-post-modal-btn');
var sharedMomentsArea = document.querySelector('#shared-moments');
var form = document.querySelector('form');
let titleInput = document.querySelector('#title');
let locationInput = document.querySelector('#location');

function openCreatePostModal() {
  // createPostArea.style.display = 'block';
  // setTimeout(() => {
  createPostArea.style.transform = 'translateY(0)';
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
  createPostArea.style.transform = 'translateY(100vh)';
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
  fetch('https://us-central1-pwagram-41a48.cloudfunctions.net/storePostData', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json'
    },
    body: JSON.stringify({
      id: new Date().toISOString(),
      title: titleInput.value,
      location: locationInput.value,
      image: "https://firebasestorage.googleapis.com/v0/b/pwagram-41a48.appspot.com/o/Copy%20of%20DSC_0018.JPG?alt=media&token=88aa4852-f00f-4bd7-8453-f960a10604bb"
    })
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
import cssLoader from 'modules/defer-css';
cssLoader();

import validateManifest from 'modules/manifestvalidator';

const btn = document.querySelector('button');
const content = document.querySelector('#content textarea');
const file = document.querySelector('#file input');
const url = document.querySelector('#url input');
const output = document.querySelector('#output');

btn.addEventListener('click', () => {
  btn.disabled = true;

  let manifest = Promise.reject('Nothing was selected');
  switch(location.hash) {
    case '#content':
      manifest = Promise.resolve(content.value);
    break;
    case '#file':
      manifest = loadFile(file.files[0]);
    break;
    case '#url':
      manifest = loadURL(url.value);
    break;
  }
  manifest
  .then(JSON.parse)
  .then(validateManifest)
  .catch(err => {
    return [err.toString()];
  })
  .then(errors => {
    while(output.firstChild) {
      output.removeChild(output.firstChild);
    }

    if(errors.length == 0) {
      const err = document.createElement('div');
      err.classList.add('success');
      err.innerText = 'No errors';
      output.appendChild(err);
      return;
    }
    errors.forEach(error => {
      const err = document.createElement('div');
      err.classList.add('error');
      err.innerText = error;
      output.appendChild(err);
    });
  })
  .then(() => btn.disabled = false);
});

function loadFile(file) {
  return new Promise((resolve, reject) => {
    let fr = new FileReader();
    fr.onload = ev => {
      return resolve(ev.target.result);
    };
    fr.readAsText(file, 'utf-8');
  });
}

function loadURL(url) {
  return fetch(`https://crossorigin.me/${url}`, {mode: 'cors'})
  .then(response => response.text())
}

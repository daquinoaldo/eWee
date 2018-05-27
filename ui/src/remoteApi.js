//export const url = "http://localhost:3000";

//TODO: DELETE IN PRODUCTION
// uncomment this line (and comment the previous one) to use remote api from localhost
export const url = process.env.API || "https://api.p1.aldodaquino.com";

export function send (url, method, data, callback) {
  const options = { method: method,
    headers: new Headers({
      'Content-Type': 'application/json',
      Accept: 'application/json',
    }),
    mode: 'cors',
    cache: 'default',
    body: data ? JSON.stringify(data) : ''
  };
  fetch(url, options)
  .then(res => callback(res, null))
  .catch(err => callback(null, err));
}

export function get (url, callback) {
  fetch(url)
  .then(response => response.json())
  .then(res => callback(res, null))
  .catch(err => callback(null, err));
}

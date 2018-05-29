export const url = process.env.API || "http://192.168.1.42:3000";

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

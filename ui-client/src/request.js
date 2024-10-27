/**
 * @returns {Promise<Response>}
 */
export function request(path, options) {
  return new Promise(async (resolve, reject) => {
    if(!navigator.onLine) return reject({ status: 'error', message: 'Network connection error!' });
    const token = await window.db.getData('user', 'token');
    const headers = {...options.headers};
    if(!!token) {
      headers['x-access-token'] = token.value;
    }

    const res = fetch(path, {...options, headers});
    resolve(res);
  });
}

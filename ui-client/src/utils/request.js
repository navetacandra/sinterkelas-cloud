/**
 * Sends a request to the specified path with the provided options.
 * @param {string} path - The URL path of the request.
 * @param {RequestInit|undefined} options - The request options.
 * @returns {Promise<Response>} The response from the server.
 */
export function request(path, options) {
  return new Promise(async (resolve, reject) => {
    if (!navigator.onLine) {
      reject({ status: 'error', message: 'Network connection error!' });
      return;
    }

    const token = await window.db.getData('user', 'token');
    const headers = {...options.headers };

    if (token) {
      headers['x-access-token'] = token.value;
    }

    try {
      const response = await fetch(path, { ...options, headers });
      if (!response.ok) {
        reject({ status: response.status, message: response.statusText });
      } else {
        resolve(response);
      }
    } catch (error) {
      reject({ status: 'error', message: error.message });
    }
  });
}


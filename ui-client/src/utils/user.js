import { request } from "./request";

/**
 * Fetches user data from the API.
 * @returns {Promise<Object>} User data
 */
async function fetchUserData() {
  try {
    const response = await request("/api/me", { method: "POST" });
    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.message);
    }
    return data.data;
  } catch (error) {
    throw error;
  }
}

/**
 * Retrieves user data from the API and stores it in the database.
 * @returns {Promise<Object>} User data
 */
async function getUserData() {
  /** @type {import('./db').default} */
  const database = window.db;
  try {
    const token = await database.getData("user", "token");
    if (!token) return null;

    const userData = await fetchUserData();
    await database.addData("user", { key: "data", value: userData });
    return userData;
  } catch (error) {
    console.error(error);
    return null;
  }
}

/**
 * Retrieves the current user's data from the database or API.
 * @returns {Promise<Object|null>} User data or null if not found
 */
export async function getCurrentUser() {
  /** @type {import('./db').default} */
  const database = window.db;
  try {
    const user = await database.getData("user", "data");
    if (!user) {
      return await getUserData();
    }
    return user.value;
  } catch (error) {
    console.error(error);
    return null;
  }
}

/**
 * Listens for user login events and updates the user data accordingly.
 * @param {Object} event - Event object
 */
export async function listenForUserLogin(event) {
  if (event.storeName === "user" && event.data?.key === "token") {
    await getUserData();
  }
}

/**
 * Logs in a user with the provided credentials.
 * @param {Object} credentials - Username and password
 * @param {string} credentials.username - Username
 * @param {string} credentials.password - Password
 * @returns {Promise<string>} Token or error message
 */
export function login({ username, password }) {
  /** @type {import('./db').default} */
  return new Promise(async (resolve, reject) => {
    try {
      const response = await request("/api/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ username, password }),
      });

      const json = await response.json();
      if (!response.ok) {
        reject(json.message);
      } else {
        resolve(json.data.token);
      }
    } catch (error) {
      reject(error.message ?? error.toString());
    }
  });
}

/**
 * Logs out the current user.
 * @returns {Promise<void>} Resolves on success, rejects on error
 */
export function logout() {
  /** @type {import('./db').default} */
  const database = window.db;
  return new Promise(async (resolve, reject) => {
    try {
      const token = await database.getData("user", "token");
      if (!token) return resolve();

      const response = await request("/api/logout", { method: "POST" });
      if (response.ok) {
        await database.clearStore("user");
        resolve();
      } else {
        const error = await response.json();
        reject(error.message || "Something went wrong");
      }
    } catch (error) {
      reject(error);
    }
  });
}

/**
 * EventEmitter class for basic pub-sub functionality
 */
class EventEmitter {
  constructor() {
    this.events = {};
  }

  /**
   * Subscribe to an event
   * @param {string} event - The event name
   * @param {function} listener - The event listener
   */
  on(event, listener) {
    if (!this.events[event]) this.events[event] = [];
    this.events[event].push(listener);
  }

  /**
   * Emit an event
   * @param {string} event - The event name
   * @param {*} data - The event data
   */
  emit(event, data) {
    const listeners = this.events[event];
    if (listeners) {
      listeners.forEach((listener) => listener(data));
    }
  }
}

/**
 * Database class extending EventEmitter for IndexedDB CRUD operations
 */
class Database extends EventEmitter {
  /**
   * Constructor
   * @param {string} dbName - The database name
   * @param {{name: string, keyPath?: string, autoIncrement?: boolean}[]} stores - The database stores
   */
  constructor(dbName, stores) {
    super();
    this.dbName = dbName;
    this.stores = stores;
    this.db = null;
  }

  /**
   * Open and initialize the database with multiple stores
   * @returns {Promise}
   */
  openDatabase() {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(this.dbName, 1);

      request.onupgradeneeded = (event) => {
        const db = event.target.result;
        this.stores.forEach((store) => {
          if (!db.objectStoreNames.contains(store.name)) {
            db.createObjectStore(store.name, {
              keyPath: store.keyPath || "id",
              autoIncrement: store.autoIncrement || false,
            });
          }
        });
      };

      request.onsuccess = (event) => {
        this.db = event.target.result;
        resolve(this.db);
      };

      request.onerror = (event) => {
        reject("Database error: " + event.target.errorCode);
      };
    });
  }

  /**
   * Add data to a specific store
   * @param {string} storeName - The store name
   * @param {*} data - The data to add
   * @returns {Promise}
   */
  addData(storeName, data) {
    if (!storeName || !data) {
      throw new Error("Store name and data are required");
    }

    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction(storeName, "readwrite");
      const store = transaction.objectStore(storeName);
      const storeConfig = this.stores.find((s) => s.name === storeName);

      if (
        storeConfig &&
        !storeConfig.autoIncrement &&
        storeConfig.keyPath &&
        data[storeConfig.keyPath] == null
      ) {
        reject(
          `Error: Missing required key '${storeConfig.keyPath}' for non-auto-increment store '${storeName}'.`,
        );
        return;
      }

      const request = storeConfig.autoIncrement
        ? store.add(data)
        : store.put(data);

      request.onsuccess = () => {
        this.emit("add", { storeName, data });
        resolve(`Data added successfully to ${storeName}`);
      };
      request.onerror = (event) =>
        reject(`Error adding data to ${storeName}: ${event.target.error}`);
    });
  }

  /**
   * Retrieve data by ID from a specific store
   * @param {string} storeName - The store name
   * @param {*} id - The ID of the data to retrieve
   * @returns {Promise}
   */
  getData(storeName, id) {
    if (!storeName || !id) {
      throw new Error("Store name and ID are required");
    }

    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction(storeName, "readonly");
      const store = transaction.objectStore(storeName);
      const request = store.get(id);

      request.onsuccess = () => resolve(request.result);
      request.onerror = (event) =>
        reject(`Error reading data from ${storeName}: ${event.target.error}`);
    });
  }

  /**
   * Update data by ID in a specific store
   * @param {string} storeName - The store name
   * @param {*} id - The ID of the data to update
   * @param {*} newData - The new data to update with
   * @returns {Promise}
   */
  updateData(storeName, id, newData) {
    if (!storeName || !id || !newData) {
      throw new Error("Store name, ID, and new data are required");
    }

    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction(storeName, "readwrite");
      const store = transaction.objectStore(storeName);
      const request = store.get(id);

      request.onsuccess = () => {
        const data = request.result;
        Object.assign(data, newData);
        const updateRequest = store.put(data);

        updateRequest.onsuccess = () => {
          this.emit("update", { storeName, id, newData });
          resolve(`Data updated successfully in ${storeName}`);
        };
        updateRequest.onerror = (event) =>
          reject(`Error updating data in ${storeName}: ${event.target.error}`);
      };

      request.onerror = (event) =>
        reject(
          `Error retrieving data for update in ${storeName}: ${event.target.error}`,
        );
    });
  }

  /**
   * Delete data by ID from a specific store
   * @param {string} storeName - The store name
   * @param {*} id - The ID of the data to delete
   * @returns {Promise}
   */
  deleteData(storeName, id) {
    if (!storeName || !id) {
      throw new Error("Store name and ID are required");
    }

    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction(storeName, "readwrite");
      const store = transaction.objectStore(storeName);
      const request = store.delete(id);

      request.onsuccess = () => {
        this.emit("delete", { storeName, id });
        resolve(`Data deleted successfully from ${storeName}`);
      };
      request.onerror = (event) =>
        reject(`Error deleting data from ${storeName}: ${event.target.error}`);
    });
  }

  /**
   * Clear all data from a specific store
   * @param {string} storeName - The store name
   * @returns {Promise}
   */
  clearStore(storeName) {
    if (!storeName) {
      throw new Error("Store name is required");
    }

    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction(storeName, "readwrite");
      const store = transaction.objectStore(storeName);
      const request = store.clear();

      request.onsuccess = () => {
        this.emit("clear", { storeName });
        resolve(`All data cleared from ${storeName}`);
      };
      request.onerror = (event) =>
        reject(`Error clearing data from ${storeName}: ${event.target.error}`);
    });
  }

  /**
   * Close the database connection
   * @returns {Promise}
   */
  close() {
    return new Promise((resolve, reject) => {
      if (this.db) {
        this.db.close();
        this.db = null;
        resolve();
      } else {
        reject("Database is not open");
      }
    });
  }
}

// Example usage
const db = new Database("sinterkelas", [
  { name: "user", keyPath: "key", autoIncrement: false },
  { name: "items" },
  { name: "preferences", keyPath: "key", autoIncrement: false },
]);

export default db;

// Import necessary dependencies
import { mount } from "svelte";
import "./app.css";
import App from "./App.svelte";
import Database from "./utils/db";
import {
  initTheme,
  onThemeSetListener,
  onThemeUpdateListener,
} from "./utils/theme";
import { getCurrentUser, listenForUserLogin } from "./utils/user";
import networkWatch from "./utils/network-watch";

// Create a reference to the Database instance
const database = (window.db = Database);

database.on("add", (event) => {
  onThemeSetListener(event);
  listenForUserLogin(event);
});

database.on("update", (event) => {
  onThemeUpdateListener(event);
});

database
  .openDatabase()
  .catch((error) => console.error("Error opening database:", error))
  .then(async () => {
    networkWatch();
    await initTheme();
    await getCurrentUser();
  })
  .finally(() => mount(App, { target: document.getElementById("app") }));

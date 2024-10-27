// Theme Management Functions

/**
 * Updates the theme of the application.
 * @param {string} theme - The new theme to apply.
 */
export function updateTheme(theme) {
  document.querySelector("html").className = theme;
}

/**
 * Initializes the theme of the application.
 * If no theme is set, defaults to 'light'.
 */
export async function initTheme() {
  /** @type {import('./db').default} */
  const database = window.db;
  const storedTheme = await database.getData("preferences", "theme");
  if (!storedTheme) {
    await database.addData("preferences", { key: "theme", value: "light" });
  }
  updateTheme(storedTheme?.value);
}

/**
 * Listener for theme set events.
 * @param {{storeName: string, data: any}} event - The event data.
 */
export function onThemeSetListener(event) {
  const { storeName, data } = event;
  if (storeName === "preferences" && data.key === "theme") {
    updateTheme(data.value);
  }
}

/**
 * Listener for theme update events.
 * @param {{storeName: string, id: string, newData: any}} event - The event data.
 */
export function onThemeUpdateListener(event) {
  const { storeName, id, newData } = event;
  if (storeName === "preferences" && id === "theme") {
    updateTheme(newData.value);
  }
}

/**
 * Sets up a network connection watcher.
 * Alerts the user if the network connection is lost.
 */
export default function networkWatch() {
  if (navigator.connection) {
    navigator.connection.onchange = () => {
      if (!navigator.onLine) {
        // Use a custom alert component or a toast notification library here
        alert("Network connection lost!");
      }
    };
  } else {
    // Fallback for older browsers
    window.addEventListener("online", () => {
      console.log("Network connection restored!");
    });
    window.addEventListener("offline", () => {
      alert("Network connection lost!");
    });
  }
}

import { mount } from 'svelte'
import './app.css'
import App from './App.svelte'
import Database from './db'

let app;
const db = window.db = Database;
const updateTheme = (theme) => document.querySelector('html').className = theme;

if(navigator.connection) {
  navigator.connection.onchange = () => {
    if(!navigator.onLine) alert("Network connection lost!");
  }
}

db.on('add', ({ storeName, data }) => {
  if(storeName === 'preferences' && data?.key === 'theme')
    updateTheme(data.value);
});

db.on('update', ({ storeName, id, newData }) => {
  if(storeName === 'preferences' && id === 'theme')
    updateTheme(newData.value);
});

db.openDatabase()
  .catch(console.error)
  .then(async _ => {
    const theme = await db.getData('preferences', 'theme');
    if(!theme) await db.addData('preferences', { key: 'theme', value: 'light' });
    else updateTheme(theme.value);
  })
  .finally(() => {
    app = mount(App, {
      target: document.getElementById('app'),
    });
  })

export default app

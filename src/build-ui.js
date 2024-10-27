const { spawn } = require('child_process');
const { readdirSync, statSync, readFileSync, writeFileSync, copyFileSync } = require('fs');
const path = require('path');
const uiClientPath = path.resolve(path.join(__dirname, '..', 'ui-client'));
const distPath = path.join(uiClientPath, 'dist');

function execute(command, args, options) {
  return new Promise((resolve, reject) => {
    const process = spawn(command, args, {
      shell: true,
      ...options
    });
    let output = '';
    process.stdout.on('data', (data) => { output += data });
    process.stderr.on('error', (err) => reject(err));
    process.on('close', (code) => {
      if (code === 0) {
        resolve(output);
      } else {
        reject();
      }
    });
  });
}

function buildUI() {
  return execute('npm', ['run', 'build'], { cwd: uiClientPath });
}

function getDistItems(dirpath = distPath) {
  const items = readdirSync(dirpath);
  let paths = [];
  items.forEach(item => {
    const itemPath = path.join(dirpath, item);
    const stat = statSync(itemPath);
    if(stat.isDirectory()) {
      return getDistItems(itemPath).forEach(path => paths.push(path));
    }
    paths.push(itemPath);
  });
  return paths.map(p => p.replace(distPath, '')).sort();
}

function generateSW() {
  const items = getDistItems();
  const svelteApp = readFileSync(path.join(uiClientPath, 'src', 'App.svelte'), 'utf8');
  const pathRegisterated = svelteApp.match(/path="(.*)"/g);
  if(pathRegisterated) {
    const paths = pathRegisterated.map(p => p.replace(/path="(.*)"/, '$1'));
    items.push(...paths);
  }

  let oldCacheData = 'const cacheData = ["/sw.js"];';
  let newCacheData = `const cacheData = [\n  "/sw.js",\n${items.sort().map(i => `  "${i}"`).join(',\n')}\n];`;
  const swTemplate = readFileSync(path.join(__dirname, 'sw.template.js'), 'utf8');
  const newSW = swTemplate.replace(oldCacheData, newCacheData);
  writeFileSync(path.join(distPath, 'sw.js'), newSW);
}

function generateServiceWorker() {
  copyFileSync(path.join(__dirname, 'service-worker.template.js'), path.join(distPath, 'service-worker.js'));
  let html = readFileSync(path.join(distPath, 'index.html'), 'utf8');
  html = html.replace('</title>', '</title>\n    <script src="/service-worker.js"></script>')
  writeFileSync(path.join(distPath, 'index.html'), html);
  generateSW();
}

;(async function() {
  try {
    console.log('Building UI...');
    await buildUI();
    generateServiceWorker();
    console.log('Done!');
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
})();

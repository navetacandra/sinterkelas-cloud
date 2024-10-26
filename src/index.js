const { spawnSync } = require('child_process');
const path = require('path');
const express = require('express');
const { existsSync, createReadStream } = require('fs');
const compression = require('compression');
const { createHash } = require('crypto');

// build-ui.js
;(() => {
  if(process.env.BUILD_UI == 'true') {
    spawnSync('node', [path.resolve(path.join(__dirname, 'build-ui.js'))]);
  }
})();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(compression({ level: 9, filter: () => true }));

// Function for handle file cache
function handleFileCache(req, res, filepath) {
  const hash = createHash('md5'); // Generate md5 hash
  const fileStream = createReadStream(filepath); // Read file
  fileStream.on('data', (chunk) => hash.update(chunk)); // Update hash
  fileStream.on('end', () => {
    const etag = hash.digest('hex'); // Get hash
    res.setHeader('Cache-Control', 'public, max-age=86400'); // Set cache to 1 day
    res.setHeader('ETag', etag); // Set hash as etag
    if(req.headers['if-none-match'] === etag) {
      res.status(304).send(); // Send 304 if etag match
    } else {
      res.sendFile(filepath); // Send file
    }
  });
  fileStream.on('error', (err) => {
    console.error(err);
    res.status(500).send(); // Send 500 if error
  });
}

app.get('/*', (req, res) => {
  // Get request path
  let filepath = req.path.slice(1);
  filepath = !!filepath ? filepath : 'index.html';

  // Get absolute file path
  let absPath = path.resolve(path.join(__dirname, '..', 'ui-client', 'dist', filepath));
  if(!existsSync(absPath)) {
    if(filepath !== 'index.html') {
      // Replace to index.html if file not found
      absPath = path.resolve(path.join(__dirname, '..', 'ui-client', 'dist', 'index.html'));
    } else {
      // Send 404 when index.html not found 
      return res.status(404).send('<h1 style="text-align: center">Not Found</h1>');
    }
  }

  // Send the file
  handleFileCache(req, res, absPath)
})

app.listen(PORT, () => console.log(`Server listen on port: ${PORT}`))

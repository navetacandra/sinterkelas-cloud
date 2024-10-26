const { spawnSync } = require('child_process');
const path = require('path');
const express = require('express');
const { existsSync } = require('fs');

// build-ui.js
;(() => {
  if(process.env.BUILD_UI == 'true') {
    spawnSync('node', [path.resolve(path.join(__dirname, 'build-ui.js'))]);
  }
})();

const app = express();
const PORT = process.env.PORT || 3000;

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
  return res.sendFile(absPath);
})

app.listen(PORT, () => console.log(`Server listen on port: ${PORT}`))

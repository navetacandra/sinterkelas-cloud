const { spawn } = require('child_process');
const path = require('path');

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
  return execute('npm', ['run', 'build'], { cwd: path.resolve(path.join(__dirname, '..', 'ui-client')) });
}

;(async function() {
  try {
    console.log('Building UI...');
    await buildUI();
    console.log('Done!');
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
})();

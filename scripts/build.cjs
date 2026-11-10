const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

function getPythonCommand() {
  try {
    execSync('python3 --version', { stdio: 'ignore' });
    return 'python3';
  } catch (e) {
    return 'python';
  }
}

const pyCmd = getPythonCommand();

console.log('=== [1/4] Preparing template index.html for Vite ===');
fs.copyFileSync('index.dev.html', 'index.html');

console.log('=== [2/4] Running Vite build ===');
execSync('npx vite build', { stdio: 'inherit' });

console.log('=== [3/4] Optimizing dist/index.html for offline execution ===');
execSync(`${pyCmd} scripts/move_script_to_body.py`, { stdio: 'inherit' });

console.log('=== [4/4] Syncing release files and launchers ===');
execSync(`${pyCmd} scripts/sync_release.py`, { stdio: 'inherit' });

console.log('\n✔ All built and ready for double-click launch!');

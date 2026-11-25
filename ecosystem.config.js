const fs = require('fs');

// Runs on its own Node 22 (/opt/node22, shared with TekCard) so other apps keep their Node version.
const NODE = process.env.MANASA_NODE || (fs.existsSync('/opt/node22/bin/node') ? '/opt/node22/bin/node' : 'node');

module.exports = {
  apps: [{
    name: 'manasa',
    script: 'server/index.js',
    cwd: __dirname,
    interpreter: NODE,
    exec_mode: 'fork',
    autorestart: true,
    max_memory_restart: '300M',
    env: { NODE_ENV: 'production' },
  }],
};

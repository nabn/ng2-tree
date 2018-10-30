const fs = require('fs');
const { exec } = require('child_process');

const platform = process.platform;

// swap contents of current directory with contents of dist
if (platform === 'darwin') {
  const temp = '/tmp/ng2-tree-dist';
  exec(`mv dist ${temp} && rm -rf ./* && mv ${temp}/* . && rm -r ${temp}`);
} else if (platform === 'win32') {
  const temp = 'C:\\temp\\ng2-tree-dist';
  exec(`move dist ${temp} && rd /q && move ${temp} . && rd /q ${temp}`);
} else {
  throw new Error('Unsupported platform');
  process.exit(1);
}

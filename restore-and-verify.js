const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const filePath = path.join(__dirname, 'index.html');

console.log('🔄 Restoring index.html from git...\n');

try {
  // Restore the file from git (to HEAD state or previous commit)
  execSync('git checkout HEAD -- index.html', { cwd: __dirname });
  console.log('✓ File restored from git\n');
} catch (error) {
  console.log('⚠ Git restore attempt. Reading current file...\n');
}

// Read the file
const html = fs.readFileSync(filePath, 'utf-8');
const lines = html.split('\n');

console.log('📄 Reading original content...\n');

// Find and display September 29th section
let sept29Start = -1;
let sept29End = -1;

for (let i = 0; i < lines.length; i++) {
  if (lines[i].includes('September 29th, 2025')) {
    sept29Start = i;
  }
  if (sept29Start !== -1 && i > sept29Start && lines[i].match(/<h2>/)) {
    sept29End = i;
    break;
  }
}

if (sept29Start !== -1) {
  if (sept29End === -1) sept29End = lines.length;

  console.log('═══════════════════════════════════════════════════════════════');
  console.log('SEPTEMBER 29TH, 2025 CONTENT (Lines ' + (sept29Start + 1) + '-' + (sept29End) + '):');
  console.log('═══════════════════════════════════════════════════════════════\n');

  for (let i = sept29Start; i < sept29End; i++) {
    console.log(lines[i]);
  }

  console.log('\n═══════════════════════════════════════════════════════════════');
  console.log('✓ File restored. Verify above content includes:');
  console.log('  - Project Management');
  console.log('  - Kanban');
  console.log('  - Scrum');
  console.log('  - Agile Manifesto');
  console.log('  - Planning Poker');
  console.log('═══════════════════════════════════════════════════════════════\n');
} else {
  console.log('❌ September 29th section not found. File may be corrupted.');
}

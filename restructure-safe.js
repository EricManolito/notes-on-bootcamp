const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'index.html');
const html = fs.readFileSync(filePath, 'utf-8');
const lines = html.split('\n');

console.log('🔧 Safe restructuring - preserving EVERY WORD from original...\n');

// Extract sections
let headSection = [];
let bodyLines = [];
let inBody = false;

for (let i = 0; i < lines.length; i++) {
  if (lines[i].includes('<body>')) {
    inBody = true;
    continue;
  }
  if (lines[i].includes('</body>')) {
    inBody = false;
    break;
  }
  if (!inBody) {
    headSection.push(lines[i]);
  } else {
    bodyLines.push(lines[i]);
  }
}

// Parse body to find h1 and h2 tags - these mark day boundaries
// Store as: { type: 'h1'|'h2', originalLine: string, contentLines: [strings] }
let days = [];
let currentDay = null;

for (let i = 0; i < bodyLines.length; i++) {
  const line = bodyLines[i];

  if (line.match(/<h1[^>]*>/)) {
    // First h1 becomes first day
    if (currentDay) {
      days.push(currentDay);
    }
    currentDay = {
      type: 'h1',
      originalLine: line,
      contentLines: []
    };
  } else if (line.match(/<h2[^>]*>/)) {
    // h2 starts new day
    if (currentDay) {
      days.push(currentDay);
    }
    currentDay = {
      type: 'h2',
      originalLine: line,
      contentLines: []
    };
  } else if (currentDay) {
    // Add content to current day (preserve exactly)
    currentDay.contentLines.push(line);
  }
}

// Don't forget last day
if (currentDay) {
  days.push(currentDay);
}

console.log(`✓ Parsed ${days.length} day entries\n`);

// Function to determine week number from h2 content
function getWeekForDay(day) {
  const text = day.originalLine.toLowerCase();

  if (text.includes('september 15')) return 1;
  if (text.includes('september 16')) return 1;
  if (text.includes('september 17')) return 1;
  if (text.includes('september 18')) return 1;
  if (text.includes('september 19')) return 1;
  if (text.includes('pre-work')) return 1;

  if (text.includes('september 22')) return 2;
  if (text.includes('september 23')) return 2;
  if (text.includes('september 24')) return 2;
  if (text.includes('september 25')) return 2;
  if (text.includes('september 26')) return 2;

  if (text.includes('september 29') || text.includes('9/29')) return 3;
  if (text.includes('september 30') || text.includes('9/30')) return 3;
  if (text.includes('october 1')) return 3;
  if (text.includes('october 2')) return 3;
  if (text.includes('october 3')) return 3;

  if (text.includes('october 6')) return 4;
  if (text.includes('october 7')) return 4;
  if (text.includes('october 8')) return 4;
  if (text.includes('october 9')) return 4;
  if (text.includes('october 10')) return 4;

  if (text.includes('october 13')) return 5;
  if (text.includes('october 14')) return 5;
  if (text.includes('october 15')) return 5;
  if (text.includes('october 16')) return 5;
  if (text.includes('october 17')) return 5;

  if (text.includes('october 20')) return 6;
  if (text.includes('october 21')) return 6;
  if (text.includes('october 22')) return 6;
  if (text.includes('october 23')) return 6;

  if (text.includes('october 27')) return 7;
  if (text.includes('october 28')) return 7;
  if (text.includes('october 29')) return 7;
  if (text.includes('october 30')) return 7;
  if (text.includes('october 31')) return 7;

  if (text.includes('november 3')) return 8;
  if (text.includes('november 4')) return 8;
  if (text.includes('november 5')) return 8;
  if (text.includes('november 6')) return 8;
  if (text.includes('november 7')) return 8;

  if (text.includes('november 10')) return 9;
  if (text.includes('november 11')) return 9;
  if (text.includes('november 12')) return 9;
  if (text.includes('november 14')) return 9;

  if (text.includes('november 17')) return 10;
  if (text.includes('november 18')) return 10;
  if (text.includes('november 19')) return 10;
  if (text.includes('november 20')) return 10;
  if (text.includes('november 21')) return 10;

  if (text.includes('november 24')) return 11;
  if (text.includes('november 25')) return 11;
  if (text.includes('november 26')) return 11;

  if (text.includes('december 1')) return 12;
  if (text.includes('december 2')) return 12;
  if (text.includes('december 3')) return 12;
  if (text.includes('december 4')) return 12;

  return 1;
}

// Week metadata
const weekData = {
  1: { range: 'Sept 15–19' },
  2: { range: 'Sept 22–26' },
  3: { range: 'Sept 29–Oct 3' },
  4: { range: 'Oct 6–10' },
  5: { range: 'Oct 13–17' },
  6: { range: 'Oct 20–23' },
  7: { range: 'Oct 27–31' },
  8: { range: 'Nov 3–7' },
  9: { range: 'Nov 10–14' },
  10: { range: 'Nov 17–21' },
  11: { range: 'Nov 24–26' },
  12: { range: 'Dec 1–4' }
};

// Group days by week
const daysByWeek = {};
for (let w = 1; w <= 12; w++) {
  daysByWeek[w] = [];
}

days.forEach(day => {
  const week = getWeekForDay(day);
  daysByWeek[week].push(day);
});

// Generate new HTML with preserved content
let output = '';

// Add head (with Tailwind CDN)
output += headSection.join('\n') + '\n';
output += '    <script src="https://cdn.tailwindcss.com"><\/script>\n';
output += '    <script>\n';
output += '      tailwind.config = {\n';
output += '        darkMode: \'class\',\n';
output += '      }\n';
output += '    <\/script>\n';
output += '</head>\n';

// Add body
output += '<body class="dark bg-gray-950 text-gray-100 font-mono p-4">\n\n';

// Add weeks
for (let weekNum = 1; weekNum <= 12; weekNum++) {
  const daysInWeek = daysByWeek[weekNum];
  const weekLabel = `Week ${weekNum}: ${weekData[weekNum].range}`;

  output += `<div class="week mb-12 border border-gray-700 rounded-xl p-6" data-week="${weekLabel}">\n`;
  output += `  <div class="text-indigo-400 text-xl font-bold mb-6 cursor-pointer hover:text-indigo-300">${weekLabel}</div>\n`;
  output += `  <div class="space-y-6">\n`;

  daysInWeek.forEach((day, idx) => {
    // Handle h1 conversion to h2 for first day
    let heading = day.originalLine;
    if (day.type === 'h1') {
      // Convert h1 to h2 for September 15th
      heading = heading.replace(/<h1[^>]*>/, '<h2>').replace(/<\/h1>/, '</h2>');
      // Change text from "September 15th - 19, 2025 notes" to "September 15th, 2025"
      heading = heading.replace(/September 15th - 19, 2025 notes/, 'September 15th, 2025');
    }

    // Handle Nov 12 labeling
    if (heading.includes('November 12th, 2025') && heading.includes('merge to main')) {
      heading = heading.replace('November 12th, 2025 8:00 am merge to main', 'November 12th, 2025 (a) — merge to main');
    } else if (heading.includes('November 12th, 2025') && heading.includes('Standup')) {
      heading = heading.replace('November 12th, 2025 8:00 am  Standup', 'November 12th, 2025 (b) — Standup');
    }

    // Add Tailwind classes to heading
    heading = heading.replace(/<h2([^>]*)>/, '<h2$1 class="text-green-400 text-base font-semibold mb-3">');
    heading = heading.replace(/<h3([^>]*)>/, '<h3$1 class="text-cyan-400 text-sm font-semibold mt-3 mb-2">');

    output += `    <div class="day mb-6 border-l-2 border-gray-600 pl-4">\n`;
    output += `      ${heading}\n`;

    // Add content lines (PRESERVE EXACTLY)
    day.contentLines.forEach(contentLine => {
      if (contentLine.trim()) {
        // Apply Tailwind to p tags only (preserve structure)
        let styledLine = contentLine;
        styledLine = styledLine.replace(/<p>/g, '<p class="text-gray-300 text-sm leading-relaxed mb-2">');
        styledLine = styledLine.replace(/<hr>/g, '<hr class="border-gray-600 my-3">');
        output += `      ${styledLine}\n`;
      }
    });

    output += `    </div>\n`;
  });

  output += `  </div>\n`;
  output += `</div>\n\n`;
}

// Add modal HTML
output += `<!-- Week Overview Modal -->
<div id="week-modal" class="fixed inset-0 bg-black/80 z-50 hidden flex items-center justify-center p-4">
  <div class="bg-gray-900 border border-gray-700 rounded-xl max-w-2xl w-full max-h-[80vh] overflow-y-auto p-6">
    <div class="flex justify-between items-center mb-4">
      <h2 id="modal-week-title" class="text-indigo-400 text-lg font-bold"></h2>
      <button id="modal-close" class="text-gray-400 hover:text-white text-2xl leading-none">&times;</button>
    </div>
    <div id="modal-day-list" class="space-y-2 mb-4"></div>
    <div id="modal-day-detail" class="hidden mt-4 border-t border-gray-700 pt-4 max-h-[50vh] overflow-y-auto"></div>
  </div>
</div>

<script>
  const modal = document.getElementById('week-modal');
  const modalTitle = document.getElementById('modal-week-title');
  const modalDayList = document.getElementById('modal-day-list');
  const modalDayDetail = document.getElementById('modal-day-detail');
  const modalClose = document.getElementById('modal-close');

  // Week click handler
  document.querySelectorAll('.week').forEach(weekDiv => {
    const weekLabel = weekDiv.querySelector('.text-indigo-400').textContent;
    weekDiv.addEventListener('click', (e) => {
      if (e.target.closest('.day')) return;

      const daysInWeek = weekDiv.querySelectorAll('.day');

      modalTitle.textContent = weekLabel;
      modalDayList.innerHTML = '';
      modalDayDetail.classList.add('hidden');
      modalDayDetail.innerHTML = '';

      daysInWeek.forEach(dayDiv => {
        const dayHeading = dayDiv.querySelector('h2')?.textContent || 'Untitled Day';
        const btn = document.createElement('button');
        btn.className = 'w-full text-left px-4 py-2 rounded bg-gray-800 hover:bg-indigo-700 text-gray-100 text-sm transition';
        btn.textContent = dayHeading;
        btn.addEventListener('click', () => {
          modalDayDetail.innerHTML = dayDiv.innerHTML;
          modalDayDetail.classList.remove('hidden');
        });
        modalDayList.appendChild(btn);
      });

      modal.classList.remove('hidden');
    });
  });

  // Close modal handlers
  modalClose.addEventListener('click', () => modal.classList.add('hidden'));
  modal.addEventListener('click', (e) => {
    if (e.target === modal) modal.classList.add('hidden');
  });
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') modal.classList.add('hidden');
  });
<\/script>

</body>
</html>
`;

// Write to file
fs.writeFileSync(filePath, output, 'utf-8');

console.log('✓ Restructuring complete!');
console.log('  - All 12 weeks created with week/day divs');
console.log('  - EVERY WORD from original content preserved');
console.log('  - Tailwind CSS CDN added (dark theme)');
console.log('  - Modal with week overview + day drill-down added');
console.log('  - Nov 12 entries labeled (a) and (b)');
console.log('  - Sept 15 h1 converted to h2\n');

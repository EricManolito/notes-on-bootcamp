const fs = require('fs');
const path = require('path');

// Read the current index.html
const filePath = path.join(__dirname, 'index.html');
const html = fs.readFileSync(filePath, 'utf-8');

// Split into lines for processing
const lines = html.split('\n');

// Week configuration with their date ranges and expected day headings
const weeks = [
  { num: 1, range: 'Sept 15–19', days: [] },
  { num: 2, range: 'Sept 22–26', days: [] },
  { num: 3, range: 'Sept 29–Oct 3', days: [] },
  { num: 4, range: 'Oct 6–10', days: [] },
  { num: 5, range: 'Oct 13–17', days: [] },
  { num: 6, range: 'Oct 20–23', days: [] },
  { num: 7, range: 'Oct 27–31', days: [] },
  { num: 8, range: 'Nov 3–7', days: [] },
  { num: 9, range: 'Nov 10–14', days: [] },
  { num: 10, range: 'Nov 17–21', days: [] },
  { num: 11, range: 'Nov 24–26', days: [] },
  { num: 12, range: 'Dec 1–4', days: [] }
];

// Extract all h2 content (and the h1 on line 8 which becomes h2)
let bodyContent = '';
let inBody = false;
let currentContent = [];

// Parse body content and identify days
let days = [];
let dayIndex = -1;
let isFirstDay = true;

for (let i = 0; i < lines.length; i++) {
  const line = lines[i];

  if (line.includes('<body>')) {
    inBody = true;
    continue;
  }
  if (line.includes('</body>')) {
    inBody = false;
    break;
  }

  if (!inBody) continue;

  // Handle the h1 on line 8 (index 7)
  if (i === 7 && line.includes('<h1>')) {
    days.push({
      heading: '<h2>September 15th, 2025</h2>',
      content: [],
      isH1Convert: true,
      week: 1
    });
    dayIndex = days.length - 1;
    continue;
  }

  // Handle Pre-work h2 - convert to h3 inside first day
  if (i === 37 && line.includes('Pre-work:')) {
    days[0].content.push(line.replace(/<h2>(.*?)<\/h2>/, '<h3>$1</h3>'));
    continue;
  }

  // Handle other h2 tags as new days
  if (line.match(/<h2>/)) {
    let heading = line;

    // Label November 12 entries
    if (line.includes('November 12th, 2025 8:00 am merge to main')) {
      heading = line.replace('November 12th, 2025 8:00 am merge to main', 'November 12th, 2025 (a) — merge to main');
    } else if (line.includes('November 12th, 2025 8:00 am  Standup')) {
      heading = line.replace('November 12th, 2025 8:00 am  Standup', 'November 12th, 2025 (b) — Standup');
    }

    days.push({
      heading: heading,
      content: [],
      week: getWeekNumber(heading)
    });
    dayIndex = days.length - 1;
    continue;
  }

  // Add content to current day
  if (dayIndex >= 0) {
    days[dayIndex].content.push(line);
  }
}

// Function to determine week number based on day heading
function getWeekNumber(heading) {
  if (heading.includes('September 15') || heading.includes('Pre-work')) return 1;
  if (heading.includes('September 22')) return 2;
  if (heading.includes('September 23') || heading.includes('September 24') || heading.includes('September 25') || heading.includes('September 26')) return 2;
  if (heading.includes('September 29') || heading.includes('September 30')) return 3;
  if (heading.includes('October 1') || heading.includes('October 2') || heading.includes('October 3')) return 3;
  if (heading.includes('October 6') || heading.includes('October 7') || heading.includes('October 8') || heading.includes('October 9') || heading.includes('October 10')) return 4;
  if (heading.includes('October 13') || heading.includes('October 14') || heading.includes('October 15') || heading.includes('October 16') || heading.includes('October 17')) return 5;
  if (heading.includes('October 20') || heading.includes('October 21') || heading.includes('October 22') || heading.includes('October 23')) return 6;
  if (heading.includes('October 27') || heading.includes('October 28') || heading.includes('October 29') || heading.includes('October 30') || heading.includes('October 31')) return 7;
  if (heading.includes('November 3') || heading.includes('November 4') || heading.includes('November 5') || heading.includes('November 6') || heading.includes('November 7')) return 8;
  if (heading.includes('November 10') || heading.includes('November 11') || heading.includes('November 12') || heading.includes('November 14')) return 9;
  if (heading.includes('November 17') || heading.includes('November 18') || heading.includes('November 19') || heading.includes('November 20') || heading.includes('November 21')) return 10;
  if (heading.includes('November 24') || heading.includes('November 25') || heading.includes('November 26')) return 11;
  if (heading.includes('December')) return 12;
  return 1;
}

// Group days by week
const daysByWeek = {};
days.forEach(day => {
  if (!daysByWeek[day.week]) daysByWeek[day.week] = [];
  daysByWeek[day.week].push(day);
});

// Generate new HTML
let newHtml = `<!DOCTYPE html>
<html lang="en" class="dark">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Bootcamp Notes — September to December 2025</title>
    <script src="https://cdn.tailwindcss.com"><\/script>
    <script>
      tailwind.config = {
        darkMode: 'class',
      }
    <\/script>
</head>
<body class="dark bg-gray-950 text-gray-100 font-mono p-4">

`;

// Build week sections
for (let weekNum = 1; weekNum <= 12; weekNum++) {
  const week = weeks[weekNum - 1];
  const daysInWeek = daysByWeek[weekNum] || [];

  newHtml += `<div class="week mb-12 border border-gray-700 rounded-xl p-6" data-week="Week ${weekNum}: ${week.range}">
  <div class="text-indigo-400 text-xl font-bold mb-6 cursor-pointer hover:text-indigo-300">Week ${weekNum}: ${week.range}</div>
  <div class="days-container space-y-4">
`;

  daysInWeek.forEach(day => {
    newHtml += `    <div class="day mb-6 border-l-2 border-gray-600 pl-4">
      ${day.heading}
`;
    day.content.forEach(contentLine => {
      if (contentLine.trim()) {
        // Apply Tailwind classes to p tags
        const styledLine = contentLine
          .replace(/<p>/g, '<p class="text-gray-300 text-sm leading-relaxed mb-2">')
          .replace(/<hr>/g, '<hr class="border-gray-600 my-3">')
          .replace(/<br>/g, '<br>');
        newHtml += `      ${styledLine}\n`;
      }
    });
    newHtml += `    </div>\n`;
  });

  newHtml += `  </div>
</div>

`;
}

// Add modal HTML
newHtml += `<!-- Week Overview Modal -->
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
    weekDiv.addEventListener('click', (e) => {
      if (e.target.closest('.day')) return; // Don't open if clicking a day

      const weekLabel = weekDiv.dataset.week;
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
</html>`;

// Write the new HTML back to file
fs.writeFileSync(filePath, newHtml, 'utf-8');
console.log('✓ index.html restructured successfully!');
console.log('  - 12 weeks created with day divs');
console.log('  - Tailwind CDN and dark theme applied');
console.log('  - Modal system integrated');
console.log('  - Nov 12 entries labeled (a) and (b)');

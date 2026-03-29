// ── NOISE SLIDER ──
const slider = document.getElementById('noiseSlider');
const noiseVal = document.getElementById('noiseVal');
const noiseEmoji = document.getElementById('noiseEmoji');
const noiseDesc = document.getElementById('noiseDesc');

const noiseMap = {
  1:  ['🤫', 'Silent'],
  2:  ['😌', 'Near Silent'],
  3:  ['🌿', 'Very Quiet'],
  4:  ['📚', 'Quiet'],
  5:  ['😐', 'Moderate'],
  6:  ['💬', 'Conversational'],
  7:  ['📢', 'Noisy'],
  8:  ['🔊', 'Very Noisy'],
  9:  ['😤', 'Loud'],
  10: ['🚨', 'Chaotic']
};

slider.addEventListener('input', () => {
  const v = slider.value;
  noiseVal.textContent = v;
  noiseEmoji.textContent = noiseMap[v][0];
  noiseDesc.textContent = noiseMap[v][1];
  const hue = Math.round(120 - (v - 1) * 13.3);
  noiseVal.style.color = `hsl(${hue}, 60%, 65%)`;
});

// ── FORM SUBMIT ──
document.getElementById('reportForm').addEventListener('submit', async (e) => {
  e.preventDefault();
  const fd = new FormData(e.target);
  const res = await fetch('/submit', { method: 'POST', body: fd });
  const data = await res.json();
  if (data.success) {
    showToast();
    e.target.reset();
    noiseVal.textContent = '5';
    noiseEmoji.textContent = '😐';
    noiseDesc.textContent = 'Moderate';
    noiseVal.style.color = 'var(--accent)';
    slider.value = 5;
    loadStats();
  }
});

// ── TOAST ──
function showToast() {
  const t = document.getElementById('toast');
  t.classList.add('show');
  setTimeout(() => t.classList.remove('show'), 3000);
}

// ── HELPERS ──
function noiseColor(v) {
  if (v <= 3) return 'var(--green)';
  if (v <= 6) return 'var(--yellow)';
  return 'var(--red)';
}

function statusBadge(status) {
  const colors = {
    'Silent':     ['rgba(110,200,169,0.15)', 'var(--green)'],
    'Quiet':      ['rgba(110,200,169,0.1)',  'var(--green)'],
    'Moderate':   ['rgba(200,192,110,0.15)', 'var(--yellow)'],
    'Noisy':      ['rgba(200,110,126,0.15)', 'var(--red)'],
    'Very Noisy': ['rgba(200,110,126,0.2)',  'var(--red)'],
  };
  const [bg, color] = colors[status] || ['transparent', 'var(--muted)'];
  return `<span class="loc-badge" style="background:${bg};color:${color}">${status}</span>`;
}

// ── LOAD DASHBOARD ──
async function loadStats() {
  const res = await fetch('/api/stats');
  const data = await res.json();

  // Stats row
  document.getElementById('totalReports').textContent = data.total || 0;
  document.getElementById('locsCovered').textContent = data.locations.length;
  const quietCount = data.locations.filter(l => l.avg_noise <= 4).length;
  document.getElementById('quietCount').textContent = quietCount;

  // Best spot now
  if (data.best_now) {
    document.getElementById('bestNow').style.display = 'flex';
    document.getElementById('bestNowPlace').textContent = data.best_now;
  }

  // Location ranking cards
  const grid = document.getElementById('locGrid');
  if (data.locations.length === 0) {
    grid.innerHTML = '<div class="empty">No reports yet — submit the first one!</div>';
  } else {
    grid.innerHTML = data.locations.map((loc, i) => `
      <div class="loc-card" style="animation-delay:${i * 0.05}s">
        <div class="loc-bar-wrap">
          <div class="loc-name">${loc.location}</div>
          <div class="loc-bar-bg">
            <div class="loc-bar-fill" style="width:${loc.avg_noise * 10}%;background:${noiseColor(loc.avg_noise)}"></div>
          </div>
          <div class="loc-meta">
            <span>${loc.reports} report${loc.reports !== 1 ? 's' : ''}</span>
            <span>${loc.avg_noise}/10</span>
          </div>
        </div>
        ${statusBadge(loc.status)}
      </div>
    `).join('');
  }

  // Heatmap
  const heatmap = document.getElementById('heatmapGrid');
  heatmap.innerHTML = data.heatmap.map(cell => {
    const v = cell.avg_noise;
    let bg = 'rgba(42,42,58,0.5)';
    let valColor = 'var(--muted)';
    if (v > 0) {
      if (v <= 3)      { bg = 'rgba(110,200,169,0.25)'; valColor = 'var(--green)'; }
      else if (v <= 6) { bg = 'rgba(200,192,110,0.25)'; valColor = 'var(--yellow)'; }
      else             { bg = 'rgba(200,110,126,0.3)';  valColor = 'var(--red)'; }
    }
    const label = cell.hour > 12 ? `${cell.hour - 12}pm`
                : cell.hour === 12 ? '12pm'
                : `${cell.hour}am`;
    return `
      <div class="heatmap-cell" style="background:${bg}" title="${label}: ${v > 0 ? v + '/10' : 'No data'}">
        <span class="heatmap-hour">${label}</span>
        <span class="heatmap-val" style="color:${valColor}">${v > 0 ? v : '·'}</span>
      </div>`;
  }).join('');

  // Recent reports
  const recent = document.getElementById('recentList');
  if (!data.recent || data.recent.length === 0) {
    recent.innerHTML = '<div class="empty">No reports yet. Be the first!</div>';
  } else {
    recent.innerHTML = data.recent.map((r, i) => `
      <div class="recent-item" style="animation-delay:${i * 0.07}s">
        <div>
          <div class="recent-loc">${r.location}</div>
          <div class="recent-time">${r.timestamp}</div>
          ${r.note ? `<div class="recent-note">"${r.note}"</div>` : ''}
        </div>
        <div class="noise-pill" style="color:${noiseColor(r.noise_level)}">${r.noise_level}</div>
      </div>
    `).join('');
  }
}

// Initial load + auto-refresh every 30 seconds
loadStats();
setInterval(loadStats, 30000);

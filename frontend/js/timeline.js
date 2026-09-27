const timelineTrack = document.getElementById('timeline-track');

// Fixed visible window: 00:00 to 23:59 today (keeps the math simple and predictable)
function getDayBounds() {
  const now = new Date();
  const start = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0);
  const end = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59);
  return { start, end };
}

function percentOfDay(date, dayStart, dayEnd) {
  const total = dayEnd - dayStart;
  const offset = date - dayStart;
  return Math.max(0, Math.min(100, (offset / total) * 100));
}

async function renderTimeline() {
  try {
    const ads = await fetchAllAds();
    const { start: dayStart, end: dayEnd } = getDayBounds();
    const now = new Date();

    // Only show ads that fall within today
    const todaysAds = ads.filter(ad => {
      const s = new Date(ad.start_time);
      const e = new Date(ad.end_time);
      return s <= dayEnd && e >= dayStart;
    });

    const nowPercent = percentOfDay(now, dayStart, dayEnd);

    let html = `<div class="timeline-now-marker" style="left:${nowPercent}%"></div>`;

    todaysAds.forEach((ad, index) => {
      const s = new Date(ad.start_time);
      const e = new Date(ad.end_time);
      const leftPct = percentOfDay(s, dayStart, dayEnd);
      const widthPct = percentOfDay(e, dayStart, dayEnd) - leftPct;
      const isActive = now >= s && now < e;

      // Stack overlapping ads on different vertical rows
      const row = index % 3;

      html += `
        <div class="timeline-block ${isActive ? 'active' : ''}"
             style="left:${leftPct}%; width:${widthPct}%; top:${row * 26}px;"
             title="${ad.name}: ${s.toLocaleTimeString()} - ${e.toLocaleTimeString()}">
          ${ad.name}
        </div>`;
    });

    timelineTrack.innerHTML = html;
  } catch (err) {
    console.error('Timeline render failed:', err);
  }
}

renderTimeline();
setInterval(renderTimeline, 30000); // refresh every 30s — timeline doesn't need to be as real-time as the player
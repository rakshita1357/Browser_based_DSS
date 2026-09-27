const API_BASE = 'http://localhost:3000';

async function fetchCurrentSchedule() {
  const res = await fetch(`${API_BASE}/api/schedule/current`);
  if (!res.ok) throw new Error('Failed to fetch schedule');
  return res.json();
}

function resolveMediaUrl(mediaUrl) {
  return `${API_BASE}${mediaUrl}`;
}
async function fetchUpcomingAds() {
  const res = await fetch(`${API_BASE}/api/ads/upcoming`);
  if (!res.ok) throw new Error('Failed to fetch upcoming ads');
  return res.json();
}
async function fetchAllAds() {
  const res = await fetch(`${API_BASE}/api/ads`);
  if (!res.ok) throw new Error('Failed to fetch ads');
  return res.json();
}
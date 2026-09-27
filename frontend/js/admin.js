const form = document.getElementById('ad-form');
const message = document.getElementById('form-message');
const tbody = document.getElementById('ads-tbody');

function computeState(ad, now) {
  const start = new Date(ad.start_time);
  const end = new Date(ad.end_time);
  if (ad.status === 'inactive') return 'inactive';
  if (now < start) return 'upcoming';
  if (now >= start && now < end) return 'active';
  return 'expired';
}

async function loadAds() {
  const res = await fetch(`${API_BASE}/api/ads`);
  const ads = await res.json();
  const now = new Date();

  tbody.innerHTML = ads.map(ad => {
    const state = computeState(ad, now);
    return `
      <tr>
        <td>${ad.id}</td>
        <td>${ad.name}</td>
        <td>${ad.media_type}</td>
        <td>${new Date(ad.start_time).toLocaleString()}</td>
        <td>${new Date(ad.end_time).toLocaleString()}</td>
        <td>${ad.status}</td>
        <td>${ad.priority}</td>
        <td class="state-${state}">${state}</td>
        <td><button class="del-btn" data-id="${ad.id}">Delete</button></td>
      </tr>
    `;
  }).join('');

  document.querySelectorAll('.del-btn').forEach(btn => {
    btn.addEventListener('click', async () => {
      if (!confirm('Delete this ad?')) return;
      await fetch(`${API_BASE}/api/ads/${btn.dataset.id}`, { method: 'DELETE' });
      loadAds();
    });
  });
}

form.addEventListener('submit', async (e) => {
  e.preventDefault();
  message.textContent = '';
  message.className = '';

  const file = document.getElementById('f-file').files[0];
  if (!file) return;

  try {
    // Step 1: upload the file
    const formData = new FormData();
    formData.append('file', file);

    const uploadRes = await fetch(`${API_BASE}/api/ads/upload`, { method: 'POST', body: formData });
    const uploadData = await uploadRes.json();
    if (!uploadRes.ok) throw new Error(uploadData.error || 'Upload failed');

    // Step 2: create the ad record using the returned media_url/media_type
    const adPayload = {
      name: document.getElementById('f-name').value,
      media_type: uploadData.media_type,
      media_url: uploadData.media_url,
      start_time: document.getElementById('f-start').value.replace('T', ' ') + ':00',
      end_time: document.getElementById('f-end').value.replace('T', ' ') + ':00',
      status: document.getElementById('f-status').value,
      priority: parseInt(document.getElementById('f-priority').value) || 0
    };

    const createRes = await fetch(`${API_BASE}/api/ads`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(adPayload)
    });
    const createData = await createRes.json();
    if (!createRes.ok) throw new Error(createData.error || 'Create failed');

    message.textContent = 'Advertisement added successfully.';
    message.className = 'success';
    form.reset();
    loadAds();

  } catch (err) {
    message.textContent = err.message;
    message.className = 'error';
  }
});

loadAds();
setInterval(loadAds, 10000); // refresh table every 10s so "current state" stays accurate
document.getElementById('demo-btn').addEventListener('click', async () => {
  try {
    const res = await fetch(`${API_BASE}/api/ads/demo-seed`, { method: 'POST' });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error);
    alert(data.message);
    loadAds();
  } catch (err) {
    alert('Error: ' + err.message);
  }
});
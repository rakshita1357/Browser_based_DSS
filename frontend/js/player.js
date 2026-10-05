// Tracks which ad is currently rendered in each zone, so we don't restart video/reload images unnecessarily
const zoneCurrentAdId = { image: null, gif: null, video: null };

const zoneConfig = {
  image: { contentId: 'zone-image-content', labelId: 'zone-image-label' },
  gif:   { contentId: 'zone-gif-content',   labelId: 'zone-gif-label' },
  video: { contentId: 'zone-video-content', labelId: 'zone-video-label' }
};

function renderZoneFallback(zoneType, message = 'No ad scheduled') {
  const { contentId, labelId } = zoneConfig[zoneType];
  document.getElementById(contentId).innerHTML = `<div class="fallback">${message}</div>`;
  document.getElementById(labelId).textContent = `${zoneType.toUpperCase()} ZONE — NO_AD`;
  zoneCurrentAdId[zoneType] = null;
}

function renderZoneAd(zoneType, ad) {
  const { contentId } = zoneConfig[zoneType];
  const url = resolveMediaUrl(ad.media_url);
  const container = document.getElementById(contentId);

  if (zoneType === 'image' || zoneType === 'gif') {
    container.innerHTML = `<img src="${url}" alt="${ad.name}" onerror="this.parentElement.innerHTML='<div class=\\'fallback error\\'>Media failed to load</div>'">`;
  } else if (zoneType === 'video') {
    container.innerHTML = `<video src="${url}" autoplay muted loop playsinline onerror="this.parentElement.innerHTML='<div class=\\'fallback error\\'>Media failed to load</div>'"></video>`;
  }
}

function updateZoneLabel(zoneType, decision) {
  const { labelId } = zoneConfig[zoneType];
  const label = document.getElementById(labelId);

  if (decision.state === 'NO_AD') {
    label.textContent = `${zoneType.toUpperCase()} ZONE — NO_AD`;
  } else if (decision.state === 'SINGLE_AD') {
    label.textContent = `${zoneType.toUpperCase()} ZONE — ${decision.ad.name}`;
  } else if (decision.state === 'ROTATING') {
    label.textContent = `${zoneType.toUpperCase()} ZONE — ${decision.ad.name} (${decision.rotationIndex + 1}/${decision.totalInRotation})`;
  }
}

function applyZoneDecision(zoneType, decision) {
  if (decision.state === 'NO_AD') {
    renderZoneFallback(zoneType);
    return;
  }

  const ad = decision.ad;
  if (ad.id !== zoneCurrentAdId[zoneType]) {
    renderZoneAd(zoneType, ad);
    zoneCurrentAdId[zoneType] = ad.id;
  }

  updateZoneLabel(zoneType, decision);
}

async function pollZonedSchedule() {
  try {
    const data = await fetchZonedSchedule();
    applyZoneDecision('image', data.image);
    applyZoneDecision('gif', data.gif);
    applyZoneDecision('video', data.video);
  } catch (err) {
    console.error('Zoned poll failed:', err);
    ['image', 'gif', 'video'].forEach(z => renderZoneFallback(z, 'Connection error'));
  }
}

pollZonedSchedule();
checkAndPreloadUpcoming();
setInterval(pollZonedSchedule, 5000);
setInterval(checkAndPreloadUpcoming, 15000);
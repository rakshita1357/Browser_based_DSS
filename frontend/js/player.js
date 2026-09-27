const playerContainer = document.getElementById('player-container');
const infoName = document.getElementById('info-name');
const infoType = document.getElementById('info-type');
const infoStatus = document.getElementById('info-status');
const infoNextSwitch = document.getElementById('info-next-switch');
const infoRotation = document.getElementById('info-rotation');
const infoPreload = document.getElementById('info-preload');
let currentAdId = null; // avoid re-rendering the same ad every poll (prevents video restart flicker)


function renderFallback(message = 'No advertisement scheduled') {
  playerContainer.innerHTML = `<div class="fallback">${message}</div>`;
  infoName.textContent = '—';
  infoType.textContent = '—';
  infoStatus.textContent = 'NO_AD';
  infoNextSwitch.textContent = '—';
  infoRotation.textContent = '—';
  currentAdId = null;
}
function updatePreloadDisplay() {
  // Show preload status of whichever ad is about to play next, if known
  if (currentAdId && preloadState.has(currentAdId)) {
    infoPreload.textContent = getPreloadStatus(currentAdId);
  } else {
    infoPreload.textContent = 'N/A';
  }
}
function renderAd(ad, mediaType) {
  const url = resolveMediaUrl(ad.media_url);

  if (mediaType === 'image' || mediaType === 'gif') {
    playerContainer.innerHTML = `<img src="${url}" alt="${ad.name}" onerror="this.parentElement.innerHTML='<div class=\\'fallback error\\'>Media failed to load: ${ad.name}</div>'">`;
  } else if (mediaType === 'video') {
    playerContainer.innerHTML = `<video src="${url}" autoplay muted loop playsinline onerror="this.parentElement.innerHTML='<div class=\\'fallback error\\'>Media failed to load: ${ad.name}</div>'"></video>`;
  } else {
    playerContainer.innerHTML = `<div class="fallback error">Unsupported media type: ${mediaType}</div>`;
  }
}

async function pollSchedule() {
  try {
    const data = await fetchCurrentSchedule();

    if (data.state === 'NO_AD') {
      renderFallback();
      return;
    }

    const ad = data.ad;

    // Only re-render the DOM element if the ad actually changed (prevents video restart every poll)
    if (ad.id !== currentAdId) {
      renderAd(ad, ad.media_type);
      currentAdId = ad.id;
    }

    infoName.textContent = ad.name;
    infoType.textContent = ad.media_type;
    infoStatus.textContent = data.state;
    infoNextSwitch.textContent = new Date(data.nextSwitchAt).toLocaleTimeString();
    infoRotation.textContent = data.state === 'ROTATING'
      ? `${data.rotationIndex + 1} of ${data.totalInRotation}`
      : 'N/A';

} catch (err) {
  playerContainer.innerHTML = `<div class="fallback error">Connection error — retrying...</div>`;
  console.error('Poll failed:', err);
}
}

// Poll every 5 seconds — frequent enough to catch rotation switches without hammering the server
pollSchedule();
setInterval(pollSchedule, 5000);
pollSchedule();
checkAndPreloadUpcoming();
setInterval(pollSchedule, 5000);
setInterval(checkAndPreloadUpcoming, 15000); // check upcoming ads every 15s
setInterval(updatePreloadDisplay, 5000);
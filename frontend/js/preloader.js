const PRELOAD_MINUTES = 45; // mirrors backend .env PRELOAD_MINUTES

// Tracks state per ad id: 'preloading' | 'ready'
const preloadState = new Map();
const preloadedElements = new Map(); // cache the actual Image/video elements

function getPreloadStatus(adId) {
  return preloadState.get(adId) || 'not-started';
}

function preloadAsset(ad) {
  if (preloadState.has(ad.id)) return; // already preloading or ready — never re-fetch

  preloadState.set(ad.id, 'preloading');
  const url = resolveMediaUrl(ad.media_url);

  if (ad.media_type === 'image' || ad.media_type === 'gif') {
    const img = new Image();
    img.onload = () => {
      preloadState.set(ad.id, 'ready');
    };
    img.onerror = () => {
      preloadState.set(ad.id, 'error');
    };
    img.src = url;
    preloadedElements.set(ad.id, img);

  } else if (ad.media_type === 'video') {
    const video = document.createElement('video');
    video.preload = 'auto';
    video.muted = true;
    video.style.display = 'none';
    video.addEventListener('canplaythrough', () => {
      preloadState.set(ad.id, 'ready');
    }, { once: true });
    video.addEventListener('error', () => {
      preloadState.set(ad.id, 'error');
    });
    video.src = url;
    document.body.appendChild(video); // hidden, just to force browser buffering
    preloadedElements.set(ad.id, video);
  }
}

async function checkAndPreloadUpcoming() {
  try {
    const upcoming = await fetchUpcomingAds();
    const now = new Date();

    upcoming.forEach(ad => {
      const start = new Date(ad.start_time);
      const minutesUntilStart = (start - now) / 60000;

      if (minutesUntilStart <= PRELOAD_MINUTES) {
        preloadAsset(ad);
      }
    });
  } catch (err) {
    console.error('Preload check failed:', err);
  }
}
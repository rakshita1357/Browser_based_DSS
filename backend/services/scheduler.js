const ROTATION_INTERVAL_MINUTES = parseInt(process.env.ROTATION_INTERVAL_MINUTES) || 5;

/**
 * Given a list of currently-active ads, determine which one should play right now.
 * Pure function: same input (ads array + current time) always gives same output.
 */
function decideCurrentAd(activeAds, now = new Date()) {
  if (!activeAds || activeAds.length === 0) {
    return { state: 'NO_AD', ad: null, nextSwitchAt: null };
  }

  if (activeAds.length === 1) {
    return {
      state: 'SINGLE_AD',
      ad: activeAds[0],
      nextSwitchAt: activeAds[0].end_time
    };
  }

  // Multiple ads: rotate using fixed time slots
  const intervalMs = ROTATION_INTERVAL_MINUTES * 60 * 1000;
  const slotNumber = Math.floor(now.getTime() / intervalMs);
  const adIndex = slotNumber % activeAds.length;
  const currentAd = activeAds[adIndex];

  // Calculate when the NEXT slot begins (for frontend countdown)
  const nextSlotStart = (slotNumber + 1) * intervalMs;
  const nextSwitchAt = new Date(nextSlotStart);

  return {
    state: 'ROTATING',
    ad: currentAd,
    rotationIndex: adIndex,
    totalInRotation: activeAds.length,
    nextSwitchAt
  };
}

module.exports = { decideCurrentAd, ROTATION_INTERVAL_MINUTES };
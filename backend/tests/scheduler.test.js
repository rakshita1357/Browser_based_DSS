const { decideCurrentAd } = require('../services/scheduler');

// Simple hand-rolled assertion helper — no need for a testing framework for this scope
let passed = 0;
let failed = 0;

function assert(condition, testName) {
  if (condition) {
    console.log(`✅ PASS: ${testName}`);
    passed++;
  } else {
    console.log(`❌ FAIL: ${testName}`);
    failed++;
  }
}

// ---- Test 1: No active ads ----
{
  const result = decideCurrentAd([], new Date());
  assert(result.state === 'NO_AD', 'Test 1: Empty array returns NO_AD');
  assert(result.ad === null, 'Test 1: NO_AD has null ad');
}

// ---- Test 2: One active ad ----
{
  const ads = [{ id: 1, name: 'Solo Ad', end_time: '2026-01-01 15:00:00' }];
  const result = decideCurrentAd(ads, new Date());
  assert(result.state === 'SINGLE_AD', 'Test 2: Single ad returns SINGLE_AD');
  assert(result.ad.id === 1, 'Test 2: Correct ad returned');
}

// ---- Test 3: Two ads rotating — same slot gives same result (determinism) ----
{
  const ads = [
    { id: 1, name: 'Ad A' },
    { id: 2, name: 'Ad B' }
  ];
  const fixedTime = new Date('2026-01-01T12:32:00'); // fixed timestamp, not "now"
  const result1 = decideCurrentAd(ads, fixedTime);
  const result2 = decideCurrentAd(ads, fixedTime);
  assert(result1.state === 'ROTATING', 'Test 3: Two ads returns ROTATING');
  assert(result1.ad.id === result2.ad.id, 'Test 3: Same timestamp always gives same ad (deterministic)');
}

// ---- Test 4: Rotation changes across different 5-min slots ----
{
  const ads = [
    { id: 1, name: 'Ad A' },
    { id: 2, name: 'Ad B' }
  ];
  const slot1 = decideCurrentAd(ads, new Date('2026-01-01T12:30:00'));
  const slot2 = decideCurrentAd(ads, new Date('2026-01-01T12:35:00'));
  assert(slot1.ad.id !== slot2.ad.id, 'Test 4: Adjacent 5-min slots pick different ads (proves rotation)');
}

// ---- Test 5: Three ads rotate through all three, not just two ----
{
  const ads = [
    { id: 1, name: 'Ad A' },
    { id: 2, name: 'Ad B' },
    { id: 3, name: 'Ad C' }
  ];
  const seenIds = new Set();
  for (let i = 0; i < 6; i++) {
    const t = new Date(2026, 0, 1, 12, i * 5, 0); // step through 6 consecutive 5-min slots
    const result = decideCurrentAd(ads, t);
    seenIds.add(result.ad.id);
  }
  assert(seenIds.size === 3, 'Test 5: Three-ad rotation cycles through all 3 ads over time');
  assert(seenIds.has(1) && seenIds.has(2) && seenIds.has(3), 'Test 5: All three specific ad IDs appeared');
}

// ---- Test 6: nextSwitchAt is present and in the future for rotating ads ----
{
  const ads = [{ id: 1 }, { id: 2 }];
  const now = new Date();
  const result = decideCurrentAd(ads, now);
  assert(result.nextSwitchAt instanceof Date, 'Test 6: nextSwitchAt is a Date object');
  assert(result.nextSwitchAt.getTime() > now.getTime(), 'Test 6: nextSwitchAt is in the future');
}

// ---- Summary ----
console.log(`\n--- ${passed} passed, ${failed} failed ---`);
process.exit(failed > 0 ? 1 : 0);
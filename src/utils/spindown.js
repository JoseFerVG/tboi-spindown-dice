/**
 * Spindown Dice logic engine faithful to The Binding of Isaac: Repentance
 */

export function getSingleSpindownStep(currentId, itemsById, lockedItemIds = new Set()) {
  let testId = currentId - 1;
  while (testId > 0) {
    const candidate = itemsById[testId];
    if (candidate && !candidate.is_skipped_default && !lockedItemIds.has(testId)) {
      return candidate;
    }
    testId -= 1;
  }
  return null;
}

export function getSpindownStep(currentId, itemsById, lockedItemIds = new Set(), hasCarBattery = false) {
  if (!hasCarBattery) {
    const next = getSingleSpindownStep(currentId, itemsById, lockedItemIds);
    return {
      nextItem: next,
      bypassedItem: null
    };
  } else {
    const step1 = getSingleSpindownStep(currentId, itemsById, lockedItemIds);
    if (!step1) {
      return { nextItem: null, bypassedItem: null };
    }
    const step2 = getSingleSpindownStep(step1.id, itemsById, lockedItemIds);
    return {
      nextItem: step2,
      bypassedItem: step1
    };
  }
}

/**
 * Computes forward chain from startId
 */
export function calculateForwardPath(startId, itemsById, lockedItemIds = new Set(), hasCarBattery = false, maxSteps = 40) {
  const path = [];
  let currId = startId;

  for (let i = 1; i <= maxSteps; i++) {
    const stepResult = getSpindownStep(currId, itemsById, lockedItemIds, hasCarBattery);
    if (!stepResult.nextItem) break;

    path.push({
      step: i,
      item: stepResult.nextItem,
      bypassedItem: stepResult.bypassedItem,
      chargesStandard: i * 6,
      charges9Volt: i * 5,
      isQuality4: stepResult.nextItem.quality === 4,
      isQuality3: stepResult.nextItem.quality === 3
    });

    currId = stepResult.nextItem.id;
  }

  return path;
}

/**
 * Computes exact distance and feasibility between two items
 */
export function calculateDistance(startId, targetId, itemsById, lockedItemIds = new Set()) {
  if (startId === targetId) {
    return {
      reachable: true,
      normalSteps: 0,
      carBatterySteps: 0,
      carBatteryFeasible: true,
      overshootDifference: 0,
      path: [],
      note: "Es el mismo objeto."
    };
  }

  if (startId < targetId) {
    return {
      reachable: false,
      normalSteps: -1,
      carBatterySteps: -1,
      carBatteryFeasible: false,
      overshootDifference: 0,
      path: [],
      error: "Spindown solo reduce el ID (hacia abajo). No se puede ir de un ID menor a uno mayor."
    };
  }

  // Trace normal path item by item
  const fullNormalPath = [];
  let curr = startId;
  let reached = false;

  while (curr > targetId) {
    const next = getSingleSpindownStep(curr, itemsById, lockedItemIds);
    if (!next) break;
    fullNormalPath.push(next);
    curr = next.id;
    if (curr === targetId) {
      reached = true;
      break;
    }
  }

  if (!reached) {
    return {
      reachable: false,
      normalSteps: -1,
      carBatterySteps: -1,
      carBatteryFeasible: false,
      overshootDifference: 0,
      path: [],
      error: "El objeto objetivo está bloqueado o fue saltado en la cadena de reducción."
    };
  }

  const normalSteps = fullNormalPath.length;
  const isEven = normalSteps % 2 === 0;
  const carBatterySteps = isEven ? normalSteps / 2 : Math.ceil(normalSteps / 2);
  const carBatteryFeasible = isEven;

  return {
    reachable: true,
    normalSteps,
    carBatterySteps,
    carBatteryFeasible,
    overshootDifference: isEven ? 0 : 1,
    chargesStandard: normalSteps * 6,
    charges9Volt: normalSteps * 5,
    chargesWithCarBattery: carBatterySteps * 6,
    chargesWithCarBattery9Volt: carBatterySteps * 5,
    fullNormalPath
  };
}

/**
 * Finds all items that can spin down into targetId
 */
export function findSourcesForTarget(targetId, allItems, itemsById, lockedItemIds = new Set(), hasCarBattery = false, maxDistance = 25) {
  const sources = [];

  // Consider all items with ID > targetId
  const candidates = allItems.filter(it => it.id > targetId && !it.is_skipped_default && !lockedItemIds.has(it.id));

  for (const candidate of candidates) {
    const distInfo = calculateDistance(candidate.id, targetId, itemsById, lockedItemIds);
    if (!distInfo.reachable) continue;

    if (distInfo.normalSteps > maxDistance) continue;

    let hitsWithCurrentMode = false;
    let spinsInCurrentMode = distInfo.normalSteps;

    if (hasCarBattery) {
      if (distInfo.carBatteryFeasible) {
        hitsWithCurrentMode = true;
        spinsInCurrentMode = distInfo.carBatterySteps;
      } else {
        hitsWithCurrentMode = false;
        spinsInCurrentMode = distInfo.carBatterySteps;
      }
    } else {
      hitsWithCurrentMode = true;
      spinsInCurrentMode = distInfo.normalSteps;
    }

    sources.push({
      item: candidate,
      normalSpins: distInfo.normalSteps,
      carBatterySpins: distInfo.carBatterySteps,
      carBatteryExact: distInfo.carBatteryFeasible,
      hitsWithCurrentMode,
      effectiveSpins: spinsInCurrentMode,
      pools: candidate.pools,
      quality: candidate.quality
    });
  }

  // Sort by effective spins, then quality
  sources.sort((a, b) => {
    if (a.hitsWithCurrentMode !== b.hitsWithCurrentMode) {
      return a.hitsWithCurrentMode ? -1 : 1;
    }
    if (a.effectiveSpins !== b.effectiveSpins) {
      return a.effectiveSpins - b.effectiveSpins;
    }
    return b.quality - a.quality;
  });

  return sources;
}

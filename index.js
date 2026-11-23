import { HOLE_CLASSES, SHAFT_CLASSES, PREFERRED_FITS } from './src/iso286.js';
import { THREAD_SPECS, MATERIAL_ENGAGEMENT } from './src/thread.js';

export { calculateFit, calculateToleranceBand } from './src/iso286.js';
export { getThreadSpec, computeEngagementAdvice, formatThreadCallout } from './src/thread.js';
export { HOLE_CLASSES, SHAFT_CLASSES, PREFERRED_FITS, THREAD_SPECS, MATERIAL_ENGAGEMENT };

// Lookup results share catalog entries. Protect those entries across calls.
function freezeCatalog(value) {
  if (value === null || typeof value !== 'object' || Object.isFrozen(value)) return;
  Object.freeze(value);
  for (const item of Object.values(value)) freezeCatalog(item);
}

for (const catalog of [HOLE_CLASSES, SHAFT_CLASSES, PREFERRED_FITS, THREAD_SPECS, MATERIAL_ENGAGEMENT]) {
  freezeCatalog(catalog);
}

// ISO 286-1:2010 & ISO 286-2:2010 Limits and Fits engine (1 mm to 500 mm, all deviations in micrometres)

const SUB_RANGES = [
  [0, 3], [3, 6], [6, 10], [10, 18], [18, 30],
  [30, 40], [40, 50], [50, 65], [65, 80], [80, 100], [100, 120],
  [120, 140], [140, 160], [160, 180], [180, 200], [200, 225], [225, 250],
  [250, 280], [280, 315], [315, 355], [355, 400], [400, 450], [450, 500]
];

const MAIN_IDX = [
  0, 1, 2, 3, 4,
  5, 5, 6, 6, 7, 7,
  8, 8, 8, 9, 9, 9,
  10, 10, 11, 11, 12, 12
];

const MAIN_RANGE_LABELS = [
  '1 to 3 mm', 'Over 3 to 6 mm', 'Over 6 to 10 mm', 'Over 10 to 18 mm', 'Over 18 to 30 mm',
  'Over 30 to 50 mm', 'Over 50 to 80 mm', 'Over 80 to 120 mm', 'Over 120 to 180 mm',
  'Over 180 to 250 mm', 'Over 250 to 315 mm', 'Over 315 to 400 mm', 'Over 400 to 500 mm'
];

export const IT_GRADES = {
  4: [3, 4, 4, 5, 6, 7, 8, 10, 12, 14, 16, 18, 20],
  5: [4, 5, 6, 8, 9, 11, 13, 15, 18, 20, 23, 25, 27],
  6: [6, 8, 9, 11, 13, 16, 19, 22, 25, 29, 32, 36, 40],
  7: [10, 12, 15, 18, 21, 25, 30, 35, 40, 46, 52, 57, 63],
  8: [14, 18, 22, 27, 33, 39, 46, 54, 63, 72, 81, 89, 97],
  9: [25, 30, 36, 43, 52, 62, 74, 87, 100, 115, 130, 140, 155],
  10: [40, 48, 58, 70, 84, 100, 120, 140, 160, 185, 210, 230, 250],
  11: [60, 75, 90, 110, 130, 160, 190, 220, 250, 290, 320, 360, 400]
};

// Shaft fundamental deviations in um
const SHAFT_C_ES = [-60, -70, -80, -95, -110, -120, -130, -140, -150, -170, -180, -200, -210, -230, -240, -260, -280, -300, -330, -360, -400, -440, -480];
const SHAFT_D_ES = [-20, -30, -40, -50, -65, -80, -100, -120, -145, -170, -190, -210, -230];
const SHAFT_E_ES = [-14, -20, -25, -32, -40, -50, -60, -72, -85, -100, -110, -125, -135];
const SHAFT_F_ES = [-6, -10, -13, -16, -20, -25, -30, -36, -43, -50, -56, -62, -68];
const SHAFT_G_ES = [-2, -4, -5, -6, -7, -9, -10, -12, -14, -15, -17, -18, -20];
const SHAFT_H_ES = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
const SHAFT_K_EI = [0, 1, 1, 1, 2, 2, 2, 3, 3, 4, 4, 4, 5]; // Grades <= 7 (0 for >= 8)
const SHAFT_M_EI = [2, 4, 6, 7, 8, 9, 11, 13, 15, 17, 20, 21, 23];
const SHAFT_N_EI = [4, 8, 10, 12, 15, 17, 20, 23, 27, 31, 34, 37, 40];
const SHAFT_P_EI = [6, 12, 15, 18, 22, 26, 32, 37, 43, 50, 56, 62, 68];
const SHAFT_S_EI = [14, 19, 23, 28, 35, 43, 43, 53, 59, 71, 79, 92, 100, 108, 122, 130, 140, 158, 170, 190, 208, 232, 252];

export const HOLE_CLASSES = ['H6', 'H7', 'H8', 'H9', 'H11', 'G7', 'F7', 'E8', 'D9', 'JS7', 'K7', 'M7', 'N7', 'P7'];
export const SHAFT_CLASSES = ['c11', 'd9', 'e8', 'f7', 'g6', 'h5', 'h6', 'h7', 'h8', 'h9', 'js6', 'js7', 'k6', 'm6', 'n6', 'p6', 's6'];

export const PREFERRED_FITS = [
  { id: 'H11/c11', hole: 'H11', shaft: 'c11', basis: 'hole', type: 'clearance', name: 'Slack running', application: 'Loose pivots, dirty or corrosive environments, rough tolerances' },
  { id: 'H9/d9', hole: 'H9', shaft: 'd9', basis: 'hole', type: 'clearance', name: 'Free running', application: 'Large clearances, wide temperature variations, long bearings' },
  { id: 'H8/f7', hole: 'H8', shaft: 'f7', basis: 'hole', type: 'clearance', name: 'Close running', application: 'Grease/oil lubricated sleeves, accurate rotating shafts' },
  { id: 'H7/g6', hole: 'H7', shaft: 'g6', basis: 'hole', type: 'clearance', name: 'Sliding fit', application: 'Precision sliding pistons, spigots, fixture locating pins' },
  { id: 'H7/h6', hole: 'H7', shaft: 'h6', basis: 'hole', type: 'clearance', name: 'Locational clearance', application: 'Snug stationary or removable parts without noticeable shake' },
  { id: 'H7/js6', hole: 'H7', shaft: 'js6', basis: 'hole', type: 'transition', name: 'Similar / snug', application: 'Dowel pins and couplings assembled by hand or light mallet' },
  { id: 'H7/k6', hole: 'H7', shaft: 'k6', basis: 'hole', type: 'transition', name: 'Locational transition', application: 'Precision hub-to-shaft alignment where light tapping is acceptable' },
  { id: 'H7/m6', hole: 'H7', shaft: 'm6', basis: 'hole', type: 'transition', name: 'Tight transition', application: 'Parts that require pressing but may still be disassembled' },
  { id: 'H7/n6', hole: 'H7', shaft: 'n6', basis: 'hole', type: 'transition', name: 'Tight assembly', application: 'Tight transition on steel/iron bosses using a light press' },
  { id: 'H7/p6', hole: 'H7', shaft: 'p6', basis: 'hole', type: 'interference', name: 'Light press fit', application: 'Bronze bushings, gears, and non-ferrous hubs pressed onto steel' },
  { id: 'H7/s6', hole: 'H7', shaft: 's6', basis: 'hole', type: 'interference', name: 'Medium drive fit', application: 'Permanent steel/cast-iron assemblies transmitting torque' },
  { id: 'G7/h6', hole: 'G7', shaft: 'h6', basis: 'shaft', type: 'clearance', name: 'Shaft-basis sliding', application: 'Standard ground shafting with sliding bore' },
  { id: 'F7/h6', hole: 'F7', shaft: 'h6', basis: 'shaft', type: 'clearance', name: 'Shaft-basis running', application: 'Rotating bearings/collars on standard ground shaft' },
  { id: 'K7/h6', hole: 'K7', shaft: 'h6', basis: 'shaft', type: 'transition', name: 'Shaft-basis location', application: 'Precision alignment on standard h6 stock shaft' },
  { id: 'N7/h6', hole: 'N7', shaft: 'h6', basis: 'shaft', type: 'transition', name: 'Shaft-basis tight transition', application: 'Keyed hubs pressed onto standard h6 ground shafting' },
  { id: 'P7/h6', hole: 'P7', shaft: 'h6', basis: 'shaft', type: 'interference', name: 'Shaft-basis press fit', application: 'Permanent hub pressed onto standard h6 ground shaft' }
];

function resolveIndices(diameterMm) {
  const d = typeof diameterMm === 'number' || typeof diameterMm === 'string' ? Number(diameterMm) : NaN;
  if (!Number.isFinite(d) || d < 1 || d > 500) {
    throw new RangeError('Enter a nominal diameter between 1 and 500 mm.');
  }
  const subIdx = SUB_RANGES.findIndex(([lo, hi]) => d > lo && d <= hi);
  if (subIdx < 0) throw new RangeError('Nominal diameter outside supported ISO 286 steps.');
  const mainIdx = MAIN_IDX[subIdx];
  return { d, subIdx, mainIdx, subRange: [...SUB_RANGES[subIdx]], mainRangeLabel: MAIN_RANGE_LABELS[mainIdx] };
}

// ISO 286-1:2010 Tables 2 and 3. The delta is the width of ITn minus IT(n−1).
function upperHoleDeviation(d, letter, grade, mainIdx) {
  if (letter === 'K' && grade > 8 && d > 3) throw new RangeError('K above IT8 is undefined above 3 mm.');
  if (letter === 'N' && grade > 8 && d <= 1) throw new RangeError('N9 to N11 require a nominal size above 1 mm.');
  if (letter === 'M' && grade === 6 && d > 250 && d <= 315) return -9;
  if (letter === 'N' && grade > 8 && d > 3) return 0;
  const eiTable = { K: SHAFT_K_EI, M: SHAFT_M_EI, N: SHAFT_N_EI, P: SHAFT_P_EI }[letter];
  const applyDelta = d > 3 && grade <= (letter === 'P' ? 7 : 8);
  const delta = applyDelta ? IT_GRADES[grade][mainIdx] - IT_GRADES[grade - 1][mainIdx] : 0;
  return delta - eiTable[mainIdx];
}

export function formatDeviationMm(um) {
  const decimals = Number.isInteger(um) ? 3 : 4;
  return `${um > 0 ? '+' : ''}${(um / 1000).toFixed(decimals)}`;
}

export function calculateToleranceBand(diameterMm, code) {
  const { d, subIdx, mainIdx, subRange, mainRangeLabel } = resolveIndices(diameterMm);
  const match = /^(H|G|F|E|D|JS|K|M|N|P|h|g|f|e|d|c|js|k|m|n|p|s)(5|6|7|8|9|10|11)$/.exec(String(code || '').trim());
  if (!match) throw new Error(`Unsupported ISO 286 tolerance class: ${code}`);
  const letter = match[1];
  const grade = Number(match[2]);
  const itUm = IT_GRADES[grade]?.[mainIdx];
  if (!Number.isFinite(itUm)) throw new Error(`Unsupported IT grade ${grade}`);
  const isHole = letter === letter.toUpperCase();

  let upperUm = 0;
  let lowerUm = 0;

  if (!isHole) {
    // Shaft deviations (es / ei)
    if (letter === 'h') {
      upperUm = SHAFT_H_ES[mainIdx];
      lowerUm = upperUm - itUm;
    } else if (letter === 'g') {
      upperUm = SHAFT_G_ES[mainIdx];
      lowerUm = upperUm - itUm;
    } else if (letter === 'f') {
      upperUm = SHAFT_F_ES[mainIdx];
      lowerUm = upperUm - itUm;
    } else if (letter === 'e') {
      upperUm = SHAFT_E_ES[mainIdx];
      lowerUm = upperUm - itUm;
    } else if (letter === 'd') {
      upperUm = SHAFT_D_ES[mainIdx];
      lowerUm = upperUm - itUm;
    } else if (letter === 'c') {
      upperUm = SHAFT_C_ES[subIdx];
      lowerUm = upperUm - itUm;
    } else if (letter === 'js') {
      upperUm = itUm / 2;
      lowerUm = -itUm / 2;
    } else if (letter === 'k') {
      lowerUm = grade <= 7 ? SHAFT_K_EI[mainIdx] : 0;
      upperUm = lowerUm + itUm;
    } else if (letter === 'm') {
      lowerUm = SHAFT_M_EI[mainIdx];
      upperUm = lowerUm + itUm;
    } else if (letter === 'n') {
      lowerUm = SHAFT_N_EI[mainIdx];
      upperUm = lowerUm + itUm;
    } else if (letter === 'p') {
      lowerUm = SHAFT_P_EI[mainIdx];
      upperUm = lowerUm + itUm;
    } else if (letter === 's') {
      lowerUm = SHAFT_S_EI[subIdx];
      upperUm = lowerUm + itUm;
    }
  } else {
    // Hole deviations (ES / EI)
    if (letter === 'H') {
      lowerUm = 0;
      upperUm = itUm;
    } else if (letter === 'G') {
      lowerUm = -SHAFT_G_ES[mainIdx];
      upperUm = lowerUm + itUm;
    } else if (letter === 'F') {
      lowerUm = -SHAFT_F_ES[mainIdx];
      upperUm = lowerUm + itUm;
    } else if (letter === 'E') {
      lowerUm = -SHAFT_E_ES[mainIdx];
      upperUm = lowerUm + itUm;
    } else if (letter === 'D') {
      lowerUm = -SHAFT_D_ES[mainIdx];
      upperUm = lowerUm + itUm;
    } else if (letter === 'JS') {
      upperUm = itUm / 2;
      lowerUm = -itUm / 2;
    } else {
      upperUm = upperHoleDeviation(d, letter, grade, mainIdx);
      lowerUm = upperUm - itUm;
    }
  }

  const maxMm = d + upperUm / 1000;
  const minMm = d + lowerUm / 1000;
  return {
    code: match[0],
    kind: isHole ? 'hole' : 'shaft',
    diameterMm: d,
    subRange,
    mainRangeLabel,
    itUm,
    upperUm,
    lowerUm,
    maxMm,
    minMm,
    maxIn: maxMm / 25.4,
    minIn: minMm / 25.4
  };
}

export function calculateFit(diameterMm, holeClass = 'H7', shaftClass = 'g6') {
  const hole = calculateToleranceBand(diameterMm, holeClass);
  const shaft = calculateToleranceBand(diameterMm, shaftClass);
  if (hole.kind !== 'hole') throw new Error(`Expected uppercase hole class, received ${holeClass}`);
  if (shaft.kind !== 'shaft') throw new Error(`Expected lowercase shaft class, received ${shaftClass}`);

  const minClearanceUm = hole.lowerUm - shaft.upperUm;
  const maxClearanceUm = hole.upperUm - shaft.lowerUm;

  let fitType = 'transition';
  let fitLabel = 'Transition fit';
  if (minClearanceUm >= 0) {
    fitType = 'clearance';
    fitLabel = 'Clearance fit';
  } else if (maxClearanceUm <= 0) {
    fitType = 'interference';
    fitLabel = 'Interference (press) fit';
  }

  const preset = PREFERRED_FITS.find(p => p.hole === hole.code && p.shaft === shaft.code && p.type === fitType);
  const nominalStr = Number(hole.diameterMm).toString();

  return {
    nominalMm: hole.diameterMm,
    subRange: hole.subRange,
    mainRangeLabel: hole.mainRangeLabel,
    hole,
    shaft,
    minClearanceUm,
    maxClearanceUm,
    minClearanceMm: minClearanceUm / 1000,
    maxClearanceMm: maxClearanceUm / 1000,
    fitType,
    fitLabel,
    fitName: preset?.name || fitLabel,
    application: preset?.application || 'Check the calculated limits against the assembly clearance or interference required on your drawing.',
    callout: `Bore Ø${nominalStr} ${hole.code} (${formatDeviationMm(hole.upperUm)}/${formatDeviationMm(hole.lowerUm)}) · Shaft Ø${nominalStr} ${shaft.code} (${formatDeviationMm(shaft.upperUm)}/${formatDeviationMm(shaft.lowerUm)}) mm — ${hole.code}/${shaft.code} (${fitLabel})`
  };
}

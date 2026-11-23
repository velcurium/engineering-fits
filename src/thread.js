// Cutting pilots: DIN 336 (Vergnano). Forming pilots: Vergnano catalog nominals;
// the M1.6 pilot is the Gühring M1.6 × 0.35 micro form tap reference.
const metricCoarseRows = [
  ['M1.6×0.35', 1.6, 0.35, 1.25, 1.45, 1.7, 1.8, 2.0, 3.5, 1.8],
  ['M2×0.4', 2.0, 0.4, 1.60, 1.85, 2.2, 2.4, 2.6, 4.4, 2.2],
  ['M2.5×0.45', 2.5, 0.45, 2.05, 2.30, 2.7, 2.9, 3.1, 5.4, 2.7],
  ['M3×0.5', 3.0, 0.5, 2.50, 2.80, 3.2, 3.4, 3.6, 6.0, 3.4],
  ['M3.5×0.6', 3.5, 0.6, 2.90, 3.25, 3.7, 3.9, 4.2, 6.8, 3.8],
  ['M4×0.7', 4.0, 0.7, 3.30, 3.70, 4.3, 4.5, 4.8, 8.0, 4.4],
  ['M5×0.8', 5.0, 0.8, 4.20, 4.65, 5.3, 5.5, 5.8, 9.5, 5.4],
  ['M6×1.0', 6.0, 1.0, 5.00, 5.55, 6.4, 6.6, 7.0, 11.0, 6.4],
  ['M8×1.25', 8.0, 1.25, 6.80, 7.40, 8.4, 9.0, 10.0, 14.5, 8.6],
  ['M10×1.5', 10.0, 1.5, 8.50, 9.30, 10.5, 11.0, 12.0, 17.5, 10.6],
  ['M12×1.75', 12.0, 1.75, 10.20, 11.20, 13.0, 13.5, 14.5, 20.0, 12.6],
  ['M14×2.0', 14.0, 2.0, 12.00, 13.10, 15.0, 15.5, 16.5, 23.0, 14.6],
  ['M16×2.0', 16.0, 2.0, 14.00, 15.10, 17.0, 17.5, 18.5, 26.0, 16.6],
  ['M18×2.5', 18.0, 2.5, 15.50, 16.90, 19.0, 20.0, 21.0, 29.0, 18.6],
  ['M20×2.5', 20.0, 2.5, 17.50, 18.90, 21.0, 22.0, 24.0, 32.0, 20.6],
  ['M24×3.0', 24.0, 3.0, 21.00, 22.70, 25.0, 26.0, 28.0, 38.0, 24.6]
];

const metricFineRows = [
  ['M6×0.75', 6.0, 0.75, 5.20, 5.65, 6.4, 6.6, 7.0, 11.0, 6.4],
  ['M8×1.0', 8.0, 1.0, 7.00, 7.55, 8.4, 9.0, 10.0, 14.5, 8.6],
  ['M10×1.0', 10.0, 1.0, 9.00, 9.55, 10.5, 11.0, 12.0, 17.5, 10.6],
  ['M10×1.25', 10.0, 1.25, 8.80, 9.40, 10.5, 11.0, 12.0, 17.5, 10.6],
  ['M12×1.25', 12.0, 1.25, 10.80, 11.40, 13.0, 13.5, 14.5, 20.0, 12.6],
  ['M12×1.5', 12.0, 1.5, 10.50, 11.30, 13.0, 13.5, 14.5, 20.0, 12.6],
  ['M16×1.5', 16.0, 1.5, 14.50, 15.30, 17.0, 17.5, 18.5, 26.0, 16.6],
  ['M20×1.5', 20.0, 1.5, 18.50, 19.30, 21.0, 22.0, 24.0, 32.0, 20.6]
];

const toMetric = ([designation, majorMm, pitchMm, cutMm, formMm, clrFineMm, clrMediumMm, clrCoarseMm, cboreDiaMm, cboreDepthMm], series) => ({
  id: designation.replace('×', 'x'),
  designation,
  system: 'metric',
  series,
  standard: 'DIN 13 / DIN 336 / ISO 273',
  majorMm,
  majorIn: majorMm / 25.4,
  pitchMm,
  tpi: null,
  cuttingTap: {
    label: `${cutMm.toFixed(2)} mm`,
    mm: cutMm,
    in: cutMm / 25.4
  },
  formingTap: {
    label: `${formMm.toFixed(2)} mm`,
    mm: formMm,
    in: formMm / 25.4
  },
  clearance: {
    close: { label: `${clrFineMm.toFixed(1)} mm`, mm: clrFineMm, in: clrFineMm / 25.4 },
    normal: { label: `${clrMediumMm.toFixed(1)} mm`, mm: clrMediumMm, in: clrMediumMm / 25.4 },
    loose: { label: `${clrCoarseMm.toFixed(1)} mm`, mm: clrCoarseMm, in: clrCoarseMm / 25.4 }
  },
  counterbore: {
    diaLabel: `Ø${cboreDiaMm.toFixed(1)} mm`,
    diaMm: cboreDiaMm,
    depthMm: cboreDepthMm
  }
});

// ASME B18.2.8-1999 Table 2. For each fit: nominal drill, drill diameter, finished hole min/max (in).
const INCH_CLEARANCE = {
  '#2':   { close: ['3/32"', 3/32, .094, .098],    normal: ['#38', .1015, .102, .108],     loose: ['#32', .116, .116, .126] },
  '#4':   { close: ['#31', .120, .120, .124],     normal: ['#30', .1285, .128, .135],     loose: ['#27', .144, .144, .156] },
  '#6':   { close: ['#23', .154, .154, .159],     normal: ['#18', .1695, .170, .177],     loose: ['#13', .185, .185, .197] },
  '#8':   { close: ['#15', .180, .180, .185],     normal: ['#9', .196, .196, .203],       loose: ['#3', .213, .213, .225] },
  '#10':  { close: ['#5', .2055, .206, .211],     normal: ['#2', .221, .221, .228],       loose: ['B', .238, .238, .250] },
  '1/4':  { close: ['17/64"', 17/64, .266, .272], normal: ['9/32"', 9/32, .281, .290],    loose: ['19/64"', 19/64, .297, .311] },
  '5/16': { close: ['21/64"', 21/64, .328, .334], normal: ['11/32"', 11/32, .344, .354],  loose: ['23/64"', 23/64, .359, .373] },
  '3/8':  { close: ['25/64"', 25/64, .391, .397], normal: ['13/32"', 13/32, .406, .416],  loose: ['27/64"', 27/64, .422, .438] },
  '7/16': { close: ['29/64"', 29/64, .453, .460], normal: ['15/32"', 15/32, .469, .479],  loose: ['31/64"', 31/64, .484, .500] },
  '1/2':  { close: ['17/32"', 17/32, .531, .538], normal: ['9/16"', 9/16, .562, .572],    loose: ['39/64"', 39/64, .609, .625] }
};

const inchFormat = new Intl.NumberFormat('en-US', { minimumFractionDigits: 4, maximumFractionDigits: 6, useGrouping: false });

const inchDrill = (drillName, decIn) => ({
  label: `${drillName} (${inchFormat.format(decIn)} in)`,
  drill: drillName,
  in: decIn,
  mm: decIn * 25.4
});

function inchClearance([drill, diameter, minIn, maxIn]) {
  return { ...inchDrill(drill, diameter), minIn, maxIn };
}

export function formatClearanceLimits(hole) {
  return `${hole.minIn.toFixed(3)}–${hole.maxIn.toFixed(3)} in`;
}

// Inch forming drills follow the Haas Roll Tap Drill Size Chart. Metric stock sizes use exact conversion.
const uncRows = [
  ['#2-56', '#2', 0.0860, 56, '#50', 0.0700, '5/64"', 5/64],
  ['#4-40', '#4', 0.1120, 40, '#43', 0.0890, '#39', 0.0995],
  ['#6-32', '#6', 0.1380, 32, '#36', 0.1065, '3.1 mm', 3.1/25.4],
  ['#8-32', '#8', 0.1640, 32, '#29', 0.1360, '3.8 mm', 3.8/25.4],
  ['#10-24', '#10', 0.1900, 24, '#25', 0.1495, '4.3 mm', 4.3/25.4],
  ['1/4-20', '1/4', 0.2500, 20, '#7', 0.2010, '5.8 mm', 5.8/25.4],
  ['5/16-18', '5/16', 0.3125, 18, 'F', 0.2570, '7.3 mm', 7.3/25.4],
  ['3/8-16', '3/8', 0.3750, 16, '5/16"', 5/16, '8.8 mm', 8.8/25.4],
  ['7/16-14', '7/16', 0.4375, 14, 'U', 0.3680, '10.3 mm', 10.3/25.4],
  ['1/2-13', '1/2', 0.5000, 13, '27/64"', 27/64, '11.8 mm', 11.8/25.4]
];

const unfRows = [
  ['#4-48', '#4', 0.1120, 48, '#42', 0.0935, '2.6 mm', 2.6/25.4],
  ['#6-40', '#6', 0.1380, 40, '#33', 0.1130, '3.2 mm', 3.2/25.4],
  ['#8-36', '#8', 0.1640, 36, '#29', 0.1360, '3.8 mm', 3.8/25.4],
  ['#10-32', '#10', 0.1900, 32, '#21', 0.1590, '4.4 mm', 4.4/25.4],
  ['1/4-28', '1/4', 0.2500, 28, '#3', 0.2130, '5.9 mm', 5.9/25.4],
  ['5/16-24', '5/16', 0.3125, 24, 'I', 0.2720, '7.4 mm', 7.4/25.4],
  ['3/8-24', '3/8', 0.3750, 24, 'Q', 0.3320, '9.0 mm', 9/25.4],
  ['1/2-20', '1/2', 0.5000, 20, '29/64"', 29/64, '12.1 mm', 12.1/25.4]
];

const toInch = ([designation, sizeKey, majorIn, tpi, cutDrill, cutIn, formDrill, formIn], series) => {
  const clr = INCH_CLEARANCE[sizeKey];
  const majorMm = majorIn * 25.4;
  const pitchMm = 25.4 / tpi;
  return {
    id: `${designation}-${series}`.toLowerCase().replace(/^[^a-z0-9]+|[^a-z0-9]+$/g, '').replace(/[^a-z0-9]+/g, '-'),
    designation: `${designation} ${series.toUpperCase()}`,
    system: 'inch',
    series,
    standard: 'ASME B1.1 / ASME B18.2.8',
    majorMm,
    majorIn,
    pitchMm,
    tpi,
    cuttingTap: inchDrill(cutDrill, cutIn),
    formingTap: inchDrill(formDrill, formIn),
    clearance: {
      close: inchClearance(clr.close),
      normal: inchClearance(clr.normal),
      loose: inchClearance(clr.loose)
    },
    counterbore: null
  };
};

export const THREAD_SPECS = [
  ...metricCoarseRows.map(r => toMetric(r, 'coarse')),
  ...metricFineRows.map(r => toMetric(r, 'fine')),
  ...uncRows.map(r => toInch(r, 'unc')),
  ...unfRows.map(r => toInch(r, 'unf'))
];

export const MATERIAL_ENGAGEMENT = {
  steel: {
    label: 'Steel / C45',
    factor: 1.0,
    factorText: '1.0×D',
    tapNote: 'Select the pilot for the steel hardness and the chosen tap.',
    blindNote: 'Provide room for the tap lead and for chips below the full threads.'
  },
  stainless: {
    label: 'Stainless steel (304 / 316)',
    factor: 1.25,
    factorText: '1.25×D',
    tapNote: 'Select a tap and lubricant rated for 304 or 316 stainless.',
    blindNote: 'For a cutting tap, check how chips will leave the blind hole.'
  },
  aluminum: {
    label: 'Aluminum (6061 / 7075)',
    factor: 1.5,
    factorText: '1.5×D',
    tapNote: 'Check alloy and temper when selecting a forming tap for aluminum.',
    blindNote: 'A forming tap displaces material and still needs clearance for its lead.'
  },
  brass: {
    label: 'Brass / Copper',
    factor: 1.25,
    factorText: '1.25×D',
    tapNote: 'Check the alloy’s ductility before specifying a forming tap.',
    blindNote: 'Allow for chip evacuation when cutting threads in a blind hole.'
  },
  plastic: {
    label: 'Engineering plastics (POM / Nylon / PEEK)',
    factor: 2.0,
    factorText: '2.0×D',
    tapNote: 'Confirm the pilot with the tap maker for this polymer and account for elastic recovery.',
    blindNote: 'For repeated assembly, check whether the joint requires a threaded insert.'
  }
};

export function getThreadSpec(id = 'M6x1.0') {
  const spec = THREAD_SPECS.find(s => s.id === id);
  if (!spec) throw new RangeError(`Unknown thread size: ${id}`);
  return spec;
}

export function computeEngagementAdvice(spec, materialKey = 'aluminum') {
  if (!Object.hasOwn(MATERIAL_ENGAGEMENT, materialKey)) throw new RangeError(`Unknown material: ${materialKey}`);
  const mat = MATERIAL_ENGAGEMENT[materialKey];
  const minThreadDepthMm = spec.majorMm * mat.factor;
  const recommendedBlindDrillDepthMm = minThreadDepthMm + 3.5 * spec.pitchMm;
  return {
    material: mat.label,
    factorText: mat.factorText,
    minThreadDepthMm,
    recommendedBlindDrillDepthMm,
    minThreadDepthIn: minThreadDepthMm / 25.4,
    recommendedBlindDrillDepthIn: recommendedBlindDrillDepthMm / 25.4,
    tapNote: mat.tapNote,
    blindNote: mat.blindNote
  };
}

export function formatDepth(value, unit) {
  return `${Number(value.toFixed(unit === 'in' ? 4 : 3))} ${unit}`;
}

export function formatThreadCallout(spec, materialKey = 'aluminum', holeType = 'tapped_cutting') {
  const metric = spec.system === 'metric';
  const clearanceMode = /^clearance_(close|normal|loose)$/.exec(holeType);
  if (clearanceMode) {
    const fit = clearanceMode[1];
    const hole = spec.clearance[fit];
    const diameter = metric ? hole.label : formatClearanceLimits(hole);
    const standard = metric ? 'ISO 273' : 'ASME B18.2.8';
    return `Ø${diameter} THRU — ${fit.toUpperCase()} CLEARANCE FOR ${spec.designation} (${standard})`;
  }
  if (holeType !== 'tapped_cutting' && holeType !== 'tapped_forming') throw new RangeError(`Unknown hole type: ${holeType}`);
  const advice = computeEngagementAdvice(spec, materialKey);
  const forming = holeType === 'tapped_forming';
  const tap = forming ? spec.formingTap : spec.cuttingTap;
  const pilot = metric ? tap.label : `${inchFormat.format(tap.in)} in (${tap.drill})`;
  const fullThread = metric ? formatDepth(advice.minThreadDepthMm, 'mm') : formatDepth(advice.minThreadDepthIn, 'in');
  const drillDepth = metric ? formatDepth(advice.recommendedBlindDrillDepthMm, 'mm') : formatDepth(advice.recommendedBlindDrillDepthIn, 'in');
  const thread = forming ? `${spec.designation} (THREAD CLASS PER DRAWING)` : `${spec.designation}-${metric ? '6H' : '2B'}`;
  const tapNote = forming ? 'FORM TAP, CONFIRM PILOT WITH TAP MAKER' : 'CUT TAP';
  return `PLANNING ESTIMATE · ${thread} · FULL THREAD ${fullThread} · PILOT Ø${pilot} TO ${drillDepth} FULL DIAMETER (EXCLUDES DRILL POINT) · ${tapNote}`;
}

import test from 'node:test';
import assert from 'node:assert/strict';
import {
  HOLE_CLASSES, SHAFT_CLASSES, PREFERRED_FITS, THREAD_SPECS, MATERIAL_ENGAGEMENT,
  calculateToleranceBand, calculateFit, getThreadSpec, computeEngagementAdvice, formatThreadCallout
} from '@velcurium/engineering-fits';

test('ISO 286-2:2010 boundary conditions and out-of-range checks', () => {
  assert.throws(() => calculateFit(0.5, 'H7', 'g6'), RangeError);
  assert.throws(() => calculateFit(500.1, 'H7', 'g6'), RangeError);
  assert.throws(() => calculateToleranceBand(25, 'Z99'));

  // Boundary rule: lo < D <= hi
  const b3 = calculateToleranceBand(3, 'H7');
  assert.equal(b3.upperUm, 10);
  const b3_01 = calculateToleranceBand(3.01, 'H7');
  assert.equal(b3_01.upperUm, 12);

  const b30 = calculateToleranceBand(30, 'H7');
  assert.equal(b30.upperUm, 21);
  const b30_01 = calculateToleranceBand(30.01, 'H7');
  assert.equal(b30_01.upperUm, 25);

  const b500 = calculateToleranceBand(500, 'H7');
  assert.equal(b500.upperUm, 63);
  assert.equal(b500.lowerUm, 0);
});

test('ISO 286-2:2010 benchmark fit calculations match published micrometre values', () => {
  const cases = [
    // [d, hole, shaft, esHole, eiHole, esShaft, eiShaft, minClr, maxClr, type]
    [25, 'H7', 'g6', 21, 0, -7, -20, 7, 41, 'clearance'],
    [25, 'H7', 'h6', 21, 0, 0, -13, 0, 34, 'clearance'],
    [25, 'H7', 'k6', 21, 0, 15, 2, -15, 19, 'transition'],
    [25, 'H7', 'm6', 21, 0, 21, 8, -21, 13, 'transition'],
    [25, 'H7', 'n6', 21, 0, 28, 15, -28, 6, 'transition'],
    [25, 'H7', 'p6', 21, 0, 35, 22, -35, -1, 'interference'],
    [25, 'H7', 's6', 21, 0, 48, 35, -48, -14, 'interference'],
    [25, 'H11', 'c11', 130, 0, -110, -240, 110, 370, 'clearance'],
    [25, 'H9', 'd9', 52, 0, -65, -117, 65, 169, 'clearance'],
    [25, 'H8', 'f7', 33, 0, -20, -41, 20, 74, 'clearance'],
    [25, 'G7', 'h6', 28, 7, 0, -13, 7, 41, 'clearance'],
    [25, 'F7', 'h6', 41, 20, 0, -13, 20, 54, 'clearance'],
    [25, 'K7', 'h6', 6, -15, 0, -13, -15, 19, 'transition'],
    [25, 'N7', 'h6', -7, -28, 0, -13, -28, 6, 'transition'],
    [25, 'P7', 'h6', -14, -35, 0, -13, -35, -1, 'interference'],
    [50, 'H7', 'g6', 25, 0, -9, -25, 9, 50, 'clearance'],
    [50, 'H7', 'p6', 25, 0, 42, 26, -42, -1, 'interference'],
    [60, 'H7', 's6', 30, 0, 72, 53, -72, -23, 'interference'],
    [75, 'H7', 's6', 30, 0, 78, 59, -78, -29, 'interference'],
    [100, 'H7', 'g6', 35, 0, -12, -34, 12, 69, 'clearance'],
    [120, 'H7', 'p6', 35, 0, 59, 37, -59, -2, 'interference'],
    [180, 'H7', 's6', 40, 0, 133, 108, -133, -68, 'interference'],
    [2, 'H7', 'g6', 10, 0, -2, -8, 2, 18, 'clearance'],
    [2, 'K7', 'h6', 0, -10, 0, -6, -10, 6, 'transition'],
    [10, 'H7', 'js6', 15, 0, 4.5, -4.5, -4.5, 19.5, 'transition']
  ];

  for (const [d, hole, shaft, esH, eiH, esS, eiS, minC, maxC, type] of cases) {
    const res = calculateFit(d, hole, shaft);
    assert.equal(res.hole.upperUm, esH, `${d} ${hole}`);
    assert.equal(res.hole.lowerUm, eiH, `${d} ${hole}`);
    assert.equal(res.shaft.upperUm, esS, `${d} ${shaft}`);
    assert.equal(res.shaft.lowerUm, eiS, `${d} ${shaft}`);
    assert.equal(res.minClearanceUm, minC, `${d} ${hole}/${shaft} minC`);
    assert.equal(res.maxClearanceUm, maxC, `${d} ${hole}/${shaft} maxC`);
    assert.equal(res.fitType, type, `${d} ${hole}/${shaft} type`);
  }

  // Spot-check mm conversions on Ø50 H7/p6
  const p50 = calculateFit(50, 'H7', 'p6');
  assert.equal(p50.hole.minMm, 50.0);
  assert.equal(p50.hole.maxMm, 50.025);
  assert.equal(p50.shaft.minMm, 50.026);
  assert.equal(p50.shaft.maxMm, 50.042);
  assert.equal(PREFERRED_FITS.length, 16);
});

test('ISO 286-1 Tables 2–3 and ISO 286-2 Tables 8–10 grade rules and exceptions', () => {
  const rows = [
    [3, 'K9', 0, -25], [3.001, 'K5', 0, -5], [25, 'K5', 1, -8],
    [25, 'K6', 2, -11], [25, 'K8', 10, -23], [25, 'M9', -8, -60],
    [250, 'M6', -8, -37], [250.001, 'M6', -9, -41], [315, 'M6', -9, -41],
    [315.001, 'M6', -10, -46], [2, 'N9', -4, -29], [3.001, 'N9', 0, -30],
    [25, 'N8', -3, -36], [25, 'N9', 0, -52], [25, 'P6', -18, -31],
    [25, 'P7', -14, -35], [25, 'P8', -22, -55], [25, 'P9', -22, -74]
  ];
  for (const [d, code, upper, lower] of rows) {
    const band = calculateToleranceBand(d, code);
    assert.deepEqual([band.upperUm, band.lowerUm], [upper, lower], `Ø${d} ${code}`);
  }
  for (const grade of [9, 10, 11]) {
    assert.throws(() => calculateToleranceBand(3.001, `K${grade}`), RangeError);
    assert.throws(() => calculateToleranceBand(1, `N${grade}`), RangeError);
  }
});

test('Limit dimensions and drawing callouts retain half micrometres and the actual fit type', () => {
  const fit = calculateFit(10, 'H7', 'js6');
  assert.match(fit.callout, /\(\+0\.0045\/-0\.0045\)/);
  assert.equal(fit.minClearanceMm, -0.0045);
  assert.equal(fit.maxClearanceMm, 0.0195);
  assert.equal(calculateToleranceBand('10.12345', 'H7').minMm, 10.12345);
  const small = calculateFit(2, 'H7', 'p6');
  assert.deepEqual([small.minClearanceUm, small.maxClearanceUm], [-12, 4]);
  assert.equal(small.fitName, 'Transition fit');
  const lineFit = calculateFit(2, 'P7', 'h6');
  assert.equal(lineFit.maxClearanceUm, 0);
  assert.equal(lineFit.fitType, 'interference');
  assert.equal(calculateFit(25, ' H7 ', ' g6 ').fitName, 'Sliding fit');
  for (const value of [true, [25], '', null, Infinity, NaN]) {
    assert.throws(() => calculateFit(value), RangeError);
  }
  for (const [hole, shaft] of [['g6', 'h6'], ['H7', 'H6']]) {
    assert.throws(() => calculateFit(25, hole, shaft));
  }
});

test('Every selectable pair observes widths, ordering and fit type at each lookup boundary', () => {
  const edges = [1, 3, 6, 10, 18, 30, 40, 50, 65, 80, 100, 120, 140, 160, 180, 200, 225, 250, 280, 315, 355, 400, 450, 500];
  for (const edge of edges) {
    for (const d of edge === 500 ? [edge] : [edge, edge + 0.001]) {
      for (const hole of HOLE_CLASSES) for (const shaft of SHAFT_CLASSES) {
        const f = calculateFit(d, hole, shaft);
        for (const band of [f.hole, f.shaft]) {
          assert.equal(band.upperUm - band.lowerUm, band.itUm);
          assert.ok(band.subRange[0] < d && d <= band.subRange[1]);
        }
        assert.equal(f.maxClearanceUm - f.minClearanceUm, f.hole.itUm + f.shaft.itUm);
        assert.equal(f.fitType, f.minClearanceUm >= 0 ? 'clearance' : f.maxClearanceUm <= 0 ? 'interference' : 'transition');
      }
    }
  }
  const first = calculateToleranceBand(30, 'H7');
  first.subRange[1] = 29;
  assert.deepEqual(calculateToleranceBand(30, 'H7').subRange, [18, 30]);
});

test('Metric cutting pilots, forming references and ISO 273 clearance diameters', () => {
  const metricBenchmarks = [
    // [id, cutMm, formMm, clrFine, clrMedium, clrCoarse]
    ['M1.6x0.35', 1.25, 1.45, 1.7, 1.8, 2.0],
    ['M3x0.5', 2.50, 2.80, 3.2, 3.4, 3.6],
    ['M4x0.7', 3.30, 3.70, 4.3, 4.5, 4.8],
    ['M5x0.8', 4.20, 4.65, 5.3, 5.5, 5.8],
    ['M6x1.0', 5.00, 5.55, 6.4, 6.6, 7.0],
    ['M8x1.25', 6.80, 7.40, 8.4, 9.0, 10.0],
    ['M10x1.5', 8.50, 9.30, 10.5, 11.0, 12.0],
    ['M6x0.75', 5.20, 5.65, 6.4, 6.6, 7.0],
    ['M12x1.25', 10.80, 11.40, 13.0, 13.5, 14.5],
    ['M10x1.25', 8.80, 9.40, 10.5, 11.0, 12.0],
    ['M12x1.75', 10.20, 11.20, 13.0, 13.5, 14.5],
    ['M16x2.0', 14.00, 15.10, 17.0, 17.5, 18.5],
    ['M20x2.5', 17.50, 18.90, 21.0, 22.0, 24.0],
    ['M24x3.0', 21.00, 22.70, 25.0, 26.0, 28.0]
  ];
  for (const [id, cutMm, formMm, fine, med, coarse] of metricBenchmarks) {
    const s = getThreadSpec(id);
    assert.equal(s.id, id);
    assert.equal(s.cuttingTap.mm, cutMm, id);
    assert.equal(s.formingTap.mm, formMm, id);
    assert.equal(s.clearance.close.mm, fine, id);
    assert.equal(s.clearance.normal.mm, med, id);
    assert.equal(s.clearance.loose.mm, coarse, id);
  }
});

test('Unified tap pilots and all three ASME B18.2.8 Table 2 finished-hole ranges', () => {
  // The nominal drill can be slightly smaller than the tabulated finished-hole minimum.
  // Each class below gives the drill and the finished diameter limits in thousandths of an inch.
  const cases = [
    ['2-56-unc', '#50', .0700, ['3/32"', 94, 98], ['#38', 102, 108], ['#32', 116, 126]],
    ['4-40-unc', '#43', .0890, ['#31', 120, 124], ['#30', 128, 135], ['#27', 144, 156]],
    ['6-32-unc', '#36', .1065, ['#23', 154, 159], ['#18', 170, 177], ['#13', 185, 197]],
    ['8-32-unc', '#29', .1360, ['#15', 180, 185], ['#9', 196, 203], ['#3', 213, 225]],
    ['10-32-unf', '#21', .1590, ['#5', 206, 211], ['#2', 221, 228], ['B', 238, 250]],
    ['1-4-20-unc', '#7', .2010, ['17/64"', 266, 272], ['9/32"', 281, 290], ['19/64"', 297, 311]],
    ['5-16-18-unc', 'F', .2570, ['21/64"', 328, 334], ['11/32"', 344, 354], ['23/64"', 359, 373]],
    ['3-8-16-unc', '5/16"', 5/16, ['25/64"', 391, 397], ['13/32"', 406, 416], ['27/64"', 422, 438]],
    ['7-16-14-unc', 'U', .3680, ['29/64"', 453, 460], ['15/32"', 469, 479], ['31/64"', 484, 500]],
    ['1-2-13-unc', '27/64"', 27/64, ['17/32"', 531, 538], ['9/16"', 562, 572], ['39/64"', 609, 625]]
  ];
  for (const [id, cutDrill, cutIn, close, normal, loose] of cases) {
    const s = getThreadSpec(id);
    assert.equal(s.cuttingTap.drill, cutDrill, id);
    assert.equal(s.cuttingTap.in, cutIn, id);
    for (const [fit, [name, low, high]] of Object.entries({ close, normal, loose })) {
      const hole = s.clearance[fit];
      assert.deepEqual([hole.drill, hole.minIn, hole.maxIn], [name, low/1000, high/1000], `${id} ${fit}`);
    }
  }
  const unc = getThreadSpec('1-4-20-unc');
  const unf = getThreadSpec('1-4-28-unf');
  assert.equal(unc.clearance.normal.in, 9/32);
  assert.deepEqual(unc.clearance, unf.clearance);
  assert.notEqual(unc.cuttingTap.in, unf.cuttingTap.in);
  assert.equal(getThreadSpec('5-16-24-unf').formingTap.in, 7.4/25.4);
});

test('Depth estimates use one unrounded length and the callout matches the selected operation', () => {
  const m6 = getThreadSpec();
  const inch = getThreadSpec('1-4-20-unc');
  const al = computeEngagementAdvice(m6, 'aluminum');
  assert.equal(al.minThreadDepthMm, 9);
  assert.equal(al.recommendedBlindDrillDepthMm, 12.5);
  assert.match(formatThreadCallout(m6), /M6×1\.0-6H .*FULL THREAD 9 mm .*PILOT Ø5\.00 mm TO 12\.5 mm FULL DIAMETER/);
  assert.match(formatThreadCallout(inch), /1\/4-20 UNC-2B .*FULL THREAD 0\.375 in .*PILOT Ø0\.2010 in \(#7\) TO 0\.55 in FULL DIAMETER/);
  assert.match(formatThreadCallout(inch, 'steel', 'clearance_normal'), /Ø0\.281–0\.290 in THRU .*NORMAL CLEARANCE.*ASME B18\.2\.8/);
  assert.match(formatThreadCallout(inch, 'steel', 'clearance_loose'), /Ø0\.297–0\.311 in THRU .*LOOSE CLEARANCE/);
  assert.match(formatThreadCallout(m6, 'steel', 'clearance_normal'), /Ø6\.6 mm THRU .*ISO 273/);
  assert.match(formatThreadCallout(m6, 'steel', 'tapped_forming'), /THREAD CLASS PER DRAWING.*PILOT Ø5\.55 mm .*FORM TAP/);
  assert.match(formatThreadCallout(inch, 'steel', 'tapped_forming'), /1\/4-20 UNC .*PILOT Ø[\d.]+ in \(5\.8 mm\).*FORM TAP/);

  assert.equal(THREAD_SPECS.length, 42);
  assert.equal(new Set(THREAD_SPECS.map(s => s.id)).size, 42);
  for (const s of THREAD_SPECS) {
    if (s.system === 'inch') assert.equal(s.pitchMm, 25.4 / s.tpi);
    assert.ok(s.cuttingTap.mm < s.formingTap.mm && s.formingTap.mm < s.majorMm, s.id);
    const { close, normal, loose } = s.clearance;
    assert.ok(s.majorMm < close.mm && close.mm < normal.mm && normal.mm < loose.mm, s.id);
    for (const [key, { factor }] of Object.entries(MATERIAL_ENGAGEMENT)) {
      const a = computeEngagementAdvice(s, key);
      assert.equal(a.minThreadDepthMm, s.majorMm * factor);
      assert.equal(a.recommendedBlindDrillDepthMm, s.majorMm * factor + 3.5 * s.pitchMm);
      assert.equal(a.recommendedBlindDrillDepthIn, a.recommendedBlindDrillDepthMm / 25.4);
      assert.equal(a.minThreadDepthIn, a.minThreadDepthMm / 25.4);
    }
  }
});

test('Invalid thread, material and operation selections cannot emit a different tapped hole', () => {
  assert.equal(getThreadSpec().id, 'M6x1.0');
  assert.throws(() => getThreadSpec('M60x10'), RangeError);
  assert.throws(() => computeEngagementAdvice(getThreadSpec(), 'toString'), RangeError);
  assert.throws(() => formatThreadCallout(getThreadSpec(), 'steel', 'clearance_typo'), RangeError);
});

test('Shared catalogs and nested lookup results stay immutable between consumers', () => {
  const inch = getThreadSpec('1-4-20-unc');
  assert.throws(() => { inch.clearance.normal.minIn = 0; }, TypeError);
  assert.throws(() => { MATERIAL_ENGAGEMENT.steel.factor = 2; }, TypeError);
  assert.throws(() => { PREFERRED_FITS[0].hole = 'H7'; }, TypeError);
  for (const catalog of [HOLE_CLASSES, SHAFT_CLASSES, THREAD_SPECS, PREFERRED_FITS]) {
    assert.throws(() => catalog.pop(), TypeError);
  }
  assert.equal(getThreadSpec(inch.id).clearance.normal.minIn, 0.281);
  assert.equal(computeEngagementAdvice(getThreadSpec(), 'steel').minThreadDepthMm, 6);
});

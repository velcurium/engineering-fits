import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { createRequire } from 'node:module';
import { calculateFit, getThreadSpec, PREFERRED_FITS, THREAD_SPECS } from '@velcurium/engineering-fits';

const require = createRequire(import.meta.url);

async function readTable(name) {
  const path = require.resolve('@velcurium/engineering-fits/data/' + name);
  const csv = await readFile(path, 'utf8');
  assert.ok(csv.endsWith('\r\n'));
  // A quoted field can contain commas, escaped quotes and line breaks.
  const field = /(?:"((?:[^"]|"")*)"|([^",\r\n]*))(,|\r\n)/gy;
  const rows = [];
  let row = [];
  while (field.lastIndex < csv.length) {
    const match = field.exec(csv);
    assert.ok(match, 'Invalid CSV field in ' + name);
    row.push(match[1] === undefined ? match[2] : match[1].replaceAll('""', '"'));
    if (match[3] === '\r\n') {
      rows.push(row);
      row = [];
    }
  }
  const [headers, ...body] = rows;
  assert.equal(new Set(headers).size, headers.length);
  return body.map(cells => {
    assert.equal(cells.length, headers.length);
    return Object.fromEntries(headers.map((key, index) => [key, cells[index]]));
  });
}

test('Fit CSV covers every preferred fit at 28 sizes with signed limits and half micrometres', async () => {
  const rows = await readTable('iso286-preferred-fits.csv');
  assert.equal(rows.length, 448);
  assert.equal(new Set(rows.map(r => r.nominal_mm)).size, 28);
  assert.equal(new Set(rows.map(r => r.nominal_mm + '/' + r.fit)).size, 448);
  const presets = new Map(PREFERRED_FITS.map(p => [p.id, p]));
  for (const r of rows) {
    const preset = presets.get(r.fit);
    assert.ok(preset);
    assert.deepEqual([r.basis, r.hole_code, r.shaft_code], [preset.basis, preset.hole, preset.shaft]);
    const f = calculateFit(Number(r.nominal_mm), r.hole_code, r.shaft_code);
    assert.equal(r.fit_type, f.fitType);
    assert.deepEqual(
      [r.hole_lower_um, r.hole_upper_um, r.shaft_lower_um, r.shaft_upper_um,
        r.min_clearance_um, r.max_clearance_um].map(Number),
      [f.hole.lowerUm, f.hole.upperUm, f.shaft.lowerUm, f.shaft.upperUm,
        f.minClearanceUm, f.maxClearanceUm]
    );
    assert.deepEqual([r.hole_min_mm, r.hole_max_mm, r.shaft_min_mm, r.shaft_max_mm], [
      f.hole.minMm.toFixed(4), f.hole.maxMm.toFixed(4), f.shaft.minMm.toFixed(4), f.shaft.maxMm.toFixed(4)
    ]);
  }
  function find(diameter, fit) {
    return rows.find(r => r.nominal_mm === diameter && r.fit === fit);
  }
  const small = find('2', 'H7/p6');
  assert.deepEqual([small.fit_type, small.min_clearance_um, small.max_clearance_um], ['transition', '-12', '4']);
  const large = find('50', 'H7/p6');
  assert.deepEqual([large.fit_type, large.min_clearance_um, large.max_clearance_um], ['interference', '-42', '-1']);
  const half = find('10', 'H7/js6');
  assert.deepEqual([half.shaft_min_mm, half.shaft_max_mm], ['9.9955', '10.0045']);
});

test('Thread CSV round-trips stock names, units and finished-hole limits for all 42 threads', async () => {
  const rows = await readTable('tap-drill-clearance-holes.csv');
  assert.equal(rows.length, 126);
  assert.equal(new Set(rows.map(r => r.thread_id)).size, THREAD_SPECS.length);
  assert.equal(new Set(rows.map(r => r.thread_id + '/' + r.clearance_fit)).size, rows.length);
  for (const r of rows) {
    const s = getThreadSpec(r.thread_id);
    assert.ok(['close', 'normal', 'loose'].includes(r.clearance_fit));
    const c = s.clearance[r.clearance_fit];
    const inch = s.system === 'inch';
    const unit = inch ? 'in' : 'mm';
    assert.deepEqual([r.designation, r.series, r.diameter_unit], [s.designation, s.series, unit]);
    assert.equal(r.clearance_standard, inch ? 'ASME B18.2.8' : 'ISO 273');
    assert.equal(Number(r.major_diameter), inch ? s.majorIn : s.majorMm);
    assert.equal(r.tpi, inch ? String(s.tpi) : '');
    assert.ok(Math.abs(Number(r.pitch_mm) - s.pitchMm) <= 0.0000005);
    for (const [name, diameter, drill] of [
      [r.cutting_drill, r.cutting_diameter, s.cuttingTap],
      [r.forming_drill, r.forming_diameter, s.formingTap],
      [r.clearance_drill, r.clearance_nominal_diameter, c]
    ]) {
      assert.equal(name, drill.drill ?? drill.label);
      assert.ok(Math.abs(Number(diameter) - drill[unit]) <= 0.0000005);
    }
    assert.deepEqual([r.finished_min, r.finished_max], inch ? [c.minIn.toFixed(3), c.maxIn.toFixed(3)] : ['', '']);
  }
  const unc = rows.find(r => r.thread_id === '1-4-20-unc' && r.clearance_fit === 'normal');
  assert.deepEqual([unc.clearance_drill, unc.clearance_nominal_diameter, unc.finished_min, unc.finished_max],
    ['9/32"', '0.28125', '0.281', '0.290']);
  const m6 = rows.find(r => r.thread_id === 'M6x1.0' && r.clearance_fit === 'normal');
  assert.deepEqual([m6.diameter_unit, m6.cutting_diameter, m6.forming_diameter, m6.clearance_nominal_diameter],
    ['mm', '5', '5.55', '6.6']);
});

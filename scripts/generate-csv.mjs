import { randomUUID } from 'node:crypto';
import { mkdir, readFile, rename, rm, writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { calculateFit, PREFERRED_FITS, THREAD_SPECS } from '@velcurium/engineering-fits';

const nominalDiametersMm = [
  1, 2, 3, 6, 10, 16, 18, 20, 25, 30, 40, 50, 65, 80,
  100, 120, 140, 160, 180, 200, 225, 250, 280, 315, 355, 400, 450, 500
];
const clearanceFits = ['close', 'normal', 'loose'];

function preferredFitRows() {
  const rows = [[
    'nominal_mm', 'fit', 'basis', 'hole_code', 'shaft_code',
    'hole_lower_um', 'hole_upper_um', 'shaft_lower_um', 'shaft_upper_um',
    'hole_min_mm', 'hole_max_mm', 'shaft_min_mm', 'shaft_max_mm',
    'min_clearance_um', 'max_clearance_um', 'fit_type'
  ]];
  for (const diameter of nominalDiametersMm) {
    for (const preset of PREFERRED_FITS) {
      const fit = calculateFit(diameter, preset.hole, preset.shaft);
      const { hole, shaft } = fit;
      rows.push([
        diameter, preset.id, preset.basis, hole.code, shaft.code,
        hole.lowerUm, hole.upperUm, shaft.lowerUm, shaft.upperUm,
        hole.minMm.toFixed(4), hole.maxMm.toFixed(4), shaft.minMm.toFixed(4), shaft.maxMm.toFixed(4),
        fit.minClearanceUm, fit.maxClearanceUm, fit.fitType
      ]);
    }
  }
  return rows;
}

// Six decimal places retain the inch fractions in the catalog and bound recurring conversions.
function decimal(value) {
  return Number(value.toFixed(6));
}

function threadRows() {
  const rows = [[
    'thread_id', 'designation', 'series', 'diameter_unit', 'major_diameter', 'pitch_mm', 'tpi',
    'cutting_drill', 'cutting_diameter', 'forming_drill', 'forming_diameter', 'clearance_fit',
    'clearance_standard', 'clearance_drill', 'clearance_nominal_diameter', 'finished_min', 'finished_max'
  ]];
  for (const spec of THREAD_SPECS) {
    const inch = spec.system === 'inch';
    const unit = inch ? 'in' : 'mm';
    for (const fit of clearanceFits) {
      const hole = spec.clearance[fit];
      rows.push([
        spec.id, spec.designation, spec.series, unit, inch ? spec.majorIn : spec.majorMm,
        decimal(spec.pitchMm), spec.tpi ?? '',
        spec.cuttingTap.drill ?? spec.cuttingTap.label, decimal(spec.cuttingTap[unit]),
        spec.formingTap.drill ?? spec.formingTap.label, decimal(spec.formingTap[unit]),
        fit, inch ? 'ASME B18.2.8' : 'ISO 273',
        hole.drill ?? hole.label, decimal(hole[unit]),
        inch ? hole.minIn.toFixed(3) : '', inch ? hole.maxIn.toFixed(3) : ''
      ]);
    }
  }
  return rows;
}

function csvCell(value) {
  const text = String(value);
  return /[",\r\n]/.test(text) ? '"' + text.replaceAll('"', '""') + '"' : text;
}

function encodeCsv(rows) {
  return rows.map(row => row.map(csvCell).join(',')).join('\r\n') + '\r\n';
}

const args = process.argv.slice(2);
if (args.length > 1 || (args.length === 1 && args[0] !== '--check')) {
  throw new Error('Usage: node scripts/generate-csv.mjs [--check]');
}
const checkOnly = args[0] === '--check';
const dataDir = fileURLToPath(new URL('../data/', import.meta.url));
if (!checkOnly) await mkdir(dataDir, { recursive: true });

for (const [name, rows] of [
  ['iso286-preferred-fits.csv', preferredFitRows()],
  ['tap-drill-clearance-holes.csv', threadRows()]
]) {
  const path = join(dataDir, name);
  const expected = encodeCsv(rows);
  if (checkOnly) {
    const current = await readFile(path, 'utf8').catch(error => {
      if (error.code === 'ENOENT') return null;
      throw error;
    });
    if (current !== expected) {
      console.error(`Missing or outdated data/${name}. Run npm run data:generate.`);
      process.exitCode = 1;
      continue;
    }
  } else {
    const temporary = path + '.' + randomUUID() + '.tmp';
    try {
      await writeFile(temporary, expected, 'utf8');
      await rename(temporary, path);
    } finally {
      await rm(temporary, { force: true });
    }
  }
  console.log(`${checkOnly ? 'Verified' : 'Generated'} data/${name} (${rows.length - 1} rows)`);
}

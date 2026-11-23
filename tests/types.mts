import {
  calculateFit, calculateToleranceBand, getThreadSpec, computeEngagementAdvice, formatThreadCallout,
  HOLE_CLASSES, SHAFT_CLASSES, PREFERRED_FITS, THREAD_SPECS, MATERIAL_ENGAGEMENT,
  type FitType, type ThreadSpec
} from '@velcurium/engineering-fits';

const kind: FitType = calculateFit('25', 'H7', 'g6').fitType;
const band: 'shaft' = calculateToleranceBand(10, 'js6').kind;
const metric = getThreadSpec();
const counterboreDiameter: number = metric.counterbore.diaMm;
const metricPitch: number = getThreadSpec('M1.6x0.35').pitchMm;
const inch = getThreadSpec('1-4-20-unc');
const finishedMin: number = inch.clearance.normal.minIn;
const tpi: number = inch.tpi;
const advice = computeEngagementAdvice(inch, 'aluminum');
const callout: string = formatThreadCallout(inch, 'steel', 'clearance_normal');

function finishedUpper(id: string): number | undefined {
  const spec: ThreadSpec = getThreadSpec(id);
  return spec.system === 'inch' ? spec.clearance.loose.maxIn : undefined;
}

calculateFit(50, HOLE_CLASSES[0], SHAFT_CLASSES[0]);
computeEngagementAdvice(THREAD_SPECS[0], 'steel');
void [kind, band, counterboreDiameter, metricPitch, finishedMin, tpi, advice, callout, finishedUpper];

// @ts-expect-error Hole and shaft positions are case sensitive.
calculateFit(25, 'h7', 'g6');
// @ts-expect-error Only IT5 through IT11 are supported.
calculateToleranceBand(25, 'H12');
// @ts-expect-error Metric ISO 273 entries contain nominal diameters.
getThreadSpec('M6x1.0').clearance.normal.minIn;
// @ts-expect-error Catalog entries are immutable.
inch.cuttingTap.in = 0;
// @ts-expect-error Presets are shared and immutable.
PREFERRED_FITS[0].hole = 'H7';
// @ts-expect-error The material lookup is immutable.
MATERIAL_ENGAGEMENT.steel.factor = 2;
// @ts-expect-error Only documented operation names are supported.
formatThreadCallout(metric, 'steel', 'clearance_standard');
// @ts-expect-error The material lookup has a finite set of keys.
computeEngagementAdvice(metric, 'bronze');

/** Nominal diameter in millimetres, from 1 through 500 inclusive. */
export type NominalDiameter = number | string;
export type ITGrade = 5 | 6 | 7 | 8 | 9 | 10 | 11;
export type HoleLetter = 'H' | 'G' | 'F' | 'E' | 'D' | 'JS' | 'K' | 'M' | 'N' | 'P';
export type ShaftLetter = 'h' | 'g' | 'f' | 'e' | 'd' | 'c' | 'js' | 'k' | 'm' | 'n' | 'p' | 's';
export type HoleClass = `${HoleLetter}${ITGrade}`;
export type ShaftClass = `${ShaftLetter}${ITGrade}`;
export type ToleranceClass = HoleClass | ShaftClass;
export type FitType = 'clearance' | 'transition' | 'interference';

/** ISO lookup step. The lower endpoint is open and the upper endpoint is closed. */
export type DiameterStep = [lowerExclusive: number, upperInclusive: number];

export interface ToleranceBand<C extends ToleranceClass = ToleranceClass> {
  code: C;
  kind: C extends HoleClass ? 'hole' : 'shaft';
  diameterMm: number;
  subRange: DiameterStep;
  mainRangeLabel: string;
  /** Width of the tolerance band in micrometres. */
  itUm: number;
  upperUm: number;
  lowerUm: number;
  maxMm: number;
  minMm: number;
  maxIn: number;
  minIn: number;
}

export interface FitResult {
  nominalMm: number;
  subRange: DiameterStep;
  mainRangeLabel: string;
  hole: ToleranceBand<HoleClass>;
  shaft: ToleranceBand<ShaftClass>;
  /** Minimum hole minus maximum shaft. Negative clearance means interference. */
  minClearanceUm: number;
  /** Maximum hole minus minimum shaft. */
  maxClearanceUm: number;
  minClearanceMm: number;
  maxClearanceMm: number;
  fitType: FitType;
  fitLabel: string;
  fitName: string;
  application: string;
  callout: string;
}

export interface FitPreset {
  readonly id: `${HoleClass}/${ShaftClass}`;
  readonly hole: HoleClass;
  readonly shaft: ShaftClass;
  readonly basis: 'hole' | 'shaft';
  /** Typical category. For a particular size, use calculateFit(...).fitType. */
  readonly type: FitType;
  readonly name: string;
  readonly application: string;
}

export const HOLE_CLASSES: readonly HoleClass[];
export const SHAFT_CLASSES: readonly ShaftClass[];
export const PREFERRED_FITS: readonly FitPreset[];

/** Subject to the class and size exclusions documented in the README. */
export function calculateToleranceBand<C extends ToleranceClass>(
  diameterMm: NominalDiameter,
  code: C
): ToleranceBand<C>;

/** The default fit is H7/g6. Deviations and clearances preserve half micrometres. */
export function calculateFit(
  diameterMm: NominalDiameter,
  holeClass?: HoleClass,
  shaftClass?: ShaftClass
): FitResult;

export type MetricThreadId = `M${number}x${number}`;
export type InchThreadId = `${string}-${'unc' | 'unf'}`;
export type ClearanceFit = 'close' | 'normal' | 'loose';
export type HoleType = 'tapped_cutting' | 'tapped_forming' | `clearance_${ClearanceFit}`;
export type MaterialKey = 'steel' | 'stainless' | 'aluminum' | 'brass' | 'plastic';

export interface DrillSize {
  readonly label: string;
  readonly mm: number;
  readonly in: number;
}

export interface InchDrill extends DrillSize {
  /** Stock identification, which can be a numbered, letter, fractional or metric drill. */
  readonly drill: string;
}

export interface InchClearanceDrill extends InchDrill {
  /** Lower and upper finished bore limits in inches. */
  readonly minIn: number;
  readonly maxIn: number;
}

export interface CounterboreExample {
  readonly diaLabel: string;
  readonly diaMm: number;
  readonly depthMm: number;
}

interface ThreadDimensions {
  readonly designation: string;
  readonly standard: string;
  readonly majorMm: number;
  readonly majorIn: number;
  readonly pitchMm: number;
}

export interface MetricThreadSpec extends ThreadDimensions {
  readonly id: MetricThreadId;
  readonly system: 'metric';
  readonly series: 'coarse' | 'fine';
  readonly tpi: null;
  readonly cuttingTap: DrillSize;
  readonly formingTap: DrillSize;
  readonly clearance: Readonly<Record<ClearanceFit, DrillSize>>;
  readonly counterbore: CounterboreExample;
}

export interface InchThreadSpec extends ThreadDimensions {
  readonly id: InchThreadId;
  readonly system: 'inch';
  readonly series: 'unc' | 'unf';
  readonly tpi: number;
  readonly cuttingTap: InchDrill;
  readonly formingTap: InchDrill;
  readonly clearance: Readonly<Record<ClearanceFit, InchClearanceDrill>>;
  readonly counterbore: null;
}

export type ThreadSpec = MetricThreadSpec | InchThreadSpec;

export interface MaterialEngagement {
  readonly label: string;
  readonly factor: number;
  readonly factorText: string;
  readonly tapNote: string;
  readonly blindNote: string;
}

export interface EngagementAdvice {
  material: string;
  factorText: string;
  minThreadDepthMm: number;
  recommendedBlindDrillDepthMm: number;
  minThreadDepthIn: number;
  recommendedBlindDrillDepthIn: number;
  tapNote: string;
  blindNote: string;
}

export const THREAD_SPECS: readonly ThreadSpec[];
export const MATERIAL_ENGAGEMENT: Readonly<Record<MaterialKey, MaterialEngagement>>;

/** Unknown IDs throw RangeError. With no argument this selects M6x1.0. */
export function getThreadSpec(id?: undefined): MetricThreadSpec;
export function getThreadSpec(id: MetricThreadId): MetricThreadSpec;
export function getThreadSpec(id: InchThreadId): InchThreadSpec;
export function getThreadSpec(id?: string): ThreadSpec;

/** Planning depths for the chosen material. Blind depth excludes the drill point. */
export function computeEngagementAdvice(spec: ThreadSpec, materialKey?: MaterialKey): EngagementAdvice;

/** Defaults to an aluminum cutting-tap planning note. Clearance callouts describe through holes. */
export function formatThreadCallout(spec: ThreadSpec, materialKey?: MaterialKey, holeType?: HoleType): string;

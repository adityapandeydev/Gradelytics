import type { Course, GradingProfile, summarize } from "./academics";

export type AcademicSummary = ReturnType<typeof summarize>;
export interface CalculationInput {
  profile: GradingProfile;
  courses: Course[];
  overrides?: Record<string, string>;
  target?: number;
  futureCredits?: number;
}
export interface CalculationResults {
  gpa: AcademicSummary;
  improvement: {
    current: AcademicSummary;
    projected: AcademicSummary;
    gpaChange: number | null;
  };
  target: {
    current: AcademicSummary;
    requiredAverage: number;
    maximumPossible: number;
    reachable: boolean;
  };
}
export type CalculationKind = keyof CalculationResults;
export type Fetcher = (
  input: RequestInfo | URL,
  init?: RequestInit,
) => Promise<Response>;

function decimal(value: number): string {
  if (
    !Number.isFinite(value) ||
    Math.abs(value * 10000 - Math.round(value * 10000)) > 0.000001
  ) {
    throw new Error("Use finite values with at most four decimal places.");
  }
  return value.toFixed(4);
}

export function prepareCalculation(
  kind: CalculationKind,
  input: CalculationInput,
): string {
  const body = {
    profile: {
      maximum: decimal(input.profile.max),
      failedCredits: "include",
      grades: input.profile.grades.map((grade) => ({
        label: grade.label,
        outcome: grade.outcome,
        ...(grade.outcome === "pass" ? {} : { points: decimal(grade.points) }),
      })),
    },
    courses: input.courses.map((course) => ({
      id: course.id,
      credits: decimal(course.credits),
      grade: course.grade,
    })),
    ...(kind === "improvement" ? { overrides: input.overrides ?? {} } : {}),
    ...(kind === "target"
      ? {
          target: decimal(input.target ?? NaN),
          futureCredits: decimal(input.futureCredits ?? NaN),
        }
      : {}),
  };
  return JSON.stringify(body);
}

function object(value: unknown): Record<string, unknown> {
  if (typeof value !== "object" || value === null || Array.isArray(value))
    throw new Error("The calculation service returned an unexpected response.");
  return value as Record<string, unknown>;
}
function numeric(value: unknown, nonnegative = true): number {
  if (
    typeof value !== "number" ||
    !Number.isFinite(value) ||
    (nonnegative && value < 0)
  )
    throw new Error("The calculation service returned an unexpected response.");
  return value;
}
function nullableNumber(value: unknown): number | null {
  return value === null ? null : numeric(value);
}
function summary(value: unknown): AcademicSummary {
  const body = object(value);
  const backlogs = numeric(body.backlogs);
  if (!Number.isInteger(backlogs))
    throw new Error("The calculation service returned an unexpected response.");
  return {
    gpa: nullableNumber(body.gpa),
    credits: numeric(body.gpaCredits),
    earned: numeric(body.earnedCredits),
    points: numeric(body.weightedGradePoints),
    backlogs,
  };
}
const decoders: {
  [K in CalculationKind]: (value: unknown) => CalculationResults[K];
} = {
  gpa: summary,
  improvement: (value) => {
    const body = object(value);
    if (body.policy !== "replacement")
      throw new Error(
        "The calculation service returned an unexpected response.",
      );
    return {
      current: summary(body.current),
      projected: summary(body.projected),
      gpaChange:
        body.gpaChange === null ? null : numeric(body.gpaChange, false),
    };
  },
  target: (value) => {
    const body = object(value);
    if (typeof body.reachable !== "boolean")
      throw new Error(
        "The calculation service returned an unexpected response.",
      );
    return {
      current: summary(body.current),
      requiredAverage: numeric(body.requiredAverage, false),
      maximumPossible: numeric(body.maximumPossible),
      reachable: body.reachable,
    };
  },
};

export async function calculate<K extends CalculationKind>(
  kind: K,
  body: string,
  signal?: AbortSignal,
  fetcher: Fetcher = fetch,
): Promise<CalculationResults[K]> {
  let response: Response;
  try {
    response = await fetcher(`/api/v1/calculations/${kind}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body,
      signal,
      cache: "no-store",
      credentials: "omit",
    });
  } catch (error) {
    if (error instanceof Error && error.name === "AbortError") throw error;
    throw new Error(
      "Live calculations are unavailable. Try again when the calculation service is running.",
      { cause: error },
    );
  }
  let payload: Record<string, unknown>;
  try {
    payload = object(await response.json());
  } catch {
    throw new Error(
      response.ok
        ? "The calculation service returned an unexpected response."
        : "Live calculations are unavailable. Please try again.",
    );
  }
  if (!response.ok) {
    const problem =
      typeof payload.error === "object" && payload.error !== null
        ? (payload.error as Record<string, unknown>)
        : null;
    throw new Error(
      typeof problem?.message === "string"
        ? problem.message.slice(0, 300)
        : "Live calculations are unavailable. Please try again.",
    );
  }
  return decoders[kind](payload.data);
}

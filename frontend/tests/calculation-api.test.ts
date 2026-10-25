import { describe, expect, test } from "bun:test";
import { createDemo, profiles } from "../src/lib/academics";
import {
  calculate,
  prepareCalculation,
  type Fetcher,
} from "../src/lib/calculation-api";

const profile = profiles[1];
const input = { profile, courses: createDemo(profile) };
const summary = {
  gpa: 3.7,
  gpaCredits: 3,
  earnedCredits: 3,
  weightedGradePoints: 11.1,
  backlogs: 0,
  completedCourses: 1,
  courseCount: 1,
};
function response(data: unknown): Fetcher {
  return async () =>
    new Response(JSON.stringify({ data }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
}

describe("calculation API client", () => {
  test("sends the domain contract without names, attendance, or student data", async () => {
    const body = prepareCalculation("gpa", input);
    const parsed = JSON.parse(body);
    expect(parsed.profile.maximum).toBe("4.0000");
    expect(parsed.profile.failedCredits).toBe("include");
    expect(parsed.courses[0]).toEqual({
      id: "1-0",
      credits: "4.0000",
      grade: input.courses[0].grade,
    });
    expect(body).not.toContain("attended");
    expect(body).not.toContain("Mathematics");
    expect(
      parsed.profile.grades.find((g: { label: string }) => g.label === "P")
        .points,
    ).toBeUndefined();
    let path = "",
      method = "";
    const fetcher: Fetcher = async (url, init) => {
      path = String(url);
      method = init?.method ?? "";
      return response(summary)(url, init);
    };
    const result = await calculate("gpa", body, undefined, fetcher);
    expect(path).toBe("/api/v1/calculations/gpa");
    expect(method).toBe("POST");
    expect(result).toEqual({
      gpa: 3.7,
      credits: 3,
      earned: 3,
      points: 11.1,
      backlogs: 0,
    });
  });
  test("normalizes floating-point noise without discarding meaningful precision", () => {
    const body = prepareCalculation("target", {
      ...input,
      target: 9 * 0.85,
      futureCredits: 46,
    });
    expect(JSON.parse(body).target).toBe("7.6500");
    expect(() =>
      prepareCalculation("target", {
        ...input,
        target: 3.70001,
        futureCredits: 46,
      }),
    ).toThrow("four decimal places");
  });
  test("parses replacement results, including no previous GPA", async () => {
    const body = prepareCalculation("improvement", {
      ...input,
      overrides: { "1-0": "A" },
    });
    expect(JSON.parse(body).overrides).toEqual({ "1-0": "A" });
    const result = await calculate(
      "improvement",
      body,
      undefined,
      response({
        current: { ...summary, gpa: null },
        projected: summary,
        gpaChange: null,
        coursesAffected: 1,
        policy: "replacement",
      }),
    );
    expect(result.current.gpa).toBeNull();
    expect(result.projected.gpa).toBe(3.7);
    expect(result.gpaChange).toBeNull();
  });
  test("uses server reachability rather than a rounded GPA comparison", async () => {
    const result = await calculate(
      "target",
      prepareCalculation("target", { ...input, target: 4, futureCredits: 10 }),
      undefined,
      response({
        current: summary,
        target: 4,
        futureCredits: 10,
        requiredAverage: 4,
        maximumPossible: 4,
        reachable: false,
      }),
    );
    expect(result.reachable).toBeFalse();
  });
  test("rejects invalid or unexpected success payloads", async () => {
    for (const malformed of [
      { ...summary, gpa: "3.7" },
      { ...summary, weightedGradePoints: Infinity },
      { ...summary, backlogs: -1 },
      { ...summary, earnedCredits: null },
    ]) {
      await expect(
        calculate("gpa", "{}", undefined, response(malformed)),
      ).rejects.toThrow("unexpected response");
    }
  });
  test("surfaces server validation errors and network failures", async () => {
    const invalid: Fetcher = async () =>
      new Response(
        JSON.stringify({
          error: {
            code: "VALIDATION_ERROR",
            message: "Choose valid grade points.",
          },
        }),
        { status: 422 },
      );
    await expect(calculate("gpa", "{}", undefined, invalid)).rejects.toThrow(
      "Choose valid grade points.",
    );
    const offline: Fetcher = async () => {
      throw new TypeError("Failed to fetch");
    };
    await expect(calculate("gpa", "{}", undefined, offline)).rejects.toThrow(
      "unavailable",
    );
  });
  test("passes request cancellation through to fetch", async () => {
    const controller = new AbortController();
    let observed: AbortSignal | null | undefined;
    const fetcher: Fetcher = async (url, init) => {
      observed = init?.signal;
      return response(summary)(url, init);
    };
    await calculate("gpa", "{}", controller.signal, fetcher);
    expect(observed).toBe(controller.signal);
  });
  test("reports a failed development proxy as unavailable", async () => {
    const proxyFailure: Fetcher = async () =>
      new Response("Bad gateway", { status: 502 });
    await expect(
      calculate("gpa", "{}", undefined, proxyFailure),
    ).rejects.toThrow("unavailable");
  });
});

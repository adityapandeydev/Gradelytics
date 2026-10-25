import { describe, expect, test } from "bun:test";
import {
  profiles,
  summarize,
  requiredAverage,
  createDemo,
  csvExport,
} from "../src/lib/academics";
describe("academic preview calculations", () => {
  const base = createDemo(profiles[0])[0];
  test("exports quoted CSV without executable spreadsheet formulas", () => {
    const csv = csvExport([
      {
        ...base,
        name: " =SUM(1,2)",
        code: "@course",
        category: 'Core "theory"',
      },
    ]);
    expect(csv).toContain('"\' =SUM(1,2)"');
    expect(csv).toContain('"\'@course"');
    expect(csv).toContain('"Core ""theory"""');
    expect(csv).toContain('"4"');
  });
  test("weights grade points by credits, including failed credits", () => {
    const result = summarize(
      [
        { ...base, credits: 4, grade: "A" },
        { ...base, id: "failed", credits: 2, grade: "F" },
      ],
      profiles[0],
    );
    expect(result.gpa).toBe(6);
    expect(result.earned).toBe(4);
    expect(result.backlogs).toBe(1);
  });
  test("excludes pass-only courses and handles zero eligible credits", () => {
    expect(
      summarize([{ ...base, credits: 0, grade: "P" }], profiles[0]).gpa,
    ).toBeNull();
    expect(
      summarize(
        [
          { ...base, credits: 4, grade: "A" },
          { ...base, id: "pass", credits: 0, grade: "P" },
        ],
        profiles[0],
      ).gpa,
    ).toBe(9);
  });
  test("replaces a grade without double counting credits", () => {
    const result = summarize(
      [{ ...base, credits: 4, grade: "F" }],
      profiles[0],
      { [base.id]: "S" },
    );
    expect(result.gpa).toBe(10);
    expect(result.credits).toBe(4);
    expect(result.backlogs).toBe(0);
  });
  test("supports fractional grade points", () => {
    expect(summarize([{ ...base, grade: "A−" }], profiles[1]).gpa).toBe(3.7);
  });
  test("solves the target and leaves unreachable targets detectable", () => {
    expect(requiredAverage(800, 100, 20, 8.5)).toBe(11);
    expect(requiredAverage(800, 100, 0, 8.5)).toBeNull();
  });
});

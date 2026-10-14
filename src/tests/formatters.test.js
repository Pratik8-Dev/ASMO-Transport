import { describe, expect, it } from "vitest";
import { formatDateTime, formatPercentage } from "../utils/formatters";
describe("formatters", () => {
  it("uses an em dash for missing percentages", () =>
    expect(formatPercentage(null)).toBe("—"));
  it("formats percentages to one decimal", () =>
    expect(formatPercentage(95)).toBe("95.0%"));
  it("handles malformed dates", () =>
    expect(formatDateTime("not-a-date")).toBe("—"));
});

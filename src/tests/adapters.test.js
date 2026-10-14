import { describe, expect, it } from "vitest";
import { adaptShipment, adaptSummary } from "../services/adapters";
describe("adapters", () => {
  it("preserves null KPI values", () => {
    expect(
      adaptSummary({ collectionTimeliness: { percentage: null } }).collection
        .percentage,
    ).toBeNull();
  });
  it("safely adapts malformed shipment fields", () => {
    const row = adaptShipment({
      jobId: "1",
      legKm: "bad",
      slaMet: "yes",
      dataQualityFlags: null,
    });
    expect(row.legKm).toBeNull();
    expect(row.slaMet).toBeNull();
    expect(row.dataQualityFlags).toEqual([]);
  });
});

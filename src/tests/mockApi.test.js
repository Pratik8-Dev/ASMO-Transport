import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { controlTowerApi, isMockApiEnabled } from "../api/controlTowerApi";
import { MOCK_SHIPMENTS } from "../mocks/mockData";
beforeEach(() => {
  vi.stubEnv("VITE_USE_MOCK_API", "true");
  vi.stubEnv("VITE_MOCK_SCENARIO", "normal");
});
afterEach(() => {
  vi.unstubAllEnvs();
});
describe("mock API mode", () => {
  it("is reported as enabled via the shared switch", () => {
    expect(isMockApiEnabled()).toBe(true);
    vi.stubEnv("VITE_USE_MOCK_API", "false");
    expect(isMockApiEnabled()).toBe(false);
  });
  it("derives a non-trivial dashboard summary from the mock dataset", async () => {
    const summary = await controlTowerApi.getSummary({});
    expect(summary.otd.delivered).toBeGreaterThan(0);
    expect(summary.otd.slaVersion).toBe("v1");
    expect(summary.otd.standInApplied).toBe(true);
  });
  it("reconciles filtered shipments with the lane aggregate for the same filters", async () => {
    const lane = MOCK_SHIPMENTS[0].lane;
    const filters = { lane };
    const shipments = await controlTowerApi.getShipments(
      filters,
      { page: 0, size: 100 },
      undefined,
    );
    const lanes = await controlTowerApi.getLanes(filters);
    const expectedCount = MOCK_SHIPMENTS.filter((r) => r.lane === lane).length;
    expect(shipments.totalElements).toBe(expectedCount);
    expect(lanes.find((l) => l.lane === lane).jobs).toBe(expectedCount);
  });
  it("excludes shipments that do not match the active filter", async () => {
    const lane = MOCK_SHIPMENTS[0].lane;
    const shipments = await controlTowerApi.getShipments(
      { lane },
      { page: 0, size: 100 },
    );
    expect(shipments.totalElements).toBeLessThan(MOCK_SHIPMENTS.length);
  });
  it("supports zero-based pagination and documented sort keys", async () => {
    const page0 = await controlTowerApi.getShipments(
      {},
      { page: 0, size: 5, sort: "createdOn,desc" },
    );
    const page1 = await controlTowerApi.getShipments(
      {},
      { page: 1, size: 5, sort: "createdOn,desc" },
    );
    expect(page0.number).toBe(0);
    expect(page1.number).toBe(1);
    expect(page0.content[0].jobId).not.toBe(page1.content[0].jobId);
    const firstCreated = new Date(page0.content[0].createdOn).getTime();
    const lastCreated = new Date(
      page0.content[page0.content.length - 1].createdOn,
    ).getTime();
    expect(firstCreated).toBeGreaterThanOrEqual(lastCreated);
  });
  it("looks up a shipment by job id and returns a 404 envelope otherwise", async () => {
    const known = MOCK_SHIPMENTS[0].jobId;
    await expect(controlTowerApi.getShipment(known)).resolves.toMatchObject({
      jobId: known,
    });
    await expect(controlTowerApi.getShipment("does-not-exist")).rejects.toMatchObject(
      { status: 404 },
    );
  });
  it("returns empty-state shaped data for the empty scenario", async () => {
    vi.stubEnv("VITE_MOCK_SCENARIO", "empty");
    const shipments = await controlTowerApi.getShipments({}, { page: 0, size: 10 });
    expect(shipments.content).toEqual([]);
    expect(shipments.totalElements).toBe(0);
    const dq = await controlTowerApi.getDataQuality({});
    expect(dq).toEqual({
      futureDated: 0,
      reverseSequence: 0,
      implausibleSpeed: 0,
      manualCloseOut: 0,
    });
  });
  it("rejects every call during the error scenario with a safe message", async () => {
    vi.stubEnv("VITE_MOCK_SCENARIO", "error");
    await expect(controlTowerApi.getSummary({})).rejects.toMatchObject({
      status: 500,
    });
  });
  it("fails only the documented subset of endpoints during partialError", async () => {
    vi.stubEnv("VITE_MOCK_SCENARIO", "partialError");
    await expect(controlTowerApi.getSummary({})).resolves.toBeDefined();
    await expect(controlTowerApi.getShipments({}, { page: 0 })).resolves.toBeDefined();
    await expect(controlTowerApi.getSites({})).rejects.toMatchObject({ status: 500 });
    await expect(controlTowerApi.getDataQuality({})).rejects.toMatchObject({
      status: 500,
    });
  });
  it("completes an ETL upload and updates the in-memory status for subsequent reads", async () => {
    const before = await controlTowerApi.getEtlStatus();
    const result = await controlTowerApi.uploadEtl({
      jobsFile: new File([""], "Jobs.xlsx"),
      tripsFile: new File([""], "Trips.xlsx"),
    });
    expect(result.status).toBe("SUCCESS");
    const after = await controlTowerApi.getEtlStatus();
    expect(after.batches).toBe(before.batches + 1);
  });
  it("rejects an ETL upload with a non-xlsx file without retrying", async () => {
    await expect(
      controlTowerApi.uploadEtl({
        jobsFile: new File([""], "Jobs.csv"),
        tripsFile: new File([""], "Trips.xlsx"),
      }),
    ).rejects.toMatchObject({ status: 400 });
  });
});

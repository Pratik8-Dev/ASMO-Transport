// Mock transport used only while VITE_USE_MOCK_API=true. Mirrors the shape
// of controlTowerApi so UI components never need to know mock mode exists.
import { MOCK_SHIPMENTS, MOCK_ETL_STATUS_SEED } from "./mockData";
import {
  applyFilters,
  sortShipments,
  paginate,
  deriveSummary,
  deriveLanePerformance,
  deriveSitePerformance,
  deriveDataQuality,
} from "./mockEngine";
const DEFAULT_SCENARIO = "normal";
const LATENCY_RANGE_MS = {
  normal: [300, 700],
  empty: [300, 700],
  error: [300, 700],
  partialError: [300, 700],
  slow: [2200, 3200],
};
// Endpoints that deliberately fail while VITE_MOCK_SCENARIO=partialError, so
// one failed dashboard section does not block the others from rendering.
const PARTIAL_ERROR_ENDPOINTS = new Set(["sites", "dataQuality"]);
const getScenario = () => import.meta.env.VITE_MOCK_SCENARIO || DEFAULT_SCENARIO;
const randomDelay = (scenario) => {
  const [min, max] = LATENCY_RANGE_MS[scenario] || LATENCY_RANGE_MS.normal;
  return min + Math.random() * (max - min);
};
const abortError = () => {
  const error = new Error("The operation was aborted.");
  error.name = "AbortError";
  return error;
};
const delay = (ms, signal) =>
  new Promise((resolve, reject) => {
    const timer = setTimeout(resolve, ms);
    if (!signal) return;
    if (signal.aborted) {
      clearTimeout(timer);
      reject(abortError());
      return;
    }
    signal.addEventListener(
      "abort",
      () => {
        clearTimeout(timer);
        reject(abortError());
      },
      { once: true },
    );
  });
// Shape matches the documented error envelope so AsyncPanel and the Axios
// interceptor's consumers can treat mock and real failures the same way.
const mockError = (path, status, code, message) => {
  const error = new Error(message);
  error.status = status;
  error.code = code;
  error.endpoint = path;
  error.timestamp = new Date().toISOString();
  return error;
};
const genericError = (path) =>
  mockError(path, 500, "MOCK_SERVER_ERROR", "Unable to retrieve dashboard data.");
async function respond(path, { signal, endpointKey } = {}, buildData) {
  const scenario = getScenario();
  await delay(randomDelay(scenario), signal);
  if (scenario === "error") throw genericError(path);
  if (scenario === "partialError" && PARTIAL_ERROR_ENDPOINTS.has(endpointKey))
    throw genericError(path);
  return buildData(scenario);
}
const filteredRows = (filters, scenario) =>
  scenario === "empty" ? [] : applyFilters(MOCK_SHIPMENTS, filters);
let etlStatusState = { ...MOCK_ETL_STATUS_SEED };
const isXlsx = (file) => /\.xlsx$/i.test(file?.name || "");
export const mockApi = {
  getSummary: (filters, signal) =>
    respond("/dashboard/summary", { signal, endpointKey: "summary" }, (scenario) =>
      deriveSummary(filteredRows(filters, scenario)),
    ),
  getLanes: (filters, signal) =>
    respond("/lanes/performance", { signal, endpointKey: "lanes" }, (scenario) =>
      deriveLanePerformance(filteredRows(filters, scenario)),
    ),
  getSites: (filters, signal) =>
    respond("/sites/performance", { signal, endpointKey: "sites" }, (scenario) =>
      deriveSitePerformance(filteredRows(filters, scenario)),
    ),
  getDataQuality: (filters, signal) =>
    respond(
      "/data-quality/summary",
      { signal, endpointKey: "dataQuality" },
      (scenario) => deriveDataQuality(filteredRows(filters, scenario)),
    ),
  getShipments: (filters, paging, signal) =>
    respond("/shipments", { signal, endpointKey: "shipments" }, (scenario) => {
      const sorted = sortShipments(filteredRows(filters, scenario), paging?.sort);
      return paginate(sorted, { page: paging?.page ?? 0, size: paging?.size ?? 25 });
    }),
  async getShipment(jobId, signal) {
    const scenario = getScenario();
    const path = `/shipments/${jobId}`;
    await delay(randomDelay(scenario), signal);
    if (scenario === "error") throw genericError(path);
    const match =
      scenario === "empty" ? undefined : MOCK_SHIPMENTS.find((r) => r.jobId === jobId);
    if (!match)
      throw mockError(
        path,
        404,
        "SHIPMENT_NOT_FOUND",
        `Shipment ${jobId} was not found.`,
      );
    return match;
  },
  getEtlStatus: (signal) =>
    respond("/admin/etl/status", { signal, endpointKey: "etlStatus" }, () => ({
      ...etlStatusState,
    })),
  async uploadEtl({ jobsFile, tripsFile } = {}, signal) {
    const path = "/admin/etl/upload";
    if (!jobsFile || !tripsFile)
      throw mockError(
        path,
        400,
        "ETL_OR_REQUEST_ERROR",
        "Both Jobs and Trips files are required.",
      );
    if (!isXlsx(jobsFile) || !isXlsx(tripsFile))
      throw mockError(
        path,
        400,
        "ETL_OR_REQUEST_ERROR",
        "Jobs and Trips files must both be .xlsx.",
      );
    // Simulates a short loading state; uploads are never auto-retried.
    await delay(randomDelay("slow"), signal);
    if (getScenario() === "error") throw genericError(path);
    const result = {
      batchId: `mock-batch-${String(etlStatusState.batches + 1).padStart(3, "0")}`,
      status: "SUCCESS",
      jobsRows: 537,
      activityRows: 288,
      stopsRows: 388,
      allocationRows: 184,
      shipmentsUpserted: MOCK_SHIPMENTS.length,
      rejectedRows: 0,
      message: "Loaded both required workbooks",
    };
    etlStatusState = {
      ...etlStatusState,
      batches: etlStatusState.batches + 1,
      lastStatus: "SUCCESS",
      lastCompletedAt: new Date().toISOString(),
      jobsFile: jobsFile.name,
      tripsFile: tripsFile.name,
    };
    return result;
  },
};

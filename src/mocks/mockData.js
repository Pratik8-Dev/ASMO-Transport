// Mock-only fictional data used while VITE_USE_MOCK_API=true so the UI can
// run end-to-end before the Spring Boot APIs are available. Nothing here
// represents personal, confidential, or production shipment data.
const COLLECTION_SITES = ["AMTPJ", "JED-DC", "RUH-HUB"];
const DELIVERY_SITES = ["TESA 2", "DMM-PORT", "MED-HUB", "YNB-WH"];
const CARRIERS = ["ABC", "XYZ", "DEF", "GHI"];
const PRIORITIES = ["High", "Normal", "Low"];
const DISTANCE_BANDS = ["<250 km", "250-500 km", ">500 km"];
const two = (value) => String(value).padStart(2, "0");
// Matches the documented jobId shape (ddMMyyyyHHmmss + 3-digit sequence).
const makeJobId = (date, seq) =>
  `${two(date.getDate())}${two(date.getMonth() + 1)}${date.getFullYear()}${two(
    date.getHours(),
  )}${two(date.getMinutes())}${two(date.getSeconds())}${String(seq).padStart(3, "0")}`;
const addHours = (date, hours) => new Date(date.getTime() + hours * 3_600_000);
const iso = (date) => (date ? date.toISOString().slice(0, 19) : null);
const SHIPMENT_COUNT = 36;
// Deliberate per-index overrides covering the documented edge cases: DQ
// flags, null SLA/window outcomes, missing optional timestamps, absent
// priority (stand-in), and future-dated / reverse-sequence anomalies.
const OVERRIDES = {
  2: { dataQualityFlags: ["DQ-01"], futureDated: true },
  5: { dataQualityFlags: ["DQ-02"], reverseSequence: true },
  8: { dataQualityFlags: ["DQ-03"] },
  11: { dataQualityFlags: ["DQ-04"], pod: null },
  14: { slaMet: null },
  17: { inWindow: null },
  20: { poc: null },
  23: { priority: undefined },
  26: { dataQualityFlags: ["DQ-01", "DQ-03"], futureDated: true },
  29: { priority: undefined, slaMet: null },
  32: { dataQualityFlags: ["DQ-04"], pod: null, inWindow: null },
};
function buildShipment(index) {
  const override = OVERRIDES[index] || {};
  const collectionSite = COLLECTION_SITES[index % COLLECTION_SITES.length];
  const deliverySite = DELIVERY_SITES[(index + 1) % DELIVERY_SITES.length];
  const carrierCode = CARRIERS[(index + 2) % CARRIERS.length];
  const rawPriority = PRIORITIES[index % PRIORITIES.length];
  const distanceBand = DISTANCE_BANDS[index % DISTANCE_BANDS.length];
  const legKm = 80 + ((index * 37) % 420) + (index % 5) * 3.2;
  const createdOn = addHours(
    new Date("2026-09-10T06:00:00"),
    index * 14 + (index % 3),
  );
  const transitHours = 2 + ((index * 5) % 10) * 0.6;
  let poc = addHours(createdOn, 48 + (index % 6) * 6);
  let pod = addHours(poc, transitHours);
  if (override.futureDated) {
    // Fixed far-future offset mocks a DQ-01 future-dated event timestamp.
    poc = addHours(createdOn, 3000);
    pod = addHours(poc, transitHours);
  }
  if (override.reverseSequence) {
    // DQ-02: delivered timestamp precedes the collection timestamp.
    pod = addHours(poc, -transitHours);
  }
  const slaDue = addHours(createdOn, 96);
  const priority = "priority" in override ? override.priority : rawPriority;
  const onTime = pod ? pod.getTime() <= slaDue.getTime() : null;
  const slaMet = "slaMet" in override ? override.slaMet : onTime;
  const inWindow = "inWindow" in override ? override.inWindow : onTime;
  return {
    jobId: makeJobId(createdOn, index + 1),
    tripId: `trip-${String(index + 1).padStart(3, "0")}`,
    collectionSite,
    deliverySite,
    lane: `${collectionSite} -> ${deliverySite}`,
    legKm: Number(legKm.toFixed(3)),
    carrierCode,
    // Documented stand-in: absent priority defaults to "Normal".
    priority: priority === undefined ? "Normal" : priority,
    distanceBand,
    createdOn: iso(createdOn),
    poc: "poc" in override ? override.poc : iso(poc),
    pod: "pod" in override ? override.pod : iso(pod),
    slaDue: iso(slaDue),
    slaMet,
    inWindow,
    dataQualityFlags: override.dataQualityFlags || [],
  };
}
export const MOCK_SHIPMENTS = Array.from({ length: SHIPMENT_COUNT }, (_, i) =>
  buildShipment(i),
);
export const MOCK_ETL_STATUS_SEED = {
  shipments: MOCK_SHIPMENTS.length,
  batches: 1,
  lastStatus: "SUCCESS",
  lastCompletedAt: "2026-10-14T14:30:00",
  jobsFile: "Jobs_2026-10-08T12_34_07.263Z 1.xlsx",
  tripsFile: "Trips_2026-10-08T12_48_48.765Z 1.xlsx",
};

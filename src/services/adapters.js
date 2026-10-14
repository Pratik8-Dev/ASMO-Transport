const n = (value) => (Number.isFinite(Number(value)) ? Number(value) : null);
export const adaptSummary = (raw = {}) => ({
  otd: {
    rawPercentage: n(raw.otd?.rawPercentage),
    validatedPercentage: n(raw.otd?.validatedPercentage),
    delivered: n(raw.otd?.delivered) ?? 0,
    breaches: n(raw.otd?.breaches) ?? 0,
    standInApplied: Boolean(raw.otd?.standInApplied),
    slaVersion: raw.otd?.slaVersion || "Unavailable",
    rag: raw.otd?.rag || "NONE",
  },
  window: {
    percentage: n(raw.deliveredWithinWindow?.percentage),
    numerator: n(raw.deliveredWithinWindow?.numerator) ?? 0,
    denominator: n(raw.deliveredWithinWindow?.denominator) ?? 0,
    rag: raw.deliveredWithinWindow?.rag || "NONE",
  },
  dwell: {
    collection: n(raw.dwell?.collectionMedianHours),
    delivery: n(raw.dwell?.deliveryMedianHours),
    collectionOver: n(raw.dwell?.collectionOverThreshold) ?? 0,
    deliveryOver: n(raw.dwell?.deliveryOverThreshold) ?? 0,
    rag: raw.dwell?.rag || "NONE",
  },
  transit: {
    median: n(raw.transit?.medianHours),
    valid: n(raw.transit?.validJobs) ?? 0,
    excluded: n(raw.transit?.excludedJobs) ?? 0,
  },
  collection: {
    percentage: n(raw.collectionTimeliness?.percentage),
    onTime: n(raw.collectionTimeliness?.onTime) ?? 0,
    collected: n(raw.collectionTimeliness?.collected) ?? 0,
    noPoc: n(raw.collectionTimeliness?.noPocAlerts) ?? 0,
    standInApplied: Boolean(raw.collectionTimeliness?.standInApplied),
    rag: raw.collectionTimeliness?.rag || "NONE",
  },
});
export const adaptSiteChart = (rows = [], role) =>
  rows
    .filter((x) => x?.role === role)
    .map((x) => ({
      name: x.site || "Unknown",
      percentage: n(x.otdPercentage),
      numerator: null,
      denominator: n(x.jobs),
    }));
export const adaptLaneChart = (rows = []) =>
  rows.map((x) => ({
    name: x.lane || "Unknown",
    percentage: n(x.otdPercentage),
    numerator: null,
    denominator: n(x.jobs),
  }));
export const adaptShipment = (x = {}) => ({
  jobId: x.jobId || "—",
  tripId: x.tripId || "—",
  collectionSite: x.collectionSite || "—",
  deliverySite: x.deliverySite || "—",
  lane: x.lane || "—",
  legKm: n(x.legKm),
  carrierCode: x.carrierCode || "—",
  priority: x.priority || "—",
  distanceBand: x.distanceBand || "—",
  createdOn: x.createdOn || null,
  poc: x.poc || null,
  pod: x.pod || null,
  slaDue: x.slaDue || null,
  slaMet: typeof x.slaMet === "boolean" ? x.slaMet : null,
  inWindow: typeof x.inWindow === "boolean" ? x.inWindow : null,
  dataQualityFlags: Array.isArray(x.dataQualityFlags) ? x.dataQualityFlags : [],
});
export const adaptShipmentPage = (raw = {}) => ({
  content: Array.isArray(raw.content) ? raw.content.map(adaptShipment) : [],
  number: n(raw.number) ?? 0,
  size: n(raw.size) ?? 25,
  totalElements: n(raw.totalElements) ?? 0,
  totalPages: n(raw.totalPages) ?? 0,
  first: Boolean(raw.first),
  last: Boolean(raw.last),
});

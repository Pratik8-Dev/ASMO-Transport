// Pure helpers that turn the flat mock shipment list into the same shapes
// the documented endpoints return, driven by the shared dashboard filters.
const DQ = {
  futureDated: "DQ-01",
  reverseSequence: "DQ-02",
  implausibleSpeed: "DQ-03",
  manualCloseOut: "DQ-04",
};
const asBool = (value) => {
  if (value === true || value === "true") return true;
  if (value === false || value === "false") return false;
  return undefined;
};
const round1 = (n) => (n === null || n === undefined ? null : Math.round(n * 10) / 10);
const round2 = (n) => (n === null || n === undefined ? null : Math.round(n * 100) / 100);
const median = (values) => {
  if (!values.length) return null;
  const sorted = [...values].sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);
  return sorted.length % 2
    ? sorted[mid]
    : (sorted[mid - 1] + sorted[mid]) / 2;
};
const hoursBetween = (a, b) =>
  a && b ? (new Date(b).getTime() - new Date(a).getTime()) / 3_600_000 : null;
const ragForPercentage = (percentage, target = 96, warnBand = 3) => {
  if (percentage === null || percentage === undefined) return "NONE";
  if (percentage >= target) return "GREEN";
  if (percentage >= target - warnBand) return "AMBER";
  return "RED";
};
const ragForOverThresholdRatio = (overCount, total) => {
  if (!total) return "NONE";
  const ratio = overCount / total;
  if (ratio <= 0.15) return "GREEN";
  if (ratio <= 0.35) return "AMBER";
  return "RED";
};
// Exact-match filters per the documented contract; empty values are ignored
// rather than treated as filters, and slaMet is parsed as a boolean.
export function applyFilters(shipments, filters = {}) {
  const from = filters.from ? new Date(filters.from) : null;
  const to = filters.to ? new Date(`${filters.to}T23:59:59`) : null;
  const slaMet = asBool(filters.slaMet);
  return shipments.filter((row) => {
    if (filters.collectionSite && row.collectionSite !== filters.collectionSite)
      return false;
    if (filters.deliverySite && row.deliverySite !== filters.deliverySite)
      return false;
    if (filters.lane && row.lane !== filters.lane) return false;
    if (filters.carrier && row.carrierCode !== filters.carrier) return false;
    if (filters.priority && row.priority !== filters.priority) return false;
    if (filters.distanceBand && row.distanceBand !== filters.distanceBand)
      return false;
    if (slaMet !== undefined && row.slaMet !== slaMet) return false;
    // Job created date drives from/to filtering, per the documented contract.
    const created = row.createdOn ? new Date(row.createdOn) : null;
    if (from && (!created || created < from)) return false;
    if (to && (!created || created > to)) return false;
    return true;
  });
}
export function sortShipments(rows, sort = "createdOn,desc") {
  const [key, dir = "asc"] = String(sort).split(",");
  const factor = dir === "desc" ? -1 : 1;
  return [...rows].sort((a, b) => {
    const av = a[key];
    const bv = b[key];
    if (av === bv) return 0;
    if (av === null || av === undefined) return 1;
    if (bv === null || bv === undefined) return -1;
    return av > bv ? factor : -factor;
  });
}
// Zero-based page index per the documented contract.
export function paginate(rows, { page = 0, size = 25 } = {}) {
  const totalElements = rows.length;
  const totalPages = Math.ceil(totalElements / size) || 0;
  const start = page * size;
  return {
    content: rows.slice(start, start + size),
    number: page,
    size,
    totalElements,
    totalPages,
    first: page <= 0,
    last: totalPages === 0 || page >= totalPages - 1,
  };
}
export function deriveSummary(rows) {
  const delivered = rows.filter((r) => r.pod);
  const breaches = delivered.filter((r) => r.slaMet === false);
  const rawPercentage = delivered.length
    ? round1(((delivered.length - breaches.length) / delivered.length) * 100)
    : null;
  // Validated OTD excludes DQ-01 future-dated events.
  const validatedDelivered = delivered.filter(
    (r) => !r.dataQualityFlags.includes(DQ.futureDated),
  );
  const validatedBreaches = validatedDelivered.filter((r) => r.slaMet === false);
  const validatedPercentage = validatedDelivered.length
    ? round1(
        ((validatedDelivered.length - validatedBreaches.length) /
          validatedDelivered.length) *
          100,
      )
    : null;
  const inWindowYes = delivered.filter((r) => r.inWindow === true);
  const windowPercentage = delivered.length
    ? round1((inWindowYes.length / delivered.length) * 100)
    : null;
  // Transit calculations exclude DQ-01, DQ-02 and DQ-03 records.
  const transitExcluded = new Set([
    DQ.futureDated,
    DQ.reverseSequence,
    DQ.implausibleSpeed,
  ]);
  const transitEligible = rows.filter(
    (r) => r.poc && r.pod && !r.dataQualityFlags.some((f) => transitExcluded.has(f)),
  );
  const transitHours = transitEligible
    .map((r) => hoursBetween(r.poc, r.pod))
    .filter((h) => h !== null && h >= 0);
  // Collection-timeliness calculations exclude DQ-01 records.
  const collectionEligible = rows.filter(
    (r) => !r.dataQualityFlags.includes(DQ.futureDated),
  );
  const collected = collectionEligible.filter((r) => r.poc);
  const collectionOnTime = collected.filter(
    (r) => new Date(r.poc).getTime() <= new Date(r.slaDue).getTime(),
  );
  const collectionPercentage = collected.length
    ? round1((collectionOnTime.length / collected.length) * 100)
    : null;
  // Mock dwell heuristic: the documented ShipmentDto has no separate
  // site-arrival timestamp, so dwell hours are approximated from leg
  // distance just to keep the figure responsive to the active filters.
  const collectionDwell = rows.map((r) => r.legKm / 180);
  const deliveryDwell = rows.map((r) => r.legKm / 140);
  const collectionOverThreshold = collectionDwell.filter((v) => v > 2).length;
  const deliveryOverThreshold = deliveryDwell.filter((v) => v > 2).length;
  return {
    otd: {
      rawPercentage,
      validatedPercentage,
      delivered: delivered.length,
      breaches: breaches.length,
      standInApplied: true,
      slaVersion: "v1",
      rag: ragForPercentage(rawPercentage),
    },
    deliveredWithinWindow: {
      percentage: windowPercentage,
      numerator: inWindowYes.length,
      denominator: delivered.length,
      rag: ragForPercentage(windowPercentage),
    },
    dwell: {
      collectionMedianHours: round2(median(collectionDwell)),
      deliveryMedianHours: round2(median(deliveryDwell)),
      collectionOverThreshold,
      deliveryOverThreshold,
      rag: ragForOverThresholdRatio(
        collectionOverThreshold + deliveryOverThreshold,
        rows.length * 2,
      ),
    },
    transit: {
      medianHours: round2(median(transitHours)),
      validJobs: transitEligible.length,
      excludedJobs: rows.length - transitEligible.length,
    },
    collectionTimeliness: {
      percentage: collectionPercentage,
      onTime: collectionOnTime.length,
      collected: collected.length,
      noPocAlerts: collectionEligible.filter((r) => !r.poc).length,
      standInApplied: true,
      rag: ragForPercentage(collectionPercentage),
    },
  };
}
export function deriveLanePerformance(rows) {
  const byLane = new Map();
  rows.forEach((row) => {
    if (!byLane.has(row.lane)) byLane.set(row.lane, []);
    byLane.get(row.lane).push(row);
  });
  return Array.from(byLane.entries()).map(([lane, laneRows]) => {
    const delivered = laneRows.filter((r) => r.pod);
    const onTime = delivered.filter((r) => r.slaMet === true);
    const inWindow = delivered.filter((r) => r.inWindow === true);
    const transitEligible = laneRows.filter(
      (r) =>
        r.poc &&
        r.pod &&
        !r.dataQualityFlags.some((f) =>
          [DQ.futureDated, DQ.reverseSequence, DQ.implausibleSpeed].includes(f),
        ),
    );
    return {
      lane,
      jobs: laneRows.length,
      otdPercentage: delivered.length
        ? round1((onTime.length / delivered.length) * 100)
        : null,
      windowPercentage: delivered.length
        ? round1((inWindow.length / delivered.length) * 100)
        : null,
      medianTransitHours: round2(
        median(
          transitEligible
            .map((r) => hoursBetween(r.poc, r.pod))
            .filter((h) => h !== null && h >= 0),
        ),
      ),
    };
  });
}
export function deriveSitePerformance(rows) {
  const byKey = new Map();
  const addRow = (site, role, row) => {
    const key = `${site}__${role}`;
    if (!byKey.has(key)) byKey.set(key, []);
    byKey.get(key).push(row);
  };
  rows.forEach((row) => {
    addRow(row.collectionSite, "COLLECTION", row);
    addRow(row.deliverySite, "DELIVERY", row);
  });
  return Array.from(byKey.entries()).map(([key, siteRows]) => {
    const [site, role] = key.split("__");
    const delivered = siteRows.filter((r) => r.pod);
    const onTime = delivered.filter((r) => r.slaMet === true);
    const inWindow = delivered.filter((r) => r.inWindow === true);
    return {
      site,
      role,
      jobs: siteRows.length,
      otdPercentage: delivered.length
        ? round1((onTime.length / delivered.length) * 100)
        : null,
      windowPercentage: delivered.length
        ? round1((inWindow.length / delivered.length) * 100)
        : null,
      medianDwellHours: round2(
        median(
          siteRows.map((r) => r.legKm / (role === "COLLECTION" ? 180 : 140)),
        ),
      ),
    };
  });
}
export function deriveDataQuality(rows) {
  const count = (code) =>
    rows.filter((r) => r.dataQualityFlags.includes(code)).length;
  return {
    futureDated: count(DQ.futureDated),
    reverseSequence: count(DQ.reverseSequence),
    implausibleSpeed: count(DQ.implausibleSpeed),
    manualCloseOut: count(DQ.manualCloseOut),
  };
}

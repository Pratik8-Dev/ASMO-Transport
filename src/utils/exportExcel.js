import * as XLSX from "xlsx";
export const exportShipments = (rows, meta = {}) => {
  const data = rows.map((x) => ({
    "Job ID": x.jobId,
    "Trip ID": x.tripId,
    "Collection Site": x.collectionSite,
    "Delivery Site": x.deliverySite,
    "Distance (km)": x.legKm,
    "Job Created On": x.createdOn,
    POC: x.poc,
    POD: x.pod,
    "SLA Due": x.slaDue,
    "SLA Met": x.slaMet === null ? "Not evaluated" : x.slaMet ? "Yes" : "No",
    "DQ Flags": x.dataQualityFlags.join(", "),
  }));
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(data), "Shipments");
  XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet([meta]), "Scope");
  XLSX.writeFile(wb, "asmo-control-tower.xlsx");
};

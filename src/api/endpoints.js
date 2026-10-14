export const ENDPOINTS = {
  summary: "/dashboard/summary",
  lanes: "/lanes/performance",
  sites: "/sites/performance",
  dataQuality: "/data-quality/summary",
  shipments: "/shipments",
  shipment: (jobId) => `/shipments/${encodeURIComponent(jobId)}`,
  etlStatus: "/admin/etl/status",
  etlUpload: "/admin/etl/upload",
};

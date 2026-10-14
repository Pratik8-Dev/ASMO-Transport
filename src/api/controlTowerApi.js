import { apiClient } from "./apiClient";
import { ENDPOINTS } from "./endpoints";
import { toQueryParams } from "../utils/queryParams";
import { mockApi } from "../mocks/mockApi";
// Mock mode is decided once, here, so UI components never branch on it.
// See VITE_USE_MOCK_API and VITE_MOCK_SCENARIO in .env.example.
export const isMockApiEnabled = () =>
  import.meta.env.VITE_USE_MOCK_API === "true";
const get = (url, filters, signal, extra = {}) =>
  apiClient
    .get(url, { params: toQueryParams(filters, extra), signal })
    .then((r) => r.data);
const toEtlFormData = ({ jobsFile, tripsFile } = {}) => {
  const form = new FormData();
  if (jobsFile) form.set("jobsFile", jobsFile);
  if (tripsFile) form.set("tripsFile", tripsFile);
  return form;
};
export const controlTowerApi = {
  getSummary: (f, s) =>
    isMockApiEnabled() ? mockApi.getSummary(f, s) : get(ENDPOINTS.summary, f, s),
  getLanes: (f, s) =>
    isMockApiEnabled() ? mockApi.getLanes(f, s) : get(ENDPOINTS.lanes, f, s),
  getSites: (f, s) =>
    isMockApiEnabled() ? mockApi.getSites(f, s) : get(ENDPOINTS.sites, f, s),
  getDataQuality: (f, s) =>
    isMockApiEnabled()
      ? mockApi.getDataQuality(f, s)
      : get(ENDPOINTS.dataQuality, f, s),
  getShipments: (f, p, s) =>
    isMockApiEnabled()
      ? mockApi.getShipments(f, p, s)
      : get(ENDPOINTS.shipments, f, s, p),
  getShipment: (id, s) =>
    isMockApiEnabled()
      ? mockApi.getShipment(id, s)
      : apiClient.get(ENDPOINTS.shipment(id), { signal: s }).then((r) => r.data),
  getEtlStatus: (s) =>
    isMockApiEnabled()
      ? mockApi.getEtlStatus(s)
      : apiClient.get(ENDPOINTS.etlStatus, { signal: s }).then((r) => r.data),
  uploadEtl: (files, s) =>
    isMockApiEnabled()
      ? mockApi.uploadEtl(files, s)
      : apiClient
          .post(ENDPOINTS.etlUpload, toEtlFormData(files), { signal: s })
          .then((r) => r.data),
};

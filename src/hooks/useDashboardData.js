import { useQueries, useQuery, useQueryClient } from "@tanstack/react-query";
import { controlTowerApi } from "../api/controlTowerApi";
import {
  adaptLaneChart,
  adaptShipmentPage,
  adaptSiteChart,
  adaptSummary,
} from "../services/adapters";
export const useDashboardData = (filters, page, sort) => {
  const queries = useQueries({
    queries: [
      {
        queryKey: ["summary", filters],
        queryFn: ({ signal }) => controlTowerApi.getSummary(filters, signal),
        select: adaptSummary,
      },
      {
        queryKey: ["lanes", filters],
        queryFn: ({ signal }) => controlTowerApi.getLanes(filters, signal),
      },
      {
        queryKey: ["sites", filters],
        queryFn: ({ signal }) => controlTowerApi.getSites(filters, signal),
      },
      {
        queryKey: ["dq", filters],
        queryFn: ({ signal }) =>
          controlTowerApi.getDataQuality(filters, signal),
      },
      {
        queryKey: ["shipments", filters, page, sort],
        queryFn: ({ signal }) =>
          controlTowerApi.getShipments(
            filters,
            { page, size: 9999, sort },
            signal,
          ),
        select: adaptShipmentPage,
      },
    ],
  });
  const [summary, lanes, sites, dq, shipments] = queries;
  return {
    summary,
    lanes: { ...lanes, data: adaptLaneChart(lanes.data) },
    collections: { ...sites, data: adaptSiteChart(sites.data, "COLLECTION") },
    deliveries: { ...sites, data: adaptSiteChart(sites.data, "DELIVERY") },
    dq,
    shipments,
  };
};
export const useRefreshDashboard = () => {
  const client = useQueryClient();
  return () => client.invalidateQueries();
};
export const useEtlStatus = () =>
  useQuery({
    queryKey: ["etlStatus"],
    queryFn: ({ signal }) => controlTowerApi.getEtlStatus(signal),
  });

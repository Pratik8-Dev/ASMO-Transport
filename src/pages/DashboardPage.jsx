import { useMemo, useState } from "react";
import { Download, RefreshCcw } from "lucide-react";
import { INITIAL_FILTERS, TARGET_PERCENT } from "../constants/dashboard";
import {
  useDashboardData,
  useEtlStatus,
  useRefreshDashboard,
} from "../hooks/useDashboardData";
import { formatHours, formatPercentage } from "../utils/formatters";
import { exportShipments } from "../utils/exportExcel";
import { AsyncPanel } from "../components/common/AsyncPanel";
import { MockModeBanner } from "../components/common/MockModeBanner";
import { FilterBar } from "../components/filters/FilterBar";
import { KpiCard } from "../components/kpi/KpiCard";
import { PerformanceChart } from "../components/charts/PerformanceChart";
import { DataQualityPanel } from "../components/dataQuality/DataQualityPanel";
import { ShipmentTable } from "../components/table/ShipmentTable";
import { ScopePanel } from "../components/ScopePanel";
export function DashboardPage() {
  const [filters, setFilters] = useState(INITIAL_FILTERS);
  const [page, setPage] = useState(0);
  const [sort, setSort] = useState("createdOn,desc");
  const [lastRefresh, setLastRefresh] = useState(null);
  const data = useDashboardData(filters, page, sort);
  const etl = useEtlStatus();
  const refreshAll = useRefreshDashboard();
  const busy = [
    data.summary,
    data.lanes,
    data.collections,
    data.deliveries,
    data.dq,
    data.shipments,
  ].some((q) => q.isFetching);
  const change = (name, value) => {
    setFilters((f) => ({ ...f, [name]: value }));
    setPage(0);
  };
  const refresh = async () => {
    await refreshAll();
    setLastRefresh(new Date());
  };
  const summary = data.summary.data;
  const cards = useMemo(
    () =>
      summary
        ? [
            {
              // code: "C1",
              icon: (
                <svg
                  class="svg-amber"
                  width="30"
                  height="30"
                  viewBox="0 0 24 24"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M3 6h11v9H3V6Z"
                    stroke="currentColor"
                    stroke-width="1.8"
                  />
                  <path
                    d="M14 9h4l3 3v3h-7V9Z"
                    stroke="currentColor"
                    stroke-width="1.8"
                  />
                  <circle
                    cx="7"
                    cy="17"
                    r="2"
                    stroke="currentColor"
                    stroke-width="1.8"
                  />
                  <circle
                    cx="18"
                    cy="17"
                    r="2"
                    stroke="currentColor"
                    stroke-width="1.8"
                  />
                </svg>
              ),
              title: "On-Time Delivery %",
              value: formatPercentage(summary.otd.rawPercentage),
              subtitle: `Validated: ${formatPercentage(summary.otd.validatedPercentage)}`,
              lines: [
                `Delivered: ${summary.otd.delivered}`,
                `Late deliveries: ${summary.otd.breaches}`,
                `Target ≥ ${TARGET_PERCENT}%`,
              ],
              rag: summary.otd.rag,
              standIn: summary.otd.standInApplied,
            },
            {
              // code: "R1",
              icon: (
                <svg class="svg-red" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 640"><path d="M528 320C528 434.9 434.9 528 320 528C205.1 528 112 434.9 112 320C112 205.1 205.1 112 320 112C434.9 112 528 205.1 528 320zM64 320C64 461.4 178.6 576 320 576C461.4 576 576 461.4 576 320C576 178.6 461.4 64 320 64C178.6 64 64 178.6 64 320zM296 184L296 320C296 328 300 335.5 306.7 340L402.7 404C413.7 411.4 428.6 408.4 436 397.3C443.4 386.2 440.4 371.4 429.3 364L344 307.2L344 184C344 170.7 333.3 160 320 160C306.7 160 296 170.7 296 184z"/></svg>
              ),
              title: "Delivered Within Time Window %",
              value: formatPercentage(summary.window.percentage),
              subtitle: `${summary.window.numerator} of ${summary.window.denominator} deliveries`,
              lines: [`Target ≥ ${TARGET_PERCENT}%`],
              rag: summary.window.rag,
            },
            {
              // code: "R2",
              icon: (
                <svg
                  class="aligsvg"
                  xmlns="http://www.w3.org/2000/svg" viewBox="0 0 384 512"><path d="M0 188.6C0 84.4 86 0 192 0S384 84.4 384 188.6c0 119.3-120.2 262.3-170.4 316.8-11.8 12.8-31.5 12.8-43.3 0-50.2-54.5-170.4-197.5-170.4-316.8zM192 256a64 64 0 1 0 0-128 64 64 0 1 0 0 128z"/></svg>
              ),
              title: "Dwell Time at Site",
              value: formatHours(summary.dwell.collection),
              subtitle: `Delivery site: ${formatHours(summary.dwell.delivery)}`,
              lines: [
                `Stops > 2 hours: ${summary.dwell.collectionOver} collection, ${summary.dwell.deliveryOver} delivery`,
              ],
              rag: summary.dwell.rag,
            },
            {
              // code: "R3",
              icon: (
                <svg
                  class="svg-grey"
                  xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512"><path d="M223.9 32l-76.2 0c-29.4 0-55.1 20.1-62.1 48.6L1.4 420.5C-6.1 450.7 16.8 480 48 480l175.9 0 0-64c0-17.7 14.3-32 32-32s32 14.3 32 32l0 64 176.1 0c31.2 0 54.1-29.3 46.6-59.5L426.5 80.6C419.4 52.1 393.8 32 364.3 32l-76.4 0 0 64c0 17.7-14.3 32-32 32s-32-14.3-32-32l0-64zm64 192l0 64c0 17.7-14.3 32-32 32s-32-14.3-32-32l0-64c0-17.7 14.3-32 32-32s32 14.3 32 32z"/></svg>
              ),
              title: "Lane Transit Time",
              value: formatHours(summary.transit.median),
              subtitle: `Valid jobs: ${summary.transit.valid}`,
              lines: [`Excluded jobs: ${summary.transit.excluded}`],
            },
            {
              // code: "C2",
              icon: (
                <svg
                  class="svg-green"
                  xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512"><path d="M284-1.3c-17.3-10-38.7-10-56 0L143.8 47.3c-17.3 10-28 28.5-28 48.5l0 101.9-88.3 51c-17.3 10-28 28.5-28 48.5l0 97.3c0 20 10.7 38.5 28 48.5l84.3 48.6c17.3 10 38.7 10 56 0l88.3-51 88.3 51c17.3 10 38.7 10 56 0L484.5 443c17.3-10 28-28.5 28-48.5l0-97.3c0-20-10.7-38.5-28-48.5l-88.3-51 0-101.9c0-20-10.7-38.5-28-48.5L284-1.3zM232 292.6l0 106.5-88.3 51c-1.2 .7-2.6 1.1-4 1.1l0-105.3 92.3-53.3zm231.4 .6c.7 1.2 1.1 2.6 1.1 4l0 97.3c0 2.9-1.5 5.5-4 6.9l-84.3 48.6c-1.2 .7-2.6 1.1-4 1.1l0-105.3 91.2-52.6zM348.3 95.8l0 101.9-92.3 53.3 0-106.5 91.2-52.6c.7 1.2 1.1 2.6 1.1 4z"/></svg>
              ),
              title: "Collection Timeliness %",
              value: formatPercentage(summary.collection.percentage),
              subtitle: `${summary.collection.onTime} of ${summary.collection.collected} collected`,
              lines: [
                `No POC alerts: ${summary.collection.noPoc}`,
                `Target ≥ ${TARGET_PERCENT}%`,
              ],
              rag: summary.collection.rag,
              standIn: summary.collection.standInApplied,
            },
          ]
        : [],
    [summary],
  );
  return (
    <main>
      <MockModeBanner />
      <header className="topbar">
        <div className="leftsection">
          <div className="brand">ASMO</div>
        <div>
          <h1>
            Transport Management System (TMS)
            <br />
            Control Tower
          </h1>
          <p>Site, Origin &amp; Destination Performance</p>
        </div>
        </div>
        <div className="meta">
          {/* <span>Data as of: {etl.data?.lastCompletedAt || "Unavailable"}</span>
          <span>
            SLA Rule Version: {summary?.otd.slaVersion || "Unavailable"}
          </span>
          <span>Working days: Sun-Thu (Fri, Sat off)</span>
          <span>Stand-ins: ASN Date = Job Created On; Priority = Normal</span> */}
        </div>
        <div className="actions">
          <button
            className="btn secondary-btn"
            disabled={!data.shipments.data?.content.length}
            onClick={() =>
              exportShipments(data.shipments.data.content, {
                slaVersion: summary?.otd.slaVersion || "Unavailable",
                exportedAt: new Date().toISOString(),
              })
            }
          >
            <Download />
            Export current page
          </button>
          <button className="btn primary-btn"
          disabled={busy} onClick={refresh}>
            <RefreshCcw className={busy ? "spin" : ""} />
            Refresh
          </button>
        </div>
      </header>
      {lastRefresh && (
        <p className="refresh-note">
          Last refresh requested: {lastRefresh.toLocaleTimeString()}
        </p>
      )}
      <FilterBar
        filters={filters}
        onChange={change}
        onReset={() => {
          setFilters(INITIAL_FILTERS);
          setPage(0);
        }}
      />
      <section className="kpis">
        <AsyncPanel query={data.summary}>
          {() => cards.map((c) => <KpiCard key={c.code} {...c} />)}
        </AsyncPanel>
      </section>
      <section className="charts">
        <AsyncPanel query={data.collections}>
          {(rows) => (
            <PerformanceChart
              title="On-Time Delivery % by Collection Site"
              data={rows}
              color="#4b8bc8"
              verticalLabels
            />
          )}
        </AsyncPanel>
        <AsyncPanel query={data.deliveries}>
          {(rows) => (
            <PerformanceChart
              title="On-Time Delivery % by Delivery Site"
              data={rows}
              color="#3fa3a7"
              verticalLabels
            />
          )}
        </AsyncPanel>
        <AsyncPanel query={data.lanes}>
          {(rows) => (
            <PerformanceChart
              title="On-Time Delivery % by Lane"
              data={rows}
              color="#6863ae"
              verticalLabels
            />
          )}
        </AsyncPanel>
      </section>
      <section className="lower">
        <AsyncPanel query={data.shipments}>
          {(shipments) => (
            <ShipmentTable
              page={shipments}
              onPage={setPage}
              onSort={(key) =>
                setSort(
                  `${key},${sort.startsWith(key) && sort.endsWith("asc") ? "desc" : "asc"}`,
                )
              }
            />
          )}
        </AsyncPanel>
        <aside>
          <AsyncPanel query={data.dq}>
            {(dq) => <DataQualityPanel data={dq} />}
          </AsyncPanel>
          {/* <ScopePanel /> */}
        </aside>
      </section>
      <footer>
        ASMO | TMS Control Tower POC{" "}
        <span>Confidential - For Internal Use Only</span>
      </footer>
    </main>
  );
}

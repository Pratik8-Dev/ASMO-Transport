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
              title: "Delivered Within Time Window %",
              value: formatPercentage(summary.window.percentage),
              subtitle: `${summary.window.numerator} of ${summary.window.denominator} deliveries`,
              lines: [`Target ≥ ${TARGET_PERCENT}%`],
              rag: summary.window.rag,
            },
            {
              // code: "R2",
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
              title: "Lane Transit Time",
              value: formatHours(summary.transit.median),
              subtitle: `Valid jobs: ${summary.transit.valid}`,
              lines: [`Excluded jobs: ${summary.transit.excluded}`],
            },
            {
              // code: "C2",
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
        <div className="brand">ASMO</div>
        <div>
          <h1>
            Transport Management System (TMS)
            <br />
            Control Tower
          </h1>
          <p>Site, Origin &amp; Destination Performance</p>
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

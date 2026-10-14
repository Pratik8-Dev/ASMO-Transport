export function ScopePanel() {
  return (
    <details className="panel scope">
      <summary>Scope for this POC</summary>
      <div className="scope-grid">
        <section>
          <h3>In scope</h3>
          <ul>
            <li>One site, origin and destination dashboard</li>
            <li>Five KPIs: R1, R2, R3, C1 and C2</li>
            <li>Filters, drill-down and export</li>
            <li>
              Existing data load, SLA rules, working calendar and data-quality
              flags
            </li>
          </ul>
        </section>
        <section>
          <h3>Out of scope</h3>
          <ul>
            <li>Other wireframe dashboards</li>
            <li>
              OTIF, FCN/FDN, POD posting time, claims and carrier comparison
            </li>
            <li>
              Priority × distance matrix, &gt;250 km SLA rows and VTD POC-to-POD
              rule
            </li>
            <li>Sign-in, SSO, hosting, live MongoDB and new ETL</li>
          </ul>
        </section>
      </div>
    </details>
  );
}

import { formatDateTime, formatKm } from "../../utils/formatters";
const columns = [
  ["jobId", "Job ID"],
  ["tripId", "Trip ID"],
  ["collectionSite", "Collection Site"],
  ["deliverySite", "Delivery Site"],
  ["legKm", "Distance"],
  ["createdOn", "Job Created On"],
  ["poc", "POC"],
  ["pod", "POD"],
  ["slaDue", "SLA Due"],
  ["slaMet", "SLA Met"],
];
export function ShipmentTable({ page, onPage, onSort }) {
  return (
    <article className="panel table-panel">
      <div className="panel-heading">
        <h2>Shipment Details</h2>
        <span>{page.totalElements} records</span>
      </div>
      <div className="table-scroll">
        <table>
          <thead>
            <tr>
              {columns.map(([key, label]) => (
                <th key={key}>
                  <button onClick={() => onSort(key)}>{label}</button>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {page.content.map((row) => (
              <tr key={row.jobId}>
                <td>{row.jobId}</td>
                <td>{row.tripId}</td>
                <td>{row.collectionSite}</td>
                <td>{row.deliverySite}</td>
                <td>{formatKm(row.legKm)}</td>
                <td>{formatDateTime(row.createdOn)}</td>
                <td>{formatDateTime(row.poc)}</td>
                <td>{formatDateTime(row.pod)}</td>
                <td>{formatDateTime(row.slaDue)}</td>
                <td>
                  <span
                    className={`status ${row.slaMet === true ? "met" : row.slaMet === false ? "breached" : "unknown"}`}
                  >
                    {row.slaMet === true
                      ? "Yes"
                      : row.slaMet === false
                        ? "No"
                        : "Not evaluated"}
                  </span>
                  {row.dataQualityFlags.length > 0 && (
                    <small> {row.dataQualityFlags.join(", ")}</small>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {!page.content.length && (
        <div className="state">No shipments match the selected filters.</div>
      )}
      <div className="pager">
        <button disabled={page.first} onClick={() => onPage(page.number - 1)}>
          Previous
        </button>
        <span>
          Page {page.totalPages ? page.number + 1 : 0} of {page.totalPages}
        </span>
        <button
          disabled={page.last || !page.totalPages}
          onClick={() => onPage(page.number + 1)}
        >
          Next
        </button>
      </div>
    </article>
  );
}

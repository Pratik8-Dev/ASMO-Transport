const fields = [
  ["collectionSite", "Collection Site"],
  ["deliverySite", "Delivery Site"],
  ["lane", "Route / Lane"],
  ["carrier", "Carrier Code"],
  ["priority", "Priority Category"],
  ["distanceBand", "Distance Band"],
];
export function FilterBar({ filters, onChange, onReset }) {
  const update = (e) => onChange(e.target.name, e.target.value);
  return (
    <section className="filters" aria-label="Dashboard filters">
      <label>
        Job Created From
        <input type="date" name="from" value={filters.from} onChange={update} />
      </label>
      <label>
        Job Created To
        <input type="date" name="to" value={filters.to} onChange={update} />
      </label>
      {fields.map(([name, label]) => (
        <label key={name}>
          {label}
          <input
            name={name}
            value={filters[name]}
            onChange={update}
            placeholder="Exact value"
          />
        </label>
      ))}
      <label>
        SLA Result
        <select name="slaMet" value={filters.slaMet} onChange={update}>
          <option value="">All</option>
          <option value="true">Met</option>
          <option value="false">Breached</option>
        </select>
      </label>
      <button className="secondary" onClick={onReset}>
        Clear filters
      </button>
      <p className="filter-note">
        Shipment Status is not sent because it is not a documented API query
        parameter.
      </p>
    </section>
  );
}

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
      <div className="filterbtn">
        <h3>
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 640"><path d="M96 128C83.1 128 71.4 135.8 66.4 147.8C61.4 159.8 64.2 173.5 73.4 182.6L256 365.3L256 480C256 488.5 259.4 496.6 265.4 502.6L329.4 566.6C338.6 575.8 352.3 578.5 364.3 573.5C376.3 568.5 384 556.9 384 544L384 365.3L566.6 182.7C575.8 173.5 578.5 159.8 573.5 147.8C568.5 135.8 556.9 128 544 128L96 128z"/></svg>
          Filter</h3>
        <button className="btn primary-btn" onClick={onReset}>
          <svg className="primary-svg" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 640"><path d="M183.1 137.4C170.6 124.9 150.3 124.9 137.8 137.4C125.3 149.9 125.3 170.2 137.8 182.7L275.2 320L137.9 457.4C125.4 469.9 125.4 490.2 137.9 502.7C150.4 515.2 170.7 515.2 183.2 502.7L320.5 365.3L457.9 502.6C470.4 515.1 490.7 515.1 503.2 502.6C515.7 490.1 515.7 469.8 503.2 457.3L365.8 320L503.1 182.6C515.6 170.1 515.6 149.8 503.1 137.3C490.6 124.8 470.3 124.8 457.8 137.3L320.5 274.7L183.1 137.4z"/></svg>
          Clear filters
        </button>
      </div>
      <div className="labalsfilter">
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
      </div>
      
      {/* <p className="filter-note">
        Shipment Status is not sent because it is not a documented API query
        parameter.
      </p> */}
    </section>
  );
}

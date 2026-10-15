export function KpiCard({
  icon,
  code,
  title,
  value,
  subtitle,
  lines = [],
  rag = "NONE",
  standIn = false,
}) {
  return (
    <article className={`kpi rag-${rag.toLowerCase()}`}>
      <div className="kpi-title">
        <div className="svgicon">
          {icon} 
        </div>
        <h3>{code} {title}</h3>
        {/* {standIn && <span className="badge">Stand-in</span>} */}
      </div>
      <div className="kpi-value">{value}</div>
      {subtitle && <p>{subtitle}</p>}
      <ul>
        {lines.map((x, i) => (
          <li key={i}>{x}</li>
        ))}
      </ul>
    </article>
  );
}

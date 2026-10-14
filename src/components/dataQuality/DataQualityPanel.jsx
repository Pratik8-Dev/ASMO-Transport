import { DQ_LABELS } from "../../constants/dashboard";
export function DataQualityPanel({ data }) {
  return (
    <article className="panel dq">
      <h2>Data Quality Flags</h2>
      <ul>
        {Object.entries(DQ_LABELS).map(([key, label]) => (
          <li key={key}>
            <span>{label}</span>
            <strong>{data?.[key] ?? 0}</strong>
          </li>
        ))}
      </ul>
    </article>
  );
}

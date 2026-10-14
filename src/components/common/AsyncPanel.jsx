export function AsyncPanel({
  query,
  children,
  emptyMessage = "No qualifying data.",
}) {
  if (query.isLoading) return <div className="skeleton" aria-label="Loading" />;
  if (query.isError)
    return (
      <div className="state error" role="alert">
        <p>{query.error.message}</p>
        <button onClick={() => query.refetch()}>Retry</button>
      </div>
    );
  if (
    query.data === null ||
    query.data === undefined ||
    (Array.isArray(query.data) && !query.data.length)
  )
    return <div className="state">{emptyMessage}</div>;
  return children(query.data);
}

export default function Pager({ page, pages, onChange }) {
  if (!pages || pages <= 1) return null;
  return (
    <div className="pager">
      <button className="btn ghost" disabled={page <= 1} onClick={() => onChange(page - 1)}>← Prev</button>
      <span>Page {page} of {pages}</span>
      <button className="btn ghost" disabled={page >= pages} onClick={() => onChange(page + 1)}>Next →</button>
    </div>
  );
}

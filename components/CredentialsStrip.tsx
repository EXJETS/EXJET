export function CredentialsStrip({ credentials }: { credentials: readonly string[] }) {
  if (credentials.length === 0) return null;
  return (
    <div className="safety-badge-grid credentials-strip" aria-label="Operator safety resources">
      {credentials.map((credential) => (
        <article key={credential}>
          <strong>{credential}</strong>
          <span>Operator safety resource</span>
        </article>
      ))}
    </div>
  );
}

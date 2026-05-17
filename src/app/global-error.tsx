"use client";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html lang="en">
      <body style={{ margin: 0, fontFamily: "system-ui, sans-serif", background: "#fff" }}>
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", minHeight: "100vh" }}>
          <h2 style={{ fontSize: "1.5rem", fontWeight: 600, marginBottom: "1rem", color: "#0f172a" }}>Something went wrong</h2>
          <p style={{ color: "#64748b", marginBottom: "1.5rem" }}>{error?.message || "An unexpected error occurred"}</p>
          <button
            onClick={() => reset()}
            style={{ padding: "0.5rem 1.5rem", backgroundColor: "#2563eb", color: "white", borderRadius: "0.5rem", border: "none", cursor: "pointer" }}
          >
            Try again
          </button>
        </div>
      </body>
    </html>
  );
}

export default function DashboardLoading() {
  return (
    <main>
      <div className="page-shell">
        <section className="loading-grid">
          {Array.from({ length: 4 }).map((_, index) => (
            <div className="loading-card" key={index} />
          ))}
        </section>
        <section className="loading-card" style={{ height: "360px" }} />
        <section className="loading-card" style={{ height: "260px" }} />
      </div>
    </main>
  );
}

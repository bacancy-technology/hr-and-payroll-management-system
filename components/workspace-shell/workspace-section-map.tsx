interface WorkspaceSectionMapItem {
  id: string;
  title: string;
  description: string;
}

interface WorkspaceSectionMapProps {
  title?: string;
  items: WorkspaceSectionMapItem[];
}

export function WorkspaceSectionMap({
  title = "On this page",
  items,
}: WorkspaceSectionMapProps) {
  if (items.length === 0) {
    return null;
  }

  return (
    <section className="workspace-section-map">
      <div className="workspace-section-map-top">
        <span className="small-label">{title}</span>
        <p className="muted">Jump directly to the operational areas on this page.</p>
      </div>

      <div className="workspace-link-grid">
        {items.map((item) => (
          <a className="feature-card workspace-link-card" href={`#${item.id}`} key={item.id}>
            <strong>{item.title}</strong>
            <p>{item.description}</p>
          </a>
        ))}
      </div>
    </section>
  );
}

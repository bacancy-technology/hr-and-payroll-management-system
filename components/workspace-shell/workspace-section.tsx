interface WorkspaceSectionProps {
  id: string;
  title: string;
  description: string;
  children: React.ReactNode;
}

export function WorkspaceSection({
  id,
  title,
  description,
  children,
}: WorkspaceSectionProps) {
  return (
    <section className="workspace-module-section" id={id}>
      <div className="workspace-module-header">
        <div>
          <span className="small-label">Module group</span>
          <h2>{title}</h2>
          <p>{description}</p>
        </div>

        <a className="button-ghost workspace-section-anchor" href={`#${id}`}>
          Anchor link
        </a>
      </div>

      <div className="workspace-card-grid">{children}</div>
    </section>
  );
}

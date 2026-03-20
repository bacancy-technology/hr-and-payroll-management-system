interface WorkspacePageHeaderProps {
  eyebrow: string;
  title: string;
  description: string;
}

export function WorkspacePageHeader({
  eyebrow,
  title,
  description,
}: WorkspacePageHeaderProps) {
  return (
    <section className="workspace-page-header">
      <span className="eyebrow">{eyebrow}</span>
      <h1>{title}</h1>
      <p className="lead">{description}</p>
    </section>
  );
}

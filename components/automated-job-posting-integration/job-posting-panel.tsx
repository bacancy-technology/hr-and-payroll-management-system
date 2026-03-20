import type { AutomatedJobPostingIntegration } from "@/lib/types";

interface JobPostingPanelProps {
  integration: AutomatedJobPostingIntegration;
}

export function JobPostingPanel({ integration }: JobPostingPanelProps) {
  return (
    <article className="panel">
      <div className="panel-top">
        <div>
          <h3>Automated job posting integration</h3>
          <p className="panel-subtitle">Publish openings to major job boards and track inbound applications from one queue.</p>
        </div>
        <span className="pill">{integration.summary.connectedBoards} connected boards</span>
      </div>

      <div className="forecast-summary-grid">
        <div className="forecast-summary-card">
          <span className="small-label">Postings</span>
          <strong>{integration.summary.activePostings}</strong>
          <p>Roles currently posted or syncing to boards.</p>
        </div>
        <div className="forecast-summary-card">
          <span className="small-label">Applications</span>
          <strong>{integration.summary.trackedApplications}</strong>
          <p>Total candidate applications currently tracked.</p>
        </div>
        <div className="forecast-summary-card">
          <span className="small-label">Board syncs</span>
          <strong>{integration.summary.syncedBoards}</strong>
          <p>Boards with a recent sync timestamp recorded.</p>
        </div>
      </div>

      <div className="job-board-grid">
        {integration.boards.map((board) => (
          <div className="job-board-card" key={board.id}>
            <span className="small-label">{board.status}</span>
            <strong>{board.displayName}</strong>
            <p>{board.postedJobs} posting sync(s) · {board.applicationsTracked} applications tracked.</p>
          </div>
        ))}
      </div>

      <div className="stack">
        {integration.postings.map((posting) => (
          <div className="job-posting-card" key={posting.id}>
            <div className="split">
              <div>
                <span className="small-label">{posting.department}</span>
                <strong>{posting.title}</strong>
              </div>
              <span className="small-label">{posting.status}</span>
            </div>
            <p>
              {posting.employmentType} · {posting.applications} tracked applications · Boards: {posting.targetBoards.join(", ")}
            </p>
            <p className="muted">{posting.source}</p>
          </div>
        ))}
      </div>
    </article>
  );
}

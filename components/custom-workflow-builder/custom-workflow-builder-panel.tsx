import type { CustomWorkflowBuilder } from "@/lib/types";

import { WorkflowBuilderPill } from "@/components/custom-workflow-builder/workflow-builder-pill";

interface CustomWorkflowBuilderPanelProps {
  builder: CustomWorkflowBuilder;
}

export function CustomWorkflowBuilderPanel({ builder }: CustomWorkflowBuilderPanelProps) {
  return (
    <article className="panel">
      <div className="panel-top">
        <div>
          <h3>Custom workflow builder</h3>
          <p className="panel-subtitle">Reusable process templates with conditional branches and automation coverage across HR operations.</p>
        </div>
        <span className="pill">{builder.summary.templates} templates modeled</span>
      </div>

      <div className="forecast-summary-grid">
        <div className="forecast-summary-card">
          <span className="small-label">Automated steps</span>
          <strong>{builder.summary.automatedSteps}</strong>
          <p>Nodes that can execute without manual intervention.</p>
        </div>
        <div className="forecast-summary-card">
          <span className="small-label">Conditional branches</span>
          <strong>{builder.summary.conditionalBranches}</strong>
          <p>Decision points routing workflows through alternate HR paths.</p>
        </div>
        <div className="forecast-summary-card">
          <span className="small-label">Active workflows</span>
          <strong>{builder.summary.activeWorkflows}</strong>
          <p>Live process instances currently moving through the modeled system.</p>
        </div>
      </div>

      <div className="workflow-builder-grid">
        <div className="stack">
          {builder.templates.map((template) => (
            <div className="workflow-builder-card" key={template.id}>
              <div className="split">
                <div>
                  <span className="small-label">{template.category}</span>
                  <strong>{template.name}</strong>
                </div>
                <WorkflowBuilderPill label={template.status} tone={template.status} />
              </div>
              <p>{template.summary}</p>
              <div className="split">
                <span className="small-label">{template.stepCount} steps</span>
                <span className="small-label">{template.automationCoverage}% automation coverage</span>
              </div>
              <p className="muted">{template.conditionalBranches} conditional branch(es) modeled in this template.</p>
            </div>
          ))}
        </div>

        <div className="stack">
          {builder.nodes.map((node) => (
            <div className="workflow-builder-card" key={node.id}>
              <div className="split">
                <div>
                  <span className="small-label">{node.nodeType}</span>
                  <strong>{node.label}</strong>
                </div>
                <WorkflowBuilderPill label={node.status} tone={node.status} />
              </div>
              <p>{node.detail}</p>
              <div className="split">
                <span className="small-label">{node.owner}</span>
                <WorkflowBuilderPill label={node.executionMode} tone={node.executionMode} />
              </div>
            </div>
          ))}
        </div>
      </div>
    </article>
  );
}

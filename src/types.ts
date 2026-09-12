export interface DebugRequest {
  bug_report: string;
  logs: string;
  code_context: string;
}

export interface DebugResponse {
  title: string;
  severity: "Low" | "Medium" | "High" | "Critical";
  reproduction_steps: string[];
  root_cause: string;
  fix_suggestion: string;
  fix_code: string;
  affected_components: string[];
  qa_checklist: string[];
  confidence_score: "High" | "Medium" | "Low";
  similar_patterns: string[];
  risky_areas: string[];
  prevention_practices: string[];
  test_generator?: {
    unit_test: string;
    integration_test: string;
    edge_cases: string[];
  };
  flow_diagram?: {
    steps: string[];
    failure_point: string;
  };
  classification?: {
    severity: "Low" | "Medium" | "High" | "Critical";
    priority: "P1" | "P2" | "P3";
    impact: string;
    reason: string;
  };
  senior_explanation?: string;
  user_friendly_report?: string;
}

export interface BugTemplate {
  id: string;
  name: string;
  shortDescription: string;
  badge: string;
  bug_report: string;
  logs: string;
  code_context: string;
}

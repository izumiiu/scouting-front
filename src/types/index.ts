export type Value = string | number | boolean | string[] | null;
export interface CaseInput {
  title: string;
  contactName: string;
  contactPhone: string;
  contactEmail: string;
  sourceChannel: string;
  sourceReference: string;
  referenceDate: string;
  permissionStatus: 'unknown' | 'granted' | 'denied';
  permissionReference: string;
  allowAiProcessing: boolean;
  answers: Record<string, Value>;
}
export interface Field {
  id: string;
  section: string;
  label: string;
  type: 'text' | 'textarea' | 'number' | 'date' | 'select' | 'multi';
  options?: string[];
  max?: number;
  help?: string;
}
export interface Catalog {
  fields: Field[];
  experts: { code: string; label: string }[];
  programs: { code: string; label: string }[];
  ruleVersion: string;
  expertVersion: string;
  tedCriteria?: TedCriteria;
  rulesApproval: string;
  aiProvider: 'openai' | 'groq';
  aiConfigured: boolean;
}
export interface User {
  id: string;
  name: string;
  email: string;
}
export type Outcome = 'pass' | 'fail' | 'unknown';
export interface Eligibility {
  program: string;
  label: string;
  outcome: Outcome;
  assessmentMode?: 'qualitative';
  conditions: {
    id: string;
    label: string;
    outcome: Outcome;
    evidenceRefs: string[];
    note?: string;
  }[];
}
export interface CaseRecord {
  _id: string;
  code: string;
  input: CaseInput;
  revision: number;
  decisionVersion: number;
  activeAnalysisId: string | null;
  latestAnalysisId: string | null;
  lastReviewAnalysisId: string | null;
  createdAt: string;
  updatedAt: string;
}
export type DevelopmentStageCode =
  | 'CONCEPT'
  | 'MOCKUP'
  | 'EARLY_EVIDENCE'
  | 'WORKING_PROTOTYPE'
  | 'MARKET_PRODUCT'
  | 'UNCLEAR';
export interface TedDevelopmentStage {
  stage: DevelopmentStageCode;
  reason: string;
  evidenceRefs: string[];
}
export interface TedFundingReadiness {
  status: 'NEEDS_VERIFICATION' | 'NOT_ASSESSED';
  reason: string;
  evidenceRefs: string[];
}
export interface TedAssessment {
  // Optional for historical analyses; current provider output requires developmentStage.
  developmentStage?: TedDevelopmentStage;
  // Added by the server, never accepted as an AI certification of funding.
  fundingReadiness?: TedFundingReadiness;
  classification: 'TED_IDEA' | 'TED_POC' | 'INSUFFICIENT_DATA';
  reason: string;
  alternativeReason: string;
  evidenceRefs: string[];
  uncertainties: string[];
}
export interface TedCriteria {
  version: string;
  source: string;
  mode: 'qualitative';
  stageGuidance?: string[];
  fundingGuidance?: string;
  programs: {
    program: string;
    focus: string;
    domains: { label: string; considerations: string[] }[];
  }[];
}
export type FollowUpScope = 'TED' | 'TED_IDEA' | 'TED_POC' | 'TED_POC_FUNDING' | 'UBI_PRE' | 'UBI_STARTUP' | 'TBI' | 'DEVELOPMENT';
export interface AiFollowUp { scope: FollowUpScope; question: string; }
export interface AiResult {
  followUps?: AiFollowUp[];
  tedAssessment?: TedAssessment;
  summary: string;
  programRecommendations: {
    program: string;
    reason: string;
    evidenceRefs: string[];
  }[];
  expertRecommendations: {
    area: string;
    need: string;
    reason: string;
    evidenceRefs: string[];
  }[];
  missingInformation: string[];
}
export interface Analysis {
  _id: string;
  eligibility?: Eligibility[];
  tedCriteriaSnapshot?: TedCriteria;
  inputRevision: number;
  status: 'queued' | 'running' | 'succeeded' | 'failed';
  result: AiResult | null;
  error: string | null;
  ruleVersion: string;
  expertVersion: string;
  provider: string;
  model: string;
  createdAt: string;
}
export interface Review {
  _id: string;
  inputRevision: number;
  decisionVersion: number;
  destination: string | null;
  expertAreas: string[];
  notes: string;
  reviewerName: string;
  createdAt: string;
}
export interface AuditEvent {
  _id: string;
  action: string;
  actorName: string;
  revision: number;
  createdAt: string;
  details?: unknown;
}
export interface CaseDetail {
  caseRecord: CaseRecord;
  eligibility: Eligibility[];
  groupContext: { group: string | null; status: string; warnings: string[] };
  analyses: Analysis[];
  reviews: Review[];
  events: AuditEvent[];
  historyHasMore: boolean;
}

import { createClient } from '@supabase/supabase-js';
import {
  Project,
  ScopeVersion,
  Requirement,
  ChangeRequest,
  Contract,
  AuditLog,
  SlackAlert,
  EmailNotification,
} from '../types';

export const SUPABASE_URL =
  import.meta.env.VITE_SUPABASE_URL || 'https://yrsnywnpohuompjluskv.supabase.co';

export const SUPABASE_ANON_KEY =
  import.meta.env.VITE_SUPABASE_ANON_KEY ||
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inlyc255d25wb2h1b21wamx1c2t2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTIwNzQ1NjAsImV4cCI6MjEwNzY1MDU2MH0.HeI9a6jeskyOe2Yw3Bo4-Qk2f7G1m7GwcgH9EnrSosY';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// Safe background executor that gracefully swallows network or missing table errors
export const safeDb = async (thenable: any) => {
  try {
    await thenable;
  } catch (err) {
    // Graceful background sync
  }
};

// Check if tables exist and are reachable
export const checkSupabaseConnection = async (): Promise<{ ok: boolean; message: string; tablesFound?: boolean }> => {
  try {
    const { data, error } = await supabase.from('projects').select('id').limit(1);
    if (error) {
      if (error.code === 'PGRST205' || error.message.includes('relation "public.projects" does not exist')) {
        return {
          ok: true,
          tablesFound: false,
          message: 'Connected to Supabase, but database tables are not yet created. Run schema migration.',
        };
      }
      return { ok: false, message: error.message };
    }
    return { ok: true, tablesFound: true, message: 'Connected and synchronized with Supabase database.' };
  } catch (err: any) {
    return { ok: false, message: err?.message || 'Failed to connect to Supabase.' };
  }
};

// Data Transformers
export const mapProjectToDb = (p: Project) => ({
  id: p.id,
  code: p.code,
  name: p.name,
  client_name: p.clientName,
  client_email: p.clientEmail,
  client_org: p.clientOrg,
  description: p.description,
  pricing_model: p.pricingModel,
  hourly_rate: p.hourlyRate,
  base_budget: p.baseBudget,
  current_budget: p.currentBudget,
  start_date: p.startDate,
  base_delivery_date: p.baseDeliveryDate,
  current_delivery_date: p.currentDeliveryDate,
  status: p.status,
  active_scope_version_id: p.activeScopeVersionId,
  compliance_rate: p.complianceRate,
});

export const mapProjectFromDb = (row: any): Project => ({
  id: row.id,
  code: row.code,
  name: row.name,
  clientName: row.client_name,
  clientEmail: row.client_email,
  clientOrg: row.client_org,
  description: row.description,
  pricingModel: row.pricing_model,
  hourlyRate: Number(row.hourly_rate),
  baseBudget: Number(row.base_budget),
  currentBudget: Number(row.current_budget),
  startDate: row.start_date,
  baseDeliveryDate: row.base_delivery_date,
  currentDeliveryDate: row.current_delivery_date,
  status: row.status,
  activeScopeVersionId: row.active_scope_version_id,
  complianceRate: Number(row.compliance_rate),
});

export const mapScopeVersionToDb = (sv: ScopeVersion) => ({
  id: sv.id,
  project_id: sv.projectId,
  version: sv.version,
  title: sv.title,
  description: sv.description,
  created_at: sv.createdAt,
  created_by: sv.createdBy,
  status: sv.status,
  total_effort_hours: sv.totalEffortHours,
  contract_id: sv.contractId,
});

export const mapScopeVersionFromDb = (row: any): ScopeVersion => ({
  id: row.id,
  projectId: row.project_id,
  version: row.version,
  title: row.title,
  description: row.description,
  createdAt: row.created_at,
  createdBy: row.created_by,
  status: row.status,
  totalEffortHours: Number(row.total_effort_hours),
  contractId: row.contract_id,
});

export const mapRequirementToDb = (r: Requirement) => ({
  id: r.id,
  scope_version_id: r.scopeVersionId,
  code: r.code,
  title: r.title,
  description: r.description,
  category: r.category,
  priority: r.priority,
  estimated_effort: r.estimatedEffort,
  acceptance_criteria: r.acceptanceCriteria,
  is_in_scope: r.isInScope,
  out_of_scope_reason: r.outOfScopeReason,
  status: r.status,
  source_cr_id: r.sourceCrId,
});

export const mapRequirementFromDb = (row: any): Requirement => ({
  id: row.id,
  scopeVersionId: row.scope_version_id,
  code: row.code,
  title: row.title,
  description: row.description,
  category: row.category,
  priority: row.priority,
  estimatedEffort: Number(row.estimated_effort),
  acceptanceCriteria: row.acceptance_criteria,
  isInScope: Boolean(row.is_in_scope),
  outOfScopeReason: row.out_of_scope_reason,
  status: row.status,
  sourceCrId: row.source_cr_id,
});

export const mapChangeRequestToDb = (cr: ChangeRequest) => ({
  id: cr.id,
  cr_number: cr.crNumber,
  project_id: cr.projectId,
  title: cr.title,
  description: cr.description,
  classification: cr.classification,
  reason: cr.reason,
  effort_impact_hours: cr.effortImpactHours,
  schedule_impact_days: cr.scheduleImpactDays,
  cost_impact: cr.costImpact,
  status: cr.status,
  requested_by: cr.requestedBy,
  requested_role: cr.requestedRole,
  submitted_at: cr.submittedAt,
  reviewed_at: cr.reviewedAt,
  reviewed_by: cr.reviewedBy,
  review_comments: cr.reviewComments,
  target_requirement_id: cr.targetRequirementId,
  new_requirement_data: cr.newRequirementData,
  addendum_contract_id: cr.addendumContractId,
});

export const mapChangeRequestFromDb = (row: any): ChangeRequest => ({
  id: row.id,
  crNumber: row.cr_number,
  projectId: row.project_id,
  title: row.title,
  description: row.description,
  classification: row.classification,
  reason: row.reason,
  effortImpactHours: Number(row.effort_impact_hours),
  scheduleImpactDays: Number(row.schedule_impact_days),
  costImpact: Number(row.cost_impact),
  status: row.status,
  requestedBy: row.requested_by,
  requestedRole: row.requested_role,
  submittedAt: row.submitted_at,
  reviewedAt: row.reviewed_at,
  reviewedBy: row.reviewed_by,
  reviewComments: row.review_comments,
  targetRequirementId: row.target_requirement_id,
  newRequirementData: row.new_requirement_data,
  addendumContractId: row.addendum_contract_id,
});

export const mapContractToDb = (c: Contract) => ({
  id: c.id,
  contract_number: c.contractNumber,
  project_id: c.projectId,
  scope_version_id: c.scopeVersionId,
  title: c.title,
  contract_type: c.contractType,
  parent_contract_id: c.parentContractId,
  related_cr_id: c.relatedCrId,
  document_summary: c.documentSummary,
  effective_date: c.effectiveDate,
  delivery_date: c.deliveryDate,
  signing_status: c.signingStatus,
  pricing_terms: c.pricingTerms,
  clauses: c.clauses,
  client_signer: c.clientSigner,
  vendor_signer: c.vendorSigner,
  certificate: c.certificate,
});

export const mapContractFromDb = (row: any): Contract => ({
  id: row.id,
  contractNumber: row.contract_number,
  projectId: row.project_id,
  scopeVersionId: row.scope_version_id,
  title: row.title,
  contractType: row.contract_type,
  parentContractId: row.parent_contract_id,
  relatedCrId: row.related_cr_id,
  documentSummary: row.document_summary,
  effectiveDate: row.effective_date,
  deliveryDate: row.delivery_date,
  signingStatus: row.signing_status,
  pricingTerms: row.pricing_terms,
  clauses: row.clauses,
  clientSigner: row.client_signer,
  vendorSigner: row.vendor_signer,
  certificate: row.certificate,
});

export const mapAuditLogToDb = (a: AuditLog) => ({
  id: a.id,
  timestamp: a.timestamp,
  actor_name: a.actorName,
  actor_role: a.actorRole,
  action: a.action,
  entity_type: a.entityType,
  entity_id: a.entityId,
  details: a.details,
  hash: a.hash,
});

export const mapAuditLogFromDb = (row: any): AuditLog => ({
  id: row.id,
  timestamp: row.timestamp,
  actorName: row.actor_name,
  actorRole: row.actor_role,
  action: row.action,
  entityType: row.entity_type,
  entityId: row.entity_id,
  details: row.details,
  hash: row.hash,
});

export const mapSlackAlertToDb = (s: SlackAlert) => ({
  id: s.id,
  channel: s.channel,
  timestamp: s.timestamp,
  sender: s.sender,
  sender_avatar: s.senderAvatar,
  text: s.text,
  badge: s.badge,
  badge_color: s.badgeColor,
  action_label: s.actionLabel,
  action_view: s.actionView,
  action_payload: s.actionPayload,
});

export const mapSlackAlertFromDb = (row: any): SlackAlert => ({
  id: row.id,
  channel: row.channel,
  timestamp: row.timestamp,
  sender: row.sender,
  senderAvatar: row.sender_avatar,
  text: row.text,
  badge: row.badge,
  badgeColor: row.badge_color,
  actionLabel: row.action_label,
  actionView: row.action_view,
  actionPayload: row.action_payload,
});

export const mapEmailToDb = (e: EmailNotification) => ({
  id: e.id,
  from_address: e.from,
  to_address: e.to,
  subject: e.subject,
  preview: e.preview,
  body: e.body,
  timestamp: e.timestamp,
  read: e.read,
  type: e.type,
});

export const mapEmailFromDb = (row: any): EmailNotification => ({
  id: row.id,
  from: row.from_address,
  to: row.to_address,
  subject: row.subject,
  preview: row.preview,
  body: row.body,
  timestamp: row.timestamp,
  read: Boolean(row.read),
  type: row.type,
});

// Bulk sync all data from app into Supabase
export const syncAllDataToSupabase = async (state: {
  projects: Project[];
  scopeVersions: ScopeVersion[];
  requirements: Requirement[];
  changeRequests: ChangeRequest[];
  contracts: Contract[];
  auditLogs: AuditLog[];
  slackAlerts: SlackAlert[];
  emails: EmailNotification[];
}): Promise<{ success: boolean; error?: string }> => {
  try {
    // 1. Projects
    if (state.projects.length > 0) {
      const { error: errP } = await supabase.from('projects').upsert(state.projects.map(mapProjectToDb));
      if (errP) throw errP;
    }
    // 2. Scope Versions
    if (state.scopeVersions.length > 0) {
      const { error: errSv } = await supabase.from('scope_versions').upsert(state.scopeVersions.map(mapScopeVersionToDb));
      if (errSv) throw errSv;
    }
    // 3. Requirements
    if (state.requirements.length > 0) {
      const { error: errR } = await supabase.from('requirements').upsert(state.requirements.map(mapRequirementToDb));
      if (errR) throw errR;
    }
    // 4. Change Requests
    if (state.changeRequests.length > 0) {
      const { error: errCr } = await supabase.from('change_requests').upsert(state.changeRequests.map(mapChangeRequestToDb));
      if (errCr) throw errCr;
    }
    // 5. Contracts
    if (state.contracts.length > 0) {
      const { error: errC } = await supabase.from('contracts').upsert(state.contracts.map(mapContractToDb));
      if (errC) throw errC;
    }
    // 6. Audit Logs
    if (state.auditLogs.length > 0) {
      const { error: errA } = await supabase.from('audit_logs').upsert(state.auditLogs.map(mapAuditLogToDb));
      if (errA) throw errA;
    }
    // 7. Slack Alerts
    if (state.slackAlerts.length > 0) {
      const { error: errS } = await supabase.from('slack_alerts').upsert(state.slackAlerts.map(mapSlackAlertToDb));
      if (errS) throw errS;
    }
    // 8. Emails
    if (state.emails.length > 0) {
      const { error: errE } = await supabase.from('emails').upsert(state.emails.map(mapEmailToDb));
      if (errE) throw errE;
    }

    return { success: true };
  } catch (error: any) {
    return { success: false, error: error?.message || 'Database synchronization failed.' };
  }
};

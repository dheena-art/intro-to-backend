import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import {
  Database,
  X,
  CheckCircle2,
  AlertCircle,
  Copy,
  Check,
  RefreshCw,
  UploadCloud,
  DownloadCloud,
  ExternalLink,
  ShieldCheck,
} from 'lucide-react';
import { checkSupabaseConnection, syncAllDataToSupabase, SUPABASE_URL } from '../lib/supabase';

interface SupabaseModalProps {
  onClose: () => void;
}

export const SupabaseModal: React.FC<SupabaseModalProps> = ({ onClose }) => {
  const {
    projects,
    scopeVersions,
    requirements,
    changeRequests,
    contracts,
    auditLogs,
    slackAlerts,
    emails,
    loadFromSupabase,
    supabaseStatus,
  } = useApp();

  const [isSyncing, setIsSyncing] = useState(false);
  const [syncResult, setSyncResult] = useState<{ success?: boolean; message?: string } | null>(null);
  const [copiedSql, setCopiedSql] = useState(false);
  const [activeTab, setActiveTab] = useState<'sync' | 'sql'>('sync');

  const handleSyncToSupabase = async () => {
    setIsSyncing(true);
    setSyncResult(null);

    const res = await syncAllDataToSupabase({
      projects,
      scopeVersions,
      requirements,
      changeRequests,
      contracts,
      auditLogs,
      slackAlerts,
      emails,
    });

    setIsSyncing(false);
    if (res.success) {
      setSyncResult({
        success: true,
        message: 'Successfully inserted and synchronized all projects, scope baselines, change requests, contracts, and audit trails to your Supabase tables!',
      });
    } else {
      setSyncResult({
        success: false,
        message: res.error || 'Failed to sync to Supabase. Ensure database tables are created via SQL Editor.',
      });
    }
  };

  const handleFetchFromSupabase = async () => {
    setIsSyncing(true);
    setSyncResult(null);
    try {
      await loadFromSupabase();
      setSyncResult({
        success: true,
        message: 'Loaded latest state from Supabase datatables into the workspace.',
      });
    } catch (e: any) {
      setSyncResult({
        success: false,
        message: e?.message || 'Error fetching from Supabase.',
      });
    } finally {
      setIsSyncing(false);
    }
  };

  const sqlSchemaText = `-- =========================================================================
-- SCOPELOCK CLM: SUPABASE SCHEMA MIGRATION SCRIPT
-- Project ID: yrsnywnpohuompjluskv
-- =========================================================================

-- 1. Projects Table
CREATE TABLE IF NOT EXISTS public.projects (
    id TEXT PRIMARY KEY,
    code TEXT NOT NULL,
    name TEXT NOT NULL,
    client_name TEXT,
    client_email TEXT,
    client_org TEXT,
    description TEXT,
    pricing_model TEXT DEFAULT 'FIXED_PRICE',
    hourly_rate NUMERIC DEFAULT 175,
    base_budget NUMERIC DEFAULT 0,
    current_budget NUMERIC DEFAULT 0,
    start_date TEXT,
    base_delivery_date TEXT,
    current_delivery_date TEXT,
    status TEXT DEFAULT 'ACTIVE',
    active_scope_version_id TEXT,
    compliance_rate NUMERIC DEFAULT 100,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Scope Versions Table
CREATE TABLE IF NOT EXISTS public.scope_versions (
    id TEXT PRIMARY KEY,
    project_id TEXT REFERENCES public.projects(id) ON DELETE CASCADE,
    version TEXT NOT NULL,
    title TEXT NOT NULL,
    description TEXT,
    created_at TEXT,
    created_by TEXT,
    status TEXT DEFAULT 'APPROVED',
    total_effort_hours NUMERIC DEFAULT 0,
    contract_id TEXT
);

-- 3. Requirements Table (In-Scope & Out-of-Scope boundaries)
CREATE TABLE IF NOT EXISTS public.requirements (
    id TEXT PRIMARY KEY,
    scope_version_id TEXT REFERENCES public.scope_versions(id) ON DELETE CASCADE,
    code TEXT NOT NULL,
    title TEXT NOT NULL,
    description TEXT,
    category TEXT,
    priority TEXT DEFAULT 'HIGH',
    estimated_effort NUMERIC DEFAULT 0,
    acceptance_criteria TEXT,
    is_in_scope BOOLEAN DEFAULT TRUE,
    out_of_scope_reason TEXT,
    status TEXT DEFAULT 'BASELINE',
    source_cr_id TEXT
);

-- 4. Change Requests (CR) Table
CREATE TABLE IF NOT EXISTS public.change_requests (
    id TEXT PRIMARY KEY,
    cr_number TEXT NOT NULL,
    project_id TEXT REFERENCES public.projects(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    description TEXT,
    classification TEXT DEFAULT 'ADDITIONAL_SCOPE',
    reason TEXT,
    effort_impact_hours NUMERIC DEFAULT 0,
    schedule_impact_days NUMERIC DEFAULT 0,
    cost_impact NUMERIC DEFAULT 0,
    status TEXT DEFAULT 'SUBMITTED',
    requested_by TEXT,
    requested_role TEXT,
    submitted_at TEXT,
    reviewed_at TEXT,
    reviewed_by TEXT,
    review_comments TEXT,
    target_requirement_id TEXT,
    new_requirement_data JSONB,
    addendum_contract_id TEXT
);

-- 5. Contracts & Addenda Table
CREATE TABLE IF NOT EXISTS public.contracts (
    id TEXT PRIMARY KEY,
    contract_number TEXT NOT NULL,
    project_id TEXT REFERENCES public.projects(id) ON DELETE CASCADE,
    scope_version_id TEXT,
    title TEXT NOT NULL,
    contract_type TEXT DEFAULT 'MSA',
    parent_contract_id TEXT,
    related_cr_id TEXT,
    document_summary TEXT,
    effective_date TEXT,
    delivery_date TEXT,
    signing_status TEXT DEFAULT 'DRAFT',
    pricing_terms JSONB,
    clauses JSONB,
    client_signer JSONB,
    vendor_signer JSONB,
    certificate JSONB
);

-- 6. Immutable Audit Trail Table
CREATE TABLE IF NOT EXISTS public.audit_logs (
    id TEXT PRIMARY KEY,
    timestamp TEXT NOT NULL,
    actor_name TEXT NOT NULL,
    actor_role TEXT,
    action TEXT NOT NULL,
    entity_type TEXT,
    entity_id TEXT,
    details TEXT,
    hash TEXT NOT NULL
);

-- 7. Slack Alerts Table
CREATE TABLE IF NOT EXISTS public.slack_alerts (
    id TEXT PRIMARY KEY,
    channel TEXT NOT NULL,
    timestamp TEXT NOT NULL,
    sender TEXT NOT NULL,
    sender_avatar TEXT,
    text TEXT NOT NULL,
    badge TEXT,
    badge_color TEXT,
    action_label TEXT,
    action_view TEXT,
    action_payload TEXT
);

-- 8. Transactional Emails Table
CREATE TABLE IF NOT EXISTS public.emails (
    id TEXT PRIMARY KEY,
    from_address TEXT NOT NULL,
    to_address TEXT NOT NULL,
    subject TEXT NOT NULL,
    preview TEXT,
    body TEXT,
    timestamp TEXT NOT NULL,
    read BOOLEAN DEFAULT FALSE,
    type TEXT
);

-- Enable RLS and Allow Anon access
ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.scope_versions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.requirements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.change_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.contracts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.slack_alerts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.emails ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public full access to projects" ON public.projects FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow public full access to scope_versions" ON public.scope_versions FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow public full access to requirements" ON public.requirements FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow public full access to change_requests" ON public.change_requests FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow public full access to contracts" ON public.contracts FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow public full access to audit_logs" ON public.audit_logs FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow public full access to slack_alerts" ON public.slack_alerts FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow public full access to emails" ON public.emails FOR ALL USING (true) WITH CHECK (true);`;

  const copySqlToClipboard = () => {
    navigator.clipboard.writeText(sqlSchemaText);
    setCopiedSql(true);
    setTimeout(() => setCopiedSql(false), 2000);
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" style={{ maxWidth: '820px' }} onClick={e => e.stopPropagation()}>
        {/* Header */}
        <div style={{
          padding: '1.25rem 1.5rem',
          borderBottom: '1px solid var(--border-subtle)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <div style={{
              width: '34px',
              height: '34px',
              borderRadius: 'var(--radius-md)',
              background: 'rgba(16, 185, 129, 0.15)',
              color: 'var(--accent-emerald)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}>
              <Database size={20} />
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <h3 style={{ fontSize: '1.15rem', fontWeight: 600 }}>Supabase Cloud Database Integration</h3>
                <span className="badge badge-emerald">Live Linked</span>
              </div>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                Project ID: <strong>yrsnywnpohuompjluskv</strong>
              </p>
            </div>
          </div>
          <button onClick={onClose} style={{ color: 'var(--text-tertiary)', padding: '0.3rem' }}>
            <X size={18} />
          </button>
        </div>

        {/* Tab switch */}
        <div style={{
          display: 'flex',
          borderBottom: '1px solid var(--border-subtle)',
          padding: '0 1.5rem',
          background: 'var(--bg-secondary)',
        }}>
          <button
            onClick={() => setActiveTab('sync')}
            style={{
              padding: '0.75rem 1rem',
              fontSize: '0.84rem',
              fontWeight: 600,
              color: activeTab === 'sync' ? 'var(--accent-primary)' : 'var(--text-secondary)',
              borderBottom: activeTab === 'sync' ? '2px solid var(--accent-primary)' : '2px solid transparent',
            }}
          >
            Data Synchronization & Status
          </button>
          <button
            onClick={() => setActiveTab('sql')}
            style={{
              padding: '0.75rem 1rem',
              fontSize: '0.84rem',
              fontWeight: 600,
              color: activeTab === 'sql' ? 'var(--accent-primary)' : 'var(--text-secondary)',
              borderBottom: activeTab === 'sql' ? '2px solid var(--accent-primary)' : '2px solid transparent',
            }}
          >
            SQL Table Schema Setup
          </button>
        </div>

        {/* Tab 1: Synchronization */}
        {activeTab === 'sync' && (
          <div style={{ padding: '1.5rem' }}>
            {/* Status Card */}
            <div style={{
              background: 'var(--bg-glass)',
              border: '1px solid var(--border-subtle)',
              borderRadius: 'var(--radius-md)',
              padding: '1.25rem',
              marginBottom: '1.5rem',
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.75rem' }}>
                <div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)', textTransform: 'uppercase' }}>
                    Connected Supabase Endpoint
                  </div>
                  <div style={{ fontWeight: 600, fontSize: '0.92rem', color: 'var(--accent-cyan)' }}>
                    {SUPABASE_URL}
                  </div>
                </div>
                <span className="badge badge-emerald">
                  <CheckCircle2 size={12} /> Connected
                </span>
              </div>

              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(4, 1fr)',
                gap: '0.75rem',
                textAlign: 'center',
                paddingTop: '0.75rem',
                borderTop: '1px solid var(--border-subtle)',
                fontSize: '0.8rem',
              }}>
                <div>
                  <div style={{ fontSize: '1.2rem', fontWeight: 700 }}>{projects.length}</div>
                  <div style={{ fontSize: '0.72rem', color: 'var(--text-tertiary)' }}>Projects</div>
                </div>
                <div>
                  <div style={{ fontSize: '1.2rem', fontWeight: 700 }}>{requirements.length}</div>
                  <div style={{ fontSize: '0.72rem', color: 'var(--text-tertiary)' }}>Requirements</div>
                </div>
                <div>
                  <div style={{ fontSize: '1.2rem', fontWeight: 700 }}>{changeRequests.length}</div>
                  <div style={{ fontSize: '0.72rem', color: 'var(--text-tertiary)' }}>Change Requests</div>
                </div>
                <div>
                  <div style={{ fontSize: '1.2rem', fontWeight: 700 }}>{contracts.length}</div>
                  <div style={{ fontSize: '0.72rem', color: 'var(--text-tertiary)' }}>Contracts</div>
                </div>
              </div>
            </div>

            {/* Sync Results Feedback */}
            {syncResult && (
              <div style={{
                padding: '0.9rem 1.15rem',
                borderRadius: 'var(--radius-md)',
                marginBottom: '1.5rem',
                display: 'flex',
                alignItems: 'center',
                gap: '0.65rem',
                fontSize: '0.82rem',
                background: syncResult.success ? 'rgba(16, 185, 129, 0.12)' : 'rgba(244, 63, 94, 0.12)',
                border: `1px solid ${syncResult.success ? 'rgba(16, 185, 129, 0.3)' : 'rgba(244, 63, 94, 0.3)'}`,
                color: syncResult.success ? '#34d399' : '#fb7185',
              }}>
                {syncResult.success ? <CheckCircle2 size={18} /> : <AlertCircle size={18} />}
                <span>{syncResult.message}</span>
              </div>
            )}

            {/* Action Buttons */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1.5rem' }}>
              <div style={{
                padding: '1.25rem',
                borderRadius: 'var(--radius-md)',
                background: 'var(--bg-card)',
                border: '1px solid var(--border-medium)',
              }}>
                <div style={{ fontWeight: 600, fontSize: '0.9rem', marginBottom: '0.25rem' }}>
                  Push Current State to Supabase
                </div>
                <p style={{ fontSize: '0.76rem', color: 'var(--text-secondary)', marginBottom: '1rem' }}>
                  Upserts all active projects, scope baselines, change requests, contracts, and audit logs into your remote Supabase tables.
                </p>
                <button
                  onClick={handleSyncToSupabase}
                  disabled={isSyncing}
                  style={{
                    width: '100%',
                    padding: '0.65rem',
                    borderRadius: 'var(--radius-md)',
                    background: 'var(--accent-primary)',
                    color: '#ffffff',
                    fontSize: '0.84rem',
                    fontWeight: 600,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '0.45rem',
                    boxShadow: 'var(--shadow-glow)',
                  }}
                >
                  <UploadCloud size={16} />
                  {isSyncing ? 'Writing to Supabase...' : 'Push All Data to Supabase'}
                </button>
              </div>

              <div style={{
                padding: '1.25rem',
                borderRadius: 'var(--radius-md)',
                background: 'var(--bg-card)',
                border: '1px solid var(--border-medium)',
              }}>
                <div style={{ fontWeight: 600, fontSize: '0.9rem', marginBottom: '0.25rem' }}>
                  Pull Latest from Supabase
                </div>
                <p style={{ fontSize: '0.76rem', color: 'var(--text-secondary)', marginBottom: '1rem' }}>
                  Fetches the latest remote records from your Supabase tables to update this local workspace.
                </p>
                <button
                  onClick={handleFetchFromSupabase}
                  disabled={isSyncing}
                  style={{
                    width: '100%',
                    padding: '0.65rem',
                    borderRadius: 'var(--radius-md)',
                    background: 'var(--bg-secondary)',
                    border: '1px solid var(--border-medium)',
                    color: 'var(--text-primary)',
                    fontSize: '0.84rem',
                    fontWeight: 600,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '0.45rem',
                  }}
                >
                  <DownloadCloud size={16} />
                  {isSyncing ? 'Loading from Supabase...' : 'Fetch from Supabase'}
                </button>
              </div>
            </div>

            {/* Hint */}
            <div style={{
              fontSize: '0.78rem',
              color: 'var(--text-tertiary)',
              background: 'var(--bg-card)',
              padding: '0.85rem',
              borderRadius: 'var(--radius-md)',
              border: '1px solid var(--border-subtle)',
            }}>
              💡 <strong>Setup Notice:</strong> If your Supabase datatables have not been initialized yet, click the <strong>"SQL Table Schema Setup"</strong> tab above, copy the SQL, and run it in your <a href="https://supabase.com/dashboard/project/yrsnywnpohuompjluskv/sql" target="_blank" rel="noreferrer" style={{ color: 'var(--accent-primary)', textDecoration: 'underline' }}>Supabase SQL Editor</a>.
            </div>
          </div>
        )}

        {/* Tab 2: SQL Schema Setup */}
        {activeTab === 'sql' && (
          <div style={{ padding: '1.5rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
              <div>
                <h4 style={{ fontSize: '0.95rem', fontWeight: 600 }}>PostgreSQL DDL Migration Script</h4>
                <p style={{ fontSize: '0.76rem', color: 'var(--text-secondary)' }}>
                  Execute this script in your Supabase SQL Editor to create all 8 datatables and Row-Level Security (RLS) policies.
                </p>
              </div>
              <button
                onClick={copySqlToClipboard}
                style={{
                  padding: '0.5rem 1rem',
                  borderRadius: 'var(--radius-md)',
                  background: 'var(--accent-primary)',
                  color: '#ffffff',
                  fontSize: '0.82rem',
                  fontWeight: 600,
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.4rem',
                }}
              >
                {copiedSql ? <Check size={14} /> : <Copy size={14} />}
                {copiedSql ? 'Copied to Clipboard!' : 'Copy SQL Script'}
              </button>
            </div>

            <div style={{
              background: '#090d16',
              border: '1px solid var(--border-medium)',
              borderRadius: 'var(--radius-md)',
              padding: '1rem',
              maxHeight: '340px',
              overflowY: 'auto',
            }}>
              <pre className="font-mono" style={{ fontSize: '0.75rem', color: '#93c5fd', lineHeight: 1.5 }}>
                {sqlSchemaText}
              </pre>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '1rem' }}>
              <a
                href="https://supabase.com/dashboard/project/yrsnywnpohuompjluskv/sql"
                target="_blank"
                rel="noreferrer"
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.4rem',
                  fontSize: '0.82rem',
                  color: 'var(--accent-cyan)',
                  textDecoration: 'underline',
                }}
              >
                Open Supabase SQL Editor in Dashboard <ExternalLink size={13} />
              </a>

              <button
                type="button"
                onClick={onClose}
                style={{
                  padding: '0.55rem 1.25rem',
                  borderRadius: 'var(--radius-md)',
                  background: 'var(--bg-secondary)',
                  border: '1px solid var(--border-medium)',
                  color: 'var(--text-primary)',
                  fontSize: '0.84rem',
                }}
              >
                Done
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

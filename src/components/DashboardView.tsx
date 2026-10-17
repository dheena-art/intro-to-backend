import React from 'react';
import { useApp } from '../context/AppContext';
import {
  TrendingUp,
  DollarSign,
  Calendar,
  ShieldCheck,
  GitPullRequest,
  FileCheck2,
  AlertTriangle,
  ArrowRight,
  Plus,
  Sparkles,
  CheckCircle2,
  Clock,
  Layers,
  FileSpreadsheet,
} from 'lucide-react';

interface DashboardViewProps {
  onOpenNewCr: () => void;
  onOpenExport: () => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({ onOpenNewCr, onOpenExport }) => {
  const {
    activeProject,
    currentUser,
    requirements,
    changeRequests,
    contracts,
    auditLogs,
    setActiveTab,
    setSelectedContractId,
    setSelectedCrId,
  } = useApp();

  const projectReqs = requirements.filter(
    r => r.scopeVersionId === activeProject.activeScopeVersionId
  );
  const inScopeReqs = projectReqs.filter(r => r.isInScope);
  const outOfScopeReqs = projectReqs.filter(r => !r.isInScope);

  const projectCrs = changeRequests.filter(cr => cr.projectId === activeProject.id);
  const approvedCrs = projectCrs.filter(cr => cr.status === 'CLIENT_APPROVED');
  const pendingCrs = projectCrs.filter(
    cr => cr.status === 'SUBMITTED' || cr.status === 'UNDER_REVIEW'
  );

  const approvedAddonsTotal = approvedCrs.reduce((acc, cr) => acc + (cr.costImpact || 0), 0);
  const pendingExposureTotal = pendingCrs.reduce((acc, cr) => acc + (cr.costImpact || 0), 0);

  const scopeCreepPercent =
    activeProject.baseBudget > 0
      ? ((approvedAddonsTotal / activeProject.baseBudget) * 100).toFixed(1)
      : '0';

  const projectContracts = contracts.filter(c => c.projectId === activeProject.id);

  return (
    <div style={{ padding: '1.75rem', maxWidth: '1440px', margin: '0 auto' }}>
      {/* Role Banner / Context */}
      <div style={{
        background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.12) 0%, rgba(6, 182, 212, 0.08) 100%)',
        border: '1px solid var(--border-highlight)',
        borderRadius: 'var(--radius-lg)',
        padding: '1.25rem 1.5rem',
        marginBottom: '1.75rem',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '1rem',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <img
            src={currentUser.avatar}
            alt={currentUser.name}
            style={{ width: '48px', height: '48px', borderRadius: '50%', border: '2px solid var(--accent-primary)', objectFit: 'cover' }}
          />
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
              <h2 style={{ fontSize: '1.2rem', fontWeight: 700 }}>
                Welcome back, {currentUser.name}
              </h2>
              <span className={`badge ${currentUser.role === 'CLIENT_SIGNER' ? 'badge-emerald' : 'badge-blue'}`}>
                {currentUser.role === 'CLIENT_SIGNER' ? 'Client VP & Signer' : currentUser.role === 'PROJECT_MANAGER' ? 'Project Lead (Vendor)' : 'Legal Officer'}
              </span>
            </div>
            <p style={{ fontSize: '0.84rem', color: 'var(--text-secondary)', marginTop: '0.2rem' }}>
              {currentUser.role === 'CLIENT_SIGNER'
                ? 'You have formal authority to approve incoming Change Requests and execute legal Addenda.'
                : 'Manage baseline requirements, calculate quantified change impacts, and draft contracts for client review.'}
            </p>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <button
            onClick={onOpenNewCr}
            style={{
              padding: '0.6rem 1.15rem',
              borderRadius: 'var(--radius-md)',
              background: 'var(--accent-primary)',
              color: '#ffffff',
              fontSize: '0.85rem',
              fontWeight: 600,
              display: 'flex',
              alignItems: 'center',
              gap: '0.45rem',
              boxShadow: 'var(--shadow-glow)',
            }}
          >
            <Plus size={16} /> Log Change Request
          </button>
          <button
            onClick={onOpenExport}
            style={{
              padding: '0.6rem 1.15rem',
              borderRadius: 'var(--radius-md)',
              background: 'var(--bg-card)',
              border: '1px solid var(--border-medium)',
              color: 'var(--text-primary)',
              fontSize: '0.85rem',
              fontWeight: 500,
              display: 'flex',
              alignItems: 'center',
              gap: '0.45rem',
            }}
          >
            <FileSpreadsheet size={16} color="var(--accent-cyan)" /> Executive Export
          </button>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
        gap: '1.25rem',
        marginBottom: '1.75rem',
      }}>
        {/* KPI 1: Total Contract Value */}
        <div className="glass-panel" style={{ padding: '1.35rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div>
              <div style={{ fontSize: '0.78rem', color: 'var(--text-tertiary)', textTransform: 'uppercase', fontWeight: 600 }}>
                Total Contract Committed
              </div>
              <div style={{ fontSize: '1.75rem', fontWeight: 700, margin: '0.4rem 0 0.2rem 0' }}>
                ${activeProject.currentBudget.toLocaleString()}
              </div>
            </div>
            <div style={{
              width: '38px',
              height: '38px',
              borderRadius: 'var(--radius-md)',
              background: 'rgba(99, 102, 241, 0.15)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'var(--accent-primary)',
            }}>
              <DollarSign size={20} />
            </div>
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
            <span style={{ color: 'var(--accent-emerald)', fontWeight: 600 }}>+${approvedAddonsTotal.toLocaleString()}</span>
            <span>via approved addenda (Base: ${activeProject.baseBudget.toLocaleString()})</span>
          </div>
        </div>

        {/* KPI 2: Delivery Target & Schedule Shift */}
        <div className="glass-panel" style={{ padding: '1.35rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div>
              <div style={{ fontSize: '0.78rem', color: 'var(--text-tertiary)', textTransform: 'uppercase', fontWeight: 600 }}>
                Target Delivery Deadline
              </div>
              <div style={{ fontSize: '1.75rem', fontWeight: 700, margin: '0.4rem 0 0.2rem 0' }}>
                {activeProject.currentDeliveryDate}
              </div>
            </div>
            <div style={{
              width: '38px',
              height: '38px',
              borderRadius: 'var(--radius-md)',
              background: 'rgba(6, 182, 212, 0.15)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'var(--accent-cyan)',
            }}>
              <Calendar size={20} />
            </div>
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
            <span className="badge badge-amber" style={{ fontSize: '0.65rem' }}>
              Shifted +14 Days
            </span>
            <span>from original baseline ({activeProject.baseDeliveryDate})</span>
          </div>
        </div>

        {/* KPI 3: Change Request Velocity */}
        <div className="glass-panel" style={{ padding: '1.35rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div>
              <div style={{ fontSize: '0.78rem', color: 'var(--text-tertiary)', textTransform: 'uppercase', fontWeight: 600 }}>
                Change Requests (CRs)
              </div>
              <div style={{ fontSize: '1.75rem', fontWeight: 700, margin: '0.4rem 0 0.2rem 0' }}>
                {projectCrs.length} Logged
              </div>
            </div>
            <div style={{
              width: '38px',
              height: '38px',
              borderRadius: 'var(--radius-md)',
              background: 'rgba(245, 158, 11, 0.15)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'var(--accent-amber)',
            }}>
              <GitPullRequest size={20} />
            </div>
          </div>
          <div style={{ fontSize: '0.75rem', display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
            <span style={{ color: 'var(--accent-emerald)', fontWeight: 600 }}>{approvedCrs.length} Approved</span>
            <span style={{ color: 'var(--text-tertiary)' }}>•</span>
            <span style={{ color: 'var(--accent-amber)', fontWeight: 600 }}>{pendingCrs.length} Awaiting Signoff</span>
          </div>
        </div>

        {/* KPI 4: Compliance & Traceability */}
        <div className="glass-panel" style={{ padding: '1.35rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div>
              <div style={{ fontSize: '0.78rem', color: 'var(--text-tertiary)', textTransform: 'uppercase', fontWeight: 600 }}>
                Contract Compliance Rate
              </div>
              <div style={{ fontSize: '1.75rem', fontWeight: 700, margin: '0.4rem 0 0.2rem 0' }}>
                {activeProject.complianceRate}%
              </div>
            </div>
            <div style={{
              width: '38px',
              height: '38px',
              borderRadius: 'var(--radius-md)',
              background: 'rgba(16, 185, 129, 0.15)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'var(--accent-emerald)',
            }}>
              <ShieldCheck size={20} />
            </div>
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--accent-emerald)', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
            <CheckCircle2 size={13} />
            <span>Cryptographic SHA-256 Audit Trail Sealed</span>
          </div>
        </div>
      </div>

      {/* Main Grid: Left Financial / Timeline breakdown, Right Action & Contracts */}
      <div style={{ display: 'grid', gridTemplateColumns: '1.6fr 1.2fr', gap: '1.5rem', marginBottom: '1.75rem' }}>
        {/* Left Column: Scope & Financial Analysis */}
        <div className="glass-panel" style={{ padding: '1.5rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
            <div>
              <h3 style={{ fontSize: '1.05rem', fontWeight: 600 }}>Scope Value & Budget Dynamics</h3>
              <p style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>
                Baseline vs. Approved Additions vs. Pending Financial Exposure
              </p>
            </div>
            <span className="badge badge-cyan">
              Scope Expansion: +{scopeCreepPercent}%
            </span>
          </div>

          {/* Visual Budget Progress Bar */}
          <div style={{ marginBottom: '1.25rem' }}>
            <div style={{
              height: '14px',
              borderRadius: '9999px',
              background: 'var(--bg-secondary)',
              display: 'flex',
              overflow: 'hidden',
              border: '1px solid var(--border-subtle)',
            }}>
              {/* Baseline */}
              <div
                style={{
                  width: `${(activeProject.baseBudget / (activeProject.currentBudget + pendingExposureTotal)) * 100}%`,
                  background: 'linear-gradient(90deg, #6366f1, #818cf8)',
                }}
                title={`Base SOW Budget: $${activeProject.baseBudget.toLocaleString()}`}
              />
              {/* Approved Addons */}
              <div
                style={{
                  width: `${(approvedAddonsTotal / (activeProject.currentBudget + pendingExposureTotal)) * 100}%`,
                  background: 'linear-gradient(90deg, #10b981, #34d399)',
                }}
                title={`Approved Addenda: $${approvedAddonsTotal.toLocaleString()}`}
              />
              {/* Pending Exposure */}
              {pendingExposureTotal > 0 && (
                <div
                  style={{
                    width: `${(pendingExposureTotal / (activeProject.currentBudget + pendingExposureTotal)) * 100}%`,
                    background: 'repeating-linear-gradient(45deg, #f59e0b, #f59e0b 6px, #d97706 6px, #d97706 12px)',
                  }}
                  title={`Pending CR Exposure: $${pendingExposureTotal.toLocaleString()}`}
                />
              )}
            </div>

            {/* Legend */}
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1.25rem', marginTop: '0.75rem', fontSize: '0.76rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <div style={{ width: '10px', height: '10px', borderRadius: '2px', background: '#6366f1' }} />
                <span>Original SOW Baseline: <strong>${activeProject.baseBudget.toLocaleString()}</strong></span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <div style={{ width: '10px', height: '10px', borderRadius: '2px', background: '#10b981' }} />
                <span>Approved Addenda: <strong>+${approvedAddonsTotal.toLocaleString()}</strong></span>
              </div>
              {pendingExposureTotal > 0 && (
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                  <div style={{ width: '10px', height: '10px', borderRadius: '2px', background: '#f59e0b' }} />
                  <span>Pending Signoff Exposure: <strong>+${pendingExposureTotal.toLocaleString()}</strong></span>
                </div>
              )}
            </div>
          </div>

          {/* Requirements Boundary Stats */}
          <div style={{
            background: 'var(--bg-glass)',
            border: '1px solid var(--border-subtle)',
            borderRadius: 'var(--radius-md)',
            padding: '1rem',
            display: 'grid',
            gridTemplateColumns: 'repeat(3, 1fr)',
            gap: '1rem',
            textAlign: 'center',
          }}>
            <div>
              <div style={{ fontSize: '1.3rem', fontWeight: 700, color: 'var(--accent-emerald)' }}>
                {inScopeReqs.length}
              </div>
              <div style={{ fontSize: '0.74rem', color: 'var(--text-secondary)' }}>
                In-Scope Deliverables
              </div>
            </div>
            <div>
              <div style={{ fontSize: '1.3rem', fontWeight: 700, color: 'var(--accent-rose)' }}>
                {outOfScopeReqs.length}
              </div>
              <div style={{ fontSize: '0.74rem', color: 'var(--text-secondary)' }}>
                Explicitly Out-of-Scope
              </div>
            </div>
            <div>
              <div style={{ fontSize: '1.3rem', fontWeight: 700, color: 'var(--accent-cyan)' }}>
                {inScopeReqs.reduce((a, b) => a + b.estimatedEffort, 0)} hrs
              </div>
              <div style={{ fontSize: '0.74rem', color: 'var(--text-secondary)' }}>
                Total Engineering Hours
              </div>
            </div>
          </div>


        </div>

        {/* Right Column: Contracts Pipeline & Pending Actions */}
        <div className="glass-panel" style={{ padding: '1.5rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
            <div>
              <h3 style={{ fontSize: '1.05rem', fontWeight: 600 }}>Contract Lifecycle Pipeline</h3>
              <p style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>
                Legal agreements and executed addenda
              </p>
            </div>
            <button
              onClick={() => setActiveTab('contracts')}
              style={{ fontSize: '0.78rem', color: 'var(--accent-primary)', fontWeight: 600 }}
            >
              View All ({projectContracts.length})
            </button>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {projectContracts.map(c => {
              const isExecuted = c.signingStatus === 'FULLY_EXECUTED';
              return (
                <div
                  key={c.id}
                  style={{
                    padding: '0.9rem',
                    borderRadius: 'var(--radius-md)',
                    background: 'var(--bg-card)',
                    border: '1px solid var(--border-medium)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <div style={{
                      width: '32px',
                      height: '32px',
                      borderRadius: 'var(--radius-sm)',
                      background: isExecuted ? 'rgba(16, 185, 129, 0.15)' : 'rgba(245, 158, 11, 0.15)',
                      color: isExecuted ? 'var(--accent-emerald)' : 'var(--accent-amber)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}>
                      <FileCheck2 size={16} />
                    </div>
                    <div>
                      <div style={{ fontWeight: 600, fontSize: '0.84rem' }}>{c.title}</div>
                      <div style={{ fontSize: '0.72rem', color: 'var(--text-tertiary)' }}>
                        {c.contractNumber} • Effective: {c.effectiveDate}
                      </div>
                    </div>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <span className={`badge ${isExecuted ? 'badge-emerald' : 'badge-amber'}`}>
                      {isExecuted ? 'Executed' : 'Pending Signature'}
                    </span>
                    <button
                      onClick={() => {
                        setSelectedContractId(c.id);
                        setActiveTab('contracts');
                      }}
                      style={{
                        padding: '0.35rem 0.65rem',
                        borderRadius: 'var(--radius-sm)',
                        background: 'var(--bg-secondary)',
                        border: '1px solid var(--border-medium)',
                        color: 'var(--text-primary)',
                        fontSize: '0.75rem',
                      }}
                    >
                      Inspect
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Quick Notice if Pending CRs exist */}
          {pendingCrs.length > 0 && (
            <div style={{
              marginTop: '1.25rem',
              padding: '0.85rem 1rem',
              borderRadius: 'var(--radius-md)',
              background: 'rgba(245, 158, 11, 0.12)',
              border: '1px solid rgba(245, 158, 11, 0.3)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                <AlertTriangle size={18} color="var(--accent-amber)" />
                <div style={{ fontSize: '0.78rem' }}>
                  <strong>{pendingCrs.length} Change Request(s)</strong> awaiting Client approval.
                </div>
              </div>
              <button
                onClick={() => setActiveTab('changeRequests')}
                style={{
                  fontSize: '0.75rem',
                  fontWeight: 600,
                  color: 'var(--accent-amber)',
                  textDecoration: 'underline',
                }}
              >
                Review Now
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Recent Cryptographic Audit Stream */}
      <div className="glass-panel" style={{ padding: '1.5rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
          <div>
            <h3 style={{ fontSize: '1.05rem', fontWeight: 600 }}>Live Requirements & Scope Traceability Feed</h3>
            <p style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>
              IEEE compliant timestamped audit trail of scope events
            </p>
          </div>
          <button
            onClick={() => setActiveTab('audit')}
            style={{ fontSize: '0.78rem', color: 'var(--accent-primary)', fontWeight: 600 }}
          >
            Full Audit Log ({auditLogs.length} Records) <ArrowRight size={13} style={{ display: 'inline' }} />
          </button>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '0.75rem' }}>
          {auditLogs.slice(0, 3).map(log => (
            <div
              key={log.id}
              style={{
                padding: '0.85rem',
                borderRadius: 'var(--radius-md)',
                background: 'var(--bg-card)',
                border: '1px solid var(--border-subtle)',
                fontSize: '0.8rem',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.3rem' }}>
                <span className="badge badge-blue" style={{ fontSize: '0.65rem' }}>{log.action}</span>
                <span style={{ fontSize: '0.7rem', color: 'var(--text-tertiary)' }}>
                  {new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.78rem', margin: '0.35rem 0' }}>
                {log.details}
              </p>
              <div style={{ fontSize: '0.68rem', color: 'var(--text-tertiary)', display: 'flex', justifyContent: 'space-between' }}>
                <span>Actor: <strong>{log.actorName}</strong> ({log.actorRole})</span>
                <span className="font-mono">{log.hash.slice(0, 14)}...</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Requirement } from '../types';
import {
  Network,
  Search,
  Filter,
  CheckCircle2,
  Clock,
  ArrowRight,
  ShieldCheck,
  FileCheck2,
  GitPullRequest,
  Sparkles,
  Layers,
  ChevronRight,
  ExternalLink,
} from 'lucide-react';

export const TraceabilityView: React.FC = () => {
  const {
    activeProject,
    requirements,
    scopeVersions,
    changeRequests,
    contracts,
    setSelectedContractId,
    setActiveTab,
  } = useApp();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedReq, setSelectedReq] = useState<Requirement | null>(null);

  const projectVersions = scopeVersions.filter(sv => sv.projectId === activeProject.id);
  const versionIds = projectVersions.map(v => v.id);
  const projectReqs = requirements.filter(r => versionIds.includes(r.scopeVersionId));

  const filteredReqs = projectReqs.filter(r => {
    return (
      r.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.category.toLowerCase().includes(searchQuery.toLowerCase())
    );
  });

  return (
    <div style={{ padding: '1.75rem', maxWidth: '1440px', margin: '0 auto' }}>
      {/* Header */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: '1rem',
        marginBottom: '1.5rem',
      }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <h2 style={{ fontSize: '1.35rem', fontWeight: 700 }}>IEEE Requirements Traceability Matrix (RTM)</h2>
            <span className="badge badge-emerald">IEEE Standard 830/1233 Compliant</span>
          </div>
          <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', marginTop: '0.2rem' }}>
            Trace the complete lifecycle of every deliverable from contractual inception to delivery & cryptographic verification.
          </p>
        </div>

        <div style={{ position: 'relative', width: '260px' }}>
          <Search size={14} style={{ position: 'absolute', left: '10px', top: '10px', color: 'var(--text-tertiary)' }} />
          <input
            type="text"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder="Search requirement or code..."
            style={{ paddingLeft: '32px', fontSize: '0.8rem', padding: '0.45rem 0.45rem 0.45rem 32px' }}
          />
        </div>
      </div>

      {/* Main Layout: Matrix Table */}
      <div className="glass-panel" style={{ overflow: 'hidden', marginBottom: '1.5rem' }}>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.82rem' }}>
            <thead>
              <tr style={{ background: 'var(--bg-secondary)', borderBottom: '1px solid var(--border-medium)', color: 'var(--text-tertiary)', fontSize: '0.72rem', textTransform: 'uppercase' }}>
                <th style={{ padding: '0.85rem 1rem' }}>Req Code</th>
                <th style={{ padding: '0.85rem 1rem' }}>Requirement Specification</th>
                <th style={{ padding: '0.85rem 1rem' }}>Origin Baseline</th>
                <th style={{ padding: '0.85rem 1rem' }}>Change Request Origin</th>
                <th style={{ padding: '0.85rem 1rem' }}>Contractual Authority</th>
                <th style={{ padding: '0.85rem 1rem' }}>Lifecycle State</th>
                <th style={{ padding: '0.85rem 1rem', textAlign: 'right' }}>Action</th>
              </tr>
            </thead>
            <tbody>
              {filteredReqs.map(req => {
                const linkedScope = projectVersions.find(v => v.id === req.scopeVersionId);
                const linkedCr = changeRequests.find(cr => cr.id === req.sourceCrId);
                const linkedContract = linkedCr?.addendumContractId
                  ? contracts.find(c => c.id === linkedCr.addendumContractId)
                  : contracts.find(c => c.projectId === activeProject.id && c.contractType === 'MSA');

                return (
                  <tr
                    key={req.id}
                    style={{
                      borderBottom: '1px solid var(--border-subtle)',
                      transition: 'background 0.15s ease',
                    }}
                    onMouseEnter={e => (e.currentTarget.style.background = 'var(--bg-card-hover)')}
                    onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
                  >
                    <td style={{ padding: '0.85rem 1rem', whiteSpace: 'nowrap' }}>
                      <span className="font-mono" style={{ fontWeight: 600, color: 'var(--accent-primary)' }}>
                        {req.code}
                      </span>
                    </td>

                    <td style={{ padding: '0.85rem 1rem', maxWidth: '280px' }}>
                      <div style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{req.title}</div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '0.15rem' }}>
                        Category: {req.category}
                      </div>
                    </td>

                    <td style={{ padding: '0.85rem 1rem', whiteSpace: 'nowrap' }}>
                      <span className="badge badge-blue">
                        {linkedScope ? `${linkedScope.version}` : 'v1.0'}
                      </span>
                    </td>

                    <td style={{ padding: '0.85rem 1rem', whiteSpace: 'nowrap' }}>
                      {linkedCr ? (
                        <span className="badge badge-amber">
                          {linkedCr.crNumber} (+{linkedCr.scheduleImpactDays}d)
                        </span>
                      ) : (
                        <span style={{ color: 'var(--text-tertiary)', fontSize: '0.75rem' }}>
                          Original SOW Scope
                        </span>
                      )}
                    </td>

                    <td style={{ padding: '0.85rem 1rem', whiteSpace: 'nowrap' }}>
                      {linkedContract ? (
                        <button
                          onClick={() => {
                            setSelectedContractId(linkedContract.id);
                            setActiveTab('contracts');
                          }}
                          style={{
                            color: 'var(--accent-cyan)',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.3rem',
                            fontSize: '0.78rem',
                            fontWeight: 500,
                          }}
                        >
                          <FileCheck2 size={13} />
                          {linkedContract.contractNumber}
                        </button>
                      ) : (
                        <span style={{ color: 'var(--text-tertiary)' }}>Pending Execution</span>
                      )}
                    </td>

                    <td style={{ padding: '0.85rem 1rem', whiteSpace: 'nowrap' }}>
                      <span
                        className={`badge ${
                          req.status === 'COMPLETED'
                            ? 'badge-emerald'
                            : req.status === 'IN_PROGRESS'
                            ? 'badge-cyan'
                            : req.status === 'ADDED_BY_CR'
                            ? 'badge-purple'
                            : !req.isInScope
                            ? 'badge-rose'
                            : 'badge-amber'
                        }`}
                      >
                        {!req.isInScope ? 'OUT-OF-SCOPE' : req.status}
                      </span>
                    </td>

                    <td style={{ padding: '0.85rem 1rem', textAlign: 'right', whiteSpace: 'nowrap' }}>
                      <button
                        onClick={() => setSelectedReq(req)}
                        style={{
                          padding: '0.35rem 0.65rem',
                          borderRadius: 'var(--radius-sm)',
                          background: 'var(--bg-secondary)',
                          border: '1px solid var(--border-medium)',
                          color: 'var(--text-primary)',
                          fontSize: '0.75rem',
                        }}
                      >
                        View Life Graph
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Visual Provenance Life Graph Modal */}
      {selectedReq && (
        <div className="modal-overlay" onClick={() => setSelectedReq(null)}>
          <div className="modal-content" style={{ maxWidth: '720px' }} onClick={e => e.stopPropagation()}>
            <div style={{ padding: '1.25rem 1.5rem', borderBottom: '1px solid var(--border-subtle)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Network size={20} color="var(--accent-cyan)" />
                <h3 style={{ fontSize: '1.1rem', fontWeight: 600 }}>
                  End-to-End Requirement Life Graph: [{selectedReq.code}]
                </h3>
              </div>
              <button onClick={() => setSelectedReq(null)} style={{ color: 'var(--text-tertiary)' }}>✕</button>
            </div>

            <div style={{ padding: '1.5rem' }}>
              <div style={{ marginBottom: '1.5rem' }}>
                <h4 style={{ fontSize: '1.05rem', fontWeight: 600 }}>{selectedReq.title}</h4>
                <p style={{ fontSize: '0.84rem', color: 'var(--text-secondary)', marginTop: '0.2rem' }}>
                  {selectedReq.description}
                </p>
              </div>

              {/* Stepper Diagram */}
              <div style={{
                background: 'var(--bg-glass)',
                border: '1px solid var(--border-subtle)',
                borderRadius: 'var(--radius-md)',
                padding: '1.25rem',
                display: 'flex',
                flexDirection: 'column',
                gap: '1.25rem',
                position: 'relative',
              }}>
                {/* Step 1: Inception */}
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '1rem' }}>
                  <div style={{
                    width: '32px',
                    height: '32px',
                    borderRadius: '50%',
                    background: 'var(--accent-primary)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#ffffff',
                    fontWeight: 'bold',
                    fontSize: '0.8rem',
                  }}>
                    1
                  </div>
                  <div>
                    <div style={{ fontWeight: 600, fontSize: '0.88rem' }}>Requirement Inception & Baseline Entry</div>
                    <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>
                      Cataloged under {selectedReq.category} with estimated {selectedReq.estimatedEffort} engineering hours.
                    </div>
                  </div>
                </div>

                {/* Step 2: Change Control */}
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '1rem' }}>
                  <div style={{
                    width: '32px',
                    height: '32px',
                    borderRadius: '50%',
                    background: selectedReq.sourceCrId ? 'var(--accent-amber)' : 'var(--accent-cyan)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#ffffff',
                    fontWeight: 'bold',
                    fontSize: '0.8rem',
                  }}>
                    2
                  </div>
                  <div>
                    <div style={{ fontWeight: 600, fontSize: '0.88rem' }}>
                      {selectedReq.sourceCrId ? 'Formal Scope Expansion (Change Request)' : 'Master Statement of Work Scope'}
                    </div>
                    <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>
                      {selectedReq.sourceCrId
                        ? `Introduced via ${selectedReq.sourceCrId.toUpperCase()} with explicit schedule and budget adjustment.`
                        : 'Approved during initial project kickoff in baseline v1.0.'}
                    </div>
                  </div>
                </div>

                {/* Step 3: Contractual Legal Link */}
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '1rem' }}>
                  <div style={{
                    width: '32px',
                    height: '32px',
                    borderRadius: '50%',
                    background: 'var(--accent-emerald)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#ffffff',
                    fontWeight: 'bold',
                    fontSize: '0.8rem',
                  }}>
                    3
                  </div>
                  <div>
                    <div style={{ fontWeight: 600, fontSize: '0.88rem' }}>Legally Bound Contract Addendum</div>
                    <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>
                      Tied to Master Agreement CTR-2026-001. Cryptographically sealed with DocuSign SHA-256 certificate.
                    </div>
                  </div>
                </div>

                {/* Step 4: Verification & Delivery */}
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '1rem' }}>
                  <div style={{
                    width: '32px',
                    height: '32px',
                    borderRadius: '50%',
                    background: selectedReq.status === 'COMPLETED' ? 'var(--accent-emerald)' : 'var(--border-medium)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#ffffff',
                    fontWeight: 'bold',
                    fontSize: '0.8rem',
                  }}>
                    4
                  </div>
                  <div>
                    <div style={{ fontWeight: 600, fontSize: '0.88rem' }}>Acceptance Criteria Verification</div>
                    <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>
                      {selectedReq.acceptanceCriteria}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div style={{ padding: '1rem 1.5rem', borderTop: '1px solid var(--border-subtle)', display: 'flex', justifyContent: 'flex-end' }}>
              <button
                onClick={() => setSelectedReq(null)}
                style={{
                  padding: '0.5rem 1.25rem',
                  borderRadius: 'var(--radius-md)',
                  background: 'var(--accent-primary)',
                  color: '#ffffff',
                  fontSize: '0.84rem',
                  fontWeight: 600,
                }}
              >
                Close Provenance View
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

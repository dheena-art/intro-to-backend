import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { ChangeRequest, CRClassification } from '../types';
import {
  GitPullRequest,
  Plus,
  Clock,
  DollarSign,
  Calendar,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  ArrowRight,
  User,
  Shield,
  FileCheck2,
  Search,
  Filter,
} from 'lucide-react';

interface ChangeRequestsViewProps {
  onOpenNewCr: () => void;
}

export const ChangeRequestsView: React.FC<ChangeRequestsViewProps> = ({ onOpenNewCr }) => {
  const {
    activeProject,
    changeRequests,
    currentUser,
    approveChangeRequest,
    rejectChangeRequest,
    setSelectedContractId,
    setActiveTab,
  } = useApp();

  const projectCrs = changeRequests.filter(cr => cr.projectId === activeProject.id);

  const [statusFilter, setStatusFilter] = useState('ALL');
  const [classificationFilter, setClassificationFilter] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');

  // Review modal state
  const [selectedCrForReview, setSelectedCrForReview] = useState<ChangeRequest | null>(null);
  const [reviewComments, setReviewComments] = useState('');
  const [reviewAction, setReviewAction] = useState<'approve' | 'reject'>('approve');

  const filteredCrs = projectCrs.filter(cr => {
    const matchesStatus = statusFilter === 'ALL' || cr.status === statusFilter;
    const matchesClass = classificationFilter === 'ALL' || cr.classification === classificationFilter;
    const matchesSearch =
      cr.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      cr.crNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      cr.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesStatus && matchesClass && matchesSearch;
  });

  const isClientRole = currentUser.role === 'CLIENT_SIGNER';

  const handleConfirmReview = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCrForReview) return;

    if (reviewAction === 'approve') {
      approveChangeRequest(selectedCrForReview.id, reviewComments);
    } else {
      rejectChangeRequest(selectedCrForReview.id, reviewComments || 'Change rejected by client sponsor.');
    }

    setSelectedCrForReview(null);
    setReviewComments('');
  };

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
            <h2 style={{ fontSize: '1.35rem', fontWeight: 700 }}>Formal Change Request (CR) Protocol</h2>
            <span className="badge badge-amber">Workflow Enforced</span>
          </div>
          <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', marginTop: '0.2rem' }}>
            Work commences strictly after formal client approval and contract addendum execution.
          </p>
        </div>

        <button
          onClick={onOpenNewCr}
          style={{
            padding: '0.6rem 1.25rem',
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
          <Plus size={16} /> Raise Change Request
        </button>
      </div>

      {/* Role Reminder Banner */}
      {!isClientRole && (
        <div style={{
          background: 'rgba(99, 102, 241, 0.1)',
          border: '1px solid rgba(99, 102, 241, 0.3)',
          borderRadius: 'var(--radius-md)',
          padding: '0.85rem 1.25rem',
          marginBottom: '1.5rem',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          fontSize: '0.82rem',
        }}>
          <div>
            <strong>RBAC Access Control:</strong> You are currently logged in as <em>{currentUser.name} ({currentUser.role})</em>. Team members can propose Change Requests. Formal approval & addendum signing is restricted to Client Signers.
          </div>
          <span className="badge badge-blue">Proposer Mode</span>
        </div>
      )}

      {/* Filter and Search Bar */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: '0.75rem',
        marginBottom: '1.25rem',
      }}>
        <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', flexWrap: 'wrap' }}>
          <div style={{ position: 'relative', width: '240px' }}>
            <Search size={14} style={{ position: 'absolute', left: '10px', top: '10px', color: 'var(--text-tertiary)' }} />
            <input
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="Search change requests..."
              style={{ paddingLeft: '32px', fontSize: '0.8rem', padding: '0.45rem 0.45rem 0.45rem 32px' }}
            />
          </div>

          <select
            value={statusFilter}
            onChange={e => setStatusFilter(e.target.value)}
            style={{ width: 'auto', fontSize: '0.8rem', padding: '0.45rem 0.75rem' }}
          >
            <option value="ALL">All Statuses</option>
            <option value="SUBMITTED">Submitted</option>
            <option value="UNDER_REVIEW">Under Review</option>
            <option value="CLIENT_APPROVED">Client Approved</option>
            <option value="REJECTED">Rejected</option>
          </select>

          <select
            value={classificationFilter}
            onChange={e => setClassificationFilter(e.target.value)}
            style={{ width: 'auto', fontSize: '0.8rem', padding: '0.45rem 0.75rem' }}
          >
            <option value="ALL">All Classifications</option>
            <option value="ADDITIONAL_SCOPE">Additional Scope (Billable Add-on)</option>
            <option value="IN_ORIGINAL_SCOPE">In Original Scope (Clarification)</option>
          </select>
        </div>

        <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
          Showing <strong>{filteredCrs.length}</strong> of {projectCrs.length} Change Requests
        </div>
      </div>

      {/* CR Cards Grid */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        {filteredCrs.length === 0 ? (
          <div className="glass-panel" style={{ padding: '3.5rem', textAlign: 'center', color: 'var(--text-tertiary)' }}>
            No Change Requests match the selected filters.
          </div>
        ) : (
          filteredCrs.map(cr => {
            const isApproved = cr.status === 'CLIENT_APPROVED';
            const isRejected = cr.status === 'REJECTED';
            const isPending = cr.status === 'SUBMITTED' || cr.status === 'UNDER_REVIEW';

            return (
              <div
                key={cr.id}
                className="glass-panel"
                style={{
                  padding: '1.25rem 1.5rem',
                  borderLeft: `4px solid ${
                    isApproved ? 'var(--accent-emerald)' : isRejected ? 'var(--accent-rose)' : 'var(--accent-amber)'
                  }`,
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '0.75rem' }}>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.3rem' }}>
                      <span className="font-mono" style={{ fontWeight: 700, fontSize: '0.95rem', color: 'var(--accent-cyan)' }}>
                        {cr.crNumber}
                      </span>
                      <h3 style={{ fontSize: '1.05rem', fontWeight: 600 }}>{cr.title}</h3>
                      <span
                        className={`badge ${
                          cr.classification === 'ADDITIONAL_SCOPE' ? 'badge-purple' : 'badge-cyan'
                        }`}
                      >
                        {cr.classification === 'ADDITIONAL_SCOPE' ? 'Additional Scope' : 'In Original Scope'}
                      </span>
                      <span
                        className={`badge ${
                          isApproved ? 'badge-emerald' : isRejected ? 'badge-rose' : 'badge-amber'
                        }`}
                      >
                        {cr.status}
                      </span>
                    </div>

                    <p style={{ fontSize: '0.84rem', color: 'var(--text-secondary)', maxWidth: '850px', lineHeight: 1.4 }}>
                      {cr.description}
                    </p>

                    <div style={{ fontSize: '0.78rem', color: 'var(--text-tertiary)', marginTop: '0.4rem' }}>
                      <strong>Business Justification:</strong> {cr.reason}
                    </div>
                  </div>

                  {/* Action Button */}
                  <div>
                    {isPending && (
                      <button
                        onClick={() => {
                          setSelectedCrForReview(cr);
                          setReviewAction('approve');
                          setReviewComments('');
                        }}
                        style={{
                          padding: '0.55rem 1.1rem',
                          borderRadius: 'var(--radius-md)',
                          background: isClientRole ? 'var(--accent-emerald)' : 'var(--bg-secondary)',
                          color: isClientRole ? '#ffffff' : 'var(--text-primary)',
                          border: isClientRole ? 'none' : '1px solid var(--border-medium)',
                          fontSize: '0.82rem',
                          fontWeight: 600,
                          display: 'flex',
                          alignItems: 'center',
                          gap: '0.4rem',
                          boxShadow: isClientRole ? '0 0 16px var(--accent-emerald-glow)' : 'none',
                        }}
                      >
                        {isClientRole ? 'Formal Review & Decision' : 'Inspect Review'}
                      </button>
                    )}

                    {isApproved && cr.addendumContractId && (
                      <button
                        onClick={() => {
                          setSelectedContractId(cr.addendumContractId!);
                          setActiveTab('contracts');
                        }}
                        style={{
                          padding: '0.45rem 0.95rem',
                          borderRadius: 'var(--radius-md)',
                          background: 'rgba(16, 185, 129, 0.15)',
                          border: '1px solid rgba(16, 185, 129, 0.4)',
                          color: '#34d399',
                          fontSize: '0.8rem',
                          fontWeight: 600,
                          display: 'flex',
                          alignItems: 'center',
                          gap: '0.4rem',
                        }}
                      >
                        <FileCheck2 size={14} /> View Executed Addendum
                      </button>
                    )}
                  </div>
                </div>

                {/* Quantified Impacts Ribbon */}
                <div style={{
                  marginTop: '1rem',
                  paddingTop: '0.85rem',
                  borderTop: '1px solid var(--border-subtle)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  flexWrap: 'wrap',
                  gap: '1rem',
                  fontSize: '0.78rem',
                }}>
                  <div style={{ display: 'flex', gap: '1.5rem', flexWrap: 'wrap' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                      <Clock size={14} color="var(--accent-cyan)" />
                      <span>Effort Impact: <strong>+{cr.effortImpactHours} hours</strong></span>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                      <Calendar size={14} color="var(--accent-amber)" />
                      <span>Schedule Shift: <strong>+{cr.scheduleImpactDays} days</strong></span>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                      <DollarSign size={14} color="var(--accent-emerald)" />
                      <span>Budget Impact: <strong>+${cr.costImpact.toLocaleString()}</strong></span>
                    </div>
                  </div>

                  <div style={{ color: 'var(--text-tertiary)', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                    <User size={13} />
                    <span>Requested by: <strong>{cr.requestedBy}</strong> ({new Date(cr.submittedAt).toLocaleDateString()})</span>
                  </div>
                </div>

                {/* Review audit feedback if evaluated */}
                {(isApproved || isRejected) && cr.reviewedBy && (
                  <div style={{
                    marginTop: '0.75rem',
                    padding: '0.65rem 0.9rem',
                    borderRadius: 'var(--radius-sm)',
                    background: isApproved ? 'rgba(16, 185, 129, 0.08)' : 'rgba(244, 63, 94, 0.08)',
                    border: `1px solid ${isApproved ? 'rgba(16, 185, 129, 0.2)' : 'rgba(244, 63, 94, 0.2)'}`,
                    fontSize: '0.78rem',
                  }}>
                    <strong>Review Decision by {cr.reviewedBy}:</strong> {cr.reviewComments}
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>

      {/* Formal Review Decision Modal */}
      {selectedCrForReview && (
        <div className="modal-overlay" onClick={() => setSelectedCrForReview(null)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <div style={{ padding: '1.25rem 1.5rem', borderBottom: '1px solid var(--border-subtle)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Shield size={20} color="var(--accent-emerald)" />
                <h3 style={{ fontSize: '1.1rem', fontWeight: 600 }}>
                  Formal Client Review: {selectedCrForReview.crNumber}
                </h3>
              </div>
              <button onClick={() => setSelectedCrForReview(null)} style={{ color: 'var(--text-tertiary)' }}>✕</button>
            </div>

            <form onSubmit={handleConfirmReview} style={{ padding: '1.5rem' }}>
              <div style={{ marginBottom: '1.25rem' }}>
                <h4 style={{ fontSize: '0.98rem', fontWeight: 600, marginBottom: '0.25rem' }}>
                  {selectedCrForReview.title}
                </h4>
                <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)' }}>
                  {selectedCrForReview.description}
                </p>
              </div>

              {/* Impact Summary Pill */}
              <div style={{
                background: 'var(--bg-glass)',
                border: '1px solid var(--border-medium)',
                borderRadius: 'var(--radius-md)',
                padding: '1rem',
                marginBottom: '1.25rem',
                display: 'grid',
                gridTemplateColumns: 'repeat(3, 1fr)',
                gap: '0.75rem',
                textAlign: 'center',
              }}>
                <div>
                  <div style={{ fontSize: '0.72rem', color: 'var(--text-tertiary)', textTransform: 'uppercase' }}>Schedule Shift</div>
                  <div style={{ fontSize: '1.15rem', fontWeight: 700, color: 'var(--accent-amber)' }}>
                    +{selectedCrForReview.scheduleImpactDays} Days
                  </div>
                </div>

                <div>
                  <div style={{ fontSize: '0.72rem', color: 'var(--text-tertiary)', textTransform: 'uppercase' }}>Cost Impact</div>
                  <div style={{ fontSize: '1.15rem', fontWeight: 700, color: 'var(--accent-emerald)' }}>
                    +${selectedCrForReview.costImpact.toLocaleString()}
                  </div>
                </div>

                <div>
                  <div style={{ fontSize: '0.72rem', color: 'var(--text-tertiary)', textTransform: 'uppercase' }}>Engineering Hours</div>
                  <div style={{ fontSize: '1.15rem', fontWeight: 700, color: 'var(--accent-cyan)' }}>
                    +{selectedCrForReview.effortImpactHours} hrs
                  </div>
                </div>
              </div>

              {/* Decision Toggle */}
              <div style={{ marginBottom: '1.25rem' }}>
                <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>
                  Signoff Decision
                </label>
                <div style={{ display: 'flex', gap: '0.75rem' }}>
                  <button
                    type="button"
                    onClick={() => setReviewAction('approve')}
                    style={{
                      flex: 1,
                      padding: '0.75rem',
                      borderRadius: 'var(--radius-md)',
                      background: reviewAction === 'approve' ? 'rgba(16, 185, 129, 0.2)' : 'var(--bg-card)',
                      border: reviewAction === 'approve' ? '1px solid var(--accent-emerald)' : '1px solid var(--border-subtle)',
                      color: reviewAction === 'approve' ? '#34d399' : 'var(--text-secondary)',
                      fontWeight: 600,
                      fontSize: '0.85rem',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '0.45rem',
                    }}
                  >
                    <CheckCircle2 size={16} /> Approve & Generate Addendum
                  </button>

                  <button
                    type="button"
                    onClick={() => setReviewAction('reject')}
                    style={{
                      flex: 1,
                      padding: '0.75rem',
                      borderRadius: 'var(--radius-md)',
                      background: reviewAction === 'reject' ? 'rgba(244, 63, 94, 0.2)' : 'var(--bg-card)',
                      border: reviewAction === 'reject' ? '1px solid var(--accent-rose)' : '1px solid var(--border-subtle)',
                      color: reviewAction === 'reject' ? '#fb7185' : 'var(--text-secondary)',
                      fontWeight: 600,
                      fontSize: '0.85rem',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '0.45rem',
                    }}
                  >
                    <XCircle size={16} /> Reject & Preserve Baseline
                  </button>
                </div>
              </div>

              <div style={{ marginBottom: '1.5rem' }}>
                <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '0.35rem' }}>
                  Review Comments & Legal Directives
                </label>
                <textarea
                  rows={3}
                  required
                  value={reviewComments}
                  onChange={e => setReviewComments(e.target.value)}
                  placeholder={
                    reviewAction === 'approve'
                      ? 'e.g. Approved by Apex Risk Committee; addendum authorization granted.'
                      : 'e.g. Scope rejected due to budget constraints; feature postponed to next fiscal year.'
                  }
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem' }}>
                <button
                  type="button"
                  onClick={() => setSelectedCrForReview(null)}
                  style={{
                    padding: '0.6rem 1.15rem',
                    borderRadius: 'var(--radius-md)',
                    border: '1px solid var(--border-medium)',
                    color: 'var(--text-secondary)',
                  }}
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  style={{
                    padding: '0.6rem 1.5rem',
                    borderRadius: 'var(--radius-md)',
                    background: reviewAction === 'approve' ? 'var(--accent-emerald)' : 'var(--accent-rose)',
                    color: '#ffffff',
                    fontWeight: 600,
                    fontSize: '0.88rem',
                    boxShadow: reviewAction === 'approve' ? '0 0 16px var(--accent-emerald-glow)' : 'none',
                  }}
                >
                  {reviewAction === 'approve' ? 'Execute Approval & Addendum' : 'Confirm Rejection'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

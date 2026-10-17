import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { X, GitPullRequest, Clock, Calendar, DollarSign, Sparkles } from 'lucide-react';
import { CRClassification } from '../types';

interface NewChangeRequestModalProps {
  onClose: () => void;
}

export const NewChangeRequestModal: React.FC<NewChangeRequestModalProps> = ({ onClose }) => {
  const { activeProject, requirements, submitChangeRequest, setActiveTab } = useApp();

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [classification, setClassification] = useState<CRClassification>('ADDITIONAL_SCOPE');
  const [reason, setReason] = useState('');
  const [effortHours, setEffortHours] = useState(80);
  const [scheduleDays, setScheduleDays] = useState(7);
  const [costImpact, setCostImpact] = useState(80 * (activeProject.hourlyRate || 175));

  const [targetType, setTargetType] = useState<'existing' | 'new'>('new');
  const [targetReqId, setTargetReqId] = useState('');
  const [newReqTitle, setNewReqTitle] = useState('');
  const [newReqCategory, setNewReqCategory] = useState('Core Architecture');
  const [newReqCriteria, setNewReqCriteria] = useState('');

  const projectReqs = requirements.filter(
    r => r.scopeVersionId === activeProject.activeScopeVersionId
  );

  const handleEffortChange = (val: number) => {
    setEffortHours(val);
    if (classification === 'ADDITIONAL_SCOPE') {
      setCostImpact(val * (activeProject.hourlyRate || 175));
    }
  };

  const handleClassificationChange = (c: CRClassification) => {
    setClassification(c);
    if (c === 'IN_ORIGINAL_SCOPE') {
      setCostImpact(0);
    } else {
      setCostImpact(effortHours * (activeProject.hourlyRate || 175));
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !reason.trim()) return;

    submitChangeRequest({
      projectId: activeProject.id,
      title,
      description,
      classification,
      reason,
      effortImpactHours: Number(effortHours),
      scheduleImpactDays: Number(scheduleDays),
      costImpact: Number(costImpact),
      requestedBy: 'Alex Mercer',
      requestedRole: 'PROJECT_MANAGER',
      targetRequirementId: targetType === 'existing' ? targetReqId : undefined,
      newRequirementData:
        targetType === 'new'
          ? {
              title: newReqTitle || title,
              category: newReqCategory,
              description,
              acceptanceCriteria: newReqCriteria || 'Criteria verified in QA acceptance tests.',
            }
          : undefined,
    });

    setActiveTab('changeRequests');
    onClose();
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" style={{ maxWidth: '680px' }} onClick={e => e.stopPropagation()}>
        {/* Header */}
        <div style={{
          padding: '1.25rem 1.5rem',
          borderBottom: '1px solid var(--border-subtle)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <GitPullRequest size={22} color="var(--accent-amber)" />
            <div>
              <h3 style={{ fontSize: '1.15rem', fontWeight: 600 }}>Log Formal Change Request</h3>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                Quantify timeline shift, effort, and commercial impact for {activeProject.name}
              </p>
            </div>
          </div>
          <button onClick={onClose} style={{ color: 'var(--text-tertiary)', padding: '0.3rem' }}>
            <X size={18} />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} style={{ padding: '1.5rem' }}>
          <div style={{ marginBottom: '1rem' }}>
            <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '0.35rem' }}>
              Change Request Title *
            </label>
            <input
              type="text"
              required
              value={title}
              onChange={e => setTitle(e.target.value)}
              placeholder="e.g. Asynchronous Real-Time Event Bus with Kafka"
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
            {/* Classification */}
            <div>
              <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '0.35rem' }}>
                Scope Classification
              </label>
              <select
                value={classification}
                onChange={e => handleClassificationChange(e.target.value as CRClassification)}
              >
                <option value="ADDITIONAL_SCOPE">Additional Scope (Billable Add-on)</option>
                <option value="IN_ORIGINAL_SCOPE">In Original Scope (Clarification, $0 Fee)</option>
              </select>
            </div>

            {/* Target Type */}
            <div>
              <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '0.35rem' }}>
                Requirement Target
              </label>
              <select
                value={targetType}
                onChange={e => setTargetType(e.target.value as any)}
              >
                <option value="new">Create Brand New Requirement</option>
                <option value="existing">Modify Existing Requirement</option>
              </select>
            </div>
          </div>

          {targetType === 'existing' ? (
            <div style={{ marginBottom: '1rem' }}>
              <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '0.35rem' }}>
                Select Existing Requirement to Amend
              </label>
              <select
                value={targetReqId}
                onChange={e => setTargetReqId(e.target.value)}
              >
                <option value="">Choose requirement...</option>
                {projectReqs.map(r => (
                  <option key={r.id} value={r.id}>
                    [{r.code}] {r.title}
                  </option>
                ))}
              </select>
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '0.35rem' }}>
                  New Requirement Name
                </label>
                <input
                  type="text"
                  value={newReqTitle}
                  onChange={e => setNewReqTitle(e.target.value)}
                  placeholder="Leave empty to use CR title"
                />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '0.35rem' }}>
                  Category
                </label>
                <input
                  type="text"
                  value={newReqCategory}
                  onChange={e => setNewReqCategory(e.target.value)}
                  placeholder="e.g. Integrations"
                />
              </div>
            </div>
          )}

          <div style={{ marginBottom: '1rem' }}>
            <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '0.35rem' }}>
              Detailed Description of Change *
            </label>
            <textarea
              rows={2}
              required
              value={description}
              onChange={e => setDescription(e.target.value)}
              placeholder="What specifically needs to be altered or implemented..."
            />
          </div>

          <div style={{ marginBottom: '1.25rem' }}>
            <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '0.35rem' }}>
              Business Justification / Root Cause Reason *
            </label>
            <input
              type="text"
              required
              value={reason}
              onChange={e => setReason(e.target.value)}
              placeholder="e.g. Mandated by Client security audit / unexpected third-party API deprecation"
            />
          </div>

          {/* Quantified Impact Engine (Key PDF requirement!) */}
          <div style={{
            background: 'var(--bg-glass)',
            border: '1px solid var(--border-medium)',
            borderRadius: 'var(--radius-md)',
            padding: '1.1rem',
            marginBottom: '1.5rem',
          }}>
            <div style={{ fontWeight: 600, fontSize: '0.85rem', marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <Sparkles size={15} color="var(--accent-cyan)" />
              Automated Impact Quantification Engine
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.76rem', color: 'var(--text-secondary)', marginBottom: '0.3rem' }}>
                  Effort Impact (Hours)
                </label>
                <div style={{ position: 'relative' }}>
                  <input
                    type="number"
                    value={effortHours}
                    onChange={e => handleEffortChange(Number(e.target.value))}
                  />
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.76rem', color: 'var(--text-secondary)', marginBottom: '0.3rem' }}>
                  Schedule Shift (+Days)
                </label>
                <input
                  type="number"
                  value={scheduleDays}
                  onChange={e => setScheduleDays(Number(e.target.value))}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.76rem', color: 'var(--text-secondary)', marginBottom: '0.3rem' }}>
                  Budget Impact ($ USD)
                </label>
                <input
                  type="number"
                  value={costImpact}
                  onChange={e => setCostImpact(Number(e.target.value))}
                />
              </div>
            </div>
          </div>

          {/* Footer */}
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem' }}>
            <button
              type="button"
              onClick={onClose}
              style={{
                padding: '0.6rem 1.15rem',
                borderRadius: 'var(--radius-md)',
                border: '1px solid var(--border-medium)',
                color: 'var(--text-secondary)',
                fontSize: '0.85rem',
              }}
            >
              Cancel
            </button>
            <button
              type="submit"
              style={{
                padding: '0.6rem 1.5rem',
                borderRadius: 'var(--radius-md)',
                background: 'var(--accent-primary)',
                color: '#ffffff',
                fontSize: '0.85rem',
                fontWeight: 600,
                boxShadow: 'var(--shadow-glow)',
              }}
            >
              Submit Change Request for Client Signoff
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

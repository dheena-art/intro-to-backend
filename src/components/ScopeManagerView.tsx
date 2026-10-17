import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Requirement, ScopeVersion, ContractType } from '../types';
import {
  FileText,
  Plus,
  CheckCircle2,
  XCircle,
  FileCheck2,
  Clock,
  Filter,
  Search,
  ArrowRight,
  Shield,
  Layers,
  History,
  Tag,
  AlertCircle,
  Edit2,
  ArrowUpRight,
} from 'lucide-react';

export const ScopeManagerView: React.FC = () => {
  const {
    activeProject,
    scopeVersions,
    requirements,
    currentUser,
    addRequirement,
    updateRequirement,
    toggleRequirementInScope,
    createScopeVersion,
    generateContractFromScope,
    setActiveTab,
    setSelectedContractId,
  } = useApp();

  const projectVersions = scopeVersions.filter(sv => sv.projectId === activeProject.id);
  const [selectedVersionId, setSelectedVersionId] = useState<string>(
    activeProject.activeScopeVersionId || (projectVersions[0]?.id ?? '')
  );

  const activeVersion =
    projectVersions.find(v => v.id === selectedVersionId) || projectVersions[0];

  const versionReqs = requirements.filter(r => r.scopeVersionId === activeVersion?.id);

  const [activeSubTab, setActiveSubTab] = useState<'inScope' | 'outOfScope'>('inScope');
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('ALL');

  // Modals state
  const [showAddModal, setShowAddModal] = useState(false);
  const [showVersionModal, setShowVersionModal] = useState(false);
  const [showGenContractModal, setShowGenContractModal] = useState(false);

  // Add requirement form
  const [reqTitle, setReqTitle] = useState('');
  const [reqCategory, setReqCategory] = useState('Core Architecture');
  const [reqDescription, setReqDescription] = useState('');
  const [reqPriority, setReqPriority] = useState<'HIGH' | 'MEDIUM' | 'LOW'>('HIGH');
  const [reqEffort, setReqEffort] = useState(80);
  const [reqCriteria, setReqCriteria] = useState('');
  const [reqIsInScope, setReqIsInScope] = useState(true);
  const [reqOosReason, setReqOosReason] = useState('');

  // Version creation form
  const [newVersionTitle, setNewVersionTitle] = useState('');
  const [newVersionDesc, setNewVersionDesc] = useState('');

  // Filtered requirements
  const inScopeItems = versionReqs.filter(r => r.isInScope);
  const outOfScopeItems = versionReqs.filter(r => !r.isInScope);

  const displayedList = (activeSubTab === 'inScope' ? inScopeItems : outOfScopeItems).filter(
    item => {
      const matchesSearch =
        item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.description.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCategory = categoryFilter === 'ALL' || item.category === categoryFilter;
      return matchesSearch && matchesCategory;
    }
  );

  const categories = Array.from(new Set(versionReqs.map(r => r.category)));

  const handleAddSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!reqTitle.trim() || !activeVersion) return;

    addRequirement({
      scopeVersionId: activeVersion.id,
      title: reqTitle,
      category: reqCategory,
      description: reqDescription,
      priority: reqPriority,
      estimatedEffort: Number(reqEffort),
      acceptanceCriteria: reqCriteria || 'Acceptance criteria to be validated by QA test suite.',
      isInScope: reqIsInScope,
      outOfScopeReason: reqIsInScope ? undefined : reqOosReason,
      status: 'BASELINE',
    });

    // Reset
    setReqTitle('');
    setReqDescription('');
    setReqCriteria('');
    setReqOosReason('');
    setShowAddModal(false);
  };

  const handleCreateVersion = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newVersionTitle.trim()) return;

    const newVer = createScopeVersion(newVersionTitle, newVersionDesc);
    setSelectedVersionId(newVer.id);
    setNewVersionTitle('');
    setNewVersionDesc('');
    setShowVersionModal(false);
  };

  const handleGenerateContract = (type: ContractType) => {
    if (!activeVersion) return;
    const ctr = generateContractFromScope(
      activeVersion.id,
      type,
      `${type === 'MSA' ? 'Master Services Agreement & SOW' : type} (${activeVersion.version})`
    );
    setShowGenContractModal(false);
    setSelectedContractId(ctr.id);
    setActiveTab('contracts');
  };

  return (
    <div style={{ padding: '1.75rem', maxWidth: '1440px', margin: '0 auto' }}>
      {/* Scope Versions Selector & Action Bar */}
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
            <h2 style={{ fontSize: '1.35rem', fontWeight: 700 }}>Scope Baseline & Boundaries</h2>
            <span className={`badge ${activeVersion?.status === 'APPROVED' ? 'badge-emerald' : activeVersion?.status === 'DRAFT' ? 'badge-amber' : 'badge-purple'}`}>
              {activeVersion?.status}
            </span>
          </div>
          <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', marginTop: '0.2rem' }}>
            Project: <strong>{activeProject.name}</strong> • Total Estimated Effort:{' '}
            <strong>{inScopeItems.reduce((acc, r) => acc + r.estimatedEffort, 0)} hours</strong>
          </p>
        </div>

        <div style={{ display: 'flex', gap: '0.65rem' }}>
          <button
            onClick={() => setShowAddModal(true)}
            style={{
              padding: '0.55rem 1rem',
              borderRadius: 'var(--radius-md)',
              background: 'var(--accent-primary)',
              color: '#ffffff',
              fontSize: '0.84rem',
              fontWeight: 600,
              display: 'flex',
              alignItems: 'center',
              gap: '0.4rem',
              boxShadow: 'var(--shadow-glow)',
            }}
          >
            <Plus size={15} /> Add Requirement
          </button>

          <button
            onClick={() => setShowVersionModal(true)}
            style={{
              padding: '0.55rem 1rem',
              borderRadius: 'var(--radius-md)',
              background: 'var(--bg-card)',
              border: '1px solid var(--border-medium)',
              color: 'var(--text-primary)',
              fontSize: '0.84rem',
              fontWeight: 500,
              display: 'flex',
              alignItems: 'center',
              gap: '0.4rem',
            }}
          >
            <History size={15} color="var(--accent-cyan)" /> Lock New Version
          </button>

          <button
            onClick={() => setShowGenContractModal(true)}
            style={{
              padding: '0.55rem 1rem',
              borderRadius: 'var(--radius-md)',
              background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.2) 0%, rgba(6, 182, 212, 0.2) 100%)',
              border: '1px solid rgba(16, 185, 129, 0.4)',
              color: 'var(--text-primary)',
              fontSize: '0.84rem',
              fontWeight: 600,
              display: 'flex',
              alignItems: 'center',
              gap: '0.4rem',
            }}
          >
            <FileCheck2 size={15} color="var(--accent-emerald)" /> Auto-Generate Contract
          </button>
        </div>
      </div>

      {/* Scope Version Tabs Header */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: '0.5rem',
        borderBottom: '1px solid var(--border-subtle)',
        marginBottom: '1.25rem',
        paddingBottom: '0.5rem',
        overflowX: 'auto',
      }}>
        <div style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)', textTransform: 'uppercase', marginRight: '0.5rem' }}>
          Version History:
        </div>
        {projectVersions.map(sv => {
          const isSelected = sv.id === activeVersion?.id;
          return (
            <button
              key={sv.id}
              onClick={() => setSelectedVersionId(sv.id)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                padding: '0.45rem 0.85rem',
                borderRadius: 'var(--radius-md)',
                background: isSelected ? 'var(--bg-card-hover)' : 'var(--bg-card)',
                border: isSelected ? '1px solid var(--accent-primary)' : '1px solid var(--border-subtle)',
                color: isSelected ? 'var(--text-primary)' : 'var(--text-secondary)',
                fontSize: '0.82rem',
                fontWeight: isSelected ? 600 : 500,
              }}
            >
              <span>{sv.version}</span>
              <span style={{ fontSize: '0.72rem', color: 'var(--text-tertiary)' }}>
                {sv.title.slice(0, 24)}...
              </span>
              <span className={`badge ${sv.status === 'APPROVED' ? 'badge-emerald' : sv.status === 'DRAFT' ? 'badge-amber' : 'badge-purple'}`} style={{ fontSize: '0.62rem' }}>
                {sv.status}
              </span>
            </button>
          );
        })}
      </div>

      {/* Active Version Description & Meta */}
      {activeVersion && (
        <div style={{
          background: 'var(--bg-card)',
          border: '1px solid var(--border-subtle)',
          borderRadius: 'var(--radius-md)',
          padding: '1rem 1.25rem',
          marginBottom: '1.5rem',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '1rem',
        }}>
          <div>
            <div style={{ fontWeight: 600, fontSize: '0.92rem' }}>
              {activeVersion.version}: {activeVersion.title}
            </div>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '0.15rem' }}>
              {activeVersion.description}
            </div>
          </div>
          <div style={{ fontSize: '0.74rem', color: 'var(--text-tertiary)', textAlign: 'right' }}>
            <div>Created by: <strong>{activeVersion.createdBy}</strong></div>
            <div>Timestamp: {new Date(activeVersion.createdAt).toLocaleDateString()}</div>
          </div>
        </div>
      )}

      {/* Dual Tabs: In-Scope vs Out-of-Scope (Key PDF specification!) */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <button
            onClick={() => setActiveSubTab('inScope')}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.45rem',
              padding: '0.6rem 1.15rem',
              borderRadius: 'var(--radius-md)',
              background: activeSubTab === 'inScope' ? 'rgba(16, 185, 129, 0.15)' : 'var(--bg-card)',
              color: activeSubTab === 'inScope' ? '#34d399' : 'var(--text-secondary)',
              border: activeSubTab === 'inScope' ? '1px solid rgba(16, 185, 129, 0.3)' : '1px solid var(--border-subtle)',
              fontSize: '0.86rem',
              fontWeight: 600,
            }}
          >
            <CheckCircle2 size={16} /> In-Scope Deliverables ({inScopeItems.length})
          </button>
          <button
            onClick={() => setActiveSubTab('outOfScope')}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.45rem',
              padding: '0.6rem 1.15rem',
              borderRadius: 'var(--radius-md)',
              background: activeSubTab === 'outOfScope' ? 'rgba(244, 63, 94, 0.15)' : 'var(--bg-card)',
              color: activeSubTab === 'outOfScope' ? '#fb7185' : 'var(--text-secondary)',
              border: activeSubTab === 'outOfScope' ? '1px solid rgba(244, 63, 94, 0.3)' : '1px solid var(--border-subtle)',
              fontSize: '0.86rem',
              fontWeight: 600,
            }}
          >
            <XCircle size={16} /> Out-of-Scope Exclusions ({outOfScopeItems.length})
          </button>
        </div>

        {/* Filters */}
        <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
          <div style={{ position: 'relative', width: '220px' }}>
            <Search size={14} style={{ position: 'absolute', left: '10px', top: '10px', color: 'var(--text-tertiary)' }} />
            <input
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="Filter requirements..."
              style={{ paddingLeft: '32px', fontSize: '0.8rem', padding: '0.45rem 0.45rem 0.45rem 32px' }}
            />
          </div>

          <select
            value={categoryFilter}
            onChange={e => setCategoryFilter(e.target.value)}
            style={{ width: 'auto', fontSize: '0.8rem', padding: '0.45rem 0.75rem' }}
          >
            <option value="ALL">All Categories</option>
            {categories.map(c => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Requirements Table */}
      <div className="glass-panel" style={{ overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.84rem' }}>
          <thead>
            <tr style={{ background: 'var(--bg-secondary)', borderBottom: '1px solid var(--border-medium)', color: 'var(--text-tertiary)', fontSize: '0.74rem', textTransform: 'uppercase' }}>
              <th style={{ padding: '0.85rem 1rem' }}>Code</th>
              <th style={{ padding: '0.85rem 1rem' }}>Requirement & Scope Specification</th>
              <th style={{ padding: '0.85rem 1rem' }}>Category</th>
              <th style={{ padding: '0.85rem 1rem' }}>Priority</th>
              <th style={{ padding: '0.85rem 1rem' }}>Effort</th>
              {activeSubTab === 'inScope' ? (
                <th style={{ padding: '0.85rem 1rem' }}>Acceptance Criteria</th>
              ) : (
                <th style={{ padding: '0.85rem 1rem' }}>Out-of-Scope Boundary Rationale</th>
              )}
              <th style={{ padding: '0.85rem 1rem', textAlign: 'right' }}>Action</th>
            </tr>
          </thead>
          <tbody>
            {displayedList.length === 0 ? (
              <tr>
                <td colSpan={7} style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-tertiary)' }}>
                  No requirements match the active filters.
                </td>
              </tr>
            ) : (
              displayedList.map(req => {
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

                    <td style={{ padding: '0.85rem 1rem', maxWidth: '320px' }}>
                      <div style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{req.title}</div>
                      <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', marginTop: '0.2rem', lineHeight: 1.35 }}>
                        {req.description}
                      </div>
                      {req.sourceCrId && (
                        <div style={{ marginTop: '0.35rem' }}>
                          <span className="badge badge-amber" style={{ fontSize: '0.62rem' }}>
                            Added via {req.sourceCrId.toUpperCase()}
                          </span>
                        </div>
                      )}
                    </td>

                    <td style={{ padding: '0.85rem 1rem', whiteSpace: 'nowrap' }}>
                      <span className="badge badge-blue">{req.category}</span>
                    </td>

                    <td style={{ padding: '0.85rem 1rem', whiteSpace: 'nowrap' }}>
                      <span
                        className={`badge ${
                          req.priority === 'HIGH'
                            ? 'badge-rose'
                            : req.priority === 'MEDIUM'
                            ? 'badge-amber'
                            : 'badge-cyan'
                        }`}
                      >
                        {req.priority}
                      </span>
                    </td>

                    <td style={{ padding: '0.85rem 1rem', whiteSpace: 'nowrap' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                        <Clock size={13} color="var(--text-tertiary)" />
                        <span>{req.estimatedEffort} hrs</span>
                      </div>
                    </td>

                    {activeSubTab === 'inScope' ? (
                      <td style={{ padding: '0.85rem 1rem', fontSize: '0.78rem', color: 'var(--text-secondary)', maxWidth: '300px' }}>
                        {req.acceptanceCriteria}
                      </td>
                    ) : (
                      <td style={{ padding: '0.85rem 1rem', fontSize: '0.78rem', color: 'var(--accent-rose)', maxWidth: '300px' }}>
                        <strong>Boundary:</strong> {req.outOfScopeReason || 'Excluded from current statement of work.'}
                      </td>
                    )}

                    <td style={{ padding: '0.85rem 1rem', textAlign: 'right', whiteSpace: 'nowrap' }}>
                      <button
                        onClick={() => toggleRequirementInScope(req.id)}
                        style={{
                          padding: '0.35rem 0.75rem',
                          borderRadius: 'var(--radius-sm)',
                          background: 'var(--bg-secondary)',
                          border: '1px solid var(--border-medium)',
                          color: req.isInScope ? 'var(--accent-rose)' : 'var(--accent-emerald)',
                          fontSize: '0.75rem',
                          fontWeight: 500,
                        }}
                        title={req.isInScope ? 'Move to Out-of-Scope Exclusions' : 'Promote to In-Scope'}
                      >
                        {req.isInScope ? 'Exclude Scope' : 'Move In-Scope'}
                      </button>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Add Requirement Modal */}
      {showAddModal && (
        <div className="modal-overlay" onClick={() => setShowAddModal(false)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <div style={{ padding: '1.25rem 1.5rem', borderBottom: '1px solid var(--border-subtle)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Plus size={20} color="var(--accent-primary)" />
                <h3 style={{ fontSize: '1.1rem', fontWeight: 600 }}>Add New Requirement Specification</h3>
              </div>
              <button onClick={() => setShowAddModal(false)} style={{ color: 'var(--text-tertiary)' }}>
                ✕
              </button>
            </div>

            <form onSubmit={handleAddSubmit} style={{ padding: '1.5rem' }}>
              <div style={{ marginBottom: '1rem' }}>
                <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '0.3rem' }}>
                  Requirement Title *
                </label>
                <input
                  type="text"
                  required
                  value={reqTitle}
                  onChange={e => setReqTitle(e.target.value)}
                  placeholder="e.g. Automated ISO 20022 XML Settlement Messaging"
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '0.3rem' }}>
                    Category
                  </label>
                  <input
                    type="text"
                    value={reqCategory}
                    onChange={e => setReqCategory(e.target.value)}
                    placeholder="e.g. Core Architecture"
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '0.3rem' }}>
                    Priority
                  </label>
                  <select
                    value={reqPriority}
                    onChange={e => setReqPriority(e.target.value as any)}
                  >
                    <option value="HIGH">HIGH Priority</option>
                    <option value="MEDIUM">MEDIUM Priority</option>
                    <option value="LOW">LOW Priority</option>
                  </select>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '0.3rem' }}>
                    Estimated Effort (Hours)
                  </label>
                  <input
                    type="number"
                    value={reqEffort}
                    onChange={e => setReqEffort(Number(e.target.value))}
                  />
                </div>
              </div>

              <div style={{ marginBottom: '1rem' }}>
                <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '0.3rem' }}>
                  Functional Specification & Description
                </label>
                <textarea
                  rows={2}
                  value={reqDescription}
                  onChange={e => setReqDescription(e.target.value)}
                  placeholder="Detailed functional and technical scope description..."
                />
              </div>

              {/* Scope Boundary Toggle */}
              <div style={{
                background: 'var(--bg-glass)',
                border: '1px solid var(--border-medium)',
                borderRadius: 'var(--radius-md)',
                padding: '0.9rem',
                marginBottom: '1rem'
              }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', cursor: 'pointer', fontSize: '0.85rem', fontWeight: 600 }}>
                  <input
                    type="checkbox"
                    checked={reqIsInScope}
                    onChange={e => setReqIsInScope(e.target.checked)}
                    style={{ width: 'auto' }}
                  />
                  <span>Mark as In-Scope Deliverable (Default)</span>
                </label>

                {!reqIsInScope && (
                  <div style={{ marginTop: '0.75rem' }}>
                    <label style={{ display: 'block', fontSize: '0.78rem', color: 'var(--accent-rose)', marginBottom: '0.3rem' }}>
                      Explicit Out-of-Scope Boundary Rationale *
                    </label>
                    <input
                      type="text"
                      required={!reqIsInScope}
                      value={reqOosReason}
                      onChange={e => setReqOosReason(e.target.value)}
                      placeholder="e.g. Deferred to Phase 2; hardware dependency handled by client team"
                    />
                  </div>
                )}
              </div>

              {reqIsInScope && (
                <div style={{ marginBottom: '1.25rem' }}>
                  <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '0.3rem' }}>
                    Acceptance Criteria (Measurable IEEE test condition)
                  </label>
                  <textarea
                    rows={2}
                    value={reqCriteria}
                    onChange={e => setReqCriteria(e.target.value)}
                    placeholder="Must sustain 10,000 tx/sec with zero latency regression under load test..."
                  />
                </div>
              )}

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem' }}>
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  style={{
                    padding: '0.6rem 1.1rem',
                    borderRadius: 'var(--radius-md)',
                    border: '1px solid var(--border-medium)',
                    color: 'var(--text-secondary)',
                    fontSize: '0.85rem'
                  }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  style={{
                    padding: '0.6rem 1.4rem',
                    borderRadius: 'var(--radius-md)',
                    background: 'var(--accent-primary)',
                    color: '#ffffff',
                    fontSize: '0.85rem',
                    fontWeight: 600,
                  }}
                >
                  Save to Scope Baseline
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Lock New Scope Version Modal */}
      {showVersionModal && (
        <div className="modal-overlay" onClick={() => setShowVersionModal(false)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <div style={{ padding: '1.25rem 1.5rem', borderBottom: '1px solid var(--border-subtle)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <History size={20} color="var(--accent-cyan)" />
                <h3 style={{ fontSize: '1.1rem', fontWeight: 600 }}>Lock New Scope Version Baseline</h3>
              </div>
              <button onClick={() => setShowVersionModal(false)} style={{ color: 'var(--text-tertiary)' }}>✕</button>
            </div>

            <form onSubmit={handleCreateVersion} style={{ padding: '1.5rem' }}>
              <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', marginBottom: '1.25rem' }}>
                Locking this scope snapshot creates an immutable new baseline version. Prior requirements will be cloned and the new version will become active.
              </p>

              <div style={{ marginBottom: '1rem' }}>
                <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '0.3rem' }}>
                  Version Title *
                </label>
                <input
                  type="text"
                  required
                  value={newVersionTitle}
                  onChange={e => setNewVersionTitle(e.target.value)}
                  placeholder="e.g. Scope Revision v1.2 (Security Hardening)"
                />
              </div>

              <div style={{ marginBottom: '1.25rem' }}>
                <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '0.3rem' }}>
                  Changelog & Baseline Release Notes
                </label>
                <textarea
                  rows={3}
                  value={newVersionDesc}
                  onChange={e => setNewVersionDesc(e.target.value)}
                  placeholder="Summary of modifications, additions, or governance approvals..."
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem' }}>
                <button
                  type="button"
                  onClick={() => setShowVersionModal(false)}
                  style={{
                    padding: '0.6rem 1.1rem',
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
                    padding: '0.6rem 1.4rem',
                    borderRadius: 'var(--radius-md)',
                    background: 'var(--accent-cyan)',
                    color: '#0f172a',
                    fontWeight: 600,
                  }}
                >
                  Lock Baseline Snapshot
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Auto-Generate Contract Modal */}
      {showGenContractModal && (
        <div className="modal-overlay" onClick={() => setShowGenContractModal(false)}>
          <div className="modal-content" style={{ maxWidth: '560px' }} onClick={e => e.stopPropagation()}>
            <div style={{ padding: '1.25rem 1.5rem', borderBottom: '1px solid var(--border-subtle)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <FileCheck2 size={20} color="var(--accent-emerald)" />
                <h3 style={{ fontSize: '1.1rem', fontWeight: 600 }}>Contract Templating Engine</h3>
              </div>
              <button onClick={() => setShowGenContractModal(false)} style={{ color: 'var(--text-tertiary)' }}>✕</button>
            </div>

            <div style={{ padding: '1.5rem' }}>
              <p style={{ fontSize: '0.84rem', color: 'var(--text-secondary)', marginBottom: '1.25rem' }}>
                Auto-generate a legally binding contract draft directly from Scope Document <strong>{activeVersion?.version}</strong> ({inScopeItems.length} deliverables, {outOfScopeItems.length} exclusions).
              </p>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
                <button
                  onClick={() => handleGenerateContract('MSA')}
                  style={{
                    padding: '1rem',
                    borderRadius: 'var(--radius-md)',
                    background: 'var(--bg-card)',
                    border: '1px solid var(--border-medium)',
                    color: 'var(--text-primary)',
                    textAlign: 'left',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                  }}
                >
                  <div>
                    <div style={{ fontWeight: 600, fontSize: '0.9rem' }}>Master Services Agreement & SOW</div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)' }}>
                      Full legal contract with IP terms, SLA, warranty, and change control procedures.
                    </div>
                  </div>
                  <ArrowRight size={16} color="var(--accent-emerald)" />
                </button>

                <button
                  onClick={() => handleGenerateContract('SOW')}
                  style={{
                    padding: '1rem',
                    borderRadius: 'var(--radius-md)',
                    background: 'var(--bg-card)',
                    border: '1px solid var(--border-medium)',
                    color: 'var(--text-primary)',
                    textAlign: 'left',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                  }}
                >
                  <div>
                    <div style={{ fontWeight: 600, fontSize: '0.9rem' }}>Statement of Work (SOW Only)</div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)' }}>
                      Detailed deliverables matrix, milestone payment schedules, and acceptance criteria.
                    </div>
                  </div>
                  <ArrowRight size={16} color="var(--accent-primary)" />
                </button>

                <button
                  onClick={() => handleGenerateContract('ADDENDUM')}
                  style={{
                    padding: '1rem',
                    borderRadius: 'var(--radius-md)',
                    background: 'var(--bg-card)',
                    border: '1px solid var(--border-medium)',
                    color: 'var(--text-primary)',
                    textAlign: 'left',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                  }}
                >
                  <div>
                    <div style={{ fontWeight: 600, fontSize: '0.9rem' }}>Contract Addendum / Amendment</div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)' }}>
                      Ties directly to master agreement for incremental scope and fee adjustments.
                    </div>
                  </div>
                  <ArrowRight size={16} color="var(--accent-amber)" />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

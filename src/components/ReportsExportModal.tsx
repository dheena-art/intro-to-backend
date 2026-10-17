import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { X, FileSpreadsheet, Printer, Download, Check, ShieldCheck } from 'lucide-react';

interface ReportsExportModalProps {
  onClose: () => void;
}

export const ReportsExportModal: React.FC<ReportsExportModalProps> = ({ onClose }) => {
  const { activeProject, requirements, changeRequests, contracts, scopeVersions } = useApp();
  const [downloadSuccess, setDownloadSuccess] = useState(false);

  const projectReqs = requirements.filter(
    r => r.scopeVersionId === activeProject.activeScopeVersionId
  );
  const inScope = projectReqs.filter(r => r.isInScope);
  const outOfScope = projectReqs.filter(r => !r.isInScope);
  const projectCrs = changeRequests.filter(cr => cr.projectId === activeProject.id);
  const approvedCrs = projectCrs.filter(cr => cr.status === 'CLIENT_APPROVED');

  const handleDownloadCsv = () => {
    // Generate CSV data
    const headers = ['Code', 'Title', 'Category', 'Priority', 'Effort Hours', 'Boundary', 'Status', 'CR Reference'];
    const rows = projectReqs.map(r => [
      `"${r.code}"`,
      `"${r.title.replace(/"/g, '""')}"`,
      `"${r.category}"`,
      `"${r.priority}"`,
      r.estimatedEffort,
      r.isInScope ? '"IN_SCOPE"' : '"OUT_OF_SCOPE"',
      `"${r.status}"`,
      `"${r.sourceCrId || 'BASELINE'}"`,
    ]);

    const csvContent = [headers.join(','), ...rows.map(row => row.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `ScopeLock_${activeProject.code}_Scope_Report.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    setDownloadSuccess(true);
    setTimeout(() => setDownloadSuccess(false), 3000);
  };

  const handlePrintSummary = () => {
    window.print();
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" style={{ maxWidth: '640px' }} onClick={e => e.stopPropagation()}>
        {/* Header */}
        <div style={{
          padding: '1.25rem 1.5rem',
          borderBottom: '1px solid var(--border-subtle)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <FileSpreadsheet size={22} color="var(--accent-emerald)" />
            <div>
              <h3 style={{ fontSize: '1.15rem', fontWeight: 600 }}>Executive Scope & Cost Reporting</h3>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                Export offline records for audit committees and client review
              </p>
            </div>
          </div>
          <button onClick={onClose} style={{ color: 'var(--text-tertiary)', padding: '0.3rem' }}>
            <X size={18} />
          </button>
        </div>

        {/* Content */}
        <div style={{ padding: '1.5rem' }}>
          {/* Executive Overview Box */}
          <div style={{
            background: 'var(--bg-glass)',
            border: '1px solid var(--border-subtle)',
            borderRadius: 'var(--radius-md)',
            padding: '1rem',
            marginBottom: '1.5rem',
            fontSize: '0.84rem'
          }}>
            <div style={{ fontWeight: 600, fontSize: '0.92rem', marginBottom: '0.4rem' }}>
              {activeProject.name} ({activeProject.code})
            </div>
            <div style={{ color: 'var(--text-secondary)', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem' }}>
              <div>Client: <strong>{activeProject.clientOrg}</strong></div>
              <div>Pricing Model: <strong>{activeProject.pricingModel}</strong></div>
              <div>Base Budget: <strong>${activeProject.baseBudget.toLocaleString()}</strong></div>
              <div>Committed Budget: <strong>${activeProject.currentBudget.toLocaleString()}</strong></div>
              <div>In-Scope Deliverables: <strong>{inScope.length}</strong></div>
              <div>Out-of-Scope Exclusions: <strong>{outOfScope.length}</strong></div>
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {/* Option 1: CSV / Excel Export */}
            <div style={{
              padding: '1.25rem',
              borderRadius: 'var(--radius-md)',
              background: 'var(--bg-card)',
              border: '1px solid var(--border-medium)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between'
            }}>
              <div>
                <div style={{ fontWeight: 600, fontSize: '0.9rem' }}>Export to CSV / Excel Spreadsheet</div>
                <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', marginTop: '0.15rem' }}>
                  Includes all requirements, effort hours, status, CR IDs, and cost breakdown columns.
                </div>
              </div>
              <button
                onClick={handleDownloadCsv}
                style={{
                  padding: '0.55rem 1.15rem',
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
                {downloadSuccess ? <Check size={16} /> : <Download size={16} />}
                {downloadSuccess ? 'Downloaded!' : 'Download .CSV'}
              </button>
            </div>

            {/* Option 2: Printable PDF Report */}
            <div style={{
              padding: '1.25rem',
              borderRadius: 'var(--radius-md)',
              background: 'var(--bg-card)',
              border: '1px solid var(--border-medium)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between'
            }}>
              <div>
                <div style={{ fontWeight: 600, fontSize: '0.9rem' }}>Printable Executive Briefing (PDF)</div>
                <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', marginTop: '0.15rem' }}>
                  Formatted executive summary with approved addenda, schedule shift, and DocuSign stamp.
                </div>
              </div>
              <button
                onClick={handlePrintSummary}
                style={{
                  padding: '0.55rem 1.15rem',
                  borderRadius: 'var(--radius-md)',
                  background: 'var(--bg-secondary)',
                  border: '1px solid var(--border-medium)',
                  color: 'var(--text-primary)',
                  fontSize: '0.84rem',
                  fontWeight: 500,
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.4rem',
                }}
              >
                <Printer size={16} /> Print / Save PDF
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

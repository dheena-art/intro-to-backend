import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Contract, ContractClause } from '../types';
import {
  FileText,
  PenTool,
  Printer,
  ShieldCheck,
  Edit3,
  GitCompare,
  Sparkles,
} from 'lucide-react';
import { SignatureModal } from './SignatureModal';

// Typography & Appearance Presets for the Letter
const FONT_FAMILIES = {
  'modern-sans': "'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
  'editorial-serif': "'Merriweather', 'Lora', Georgia, 'Times New Roman', serif",
  'humanist-sans': "'DM Sans', -apple-system, BlinkMacSystemFont, sans-serif",
  'classic-formal': "'Times New Roman', Times, serif",
};

const FONT_SIZES = {
  compact: '0.88rem',
  standard: '1rem',
  comfortable: '1.12rem',
  large: '1.24rem',
};

export const ContractsView: React.FC = () => {
  const {
    contracts,
    activeProject,
    currentUser,
    selectedContractId,
    setSelectedContractId,
    updateContractClause,
  } = useApp();

  const projectContracts = contracts.filter(c => c.projectId === activeProject.id);
  const activeContractId = selectedContractId || projectContracts[0]?.id;
  const currentContract = projectContracts.find(c => c.id === activeContractId) || projectContracts[0];

  const [activeTabMode, setActiveTabMode] = useState<'document' | 'redlining'>('document');
  const [editingClauseId, setEditingClauseId] = useState<string | null>(null);
  const [editedClauseContent, setEditedClauseContent] = useState('');
  const [redlineNote, setRedlineNote] = useState('');
  const [showSignModal, setShowSignModal] = useState(false);
  const [filterType, setFilterType] = useState('ALL');

  // Letter Typography & Humanization States
  const [docToneMode, setDocToneMode] = useState<'humanized' | 'traditional'>('humanized');
  const [docFontStyle, setDocFontStyle] = useState<'modern-sans' | 'editorial-serif' | 'humanist-sans' | 'classic-formal'>('modern-sans');
  const [docFontSize, setDocFontSize] = useState<'compact' | 'standard' | 'comfortable' | 'large'>('standard');
  const [docPaperTheme, setDocPaperTheme] = useState<'paper-modern' | 'paper-warm' | 'paper-minimal'>('paper-modern');

  const filteredContracts = projectContracts.filter(c => {
    if (filterType === 'ALL') return true;
    return c.contractType === filterType;
  });

  const handleStartEditClause = (clause: ContractClause) => {
    setEditingClauseId(clause.id);
    setEditedClauseContent(docToneMode === 'humanized' ? (clause.humanizedContent || clause.content) : clause.content);
    setRedlineNote(clause.redlineNote || '');
  };

  const handleSaveClause = (clauseId: string) => {
    if (!currentContract) return;
    updateContractClause(currentContract.id, clauseId, editedClauseContent, redlineNote);
    setEditingClauseId(null);
  };

  const handlePrint = () => {
    window.print();
  };

  const isExecuted = currentContract?.signingStatus === 'FULLY_EXECUTED';
  const hasClientSigned = Boolean(currentContract?.clientSigner?.signedDate);
  const hasVendorSigned = Boolean(currentContract?.vendorSigner?.signedDate);

  const canSign =
    (currentUser.role === 'CLIENT_SIGNER' && !hasClientSigned) ||
    ((currentUser.role === 'PROJECT_MANAGER' || currentUser.role === 'LEGAL_COUNSEL') && !hasVendorSigned);

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
            <h2 style={{ fontSize: '1.35rem', fontWeight: 700 }}>Contract & E-Signature Lifecycle Hub</h2>
            <span className="badge badge-blue">DocuSign Certified</span>
            <span className="badge badge-emerald">
              {docToneMode === 'humanized' ? 'Plain-English Active' : 'Formal Statutory'}
            </span>
          </div>
          <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', marginTop: '0.2rem' }}>
            Humanized Plain-Language Drafting • Dynamic Letter Styling • Collaborative Redlining • Digital Signatures
          </p>
        </div>

        {currentContract && (
          <div style={{ display: 'flex', gap: '0.65rem' }}>
            <button
              onClick={handlePrint}
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
              <Printer size={15} /> Print / Save PDF
            </button>

            {canSign && (
              <button
                onClick={() => setShowSignModal(true)}
                style={{
                  padding: '0.55rem 1.25rem',
                  borderRadius: 'var(--radius-md)',
                  background: 'var(--accent-primary)',
                  color: '#ffffff',
                  fontSize: '0.84rem',
                  fontWeight: 600,
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.45rem',
                  boxShadow: 'var(--shadow-glow)',
                }}
              >
                <PenTool size={15} /> Execute Digital Signature
              </button>
            )}
          </div>
        )}
      </div>

      {/* Main Grid: Left Contract List, Right Document Workspace */}
      <div style={{ display: 'grid', gridTemplateColumns: '320px 1fr', gap: '1.5rem' }}>
        {/* Left Column: Linked Contracts Tree */}
        <div>
          <div className="glass-panel" style={{ padding: '1rem', marginBottom: '1rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
              <div style={{ fontSize: '0.76rem', color: 'var(--text-tertiary)', textTransform: 'uppercase', fontWeight: 600 }}>
                Agreement Archive
              </div>
              <select
                value={filterType}
                onChange={e => setFilterType(e.target.value)}
                style={{ fontSize: '0.75rem', padding: '0.2rem 0.5rem', width: 'auto' }}
              >
                <option value="ALL">All Types</option>
                <option value="MSA">MSA</option>
                <option value="SOW">SOW</option>
                <option value="ADDENDUM">Addenda</option>
              </select>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              {filteredContracts.map(c => {
                const isSelected = c.id === currentContract?.id;
                const isFullySigned = c.signingStatus === 'FULLY_EXECUTED';
                return (
                  <button
                    key={c.id}
                    onClick={() => setSelectedContractId(c.id)}
                    style={{
                      padding: '0.8rem',
                      borderRadius: 'var(--radius-md)',
                      background: isSelected ? 'var(--bg-card-hover)' : 'var(--bg-card)',
                      border: isSelected ? '1px solid var(--accent-primary)' : '1px solid var(--border-subtle)',
                      textAlign: 'left',
                      color: 'var(--text-primary)',
                      position: 'relative',
                      transition: 'all 0.15s ease',
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.25rem' }}>
                      <span className="font-mono" style={{ fontSize: '0.74rem', color: 'var(--accent-cyan)', fontWeight: 600 }}>
                        {c.contractNumber}
                      </span>
                      <span className={`badge ${isFullySigned ? 'badge-emerald' : 'badge-amber'}`} style={{ fontSize: '0.62rem' }}>
                        {isFullySigned ? 'Executed' : 'Pending'}
                      </span>
                    </div>

                    <div style={{ fontWeight: 600, fontSize: '0.84rem', marginBottom: '0.2rem' }}>
                      {docToneMode === 'humanized' ? (c.humanizedTitle || c.title) : c.title}
                    </div>

                    {c.parentContractId && (
                      <div style={{ fontSize: '0.7rem', color: 'var(--accent-purple)', marginBottom: '0.2rem' }}>
                        ↳ Linked to Master CTR-2026-001
                      </div>
                    )}

                    <div style={{ fontSize: '0.72rem', color: 'var(--text-tertiary)', display: 'flex', justifyContent: 'space-between' }}>
                      <span>Fee: ${c.pricingTerms.baseAmount.toLocaleString()}</span>
                      <span>Due: {c.deliveryDate}</span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Quick Notice */}
          <div style={{
            background: 'var(--bg-card)',
            border: '1px solid var(--border-subtle)',
            borderRadius: 'var(--radius-md)',
            padding: '1rem',
            fontSize: '0.78rem',
            color: 'var(--text-secondary)',
          }}>
            <div style={{ fontWeight: 600, color: 'var(--text-primary)', marginBottom: '0.3rem' }}>
              🔒 Human-First & Legally Sealed
            </div>
            ScopeLock pairs plain-language, transparent terms with cryptographic SHA-256 digital seals so both clients and vendors share crystal-clear expectations.
          </div>
        </div>

        {/* Right Column: Contract Workspace */}
        {currentContract ? (
          <div>
            {/* Top Bar: View Mode Switcher + Status */}
            <div style={{
              background: 'var(--bg-card)',
              border: '1px solid var(--border-subtle)',
              borderRadius: 'var(--radius-md)',
              padding: '0.85rem 1.25rem',
              marginBottom: '1rem',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              flexWrap: 'wrap',
              gap: '0.75rem',
            }}>
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <button
                  onClick={() => setActiveTabMode('document')}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.4rem',
                    padding: '0.45rem 0.95rem',
                    borderRadius: 'var(--radius-sm)',
                    background: activeTabMode === 'document' ? 'var(--accent-primary)' : 'transparent',
                    color: activeTabMode === 'document' ? '#ffffff' : 'var(--text-secondary)',
                    fontSize: '0.82rem',
                    fontWeight: 600,
                  }}
                >
                  <FileText size={15} /> Document Sheet (Print Ready)
                </button>
                <button
                  onClick={() => setActiveTabMode('redlining')}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.4rem',
                    padding: '0.45rem 0.95rem',
                    borderRadius: 'var(--radius-sm)',
                    background: activeTabMode === 'redlining' ? 'var(--accent-primary)' : 'transparent',
                    color: activeTabMode === 'redlining' ? '#ffffff' : 'var(--text-secondary)',
                    fontSize: '0.82rem',
                    fontWeight: 600,
                  }}
                >
                  <GitCompare size={15} /> Redlining & Clause Library
                  {currentContract.clauses.some(cl => cl.isRedlined) && (
                    <span className="badge badge-amber" style={{ fontSize: '0.6rem', padding: '0.1rem 0.35rem' }}>
                      Markups
                    </span>
                  )}
                </button>
              </div>

              {/* Execution Status Stamp */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <span className={`badge ${isExecuted ? 'badge-emerald' : 'badge-amber'}`}>
                  {isExecuted ? 'Fully Executed & Sealed' : 'Awaiting Signatures'}
                </span>
                {currentContract.certificate && (
                  <span className="font-mono" style={{ fontSize: '0.72rem', color: 'var(--accent-cyan)' }}>
                    {currentContract.certificate.certificateId}
                  </span>
                )}
              </div>
            </div>

            {/* Content Area */}
            {activeTabMode === 'document' ? (
              <div>
                {/* 🌟 Interactive Letter Styling & Humanization Toolbar 🌟 */}
                <div
                  className="no-print"
                  style={{
                    background: 'var(--bg-card)',
                    border: '1px solid var(--border-medium)',
                    borderRadius: 'var(--radius-md)',
                    padding: '0.9rem 1.25rem',
                    marginBottom: '1.25rem',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    flexWrap: 'wrap',
                    gap: '1rem',
                  }}
                >
                  {/* Left: Tone Mode (Humanized vs Traditional Legal) */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
                    <div style={{ fontSize: '0.78rem', fontWeight: 600, color: 'var(--text-tertiary)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                      Tone Mode:
                    </div>
                    <div style={{
                      display: 'flex',
                      background: 'var(--bg-secondary)',
                      padding: '3px',
                      borderRadius: 'var(--radius-sm)',
                      border: '1px solid var(--border-subtle)',
                    }}>
                      <button
                        onClick={() => setDocToneMode('humanized')}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '0.4rem',
                          padding: '0.35rem 0.8rem',
                          borderRadius: 'var(--radius-xs)',
                          background: docToneMode === 'humanized' ? 'var(--accent-primary)' : 'transparent',
                          color: docToneMode === 'humanized' ? '#ffffff' : 'var(--text-secondary)',
                          fontSize: '0.8rem',
                          fontWeight: 600,
                          cursor: 'pointer',
                          transition: 'all 0.15s ease',
                          boxShadow: docToneMode === 'humanized' ? '0 1px 4px rgba(0,0,0,0.2)' : 'none',
                        }}
                      >
                        <Sparkles size={13} /> Humanized (Plain English)
                      </button>
                      <button
                        onClick={() => setDocToneMode('traditional')}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '0.4rem',
                          padding: '0.35rem 0.8rem',
                          borderRadius: 'var(--radius-xs)',
                          background: docToneMode === 'traditional' ? 'var(--accent-primary)' : 'transparent',
                          color: docToneMode === 'traditional' ? '#ffffff' : 'var(--text-secondary)',
                          fontSize: '0.8rem',
                          fontWeight: 600,
                          cursor: 'pointer',
                          transition: 'all 0.15s ease',
                          boxShadow: docToneMode === 'traditional' ? '0 1px 4px rgba(0,0,0,0.2)' : 'none',
                        }}
                      >
                        <ShieldCheck size={13} /> Traditional Legal
                      </button>
                    </div>
                  </div>

                  {/* Right: Typography Style, Letter Size, Paper Stationery */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap' }}>
                    {/* Font Style Selection */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                      <span style={{ fontSize: '0.78rem', color: 'var(--text-tertiary)', fontWeight: 500 }}>
                        Text Style:
                      </span>
                      <select
                        value={docFontStyle}
                        onChange={e => setDocFontStyle(e.target.value as any)}
                        style={{
                          fontSize: '0.78rem',
                          padding: '0.35rem 0.65rem',
                          borderRadius: 'var(--radius-sm)',
                          border: '1px solid var(--border-medium)',
                          background: 'var(--bg-secondary)',
                          color: 'var(--text-primary)',
                          cursor: 'pointer',
                          fontWeight: 500,
                        }}
                      >
                        <option value="modern-sans">Modern Sans (Plus Jakarta)</option>
                        <option value="editorial-serif">Editorial Serif (Merriweather)</option>
                        <option value="humanist-sans">Warm Humanist (DM Sans)</option>
                        <option value="classic-formal">Classic Formal (Times New Roman)</option>
                      </select>
                    </div>

                    {/* Letter Size Controls */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                      <span style={{ fontSize: '0.78rem', color: 'var(--text-tertiary)', fontWeight: 500 }}>
                        Size:
                      </span>
                      <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        border: '1px solid var(--border-medium)',
                        borderRadius: 'var(--radius-sm)',
                        background: 'var(--bg-secondary)',
                        overflow: 'hidden',
                      }}>
                        <button
                          onClick={() => {
                            if (docFontSize === 'large') setDocFontSize('comfortable');
                            else if (docFontSize === 'comfortable') setDocFontSize('standard');
                            else if (docFontSize === 'standard') setDocFontSize('compact');
                          }}
                          disabled={docFontSize === 'compact'}
                          title="Decrease letter font size"
                          style={{
                            padding: '0.35rem 0.6rem',
                            fontSize: '0.75rem',
                            fontWeight: 700,
                            color: docFontSize === 'compact' ? 'var(--text-tertiary)' : 'var(--text-secondary)',
                            cursor: docFontSize === 'compact' ? 'default' : 'pointer',
                          }}
                        >
                          A-
                        </button>
                        <span style={{
                          fontSize: '0.75rem',
                          padding: '0.35rem 0.55rem',
                          borderLeft: '1px solid var(--border-subtle)',
                          borderRight: '1px solid var(--border-subtle)',
                          color: 'var(--text-primary)',
                          fontWeight: 600,
                          minWidth: '82px',
                          textAlign: 'center',
                        }}>
                          {docFontSize === 'compact' && 'Compact'}
                          {docFontSize === 'standard' && 'Standard'}
                          {docFontSize === 'comfortable' && 'Comfortable'}
                          {docFontSize === 'large' && 'Large'}
                        </span>
                        <button
                          onClick={() => {
                            if (docFontSize === 'compact') setDocFontSize('standard');
                            else if (docFontSize === 'standard') setDocFontSize('comfortable');
                            else if (docFontSize === 'comfortable') setDocFontSize('large');
                          }}
                          disabled={docFontSize === 'large'}
                          title="Increase letter font size"
                          style={{
                            padding: '0.35rem 0.6rem',
                            fontSize: '0.85rem',
                            fontWeight: 700,
                            color: docFontSize === 'large' ? 'var(--text-tertiary)' : 'var(--text-secondary)',
                            cursor: docFontSize === 'large' ? 'default' : 'pointer',
                          }}
                        >
                          A+
                        </button>
                      </div>
                    </div>

                    {/* Paper Theme */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                      <span style={{ fontSize: '0.78rem', color: 'var(--text-tertiary)', fontWeight: 500 }}>
                        Stationery:
                      </span>
                      <select
                        value={docPaperTheme}
                        onChange={e => setDocPaperTheme(e.target.value as any)}
                        style={{
                          fontSize: '0.78rem',
                          padding: '0.35rem 0.65rem',
                          borderRadius: 'var(--radius-sm)',
                          border: '1px solid var(--border-medium)',
                          background: 'var(--bg-secondary)',
                          color: 'var(--text-primary)',
                          cursor: 'pointer',
                          fontWeight: 500,
                        }}
                      >
                        <option value="paper-modern">Modern Clean White</option>
                        <option value="paper-warm">Warm Executive Ivory</option>
                        <option value="paper-minimal">Minimalist Frameless</option>
                      </select>
                    </div>
                  </div>
                </div>

                {/* Printable / Viewable Letter Sheet */}
                <div
                  className={`legal-contract-sheet ${docPaperTheme}`}
                  style={{
                    fontFamily: FONT_FAMILIES[docFontStyle],
                    fontSize: FONT_SIZES[docFontSize],
                    lineHeight: docToneMode === 'humanized' ? 1.75 : 1.65,
                  }}
                >
                  {/* Top Letterhead Banner */}
                  <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    borderBottom: '2px solid #e2e8f0',
                    paddingBottom: '1.25rem',
                    marginBottom: '2rem',
                    flexWrap: 'wrap',
                    gap: '1rem',
                  }}>
                    <div>
                      <div style={{ fontSize: '0.72rem', letterSpacing: '0.12em', textTransform: 'uppercase', color: '#64748b', fontWeight: 700 }}>
                        {docToneMode === 'humanized' ? 'PROJECT COLLABORATION CHARTER' : 'CONFIDENTIAL LEGAL AGREEMENT'}
                      </div>
                      <div style={{ fontSize: '1.15rem', fontWeight: 700, color: '#0f172a', marginTop: '0.2rem' }}>
                        {currentContract.vendorSigner.organization} & {currentContract.clientSigner.organization}
                      </div>
                    </div>

                    <div style={{ textAlign: 'right' }}>
                      {docToneMode === 'humanized' ? (
                        <span style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '0.35rem',
                          padding: '0.25rem 0.65rem',
                          borderRadius: '9999px',
                          background: '#ecfdf5',
                          border: '1px solid #a7f3d0',
                          color: '#047857',
                          fontSize: '0.72rem',
                          fontWeight: 600,
                        }}>
                          <Sparkles size={11} /> Human-Centered Plain English
                        </span>
                      ) : (
                        <span style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '0.35rem',
                          padding: '0.25rem 0.65rem',
                          borderRadius: '9999px',
                          background: '#eff6ff',
                          border: '1px solid #bfdbfe',
                          color: '#1d4ed8',
                          fontSize: '0.72rem',
                          fontWeight: 600,
                        }}>
                          <ShieldCheck size={11} /> Statutory Legal Form
                        </span>
                      )}
                      <div style={{ fontSize: '0.75rem', color: '#64748b', marginTop: '0.3rem' }}>
                        Ref: <strong style={{ fontFamily: 'var(--font-mono)', color: '#0f172a' }}>{currentContract.contractNumber}</strong>
                      </div>
                    </div>
                  </div>

                  {/* Letter Title Header */}
                  <div style={{ textAlign: 'center', marginBottom: '2.25rem' }}>
                    <h1 style={{ fontSize: '1.85em', fontWeight: 800, margin: '0 0 0.5rem', color: '#0f172a', lineHeight: 1.25 }}>
                      {docToneMode === 'humanized'
                        ? (currentContract.humanizedTitle || currentContract.title)
                        : currentContract.title}
                    </h1>
                    <div style={{ fontSize: '0.9em', color: '#64748b' }}>
                      Agreement Reference: <strong style={{ color: '#0f172a' }}>{currentContract.contractNumber}</strong> • Effective Date:{' '}
                      <strong style={{ color: '#0f172a' }}>{currentContract.effectiveDate}</strong> • Target Delivery:{' '}
                      <strong style={{ color: '#0f172a' }}>{currentContract.deliveryDate}</strong>
                    </div>
                  </div>

                  {/* Humanized Salutation & Opening Letter Box */}
                  {docToneMode === 'humanized' ? (
                    <div className="letter-greeting-box">
                      <div style={{ fontWeight: 700, fontSize: '1.05em', marginBottom: '0.5rem', color: '#1e3a8a' }}>
                        Dear {currentContract.clientSigner.name} and the {currentContract.clientSigner.organization} Team,
                      </div>
                      <p style={{ margin: 0, whiteSpace: 'pre-line', color: '#1e293b', fontSize: '0.98em', lineHeight: 1.7 }}>
                        {currentContract.greetingLetter || `We are genuinely thrilled to partner together on ${activeProject.name}. This charter sets out what we are building together, our mutual commitments, target milestones, and clear guidelines for how we will collaborate seamlessly. We wrote this agreement in straightforward, human language so everyone shares total confidence, transparency, and alignment from day one.`}
                      </p>
                    </div>
                  ) : (
                    <div style={{ fontSize: '0.95em', marginBottom: '1.5rem', lineHeight: 1.6 }}>
                      This Agreement is entered into by and between{' '}
                      <strong>{currentContract.vendorSigner.organization}</strong> ("Vendor") and{' '}
                      <strong>{currentContract.clientSigner.organization}</strong> ("Client"), for the execution of{' '}
                      <strong>{activeProject.name}</strong>.
                    </div>
                  )}

                  {/* Executive Summary Card */}
                  <div className="letter-summary-card">
                    <div style={{ fontWeight: 700, color: '#0f172a', marginBottom: '0.35rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                      <FileText size={15} color="#2563eb" />
                      Executive Summary of Scope & Consideration:
                    </div>
                    <p style={{ margin: 0, color: '#334155', fontSize: '0.98em' }}>
                      {docToneMode === 'humanized'
                        ? (currentContract.humanizedSummary || currentContract.documentSummary)
                        : currentContract.documentSummary}
                    </p>
                  </div>

                  {/* Contract Clauses */}
                  <div style={{ marginBottom: '2.5rem' }}>
                    <div style={{
                      fontSize: '0.82rem',
                      fontWeight: 700,
                      textTransform: 'uppercase',
                      letterSpacing: '0.08em',
                      color: '#64748b',
                      marginBottom: '1rem',
                      borderBottom: '1px solid #e2e8f0',
                      paddingBottom: '0.4rem',
                    }}>
                      {docToneMode === 'humanized' ? 'Collaborative Articles & Shared Commitments' : 'Contract Clauses & Statutory Terms'}
                    </div>

                    {currentContract.clauses.map((clause, idx) => (
                      <div
                        key={clause.id}
                        className={docToneMode === 'humanized' ? 'humanized-clause-card' : 'legal-clause-block'}
                      >
                        <div className="legal-clause-title">
                          <span>
                            {docToneMode === 'humanized'
                              ? (clause.humanizedTitle || clause.title)
                              : clause.title}
                          </span>
                          {clause.isRedlined && (
                            <span style={{ color: '#d97706', fontSize: '0.75rem', fontWeight: 600, textTransform: 'none' }}>
                              [Redlined & Agreed: {clause.redlineNote}]
                            </span>
                          )}
                        </div>
                        <p style={{ margin: 0, color: '#334155', fontSize: '0.98em', lineHeight: 1.7 }}>
                          {docToneMode === 'humanized'
                            ? (clause.humanizedContent || clause.content)
                            : clause.content}
                        </p>
                      </div>
                    ))}
                  </div>

                  {/* Payment Milestones Table */}
                  <div style={{ marginBottom: '2.5rem' }}>
                    <div className="legal-clause-title" style={{ marginBottom: '0.75rem' }}>
                      {docToneMode === 'humanized'
                        ? 'Investment & Milestone Delivery Schedule'
                        : 'Payment Milestones & Consideration Schedule'}
                    </div>
                    <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: '0.5rem', fontSize: '0.9em' }}>
                      <thead>
                        <tr style={{ borderBottom: '2px solid #0f172a', textAlign: 'left', color: '#475569' }}>
                          <th style={{ padding: '0.65rem 0' }}>Milestone Deliverable</th>
                          <th style={{ padding: '0.65rem 0' }}>Target Date</th>
                          <th style={{ padding: '0.65rem 0', textAlign: 'right' }}>Amount (USD)</th>
                        </tr>
                      </thead>
                      <tbody>
                        {currentContract.pricingTerms.paymentMilestones.map(ms => (
                          <tr key={ms.id} style={{ borderBottom: '1px solid #e2e8f0' }}>
                            <td style={{ padding: '0.65rem 0', fontWeight: 500 }}>{ms.name}</td>
                            <td style={{ padding: '0.65rem 0', color: '#64748b' }}>{ms.dueDate}</td>
                            <td style={{ padding: '0.65rem 0', textAlign: 'right', fontWeight: 700 }}>
                              ${ms.amount.toLocaleString()}.00
                            </td>
                          </tr>
                        ))}
                        <tr style={{ borderTop: '2px solid #0f172a' }}>
                          <td colSpan={2} style={{ padding: '0.75rem 0', fontWeight: 700 }}>
                            Total Agreed Investment
                          </td>
                          <td style={{ padding: '0.75rem 0', textAlign: 'right', fontWeight: 800, fontSize: '1.1em', color: '#0f172a' }}>
                            ${currentContract.pricingTerms.baseAmount.toLocaleString()}.00
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </div>

                  {/* Execution / Signatures Block */}
                  <div style={{
                    display: 'grid',
                    gridTemplateColumns: '1fr 1fr',
                    gap: '2.5rem',
                    borderTop: '2px solid #0f172a',
                    paddingTop: '1.75rem',
                    marginTop: '2.5rem',
                  }}>
                    {/* Client Signer */}
                    <div>
                      <div style={{ fontSize: '0.8rem', textTransform: 'uppercase', color: '#64748b', fontWeight: 700, letterSpacing: '0.04em' }}>
                        {docToneMode === 'humanized' ? 'AGREED ON BEHALF OF CLIENT:' : 'FOR CLIENT:'} {currentContract.clientSigner.organization}
                      </div>
                      <div style={{ height: '70px', display: 'flex', alignItems: 'center', margin: '0.65rem 0' }}>
                        {hasClientSigned ? (
                          <img
                            src={currentContract.clientSigner.signatureDataUrl}
                            alt="Client Signature"
                            style={{ maxHeight: '55px', maxWidth: '220px' }}
                          />
                        ) : (
                          <div style={{ color: '#94a3b8', fontStyle: 'italic', fontSize: '0.85em' }}>
                            [Awaiting Client Signature]
                          </div>
                        )}
                      </div>
                      <div style={{ fontSize: '0.88em', color: '#1e293b' }}>
                        <strong>Name:</strong> {currentContract.clientSigner.name}
                      </div>
                      <div style={{ fontSize: '0.88em', color: '#1e293b' }}>
                        <strong>Title:</strong> {currentContract.clientSigner.title}
                      </div>
                      <div style={{ fontSize: '0.88em', color: '#64748b' }}>
                        <strong>Date:</strong> {currentContract.clientSigner.signedDate ? new Date(currentContract.clientSigner.signedDate).toLocaleString() : 'Pending'}
                      </div>
                    </div>

                    {/* Vendor Signer */}
                    <div>
                      <div style={{ fontSize: '0.8rem', textTransform: 'uppercase', color: '#64748b', fontWeight: 700, letterSpacing: '0.04em' }}>
                        {docToneMode === 'humanized' ? 'COMMITTED ON BEHALF OF SCOPELOCK:' : 'FOR VENDOR:'} {currentContract.vendorSigner.organization}
                      </div>
                      <div style={{ height: '70px', display: 'flex', alignItems: 'center', margin: '0.65rem 0' }}>
                        {hasVendorSigned ? (
                          <img
                            src={currentContract.vendorSigner.signatureDataUrl}
                            alt="Vendor Signature"
                            style={{ maxHeight: '55px', maxWidth: '220px' }}
                          />
                        ) : (
                          <div style={{ color: '#94a3b8', fontStyle: 'italic', fontSize: '0.85em' }}>
                            [Awaiting Vendor Signature]
                          </div>
                        )}
                      </div>
                      <div style={{ fontSize: '0.88em', color: '#1e293b' }}>
                        <strong>Name:</strong> {currentContract.vendorSigner.name}
                      </div>
                      <div style={{ fontSize: '0.88em', color: '#1e293b' }}>
                        <strong>Title:</strong> {currentContract.vendorSigner.title}
                      </div>
                      <div style={{ fontSize: '0.88em', color: '#64748b' }}>
                        <strong>Date:</strong> {currentContract.vendorSigner.signedDate ? new Date(currentContract.vendorSigner.signedDate).toLocaleString() : 'Pending'}
                      </div>
                    </div>
                  </div>

                  {/* Cryptographic Seal Stamp */}
                  {currentContract.certificate && (
                    <div className="legal-stamp" style={{ marginTop: '2.5rem' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.5rem' }}>
                        <span style={{ fontWeight: 600 }}>DOCUSIGN AUDIT TRAIL CERTIFICATE ID: {currentContract.certificate.certificateId}</span>
                        <span className="badge badge-emerald" style={{ fontSize: '0.7rem' }}>
                          TAMPER-EVIDENT: {currentContract.certificate.tamperEvidentStatus}
                        </span>
                      </div>
                      <div style={{ marginTop: '0.35rem', wordBreak: 'break-all', opacity: 0.85 }}>
                        SHA-256 DIGEST: {currentContract.certificate.sha256Hash}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              /* Collaborative Redlining & Clause Library View */
              <div className="glass-panel" style={{ padding: '1.5rem' }}>
                <div style={{ marginBottom: '1.25rem' }}>
                  <h3 style={{ fontSize: '1.1rem', fontWeight: 600 }}>Clause Library & Collaborative Redlining</h3>
                  <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                    Edit terms in real-time, compare markups against original templates, and record redline justifications.
                  </p>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                  {currentContract.clauses.map(clause => {
                    const isEditing = editingClauseId === clause.id;
                    return (
                      <div
                        key={clause.id}
                        style={{
                          background: 'var(--bg-card)',
                          border: clause.isRedlined ? '1px solid var(--accent-amber)' : '1px solid var(--border-subtle)',
                          borderRadius: 'var(--radius-md)',
                          padding: '1.25rem',
                        }}
                      >
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <span style={{ fontWeight: 600, fontSize: '0.9rem' }}>{clause.title}</span>
                            <span className="badge badge-blue">{clause.category}</span>
                            {clause.isRedlined && (
                              <span className="badge badge-amber">Redlined & Modified</span>
                            )}
                          </div>

                          {!isEditing && (
                            <button
                              onClick={() => handleStartEditClause(clause)}
                              style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '0.35rem',
                                fontSize: '0.78rem',
                                color: 'var(--accent-primary)',
                                fontWeight: 500,
                              }}
                            >
                              <Edit3 size={13} /> Edit / Redline Clause
                            </button>
                          )}
                        </div>

                        {isEditing ? (
                          <div>
                            <textarea
                              rows={4}
                              value={editedClauseContent}
                              onChange={e => setEditedClauseContent(e.target.value)}
                              style={{ marginBottom: '0.75rem', fontSize: '0.86rem' }}
                            />
                            <div style={{ marginBottom: '0.75rem' }}>
                              <label style={{ display: 'block', fontSize: '0.75rem', color: 'var(--text-secondary)', marginBottom: '0.25rem' }}>
                                Redline Justification Note
                              </label>
                              <input
                                type="text"
                                value={redlineNote}
                                onChange={e => setRedlineNote(e.target.value)}
                                placeholder="e.g. Revised SLA requirement to align with client regulatory mandate"
                              />
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem' }}>
                              <button
                                onClick={() => setEditingClauseId(null)}
                                style={{
                                  padding: '0.45rem 0.85rem',
                                  borderRadius: 'var(--radius-sm)',
                                  border: '1px solid var(--border-medium)',
                                  color: 'var(--text-secondary)',
                                  fontSize: '0.8rem',
                                }}
                              >
                                Cancel
                              </button>
                              <button
                                onClick={() => handleSaveClause(clause.id)}
                                style={{
                                  padding: '0.45rem 1.1rem',
                                  borderRadius: 'var(--radius-sm)',
                                  background: 'var(--accent-primary)',
                                  color: '#ffffff',
                                  fontSize: '0.8rem',
                                  fontWeight: 600,
                                }}
                              >
                                Apply Redline
                              </button>
                            </div>
                          </div>
                        ) : (
                          <div>
                            <p style={{ fontSize: '0.86rem', color: 'var(--text-primary)', lineHeight: 1.5 }}>
                              {clause.content}
                            </p>

                            {/* Diff comparison if redlined */}
                            {clause.isRedlined && (
                              <div style={{
                                marginTop: '0.75rem',
                                padding: '0.75rem',
                                borderRadius: 'var(--radius-sm)',
                                background: 'var(--bg-secondary)',
                                border: '1px dashed var(--border-medium)',
                                fontSize: '0.78rem',
                              }}>
                                <div style={{ color: 'var(--text-tertiary)', fontWeight: 600, marginBottom: '0.2rem' }}>
                                  Original Baseline Text:
                                </div>
                                <div style={{ color: 'var(--text-secondary)', textDecoration: 'line-through' }}>
                                  {clause.originalContent}
                                </div>
                                {clause.redlineNote && (
                                  <div style={{ color: 'var(--accent-amber)', marginTop: '0.35rem', fontStyle: 'italic' }}>
                                    Note: {clause.redlineNote}
                                  </div>
                                )}
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="glass-panel" style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-tertiary)' }}>
            No contracts found for this project. Use "Auto-Generate Contract" from Scope Baseline to draft one.
          </div>
        )}
      </div>

      {/* Signature Modal */}
      {showSignModal && currentContract && (
        <SignatureModal
          contract={currentContract}
          onClose={() => setShowSignModal(false)}
        />
      )}
    </div>
  );
};

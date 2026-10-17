import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import {
  Layers,
  LayoutDashboard,
  FileCheck2,
  GitPullRequest,
  ShieldCheck,
  Moon,
  Sun,
  ChevronDown,
  Plus,
  FileSpreadsheet,
  Database,
  Scale,
} from 'lucide-react';
import { NewProjectModal } from './NewProjectModal';

interface NavbarProps {
  onOpenExport: () => void;
  onOpenSupabase: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ onOpenExport, onOpenSupabase }) => {
  const {
    theme,
    toggleTheme,
    currentUser,
    setCurrentUser,
    availableUsers,
    projects,
    activeProject,
    setActiveProject,
    changeRequests,
    contracts,
    activeTab,
    setActiveTab,
  } = useApp();

  const [showProjectDropdown, setShowProjectDropdown] = useState(false);
  const [showUserDropdown, setShowUserDropdown] = useState(false);
  const [showNewProjectModal, setShowNewProjectModal] = useState(false);

  const pendingCrCount = changeRequests.filter(
    cr => cr.projectId === activeProject.id && (cr.status === 'SUBMITTED' || cr.status === 'UNDER_REVIEW')
  ).length;

  const unsignedContractsCount = contracts.filter(
    c => c.projectId === activeProject.id && c.signingStatus !== 'FULLY_EXECUTED'
  ).length;

  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'contracts', label: 'Contracts & E-Sign', icon: FileCheck2, badge: unsignedContractsCount ? `${unsignedContractsCount}` : undefined, badgeColor: 'amber' },
    { id: 'changeRequests', label: 'Change Requests', icon: GitPullRequest, badge: pendingCrCount ? `${pendingCrCount} Pending` : undefined, badgeColor: 'rose' },
    { id: 'delayAttribution', label: 'Delay Attribution', icon: Scale, badge: 'Point 6', badgeColor: 'emerald' },
    { id: 'audit', label: 'Audit Trail', icon: ShieldCheck },
  ];

  return (
    <>
      <header style={{
        background: 'var(--bg-glass-heavy)',
        backdropFilter: 'blur(12px)',
        borderBottom: '1px solid var(--border-medium)',
        position: 'sticky',
        top: 0,
        zIndex: 100,
      }}>
        {/* Top bar */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '0.9rem 2rem',
          borderBottom: '1px solid var(--border-subtle)',
        }}>
          {/* Brand + Project Switcher */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>

            {/* Logo */}
            <div
              style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', cursor: 'pointer' }}
              onClick={() => setActiveTab('dashboard')}
            >
              <div style={{
                width: '38px', height: '38px', borderRadius: 'var(--radius-md)',
                background: 'var(--accent-primary)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                color: '#ffffff',
                boxShadow: '0 2px 8px rgba(59, 130, 246, 0.40)',
                flexShrink: 0,
              }}>
                <Layers size={20} />
              </div>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', lineHeight: 1 }}>
                  <span className="brand-title" style={{ fontSize: '1.1rem', fontWeight: 800 }}>
                    ScopeLock<span style={{ color: 'var(--accent-primary)' }}>.CLM</span>
                  </span>
                  <span className="badge badge-blue" style={{ fontSize: '0.65rem' }}>v2.4 Enterprise</span>
                </div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)', marginTop: '0.2rem' }}>
                  Scope &amp; Contract Lifecycle Platform
                </div>
              </div>
            </div>

            {/* Active Project Selector */}
            <div style={{ position: 'relative' }}>
              <button
                onClick={() => setShowProjectDropdown(!showProjectDropdown)}
                style={{
                  display: 'flex', alignItems: 'center', gap: '0.65rem',
                  padding: '0.5rem 0.9rem',
                  background: 'var(--bg-card)',
                  border: '1px solid var(--border-medium)',
                  borderRadius: 'var(--radius-md)',
                  color: 'var(--text-primary)',
                  fontSize: '0.875rem',
                  boxShadow: 'var(--shadow-xs)',
                }}
              >
                <div style={{
                  width: '8px', height: '8px', borderRadius: '50%', flexShrink: 0,
                  background: activeProject.status === 'ACTIVE' ? 'var(--accent-emerald)' : 'var(--accent-amber)',
                }} />
                <div style={{ textAlign: 'left', minWidth: 0 }}>
                  <div style={{ fontWeight: 600, fontSize: '0.875rem', lineHeight: 1.3, whiteSpace: 'nowrap' }}>
                    {activeProject.name}
                  </div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)', whiteSpace: 'nowrap' }}>
                    {activeProject.code} · {activeProject.clientOrg}
                  </div>
                </div>
                <ChevronDown size={14} color="var(--text-tertiary)" />
              </button>

              {showProjectDropdown && (
                <div style={{
                  position: 'absolute', top: 'calc(100% + 6px)', left: 0,
                  width: '300px',
                  background: 'var(--bg-secondary)',
                  border: '1px solid var(--border-medium)',
                  borderRadius: 'var(--radius-lg)',
                  boxShadow: 'var(--shadow-lg)',
                  padding: '0.5rem',
                  zIndex: 200,
                }}>
                  <div style={{ fontSize: '0.72rem', color: 'var(--text-tertiary)', padding: '0.35rem 0.7rem 0.25rem', fontWeight: 600, letterSpacing: '0.04em', textTransform: 'uppercase' }}>
                    Active Project
                  </div>
                  {projects.map(p => (
                    <button
                      key={p.id}
                      onClick={() => { setActiveProject(p); setShowProjectDropdown(false); }}
                      style={{
                        width: '100%', display: 'flex', alignItems: 'center',
                        justifyContent: 'space-between',
                        padding: '0.6rem 0.7rem',
                        borderRadius: 'var(--radius-md)',
                        background: p.id === activeProject.id ? 'var(--accent-primary-dim)' : 'transparent',
                        border: p.id === activeProject.id ? '1px solid var(--border-highlight)' : '1px solid transparent',
                        color: 'var(--text-primary)', textAlign: 'left', marginBottom: '0.2rem',
                      }}
                    >
                      <div>
                        <div style={{ fontWeight: 600, fontSize: '0.875rem' }}>{p.name}</div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)' }}>
                          {p.code} · {p.pricingModel === 'FIXED_PRICE' ? 'Fixed-Price' : 'T&M'}
                        </div>
                      </div>
                      <span className={`badge ${p.status === 'ACTIVE' ? 'badge-emerald' : 'badge-amber'}`}>
                        {p.status}
                      </span>
                    </button>
                  ))}
                  <div style={{ borderTop: '1px solid var(--border-subtle)', marginTop: '0.35rem', paddingTop: '0.35rem' }}>
                    <button
                      onClick={() => { setShowProjectDropdown(false); setShowNewProjectModal(true); }}
                      style={{
                        width: '100%', display: 'flex', alignItems: 'center', gap: '0.5rem',
                        padding: '0.5rem 0.7rem', borderRadius: 'var(--radius-md)',
                        color: 'var(--accent-primary)', fontSize: '0.875rem', fontWeight: 600,
                      }}
                    >
                      <Plus size={15} /> New Project
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Right: Actions */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>

            {/* Supabase */}
            <button
              onClick={onOpenSupabase}
              title="Supabase Cloud Database"
              style={{
                display: 'flex', alignItems: 'center', gap: '0.45rem',
                padding: '0.48rem 0.9rem',
                background: 'rgba(34, 197, 94, 0.08)',
                border: '1px solid rgba(34, 197, 94, 0.25)',
                borderRadius: 'var(--radius-md)',
                color: 'var(--accent-emerald)',
                fontSize: '0.85rem', fontWeight: 600,
              }}
            >
              <Database size={14} />
              <span>Supabase</span>
            </button>

            {/* Export */}
            <button
              onClick={onOpenExport}
              title="Export Report"
              style={{
                display: 'flex', alignItems: 'center', gap: '0.45rem',
                padding: '0.48rem 0.9rem',
                background: 'var(--bg-card)',
                border: '1px solid var(--border-medium)',
                borderRadius: 'var(--radius-md)',
                color: 'var(--text-secondary)',
                fontSize: '0.85rem', fontWeight: 500,
              }}
            >
              <FileSpreadsheet size={14} />
              <span>Export</span>
            </button>

            {/* User / Role Switcher */}
            <div style={{ position: 'relative' }}>
              <button
                onClick={() => setShowUserDropdown(!showUserDropdown)}
                style={{
                  display: 'flex', alignItems: 'center', gap: '0.55rem',
                  padding: '0.4rem 0.8rem',
                  background: 'var(--bg-card)',
                  border: '1px solid var(--border-highlight)',
                  borderRadius: 'var(--radius-md)',
                  color: 'var(--text-primary)',
                  fontSize: '0.875rem',
                }}
              >
                <img
                  src={currentUser.avatar} alt={currentUser.name}
                  style={{ width: '28px', height: '28px', borderRadius: '50%', objectFit: 'cover' }}
                />
                <div style={{ textAlign: 'left' }}>
                  <div style={{ fontWeight: 600, fontSize: '0.85rem', lineHeight: 1.2 }}>{currentUser.name}</div>
                  <div style={{ fontSize: '0.72rem', color: 'var(--accent-primary)' }}>
                    {currentUser.role === 'PROJECT_MANAGER' ? 'Project Manager'
                      : currentUser.role === 'CLIENT_SIGNER' ? 'Client Approver'
                      : 'Legal Counsel'}
                  </div>
                </div>
                <ChevronDown size={13} color="var(--text-tertiary)" />
              </button>

              {showUserDropdown && (
                <div style={{
                  position: 'absolute', top: 'calc(100% + 6px)', right: 0,
                  width: '270px',
                  background: 'var(--bg-secondary)',
                  border: '1px solid var(--border-medium)',
                  borderRadius: 'var(--radius-lg)',
                  boxShadow: 'var(--shadow-lg)',
                  padding: '0.5rem',
                  zIndex: 200,
                }}>
                  <div style={{ fontSize: '0.72rem', color: 'var(--text-tertiary)', padding: '0.3rem 0.6rem 0.25rem', fontWeight: 600, letterSpacing: '0.04em', textTransform: 'uppercase' }}>
                    Switch Role
                  </div>
                  {availableUsers.map(u => (
                    <button
                      key={u.id}
                      onClick={() => { setCurrentUser(u); setShowUserDropdown(false); }}
                      style={{
                        width: '100%', display: 'flex', alignItems: 'center', gap: '0.7rem',
                        padding: '0.55rem 0.65rem',
                        borderRadius: 'var(--radius-md)',
                        background: u.id === currentUser.id ? 'var(--accent-primary-dim)' : 'transparent',
                        border: u.id === currentUser.id ? '1px solid var(--border-highlight)' : '1px solid transparent',
                        color: 'var(--text-primary)', textAlign: 'left', marginBottom: '0.2rem',
                      }}
                    >
                      <img
                        src={u.avatar} alt={u.name}
                        style={{ width: '34px', height: '34px', borderRadius: '50%', objectFit: 'cover', flexShrink: 0 }}
                      />
                      <div>
                        <div style={{ fontWeight: 600, fontSize: '0.875rem' }}>{u.name}</div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>{u.role}</div>
                      </div>
                    </button>
                  ))}
                  <div style={{
                    fontSize: '0.78rem', color: 'var(--text-tertiary)',
                    padding: '0.5rem 0.65rem',
                    background: 'var(--bg-card)',
                    borderRadius: 'var(--radius-sm)',
                    marginTop: '0.35rem',
                    lineHeight: 1.5,
                  }}>
                    💡 Switch to <strong style={{ color: 'var(--text-secondary)' }}>Sarah Jenkins</strong> to approve and sign contracts.
                  </div>
                </div>
              )}
            </div>

            {/* Theme Toggle */}
            <button
              onClick={toggleTheme}
              title="Toggle theme"
              style={{
                padding: '0.5rem',
                borderRadius: 'var(--radius-md)',
                color: 'var(--text-secondary)',
                border: '1px solid var(--border-medium)',
                background: 'var(--bg-card)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}
            >
              {theme === 'dark' ? <Sun size={16} /> : <Moon size={16} />}
            </button>
          </div>
        </div>

        {/* Navigation Tabs */}
        <nav style={{
          display: 'flex', gap: '0.15rem',
          padding: '0.4rem 2rem',
          overflowX: 'auto', scrollbarWidth: 'none',
        }}>
          {navItems.map(item => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                style={{
                  display: 'flex', alignItems: 'center', gap: '0.5rem',
                  padding: '0.55rem 1rem',
                  borderRadius: 'var(--radius-md)',
                  color: isActive ? 'var(--accent-primary)' : 'var(--text-secondary)',
                  background: isActive ? 'var(--accent-primary-dim)' : 'transparent',
                  border: isActive ? '1px solid var(--border-highlight)' : '1px solid transparent',
                  fontSize: '0.875rem',
                  fontWeight: isActive ? 600 : 500,
                  whiteSpace: 'nowrap',
                  transition: 'all 0.15s ease',
                }}
              >
                <Icon size={15} />
                <span>{item.label}</span>
                {item.badge && (
                  <span className={`badge badge-${item.badgeColor}`} style={{ fontSize: '0.68rem' }}>
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>
      </header>

      {showNewProjectModal && <NewProjectModal onClose={() => setShowNewProjectModal(false)} />}
    </>
  );
};

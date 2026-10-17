import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import {
  CalendarDays,
  Clock,
  ArrowRight,
  AlertTriangle,
  CheckCircle2,
  GitPullRequest,
  Sparkles,
  TrendingUp,
} from 'lucide-react';

export const GanttTimelineView: React.FC = () => {
  const { activeProject, changeRequests } = useApp();

  const [simulatedExtraDays, setSimulatedExtraDays] = useState(0);

  const projectCrs = changeRequests.filter(cr => cr.projectId === activeProject.id);
  const approvedCrs = projectCrs.filter(cr => cr.status === 'CLIENT_APPROVED');
  const pendingCrs = projectCrs.filter(
    cr => cr.status === 'SUBMITTED' || cr.status === 'UNDER_REVIEW'
  );

  const totalApprovedShiftDays = approvedCrs.reduce((a, b) => a + b.scheduleImpactDays, 0);
  const totalPendingShiftDays = pendingCrs.reduce((a, b) => a + b.scheduleImpactDays, 0);

  // Compute dates
  const baselineEnd = new Date(activeProject.baseDeliveryDate);
  const currentEnd = new Date(activeProject.currentDeliveryDate);
  const potentialEnd = new Date(currentEnd);
  potentialEnd.setDate(potentialEnd.getDate() + totalPendingShiftDays + simulatedExtraDays);

  const ganttPhases = [
    {
      id: 'ph-1',
      name: 'Phase 1: Architecture Baseline & Schema Design',
      startPct: 5,
      widthPct: 20,
      status: 'COMPLETED',
      dates: 'Sep 01 - Sep 20, 2026',
      shiftDays: 0,
    },
    {
      id: 'ph-2',
      name: 'Phase 2: ACID Double-Entry Ledger & SSO Integration',
      startPct: 25,
      widthPct: 28,
      status: 'COMPLETED',
      dates: 'Sep 21 - Oct 25, 2026',
      shiftDays: 0,
    },
    {
      id: 'ph-3',
      name: 'Phase 3: Automated Settlement & Clearing Pipeline',
      startPct: 53,
      widthPct: 22,
      status: 'IN_PROGRESS',
      dates: 'Oct 26 - Nov 20, 2026',
      shiftDays: 0,
    },
    {
      id: 'ph-4',
      name: 'CR-001 Extension: Biometric WebAuthn MFA Step-Up',
      startPct: 75,
      widthPct: 15,
      status: 'APPROVED_SHIFT',
      dates: 'Nov 21 - Dec 10, 2026',
      shiftDays: 14,
      crRef: 'CR-001',
    },
    {
      id: 'ph-5',
      name: 'Phase 5: Production Acceptance Testing & Cutover',
      startPct: 88,
      widthPct: 12,
      status: 'SCHEDULED',
      dates: `Dec 11 - ${activeProject.currentDeliveryDate}`,
      shiftDays: 14,
    },
  ];

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
            <h2 style={{ fontSize: '1.35rem', fontWeight: 700 }}>Dynamic Gantt Schedule & Milestone Drift</h2>
            <span className="badge badge-cyan">Automated Recalculation Engine</span>
          </div>
          <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', marginTop: '0.2rem' }}>
            Visualizes contractual deadline shifts directly calculated from approved and pending Change Requests.
          </p>
        </div>

        {/* Schedule Drift Indicator */}
        <div style={{
          display: 'flex',
          gap: '1rem',
          background: 'var(--bg-card)',
          border: '1px solid var(--border-medium)',
          borderRadius: 'var(--radius-md)',
          padding: '0.6rem 1.1rem',
          alignItems: 'center',
        }}>
          <div>
            <div style={{ fontSize: '0.7rem', color: 'var(--text-tertiary)', textTransform: 'uppercase' }}>Baseline Due</div>
            <div style={{ fontSize: '0.88rem', fontWeight: 600 }}>{activeProject.baseDeliveryDate}</div>
          </div>
          <ArrowRight size={14} color="var(--accent-amber)" />
          <div>
            <div style={{ fontSize: '0.7rem', color: 'var(--accent-amber)', textTransform: 'uppercase' }}>Approved Revised Due</div>
            <div style={{ fontSize: '0.88rem', fontWeight: 700, color: 'var(--accent-amber)' }}>
              {activeProject.currentDeliveryDate} (+{totalApprovedShiftDays}d)
            </div>
          </div>
        </div>
      </div>

      {/* Main Gantt Visualizer Card */}
      <div className="glass-panel" style={{ padding: '1.5rem', marginBottom: '1.5rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
          <div>
            <h3 style={{ fontSize: '1.05rem', fontWeight: 600 }}>Project Milestone Timeline Bar</h3>
            <p style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>
              September 2026 – January 2027 Schedule Progression
            </p>
          </div>
          <div style={{ display: 'flex', gap: '1rem', fontSize: '0.75rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
              <div style={{ width: '10px', height: '10px', borderRadius: '2px', background: 'var(--accent-emerald)' }} />
              <span>Completed Baseline</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
              <div style={{ width: '10px', height: '10px', borderRadius: '2px', background: 'var(--accent-cyan)' }} />
              <span>In-Progress</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
              <div style={{ width: '10px', height: '10px', borderRadius: '2px', background: 'var(--accent-amber)' }} />
              <span>CR Approved Extension (+14d)</span>
            </div>
          </div>
        </div>

        {/* Timeline Header Months */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(5, 1fr)',
          borderBottom: '1px solid var(--border-medium)',
          paddingBottom: '0.5rem',
          fontSize: '0.76rem',
          fontWeight: 600,
          color: 'var(--text-tertiary)',
          textAlign: 'center',
          marginBottom: '1rem',
        }}>
          <div>SEPTEMBER 2026</div>
          <div>OCTOBER 2026</div>
          <div>NOVEMBER 2026</div>
          <div>DECEMBER 2026</div>
          <div>JANUARY 2027</div>
        </div>

        {/* Gantt Rows */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem', position: 'relative' }}>
          {/* Baseline Deadline Marker Line */}
          <div style={{
            position: 'absolute',
            left: '80%',
            top: 0,
            bottom: 0,
            width: '2px',
            background: 'dashed #f43f5e',
            zIndex: 10,
            pointerEvents: 'none',
          }}>
            <div style={{
              position: 'absolute',
              top: '-18px',
              left: '-45px',
              background: '#f43f5e',
              color: '#ffffff',
              fontSize: '0.62rem',
              fontWeight: 700,
              padding: '0.1rem 0.35rem',
              borderRadius: '3px',
              whiteSpace: 'nowrap',
            }}>
              Original Baseline (Dec 15)
            </div>
          </div>

          {/* Revised Current Deadline Marker Line */}
          <div style={{
            position: 'absolute',
            left: '88%',
            top: 0,
            bottom: 0,
            width: '2px',
            background: 'var(--accent-amber)',
            zIndex: 10,
            pointerEvents: 'none',
          }}>
            <div style={{
              position: 'absolute',
              top: '-18px',
              left: '-50px',
              background: 'var(--accent-amber)',
              color: '#0f172a',
              fontSize: '0.62rem',
              fontWeight: 700,
              padding: '0.1rem 0.35rem',
              borderRadius: '3px',
              whiteSpace: 'nowrap',
            }}>
              Revised (Dec 29) +14d
            </div>
          </div>

          {ganttPhases.map(phase => {
            const isCompleted = phase.status === 'COMPLETED';
            const isShift = phase.status === 'APPROVED_SHIFT';
            const isInProg = phase.status === 'IN_PROGRESS';

            return (
              <div key={phase.id}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.78rem', marginBottom: '0.35rem' }}>
                  <span style={{ fontWeight: 600 }}>{phase.name}</span>
                  <span style={{ color: 'var(--text-tertiary)', fontSize: '0.72rem' }}>{phase.dates}</span>
                </div>

                <div style={{
                  height: '24px',
                  background: 'var(--bg-secondary)',
                  borderRadius: 'var(--radius-sm)',
                  position: 'relative',
                  overflow: 'hidden',
                  border: '1px solid var(--border-subtle)',
                }}>
                  <div
                    style={{
                      position: 'absolute',
                      left: `${phase.startPct}%`,
                      width: `${phase.widthPct}%`,
                      height: '100%',
                      borderRadius: 'var(--radius-sm)',
                      background: isCompleted
                        ? 'linear-gradient(90deg, #10b981, #059669)'
                        : isInProg
                        ? 'linear-gradient(90deg, #06b6d4, #0284c7)'
                        : isShift
                        ? 'linear-gradient(90deg, #f59e0b, #d97706)'
                        : 'linear-gradient(90deg, #6366f1, #4f46e5)',
                      display: 'flex',
                      alignItems: 'center',
                      paddingLeft: '0.5rem',
                      color: '#ffffff',
                      fontSize: '0.7rem',
                      fontWeight: 600,
                    }}
                  >
                    {isShift && `+${phase.shiftDays}d Addendum`}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Interactive Schedule Drift Simulator */}
      <div className="glass-panel" style={{ padding: '1.5rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', flexWrap: 'wrap', gap: '0.75rem' }}>
          <div>
            <h3 style={{ fontSize: '1.05rem', fontWeight: 600 }}>What-If Schedule Impact Simulator</h3>
            <p style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>
              Simulate schedule drift from pending Change Requests or newly proposed scope additions.
            </p>
          </div>
          <button
            onClick={() => setSimulatedExtraDays(0)}
            style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)' }}
          >
            Reset Simulation
          </button>
        </div>

        <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', flexWrap: 'wrap' }}>
          <button
            onClick={() => setSimulatedExtraDays(5)}
            style={{
              padding: '0.5rem 1rem',
              borderRadius: 'var(--radius-md)',
              background: simulatedExtraDays === 5 ? 'var(--accent-primary)' : 'var(--bg-card)',
              color: simulatedExtraDays === 5 ? '#ffffff' : 'var(--text-secondary)',
              border: '1px solid var(--border-medium)',
              fontSize: '0.82rem',
              fontWeight: 600,
            }}
          >
            +5 Calendar Days
          </button>

          <button
            onClick={() => setSimulatedExtraDays(10)}
            style={{
              padding: '0.5rem 1rem',
              borderRadius: 'var(--radius-md)',
              background: simulatedExtraDays === 10 ? 'var(--accent-primary)' : 'var(--bg-card)',
              color: simulatedExtraDays === 10 ? '#ffffff' : 'var(--text-secondary)',
              border: '1px solid var(--border-medium)',
              fontSize: '0.82rem',
              fontWeight: 600,
            }}
          >
            +10 Days (CR-002 Pending)
          </button>

          <button
            onClick={() => setSimulatedExtraDays(21)}
            style={{
              padding: '0.5rem 1rem',
              borderRadius: 'var(--radius-md)',
              background: simulatedExtraDays === 21 ? 'var(--accent-primary)' : 'var(--bg-card)',
              color: simulatedExtraDays === 21 ? '#ffffff' : 'var(--text-secondary)',
              border: '1px solid var(--border-medium)',
              fontSize: '0.82rem',
              fontWeight: 600,
            }}
          >
            +21 Days (Sprint Extension)
          </button>
        </div>

        {simulatedExtraDays > 0 && (
          <div style={{
            marginTop: '1rem',
            padding: '0.85rem 1rem',
            borderRadius: 'var(--radius-md)',
            background: 'rgba(99, 102, 241, 0.12)',
            border: '1px solid rgba(99, 102, 241, 0.3)',
            fontSize: '0.82rem',
          }}>
            Projected Revised Delivery with Simulated Drift:{' '}
            <strong>{potentialEnd.toISOString().split('T')[0]}</strong> (+{totalApprovedShiftDays + simulatedExtraDays} aggregate days from original contract baseline).
          </div>
        )}
      </div>
    </div>
  );
};

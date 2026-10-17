import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import {
  Bell,
  Mail,
  Send,
  Sparkles,
  Bot,
  CheckCircle2,
  AlertTriangle,
  Clock,
  ArrowRight,
  Settings,
  ShieldCheck,
  FileCheck2,
} from 'lucide-react';

export const NotificationsSlackView: React.FC = () => {
  const {
    slackAlerts,
    emails,
    sendSlackAlert,
    markEmailAsRead,
    setActiveTab,
    setSelectedContractId,
    setSelectedCrId,
    activeProject,
  } = useApp();

  const [activeSubTab, setActiveSubTab] = useState<'slack' | 'email' | 'settings'>('slack');
  const [customMsg, setCustomMsg] = useState('');
  const [selectedEmailId, setSelectedEmailId] = useState<string>(emails[0]?.id || '');

  const [emailEnabled, setEmailEnabled] = useState(true);
  const [slackEnabled, setSlackEnabled] = useState(true);
  const [smsUrgentEnabled, setSmsUrgentEnabled] = useState(false);
  const [cadence, setCadence] = useState('INSTANT');

  const selectedEmail = emails.find(e => e.id === selectedEmailId) || emails[0];

  const handleSendCustomMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customMsg.trim()) return;
    sendSlackAlert(customMsg, 'BROADCAST', 'blue');
    setCustomMsg('');
  };

  const handleSimulateAlert = (type: 'cr' | 'signing' | 'audit') => {
    if (type === 'cr') {
      sendSlackAlert(
        `🚨 *Client Approval Pending*: Change Request *CR-002* requires review from @Sarah Jenkins. Schedule impact: *+10 days*, Budget: *+$26,000*. Work cannot commence until addendum is signed.`,
        'ACTION REQUIRED',
        'amber',
        'Review CR-002',
        'changeRequests',
        'cr-002'
      );
    } else if (type === 'signing') {
      sendSlackAlert(
        `✍️ *DocuSign Signature Requested*: Addendum #1 for project *${activeProject.name}* is pending final executive signature from @Alex Mercer.`,
        'URGENT SIGNING',
        'rose',
        'Sign Contract',
        'contracts',
        'ctr-001'
      );
    } else {
      sendSlackAlert(
        `🛡️ *Audit Trail Integrity Check*: SHA-256 Merkle root validated for project baseline. Zero scope discrepancies detected.`,
        'VERIFIED',
        'emerald',
        'Inspect Audit Log',
        'audit'
      );
    }
  };

  const handleAlertAction = (actionView?: string, actionPayload?: string) => {
    if (!actionView) return;
    if (actionView === 'contracts' && actionPayload) {
      setSelectedContractId(actionPayload);
    } else if (actionView === 'changeRequests' && actionPayload) {
      setSelectedCrId(actionPayload);
    }
    setActiveTab(actionView);
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
            <h2 style={{ fontSize: '1.35rem', fontWeight: 700 }}>Multi-Channel Notification Hub</h2>
            <span className="badge badge-purple">Slack & Email Sync</span>
          </div>
          <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', marginTop: '0.2rem' }}>
            Automate approval reminders in spaces you already work • Avoid alert fatigue with scheduled digests
          </p>
        </div>

        {/* Sub-tab Navigation */}
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <button
            onClick={() => setActiveSubTab('slack')}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.4rem',
              padding: '0.55rem 1.1rem',
              borderRadius: 'var(--radius-md)',
              background: activeSubTab === 'slack' ? 'var(--accent-primary)' : 'var(--bg-card)',
              color: activeSubTab === 'slack' ? '#ffffff' : 'var(--text-secondary)',
              border: activeSubTab === 'slack' ? 'none' : '1px solid var(--border-medium)',
              fontSize: '0.84rem',
              fontWeight: 600,
            }}
          >
            <Bot size={15} /> Slack Bot Stream ({slackAlerts.length})
          </button>

          <button
            onClick={() => setActiveSubTab('email')}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.4rem',
              padding: '0.55rem 1.1rem',
              borderRadius: 'var(--radius-md)',
              background: activeSubTab === 'email' ? 'var(--accent-primary)' : 'var(--bg-card)',
              color: activeSubTab === 'email' ? '#ffffff' : 'var(--text-secondary)',
              border: activeSubTab === 'email' ? 'none' : '1px solid var(--border-medium)',
              fontSize: '0.84rem',
              fontWeight: 600,
            }}
          >
            <Mail size={15} /> Transactional Emails ({emails.length})
          </button>

          <button
            onClick={() => setActiveSubTab('settings')}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.4rem',
              padding: '0.55rem 1.1rem',
              borderRadius: 'var(--radius-md)',
              background: activeSubTab === 'settings' ? 'var(--accent-primary)' : 'var(--bg-card)',
              color: activeSubTab === 'settings' ? '#ffffff' : 'var(--text-secondary)',
              border: activeSubTab === 'settings' ? 'none' : '1px solid var(--border-medium)',
              fontSize: '0.84rem',
              fontWeight: 600,
            }}
          >
            <Settings size={15} /> Notification Preferences
          </button>
        </div>
      </div>

      {/* Subtab 1: Slack Channel Simulator */}
      {activeSubTab === 'slack' && (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: '1.5rem' }}>
          {/* Left: Live Slack Chat Box */}
          <div className="glass-panel" style={{ display: 'flex', flexDirection: 'column', height: '640px', overflow: 'hidden' }}>
            {/* Channel Header */}
            <div style={{
              padding: '1rem 1.25rem',
              borderBottom: '1px solid var(--border-subtle)',
              background: 'var(--bg-secondary)',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                <span style={{ fontSize: '1.1rem', fontWeight: 700 }}>#scope-and-contract-ops</span>
                <span className="badge badge-emerald" style={{ fontSize: '0.65rem' }}>Active Webhook</span>
              </div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)' }}>
                3 Bots • 12 Stakeholders
              </div>
            </div>

            {/* Messages Feed */}
            <div style={{ flex: 1, overflowY: 'auto', padding: '1.25rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {slackAlerts.map(alert => (
                <div
                  key={alert.id}
                  style={{
                    display: 'flex',
                    alignItems: 'flex-start',
                    gap: '0.85rem',
                    padding: '0.85rem',
                    borderRadius: 'var(--radius-md)',
                    background: 'var(--bg-card)',
                    border: '1px solid var(--border-subtle)',
                  }}
                >
                  <div style={{
                    width: '36px',
                    height: '36px',
                    borderRadius: 'var(--radius-md)',
                    background: 'var(--bg-secondary)',
                    border: '1px solid var(--border-medium)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '1.2rem',
                    flexShrink: 0,
                  }}>
                    {alert.senderAvatar || '🤖'}
                  </div>

                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
                      <span style={{ fontWeight: 700, fontSize: '0.86rem' }}>{alert.sender}</span>
                      <span className="badge badge-blue" style={{ fontSize: '0.62rem' }}>APP</span>
                      <span style={{ fontSize: '0.72rem', color: 'var(--text-tertiary)' }}>{alert.timestamp}</span>
                      {alert.badge && (
                        <span className={`badge badge-${alert.badgeColor || 'amber'}`} style={{ fontSize: '0.62rem', marginLeft: 'auto' }}>
                          {alert.badge}
                        </span>
                      )}
                    </div>

                    <div style={{ fontSize: '0.84rem', color: 'var(--text-primary)', lineHeight: 1.45 }}>
                      {alert.text}
                    </div>

                    {alert.actionLabel && alert.actionView && (
                      <div style={{ marginTop: '0.65rem' }}>
                        <button
                          onClick={() => handleAlertAction(alert.actionView, alert.actionPayload)}
                          style={{
                            padding: '0.35rem 0.85rem',
                            borderRadius: 'var(--radius-sm)',
                            background: 'var(--accent-primary)',
                            color: '#ffffff',
                            fontSize: '0.76rem',
                            fontWeight: 600,
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '0.35rem',
                          }}
                        >
                          {alert.actionLabel} <ArrowRight size={12} />
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {/* Post Message Input */}
            <form onSubmit={handleSendCustomMessage} style={{ padding: '0.85rem 1.25rem', borderTop: '1px solid var(--border-subtle)', background: 'var(--bg-secondary)', display: 'flex', gap: '0.65rem' }}>
              <input
                type="text"
                value={customMsg}
                onChange={e => setCustomMsg(e.target.value)}
                placeholder="Broadcast notification to #scope-and-contract-ops..."
                style={{ fontSize: '0.84rem' }}
              />
              <button
                type="submit"
                style={{
                  padding: '0.6rem 1.1rem',
                  borderRadius: 'var(--radius-md)',
                  background: 'var(--accent-primary)',
                  color: '#ffffff',
                  fontSize: '0.84rem',
                  fontWeight: 600,
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.35rem',
                }}
              >
                <Send size={14} /> Send
              </button>
            </form>
          </div>

          {/* Right: Instant Trigger Simulator */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div className="glass-panel" style={{ padding: '1.25rem' }}>
              <h3 style={{ fontSize: '0.98rem', fontWeight: 600, marginBottom: '0.35rem' }}>
                Simulate Automated Bot Alerts
              </h3>
              <p style={{ fontSize: '0.76rem', color: 'var(--text-secondary)', marginBottom: '1rem' }}>
                Test event triggers described on Page 3 of the specification:
              </p>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
                <button
                  onClick={() => handleSimulateAlert('cr')}
                  style={{
                    padding: '0.7rem',
                    borderRadius: 'var(--radius-md)',
                    background: 'var(--bg-card)',
                    border: '1px solid var(--border-medium)',
                    color: 'var(--text-primary)',
                    textAlign: 'left',
                    fontSize: '0.8rem',
                  }}
                >
                  <div style={{ fontWeight: 600, color: 'var(--accent-amber)' }}>
                    ⚡ Trigger: CR Approval Pending
                  </div>
                  <div style={{ fontSize: '0.72rem', color: 'var(--text-tertiary)', marginTop: '0.15rem' }}>
                    Alerts client that review deadline is approaching.
                  </div>
                </button>

                <button
                  onClick={() => handleSimulateAlert('signing')}
                  style={{
                    padding: '0.7rem',
                    borderRadius: 'var(--radius-md)',
                    background: 'var(--bg-card)',
                    border: '1px solid var(--border-medium)',
                    color: 'var(--text-primary)',
                    textAlign: 'left',
                    fontSize: '0.8rem',
                  }}
                >
                  <div style={{ fontWeight: 600, color: 'var(--accent-rose)' }}>
                    ✍️ Trigger: Urgent DocuSign Signature
                  </div>
                  <div style={{ fontSize: '0.72rem', color: 'var(--text-tertiary)', marginTop: '0.15rem' }}>
                    Pings designated signer before milestone cutoff.
                  </div>
                </button>

                <button
                  onClick={() => handleSimulateAlert('audit')}
                  style={{
                    padding: '0.7rem',
                    borderRadius: 'var(--radius-md)',
                    background: 'var(--bg-card)',
                    border: '1px solid var(--border-medium)',
                    color: 'var(--text-primary)',
                    textAlign: 'left',
                    fontSize: '0.8rem',
                  }}
                >
                  <div style={{ fontWeight: 600, color: 'var(--accent-emerald)' }}>
                    🛡️ Trigger: Scope Baseline Seal
                  </div>
                  <div style={{ fontSize: '0.72rem', color: 'var(--text-tertiary)', marginTop: '0.15rem' }}>
                    Verifies cryptographic checksum across all clauses.
                  </div>
                </button>
              </div>
            </div>

            <div style={{
              background: 'var(--bg-card)',
              border: '1px solid var(--border-subtle)',
              borderRadius: 'var(--radius-md)',
              padding: '1rem',
              fontSize: '0.76rem',
              color: 'var(--text-secondary)',
            }}>
              <strong>Webhook Integration:</strong> Connected via Slack App Incoming Webhooks to endpoint <code>https://hooks.slack.com/services/T01/B04/scopelock</code>.
            </div>
          </div>
        </div>
      )}

      {/* Subtab 2: Transactional Email Inbox */}
      {activeSubTab === 'email' && (
        <div style={{ display: 'grid', gridTemplateColumns: '360px 1fr', gap: '1.5rem', minHeight: '560px' }}>
          {/* Email List */}
          <div className="glass-panel" style={{ padding: '0.75rem', overflowY: 'auto' }}>
            <div style={{ fontSize: '0.74rem', color: 'var(--text-tertiary)', textTransform: 'uppercase', padding: '0.5rem', fontWeight: 600 }}>
              Inbox ({emails.length} notifications)
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
              {emails.map(email => {
                const isSelected = email.id === selectedEmail?.id;
                return (
                  <button
                    key={email.id}
                    onClick={() => {
                      setSelectedEmailId(email.id);
                      markEmailAsRead(email.id);
                    }}
                    style={{
                      padding: '0.85rem',
                      borderRadius: 'var(--radius-md)',
                      background: isSelected ? 'var(--bg-card-hover)' : 'var(--bg-card)',
                      border: isSelected ? '1px solid var(--accent-primary)' : '1px solid var(--border-subtle)',
                      textAlign: 'left',
                      color: 'var(--text-primary)',
                      position: 'relative',
                    }}
                  >
                    {!email.read && (
                      <div style={{
                        position: 'absolute',
                        top: '12px',
                        right: '12px',
                        width: '8px',
                        height: '8px',
                        borderRadius: '50%',
                        background: 'var(--accent-primary)',
                      }} />
                    )}
                    <div style={{ fontSize: '0.72rem', color: 'var(--text-tertiary)', marginBottom: '0.2rem' }}>
                      {email.from} • {email.timestamp}
                    </div>
                    <div style={{ fontWeight: email.read ? 500 : 700, fontSize: '0.84rem', marginBottom: '0.25rem', paddingRight: '1rem' }}>
                      {email.subject}
                    </div>
                    <div style={{ fontSize: '0.74rem', color: 'var(--text-secondary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {email.preview}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Email Body Viewer */}
          <div className="glass-panel" style={{ padding: '2rem', display: 'flex', flexDirection: 'column' }}>
            {selectedEmail ? (
              <div>
                <div style={{ borderBottom: '1px solid var(--border-medium)', paddingBottom: '1.25rem', marginBottom: '1.5rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.5rem' }}>
                    <h3 style={{ fontSize: '1.15rem', fontWeight: 700 }}>{selectedEmail.subject}</h3>
                    <span className="badge badge-emerald">Verified Sender</span>
                  </div>
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                    <div><strong>From:</strong> {selectedEmail.from}</div>
                    <div><strong>To:</strong> {selectedEmail.to}</div>
                    <div><strong>Date:</strong> {selectedEmail.timestamp}</div>
                  </div>
                </div>

                <div style={{
                  fontSize: '0.88rem',
                  lineHeight: 1.7,
                  whiteSpace: 'pre-wrap',
                  color: 'var(--text-primary)',
                  background: 'var(--bg-secondary)',
                  padding: '1.5rem',
                  borderRadius: 'var(--radius-md)',
                  border: '1px solid var(--border-subtle)',
                }}>
                  {selectedEmail.body}
                </div>
              </div>
            ) : (
              <div style={{ textAlign: 'center', color: 'var(--text-tertiary)', margin: 'auto' }}>
                Select an email to view full content.
              </div>
            )}
          </div>
        </div>
      )}

      {/* Subtab 3: Preferences / Alert Fatigue Settings */}
      {activeSubTab === 'settings' && (
        <div className="glass-panel" style={{ padding: '2rem', maxWidth: '720px', margin: '0 auto' }}>
          <h3 style={{ fontSize: '1.15rem', fontWeight: 600, marginBottom: '0.35rem' }}>
            Stakeholder Notification & Fatigue Controls
          </h3>
          <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', marginBottom: '1.5rem' }}>
            Customize channels and frequency to prevent alert fatigue while ensuring critical approvals are not missed.
          </p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1rem', background: 'var(--bg-card)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)' }}>
              <div>
                <div style={{ fontWeight: 600, fontSize: '0.88rem' }}>Slack Channel Alerts</div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                  Post interactive approval cards to #scope-and-contract-ops
                </div>
              </div>
              <input
                type="checkbox"
                checked={slackEnabled}
                onChange={e => setSlackEnabled(e.target.checked)}
                style={{ width: '20px', height: '20px', accentColor: 'var(--accent-primary)' }}
              />
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1rem', background: 'var(--bg-card)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)' }}>
              <div>
                <div style={{ fontWeight: 600, fontSize: '0.88rem' }}>Transactional SMTP Email</div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                  Send contract signature links and CR submission notices to stakeholders
                </div>
              </div>
              <input
                type="checkbox"
                checked={emailEnabled}
                onChange={e => setEmailEnabled(e.target.checked)}
                style={{ width: '20px', height: '20px', accentColor: 'var(--accent-primary)' }}
              />
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1rem', background: 'var(--bg-card)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)' }}>
              <div>
                <div style={{ fontWeight: 600, fontSize: '0.88rem' }}>SMS Critical Pings</div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                  Send SMS when a contract signature is overdue by &gt; 48 hours
                </div>
              </div>
              <input
                type="checkbox"
                checked={smsUrgentEnabled}
                onChange={e => setSmsUrgentEnabled(e.target.checked)}
                style={{ width: '20px', height: '20px', accentColor: 'var(--accent-primary)' }}
              />
            </div>

            <div style={{ padding: '1rem', background: 'var(--bg-card)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)' }}>
              <div style={{ fontWeight: 600, fontSize: '0.88rem', marginBottom: '0.5rem' }}>
                Alert Cadence & Fatigue Throttling
              </div>
              <select
                value={cadence}
                onChange={e => setCadence(e.target.value)}
                style={{ fontSize: '0.84rem' }}
              >
                <option value="INSTANT">Instant Real-time Dispatch (Recommended for Signing)</option>
                <option value="HOURLY">Hourly Batch Digest</option>
                <option value="DAILY">Daily Executive Morning Briefing (9:00 AM)</option>
              </select>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

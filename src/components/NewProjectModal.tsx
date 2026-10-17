import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { X, FolderPlus, DollarSign, Clock, Building, User, Mail, Calendar } from 'lucide-react';
import { PricingModel } from '../types';

interface NewProjectModalProps {
  onClose: () => void;
}

export const NewProjectModal: React.FC<NewProjectModalProps> = ({ onClose }) => {
  const { createProject, setActiveTab } = useApp();

  const [name, setName] = useState('');
  const [clientName, setClientName] = useState('');
  const [clientEmail, setClientEmail] = useState('');
  const [clientOrg, setClientOrg] = useState('');
  const [description, setDescription] = useState('');
  const [pricingModel, setPricingModel] = useState<PricingModel>('FIXED_PRICE');
  const [baseBudget, setBaseBudget] = useState(180000);
  const [hourlyRate, setHourlyRate] = useState(175);
  const [startDate, setStartDate] = useState(new Date().toISOString().split('T')[0]);
  const [deliveryDate, setDeliveryDate] = useState('2027-03-31');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    createProject({
      name,
      clientName: clientName || 'Client Stakeholder',
      clientEmail: clientEmail || 'client@enterprise.com',
      clientOrg: clientOrg || 'Enterprise Client Inc.',
      description: description || 'Scoped engineering engagement.',
      pricingModel,
      baseBudget: Number(baseBudget),
      hourlyRate: Number(hourlyRate),
      startDate,
      baseDeliveryDate: deliveryDate,
      currentDeliveryDate: deliveryDate,
    });

    setActiveTab('dashboard');
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
            <FolderPlus size={22} color="var(--accent-primary)" />
            <div>
              <h3 style={{ fontSize: '1.15rem', fontWeight: 600 }}>Create New Project Engagement</h3>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Initialize scope baseline & contractual terms</p>
            </div>
          </div>
          <button onClick={onClose} style={{ color: 'var(--text-tertiary)', padding: '0.3rem' }}>
            <X size={18} />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} style={{ padding: '1.5rem' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '1rem', marginBottom: '1.25rem' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '0.35rem' }}>
                Project Initiative Title *
              </label>
              <input
                type="text"
                required
                value={name}
                onChange={e => setName(e.target.value)}
                placeholder="e.g. NextGen Microservices Data Pipeline"
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '0.35rem' }}>
                Description & Engagement Objective
              </label>
              <textarea
                rows={2}
                value={description}
                onChange={e => setDescription(e.target.value)}
                placeholder="Brief summary of the engineering objectives and architecture..."
              />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1rem', marginBottom: '1.25rem' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '0.35rem' }}>
                Client Organization
              </label>
              <div style={{ position: 'relative' }}>
                <input
                  type="text"
                  value={clientOrg}
                  onChange={e => setClientOrg(e.target.value)}
                  placeholder="Apex Global LLC"
                />
              </div>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '0.35rem' }}>
                Client Authorized Signer
              </label>
              <input
                type="text"
                value={clientName}
                onChange={e => setClientName(e.target.value)}
                placeholder="e.g. Rachel Adams"
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '0.35rem' }}>
                Signer Email (for DocuSign)
              </label>
              <input
                type="email"
                value={clientEmail}
                onChange={e => setClientEmail(e.target.value)}
                placeholder="radams@client.com"
              />
            </div>
          </div>

          {/* Pricing Model Section */}
          <div style={{
            background: 'var(--bg-glass)',
            border: '1px solid var(--border-medium)',
            borderRadius: 'var(--radius-md)',
            padding: '1.2rem',
            marginBottom: '1.25rem'
          }}>
            <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.75rem' }}>
              Pricing & Commercial Billing Model
            </label>
            <div style={{ display: 'flex', gap: '1rem', marginBottom: '1rem' }}>
              <label
                style={{
                  flex: 1,
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.6rem',
                  padding: '0.75rem',
                  borderRadius: 'var(--radius-md)',
                  background: pricingModel === 'FIXED_PRICE' ? 'var(--accent-primary-glow)' : 'transparent',
                  border: `1px solid ${pricingModel === 'FIXED_PRICE' ? 'var(--accent-primary)' : 'var(--border-subtle)'}`,
                  cursor: 'pointer'
                }}
              >
                <input
                  type="radio"
                  name="pricingModel"
                  checked={pricingModel === 'FIXED_PRICE'}
                  onChange={() => setPricingModel('FIXED_PRICE')}
                  style={{ width: 'auto' }}
                />
                <div>
                  <div style={{ fontWeight: 600, fontSize: '0.88rem' }}>Fixed-Price Engagement</div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)' }}>Strict scope baseline with change control fees</div>
                </div>
              </label>

              <label
                style={{
                  flex: 1,
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.6rem',
                  padding: '0.75rem',
                  borderRadius: 'var(--radius-md)',
                  background: pricingModel === 'TIME_AND_MATERIALS' ? 'var(--accent-primary-glow)' : 'transparent',
                  border: `1px solid ${pricingModel === 'TIME_AND_MATERIALS' ? 'var(--accent-primary)' : 'var(--border-subtle)'}`,
                  cursor: 'pointer'
                }}
              >
                <input
                  type="radio"
                  name="pricingModel"
                  checked={pricingModel === 'TIME_AND_MATERIALS'}
                  onChange={() => setPricingModel('TIME_AND_MATERIALS')}
                  style={{ width: 'auto' }}
                />
                <div>
                  <div style={{ fontWeight: 600, fontSize: '0.88rem' }}>Time & Materials (T&M)</div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)' }}>Billed per logged hour with rate card</div>
                </div>
              </label>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.78rem', color: 'var(--text-secondary)', marginBottom: '0.3rem' }}>
                  Base Budget Cap ($ USD)
                </label>
                <input
                  type="number"
                  value={baseBudget}
                  onChange={e => setBaseBudget(Number(e.target.value))}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.78rem', color: 'var(--text-secondary)', marginBottom: '0.3rem' }}>
                  Blended Hourly Rate ($/hr)
                </label>
                <input
                  type="number"
                  value={hourlyRate}
                  onChange={e => setHourlyRate(Number(e.target.value))}
                />
              </div>
            </div>
          </div>

          {/* Schedule */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1.5rem' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '0.35rem' }}>
                Target Project Start Date
              </label>
              <input
                type="date"
                value={startDate}
                onChange={e => setStartDate(e.target.value)}
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '0.35rem' }}>
                Base Delivery Deadline
              </label>
              <input
                type="date"
                value={deliveryDate}
                onChange={e => setDeliveryDate(e.target.value)}
              />
            </div>
          </div>

          {/* Footer */}
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem' }}>
            <button
              type="button"
              onClick={onClose}
              style={{
                padding: '0.65rem 1.25rem',
                borderRadius: 'var(--radius-md)',
                border: '1px solid var(--border-medium)',
                color: 'var(--text-secondary)',
                fontSize: '0.88rem'
              }}
            >
              Cancel
            </button>
            <button
              type="submit"
              style={{
                padding: '0.65rem 1.5rem',
                borderRadius: 'var(--radius-md)',
                background: 'var(--accent-primary)',
                color: '#ffffff',
                fontSize: '0.88rem',
                fontWeight: 600,
                boxShadow: 'var(--shadow-glow)',
              }}
            >
              Initialize Project Baseline
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

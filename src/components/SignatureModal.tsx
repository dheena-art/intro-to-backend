import React, { useRef, useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { Contract } from '../types';
import { X, Check, PenTool, Type, ShieldCheck, RefreshCw } from 'lucide-react';
import confetti from 'canvas-confetti';

interface SignatureModalProps {
  contract: Contract;
  onClose: () => void;
}

export const SignatureModal: React.FC<SignatureModalProps> = ({ contract, onClose }) => {
  const { currentUser, signContract } = useApp();
  const [mode, setMode] = useState<'draw' | 'type'>('draw');
  const [typedName, setTypedName] = useState(currentUser.name);
  const [isAgreed, setIsAgreed] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [hasDrawn, setHasDrawn] = useState(false);

  // Setup canvas drawing
  useEffect(() => {
    if (mode === 'draw' && canvasRef.current) {
      const canvas = canvasRef.current;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.strokeStyle = '#3b82f6';
        ctx.lineWidth = 2.5;
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';
      }
    }
  }, [mode]);

  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    setIsDrawing(true);
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    const rect = canvas.getBoundingClientRect();
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;
    ctx.beginPath();
    ctx.moveTo(clientX - rect.left, clientY - rect.top);
    setHasDrawn(true);
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    const rect = canvas.getBoundingClientRect();
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;
    ctx.lineTo(clientX - rect.left, clientY - rect.top);
    ctx.stroke();
  };

  const stopDrawing = () => {
    setIsDrawing(false);
  };

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    setHasDrawn(false);
  };

  const handleSign = () => {
    if (!isAgreed) return;

    let signatureDataUrl = '';
    if (mode === 'draw' && canvasRef.current && hasDrawn) {
      signatureDataUrl = canvasRef.current.toDataURL('image/png');
    } else {
      // Generate SVG data url for typed signature
      const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="300" height="70"><text x="10" y="48" font-family="Brush Script MT, cursive" font-size="34" fill="#2563eb">${typedName}</text></svg>`;
      signatureDataUrl = `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
    }

    const signerType = currentUser.role === 'CLIENT_SIGNER' ? 'client' : 'vendor';
    signContract(contract.id, signerType, signatureDataUrl, typedName);

    // Trigger celebratory confetti
    confetti({
      particleCount: 80,
      spread: 70,
      origin: { y: 0.6 },
    });

    onClose();
  };

  const isClientRole = currentUser.role === 'CLIENT_SIGNER';
  const isVendorRole = currentUser.role === 'PROJECT_MANAGER' || currentUser.role === 'LEGAL_COUNSEL';

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div
        className="modal-content"
        style={{ maxWidth: '640px' }}
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div style={{
          padding: '1.25rem 1.5rem',
          borderBottom: '1px solid var(--border-subtle)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <ShieldCheck size={20} color="var(--accent-primary)" />
              <h3 style={{ fontSize: '1.15rem', fontWeight: 600 }}>DocuSign Secure E-Signature</h3>
            </div>
            <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', marginTop: '0.2rem' }}>
              Signing Document: <strong>{contract.contractNumber}</strong> ({contract.humanizedTitle || contract.title})
            </p>
          </div>
          <button
            onClick={onClose}
            style={{
              padding: '0.4rem',
              borderRadius: 'var(--radius-md)',
              color: 'var(--text-tertiary)',
            }}
          >
            <X size={18} />
          </button>
        </div>

        {/* Body */}
        <div style={{ padding: '1.5rem' }}>
          {/* Signer Info Banner */}
          <div style={{
            background: 'var(--bg-glass)',
            border: '1px solid var(--border-medium)',
            borderRadius: 'var(--radius-md)',
            padding: '1rem',
            marginBottom: '1.25rem',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center'
          }}>
            <div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)', textTransform: 'uppercase' }}>Signer Profile</div>
              <div style={{ fontWeight: 600, fontSize: '0.95rem' }}>{currentUser.name}</div>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>{currentUser.email} • {currentUser.organization}</div>
            </div>
            <span className={`badge ${isClientRole ? 'badge-emerald' : 'badge-blue'}`}>
              {isClientRole ? 'Client Signer' : 'Vendor Signer'}
            </span>
          </div>

          {/* Mode Switcher */}
          <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1rem' }}>
            <button
              onClick={() => setMode('draw')}
              style={{
                flex: 1,
                padding: '0.6rem',
                borderRadius: 'var(--radius-md)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.5rem',
                fontSize: '0.85rem',
                fontWeight: 600,
                background: mode === 'draw' ? 'var(--accent-primary)' : 'var(--bg-secondary)',
                color: mode === 'draw' ? '#ffffff' : 'var(--text-secondary)',
                border: `1px solid ${mode === 'draw' ? 'var(--accent-primary)' : 'var(--border-subtle)'}`,
              }}
            >
              <PenTool size={16} /> Draw Signature
            </button>
            <button
              onClick={() => setMode('type')}
              style={{
                flex: 1,
                padding: '0.6rem',
                borderRadius: 'var(--radius-md)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.5rem',
                fontSize: '0.85rem',
                fontWeight: 600,
                background: mode === 'type' ? 'var(--accent-primary)' : 'var(--bg-secondary)',
                color: mode === 'type' ? '#ffffff' : 'var(--text-secondary)',
                border: `1px solid ${mode === 'type' ? 'var(--accent-primary)' : 'var(--border-subtle)'}`,
              }}
            >
              <Type size={16} /> Type Signature
            </button>
          </div>

          {/* Signature Area */}
          {mode === 'draw' ? (
            <div>
              <div style={{
                position: 'relative',
                border: '2px dashed var(--border-medium)',
                borderRadius: 'var(--radius-md)',
                background: '#ffffff',
                height: '160px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <canvas
                  ref={canvasRef}
                  width={580}
                  height={156}
                  style={{ width: '100%', height: '100%', cursor: 'crosshair', touchAction: 'none' }}
                  onMouseDown={startDrawing}
                  onMouseMove={draw}
                  onMouseUp={stopDrawing}
                  onMouseLeave={stopDrawing}
                  onTouchStart={startDrawing}
                  onTouchMove={draw}
                  onTouchEnd={stopDrawing}
                />
                {!hasDrawn && (
                  <div style={{
                    position: 'absolute',
                    pointerEvents: 'none',
                    color: '#94a3b8',
                    fontSize: '0.9rem',
                    fontStyle: 'italic',
                  }}>
                    Draw your signature here with mouse or touch
                  </div>
                )}
              </div>
              <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '0.5rem' }}>
                <button
                  onClick={clearCanvas}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.3rem',
                    fontSize: '0.78rem',
                    color: 'var(--text-tertiary)',
                  }}
                >
                  <RefreshCw size={13} /> Clear Canvas
                </button>
              </div>
            </div>
          ) : (
            <div>
              <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '0.4rem' }}>
                Full Legal Name:
              </label>
              <input
                type="text"
                value={typedName}
                onChange={e => setTypedName(e.target.value)}
                placeholder="Enter full name"
                style={{ marginBottom: '1rem' }}
              />
              <div style={{
                border: '1px solid var(--border-subtle)',
                borderRadius: 'var(--radius-md)',
                padding: '1.25rem',
                background: '#ffffff',
                textAlign: 'center',
              }}>
                <div style={{
                  fontFamily: 'Brush Script MT, cursive',
                  fontSize: '2.5rem',
                  color: '#2563eb',
                  letterSpacing: '1px'
                }}>
                  {typedName || 'Your Name'}
                </div>
              </div>
            </div>
          )}

          {/* Legal Consent Checkbox */}
          <div style={{
            marginTop: '1.5rem',
            padding: '0.9rem',
            borderRadius: 'var(--radius-md)',
            background: 'var(--bg-card)',
            border: '1px solid var(--border-subtle)',
            display: 'flex',
            gap: '0.75rem',
            alignItems: 'flex-start'
          }}>
            <input
              type="checkbox"
              id="legal-consent"
              checked={isAgreed}
              onChange={e => setIsAgreed(e.target.checked)}
              style={{ width: '18px', height: '18px', marginTop: '2px', accentColor: 'var(--accent-primary)' }}
            />
            <label htmlFor="legal-consent" style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', cursor: 'pointer', lineHeight: 1.4 }}>
              I agree to use electronic records and signatures. By clicking <strong>"Adopt & Sign"</strong>, I confirm that this digital signature is legally binding and equivalent to a handwritten signature under the ESIGN Act and UETA.
            </label>
          </div>
        </div>

        {/* Footer */}
        <div style={{
          padding: '1rem 1.5rem',
          borderTop: '1px solid var(--border-subtle)',
          display: 'flex',
          justifyContent: 'flex-end',
          gap: '0.75rem'
        }}>
          <button
            onClick={onClose}
            style={{
              padding: '0.6rem 1.1rem',
              borderRadius: 'var(--radius-md)',
              border: '1px solid var(--border-medium)',
              color: 'var(--text-secondary)',
              fontSize: '0.88rem'
            }}
          >
            Cancel
          </button>
          <button
            onClick={handleSign}
            disabled={!isAgreed || (mode === 'draw' && !hasDrawn) || (mode === 'type' && !typedName.trim())}
            style={{
              padding: '0.6rem 1.4rem',
              borderRadius: 'var(--radius-md)',
              background: isAgreed ? 'var(--accent-primary)' : 'var(--border-subtle)',
              color: isAgreed ? '#ffffff' : 'var(--text-tertiary)',
              fontSize: '0.88rem',
              fontWeight: 600,
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              cursor: isAgreed ? 'pointer' : 'not-allowed',
              boxShadow: isAgreed ? '0 0 16px var(--accent-primary-glow)' : 'none',
            }}
          >
            <Check size={16} /> Adopt & Sign Document
          </button>
        </div>
      </div>
    </div>
  );
};

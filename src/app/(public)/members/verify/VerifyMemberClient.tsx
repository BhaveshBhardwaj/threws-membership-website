'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { 
  ShieldCheck, 
  Search, 
  QrCode, 
  CheckCircle, 
  AlertTriangle, 
  User, 
  ExternalLink, 
  Loader2, 
  X,
  Camera
} from 'lucide-react';

import Button from '@/components/ui/Button';
import { verifyMember } from '@/actions/member.actions';
import type { MemberData } from '@/types';
import styles from './page.module.css';

function formatTier(type: string) {
  return type.replace(/_/g, ' ').replace(/\b\w/g, (char) => char.toUpperCase());
}

export default function VerifyMemberClient() {
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<MemberData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isScannerOpen, setIsScannerOpen] = useState(false);
  const [mockScanCode, setMockScanCode] = useState('');

  const handleVerify = async (e?: React.FormEvent, searchVal?: string) => {
    if (e) e.preventDefault();
    
    const valueToSearch = searchVal !== undefined ? searchVal : query;
    if (!valueToSearch.trim()) {
      setError('Please enter a Member ID or Email.');
      setResult(null);
      return;
    }

    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const res = await verifyMember(valueToSearch);
      if (res.success && res.data) {
        setResult(res.data);
      } else {
        setError(res.error || 'No active member found with this ID or Email.');
      }
    } catch (err) {
      setError('An unexpected error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleMockScan = (e: React.FormEvent) => {
    e.preventDefault();
    if (mockScanCode.trim()) {
      setQuery(mockScanCode);
      setIsScannerOpen(false);
      handleVerify(undefined, mockScanCode);
      setMockScanCode('');
    }
  };

  const simulateQuickScan = (code: string) => {
    setQuery(code);
    setIsScannerOpen(false);
    handleVerify(undefined, code);
  };

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <ShieldCheck size={56} className={styles.headerIcon} />
        <h1>Verify Membership</h1>
        <p>
          Instantly verify the credentials, active status, and public records of any researcher or professional within the global Westbridge network.
        </p>
      </div>

      <div className={styles.verifyCard}>
        <h2>Search Database</h2>
        
        <form onSubmit={handleVerify} className={styles.searchForm}>
          <div className={styles.inputField}>
            <label htmlFor="member-search-input">
              Member ID or Registered Email
            </label>
            <div className={styles.inputWrapper}>
              <Search size={18} className={styles.searchIcon} />
              <input 
                id="member-search-input"
                type="text" 
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="e.g. THR-F-2026-001 or scholar@institution.edu" 
                required
              />
            </div>
          </div>
          
          <div className={styles.buttonGroup}>
            <Button 
              type="submit" 
              variant="primary" 
              className={styles.verifyBtn}
              loading={loading}
            >
              Verify Member
            </Button>
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => setIsScannerOpen(true)}
              className={styles.scanBtn}
            >
              <QrCode size={18} />
              Scan QR Code
            </Button>
          </div>
        </form>

        <p className={styles.disclaimer}>
          * To protect privacy, only authorized public directory profile attributes are exposed via this validation hub.
        </p>
      </div>

      {/* Results Section */}
      <div className={styles.resultsArea}>
        {loading && (
          <div style={{ display: 'flex', justifyContent: 'center', padding: '2rem' }}>
            <Loader2 size={36} className="animate-spin" style={{ color: 'var(--color-primary)' }} />
          </div>
        )}

        {error && !loading && (
          <div className={styles.resultError}>
            <AlertTriangle size={28} className={styles.errorIcon} />
            <div className={styles.errorText}>
              <h3>Verification Unsuccessful</h3>
              <p>{error}</p>
            </div>
          </div>
        )}

        {result && !loading && (
          <div className={styles.resultSuccess}>
            <div className={styles.resultHeader}>
              <CheckCircle size={32} className={styles.successIcon} />
              <div className={styles.resultTitle}>
                <h3>Verification Confirmed</h3>
                <span>Active Westbridge Research Credentials</span>
              </div>
            </div>

            <div className={styles.resultGrid}>
              <div className={styles.resultAvatar}>
                {result.photoUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={result.photoUrl} alt={result.fullName} />
                ) : (
                  <User size={36} />
                )}
              </div>

              <div className={styles.detailsList}>
                <div className={styles.detailItem}>
                  <dt>Full Name</dt>
                  <dd>{result.fullName}</dd>
                </div>
                <div className={styles.detailItem}>
                  <dt>Membership ID</dt>
                  <dd>{result.membershipId}</dd>
                </div>
                <div className={styles.detailItem}>
                  <dt>Member Tier</dt>
                  <dd>{formatTier(result.type)}</dd>
                </div>
                <div className={styles.detailItem}>
                  <dt>Designation</dt>
                  <dd>{result.designation}</dd>
                </div>
                <div className={styles.detailItem}>
                  <dt>Institution</dt>
                  <dd>{result.institution}</dd>
                </div>
                <div className={styles.detailItem}>
                  <dt>Verification Status</dt>
                  <dd style={{ color: '#10b981', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                    <ShieldCheck size={16} /> Active Member
                  </dd>
                </div>
              </div>
            </div>

            <div className={styles.viewProfileContainer}>
              <Link href={`/members/${result.membershipId}`}>
                <Button variant="primary" className={styles.viewProfileBtn}>
                  View Full Profile <ExternalLink size={14} />
                </Button>
              </Link>
            </div>
          </div>
        )}
      </div>

      {/* QR Code Scanner Overlay Modal */}
      {isScannerOpen && (
        <div className={styles.modalOverlay}>
          <div className={styles.modalContent}>
            <button 
              type="button" 
              onClick={() => setIsScannerOpen(false)}
              className={styles.closeModalBtn}
              aria-label="Close Scanner"
            >
              <X size={20} />
            </button>
            
            <Camera size={32} style={{ color: 'var(--color-primary)', margin: '0 auto 0.75rem auto' }} />
            <h3>QR Scanner Simulator</h3>
            <p>
              Allow camera access to scan the QR verification code directly from a member's digital membership card.
            </p>

            <div className={styles.scannerViewfinder}>
              <div className={styles.scannerLine} />
              <div className={styles.scannerCorners} />
              <div className={styles.scannerCornersInner} />
              <QrCode size={120} className={styles.qrPlaceholder} />
            </div>

            <p className={styles.scannerHelpText}>Align member card QR within frame</p>

            <div style={{ borderTop: '1px solid var(--color-border)', paddingTop: '1.5rem', marginTop: '1rem' }}>
              <p style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)', marginBottom: '1rem' }}>
                Simulate a QR scan below by entering a mock ID:
              </p>
              
              <form onSubmit={handleMockScan} className={styles.mockScannerInput}>
                <input 
                  type="text" 
                  value={mockScanCode}
                  onChange={(e) => setMockScanCode(e.target.value)}
                  placeholder="e.g. THR-F-2026-001"
                  required
                />
                <Button type="submit" variant="primary">
                  Scan
                </Button>
              </form>

              <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'center', marginTop: '0.75rem' }}>
                <Button 
                  type="button" 
                  variant="outline" 
                  size="sm"
                  onClick={() => simulateQuickScan('THR-F-2026-001')}
                  style={{ fontSize: '0.75rem', padding: '0.4rem 0.8rem' }}
                >
                  Quick Scan Demo ID
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

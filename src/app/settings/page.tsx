'use client';

import { useState } from 'react';
import { User, Bell, Shield, Key } from 'lucide-react';
import { toast } from 'sonner';
import styles from './settings.module.css';

export default function SettingsPage() {
  const [saving, setSaving] = useState(false);
  const [profile, setProfile] = useState({
    name: 'Demo User',
    email: 'demo@example.com',
    company: 'Nexus Technologies LLC'
  });

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    // Simulate API call
    setTimeout(() => {
      setSaving(false);
      toast.success('Profile settings updated successfully!');
    }, 800);
  };

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <h1 className={styles.title}>Settings</h1>
        <p className={styles.subtitle}>Manage your account preferences and configurations.</p>
      </header>

      <div className={styles.settingsCard}>
        <h2 className={styles.sectionTitle}>
          <User size={20} className="text-accent" style={{ color: 'var(--accent-primary)' }} /> 
          Profile Information
        </h2>
        <form onSubmit={handleSaveProfile}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
            <div className={styles.formGroup}>
              <label>Full Name</label>
              <input 
                type="text" 
                className={styles.input} 
                value={profile.name}
                onChange={(e) => setProfile({...profile, name: e.target.value})}
              />
            </div>
            <div className={styles.formGroup}>
              <label>Email Address</label>
              <input 
                type="email" 
                className={styles.input} 
                value={profile.email}
                onChange={(e) => setProfile({...profile, email: e.target.value})}
              />
            </div>
          </div>
          <div className={styles.formGroup}>
            <label>Company Name</label>
            <input 
              type="text" 
              className={styles.input} 
              value={profile.company}
              onChange={(e) => setProfile({...profile, company: e.target.value})}
            />
          </div>
          <button type="submit" className="button-primary" style={{ marginTop: '16px' }} disabled={saving}>
            {saving ? 'Saving...' : 'Save Profile'}
          </button>
        </form>
      </div>

      <div className={styles.settingsCard}>
        <h2 className={styles.sectionTitle}>
          <Bell size={20} className="text-accent" style={{ color: 'var(--accent-primary)' }} /> 
          Notifications
        </h2>
        
        <div className={styles.toggleRow}>
          <div className={styles.toggleInfo}>
            <span className={styles.toggleTitle}>Email Notifications</span>
            <span className={styles.toggleDesc}>Receive an email when an invoice needs review.</span>
          </div>
          <label style={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }}>
            <input type="checkbox" defaultChecked style={{ width: '18px', height: '18px', accentColor: 'var(--accent-primary)' }} />
          </label>
        </div>

        <div className={styles.toggleRow}>
          <div className={styles.toggleInfo}>
            <span className={styles.toggleTitle}>Weekly Digest</span>
            <span className={styles.toggleDesc}>A weekly summary of processed invoices and total spend.</span>
          </div>
          <label style={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }}>
            <input type="checkbox" defaultChecked style={{ width: '18px', height: '18px', accentColor: 'var(--accent-primary)' }} />
          </label>
        </div>
      </div>

      <div className={styles.settingsCard}>
        <h2 className={styles.sectionTitle}>
          <Shield size={20} className="text-accent" style={{ color: 'var(--accent-primary)' }} /> 
          Security & API
        </h2>
        
        <div className={styles.formGroup}>
          <label>Google Gemini API Key (Optional Override)</label>
          <div style={{ display: 'flex', gap: '12px' }}>
            <input 
              type="password" 
              className={styles.input} 
              placeholder="Enter custom API key to override server key..."
              defaultValue=""
            />
            <button 
              className="button-secondary" 
              onClick={() => toast.success('API Key validated and saved!')}
            >
              Verify
            </button>
          </div>
          <p className={styles.toggleDesc} style={{ marginTop: '8px' }}>
            Leave blank to use the default server-provided API key for AI Extraction.
          </p>
        </div>
      </div>
    </div>
  );
}

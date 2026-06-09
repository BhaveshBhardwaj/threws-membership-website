'use client';

import Card from '@/components/ui/Card';
import Input from '@/components/ui/Input';
import Button from '@/components/ui/Button';

export default function SettingsPage() {
  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '2rem', fontWeight: 'bold' }}>Platform Settings</h1>
      </div>

      <div style={{ display: 'grid', gap: '2rem' }}>
        <Card>
          <h2 style={{ fontSize: '1.25rem', fontWeight: 'bold', marginBottom: '1rem' }}>General Settings</h2>
          <form style={{ display: 'flex', flexDirection: 'column', gap: '1rem', maxWidth: '500px' }}>
            <Input label="Site Name" defaultValue="Westbridge Research" />
            <Input label="Contact Email" type="email" defaultValue="contact@westbridgeresearch.com" />
            <Button type="button" style={{ width: 'fit-content' }}>Save Changes</Button>
          </form>
        </Card>

        <Card>
          <h2 style={{ fontSize: '1.25rem', fontWeight: 'bold', marginBottom: '1rem' }}>Change Password</h2>
          <form style={{ display: 'flex', flexDirection: 'column', gap: '1rem', maxWidth: '500px' }}>
            <Input label="Current Password" type="password" />
            <Input label="New Password" type="password" />
            <Input label="Confirm New Password" type="password" />
            <Button type="button" style={{ width: 'fit-content' }}>Update Password</Button>
          </form>
        </Card>
      </div>
    </div>
  );
}

import React from 'react';
import { useAuth } from '../auth/AuthContext.jsx';

export default function AccountPage() {
  const { profile, role, user } = useAuth();

  return (
    <>
      <p className="shell-eyebrow">Account</p>
      <h1>Your LYG Account</h1>
      <p className="shell-copy">
        This secure account area is ready for future client, crew, and owner workflows.
      </p>
      <div className="account-state-card">
        <span>Signed in as</span>
        <strong>{user?.email}</strong>
        <span>Role</span>
        <strong>{role ?? 'user'}</strong>
        {profile?.full_name && (
          <>
            <span>Name</span>
            <strong>{profile.full_name}</strong>
          </>
        )}
      </div>
    </>
  );
}

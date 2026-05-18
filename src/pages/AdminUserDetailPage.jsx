import React, { useEffect, useMemo, useState } from 'react';
import { useAuth } from '../auth/AuthContext.jsx';
import { canAccessAdmin, canManageRoles, normalizeRole } from '../auth/roles.js';
import AdminActionButton from '../components/AdminActionButton.jsx';
import Avatar from '../components/Avatar.jsx';
import FlagIcon from '../components/FlagIcon.jsx';
import Icon from '../components/Icons.jsx';
import StatusBadge from '../components/StatusBadge.jsx';
import banIconUrl from '../assets/icons/actions/ico-ban.svg?url&no-inline';
import trashIconUrl from '../assets/icons/actions/ico-trash.svg?url&no-inline';
import arrowLeftIconUrl from '../assets/icons/navigation/ico-arrow-left.svg?url&no-inline';
import { supabase } from '../lib/supabaseClient.js';
import { navigateTo } from '../routes/router.js';
import { getPhoneDisplayParts } from '../utils/phoneFlags.js';

const validRoles = ['user', 'admin', 'super_admin'];

function normalizeAdminUser(row) {
  if (!row) return row;

  return {
    ...row,
    avatar_url: row.auth_avatar_url || row.avatar_url || null,
  };
}

function formatDate(value) {
  if (!value) return '-';

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '-';

  return new Intl.DateTimeFormat('en', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  }).format(date);
}

function formatDateTimeWithTimezone(value) {
  if (!value) return 'Never';

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return 'Never';

  const datePart = formatDate(value);
  const parts = new Intl.DateTimeFormat('en', {
    hour: 'numeric',
    minute: '2-digit',
    timeZoneName: 'shortOffset',
  }).formatToParts(date);
  const timeValue = parts
    .filter((part) => part.type !== 'timeZoneName')
    .map((part) => part.value)
    .join('')
    .trim();
  const timeZone = parts.find((part) => part.type === 'timeZoneName')?.value;

  return [datePart, timeValue, timeZone].filter(Boolean).join(' · ');
}

function getPhoneDisplay(phone) {
  const display = getPhoneDisplayParts(phone);
  if (!display) return null;

  if (!display.country) return <span>{display.text}</span>;
  return (
    <span className="admin-detail-phone-value">
      <FlagIcon className="admin-detail-phone-flag" countryCode={display.country.countryCode} />
      <span className="admin-detail-phone-code">{display.country.code}</span>
      {display.localNumber && <span>{display.localNumber}</span>}
    </span>
  );
}

function getProviderInfo(user) {
  const appMetadata = user?.app_metadata || {};
  const userMetadata = user?.user_metadata || {};
  const providers = Array.isArray(appMetadata.providers) ? appMetadata.providers : [];
  const identityProvider = Array.isArray(user?.identities)
    ? user.identities.map((identity) => identity?.provider).find(Boolean)
    : null;
  const provider = user?.provider || identityProvider || appMetadata.provider || (userMetadata.iss ? 'google' : 'email');
  const normalizedProvider = String(provider).toLowerCase();
  const isOAuth = normalizedProvider === 'google' || providers.includes('google') || Boolean(userMetadata.iss);
  const providerName = normalizedProvider === 'google' ? 'Google' : provider.charAt(0).toUpperCase() + provider.slice(1);

  return {
    normalizedProvider,
    provider: providerName,
    providerType: isOAuth ? 'OAuth' : 'Email/password',
  };
}

function getProviderDisplay(providerInfo) {
  if (providerInfo.normalizedProvider === 'google') {
    return (
      <span className="admin-detail-provider-value">
        <Icon name="ico-google" size={16} />
        <span>Google</span>
      </span>
    );
  }

  return providerInfo.provider;
}

export default function AdminUserDetailPage({ userId }) {
  const { role: currentUserRole, user: currentUser } = useAuth();
  const [adminUser, setAdminUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isUpdating, setIsUpdating] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');

  const normalizedCurrentUserRole = normalizeRole(currentUserRole);
  const isSuperAdmin = canManageRoles(normalizedCurrentUserRole);
  const isSelf = adminUser?.id === currentUser?.id;
  const providerInfo = useMemo(() => getProviderInfo(adminUser), [adminUser]);
  const canChangeStatus =
    Boolean(adminUser) &&
    !isSelf &&
    !(normalizedCurrentUserRole === 'admin' && canAccessAdmin(adminUser.role));
  const canChangeRole = Boolean(adminUser) && isSuperAdmin && !isSelf;
  const canRemove = Boolean(adminUser) && isSuperAdmin && !isSelf;

  const loadUser = async () => {
    if (!supabase) {
      setError('Supabase is not configured.');
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError('');

    const { data, error: rpcError } = await supabase.rpc('get_admin_users');

    if (rpcError) {
      console.error('[AdminUserDetailPage] admin user fetch error:', rpcError);
      setError(rpcError.message);
      setAdminUser(null);
    } else {
      setAdminUser((data ?? []).map(normalizeAdminUser).find((row) => row.id === userId) ?? null);
    }

    setIsLoading(false);
  };

  useEffect(() => {
    loadUser();
  }, [userId]);

  const handleUpdateRole = async (newRole) => {
    if (!adminUser) return;
    if (!isSuperAdmin) {
      setError('Only super admins can change user roles.');
      return;
    }
    if (isSelf) {
      setError('You cannot change your own role.');
      return;
    }
    if (!validRoles.includes(newRole)) {
      setError('Invalid role selected.');
      return;
    }
    if (newRole === normalizeRole(adminUser.role)) return;

    const confirmed = window.confirm(`Change role for ${adminUser.email} to ${newRole}?`);
    if (!confirmed) return;

    setIsUpdating(true);
    setMessage('');
    setError('');

    const { error: updateError } = await supabase.rpc('update_user_role', {
      target_user_id: adminUser.id,
      new_role: newRole,
    });

    if (updateError) {
      setError(updateError.message);
    } else {
      setMessage(`Role updated for ${adminUser.email}.`);
      await loadUser();
    }

    setIsUpdating(false);
  };

  const handleUpdateStatus = async (newStatus) => {
    if (!adminUser) return;
    if (isSelf) {
      setError('You cannot change your own status.');
      return;
    }
    if (!canChangeStatus) {
      setError('Admins cannot change status of other admins or super admins.');
      return;
    }

    const action = newStatus === 'blocked' ? 'Block' : 'Unblock';
    const confirmed = window.confirm(`${action} user ${adminUser.email}?`);
    if (!confirmed) return;

    setIsUpdating(true);
    setMessage('');
    setError('');

    const { error: updateError } = await supabase.rpc('update_user_status', {
      target_user_id: adminUser.id,
      new_status: newStatus,
    });

    if (updateError) {
      setError(updateError.message);
    } else {
      setMessage(`User ${adminUser.email} ${newStatus === 'blocked' ? 'blocked' : 'unblocked'}.`);
      await loadUser();
    }

    setIsUpdating(false);
  };

  const handleRemoveUser = async () => {
    if (!adminUser) return;
    if (isSelf) {
      setError('You cannot remove yourself.');
      return;
    }
    if (!isSuperAdmin) {
      setError('Only super admins can remove users.');
      return;
    }

    const confirmed = window.confirm(`Permanently remove user ${adminUser.email}? This will delete their profile.`);
    if (!confirmed) return;

    setIsUpdating(true);
    setMessage('');
    setError('');

    const { error: deleteError } = await supabase.rpc('remove_admin_user', {
      target_user_id: adminUser.id,
    });

    if (deleteError) {
      setError(deleteError.message);
      setIsUpdating(false);
    } else {
      navigateTo('/admin/users');
    }
  };

  if (isLoading) {
    return <p className="admin-empty-state">Loading user profile...</p>;
  }

  if (!adminUser) {
    return (
      <div className="admin-user-detail">
        {error && <p className="admin-alert admin-alert-error">{error}</p>}
        <section className="admin-card">
          <p className="admin-empty-state">User profile not found.</p>
        </section>
      </div>
    );
  }

  const status = adminUser.status || 'active';

  return (
    <div className="admin-user-detail">
      <button className="admin-text-button admin-back-button" type="button" onClick={() => navigateTo('/admin/users')}>
        <img className="admin-back-button-icon svg-icon" src={arrowLeftIconUrl} alt="" aria-hidden="true" />
        Back to users
      </button>

      {message && <p className="admin-alert admin-alert-success">{message}</p>}
      {error && <p className="admin-alert admin-alert-error">{error}</p>}

      <section className="admin-card admin-user-profile-card">
        <div className="admin-user-profile-heading">
          <Avatar
            className="admin-user-profile-avatar"
            fallbackName={adminUser.full_name || adminUser.email || 'User'}
            profile={{
              full_name: adminUser.full_name,
              email: adminUser.email,
              avatar_url: adminUser.avatar_url,
              auth_avatar_url: adminUser.auth_avatar_url,
            }}
            user={adminUser}
          />
          <div>
            <p className="subtitle-page">User Profile</p>
            <h2>{adminUser.full_name || adminUser.email || 'User'}</h2>
          </div>
        </div>

        <div className="admin-detail-grid">
          <AdminDetail label="First name" value={adminUser.first_name} />
          <AdminDetail label="Last name" value={adminUser.last_name} />
          <AdminDetail label="Email" value={adminUser.email} />
          <AdminDetail label="Phone" value={getPhoneDisplay(adminUser.phone)} />
          <AdminDetail label="Provider" value={getProviderDisplay(providerInfo)} />
          <AdminDetail label="Provider type" value={providerInfo.providerType} />
          <div className="detail-row admin-detail-field">
            <span>Role</span>
            <select
              className="select-control admin-detail-select"
              disabled={!canChangeRole || isUpdating}
              value={normalizeRole(adminUser.role) || 'user'}
              onChange={(event) => handleUpdateRole(event.target.value)}
            >
              <option value="user">User</option>
              <option value="admin">Admin</option>
              <option value="super_admin">Super admin</option>
            </select>
          </div>
          <div className="detail-row admin-detail-field">
            <span>Account status</span>
            <StatusBadge status={status} />
          </div>
          <AdminDetail label="Created date" value={formatDate(adminUser.created_at)} />
          <AdminDetail label="Last sign-in" value={formatDateTimeWithTimezone(adminUser.last_sign_in_at)} />
        </div>

        <div className="admin-user-detail-actions">
          {status === 'blocked' ? (
            <AdminActionButton
              className="button button-tone-destructive button-type-outline button-size-compact"
              disabled={!canChangeStatus || isUpdating}
              label="Unblock user"
              onClick={() => handleUpdateStatus('active')}
              type="button"
            >
              <img className="svg-icon icon-destructive" src={banIconUrl} alt="" aria-hidden="true" />
              <span>Unblock user</span>
            </AdminActionButton>
          ) : (
            <AdminActionButton
              className="button button-tone-destructive button-type-outline button-size-compact"
              disabled={!canChangeStatus || isUpdating}
              label="Block user"
              onClick={() => handleUpdateStatus('blocked')}
              type="button"
            >
              <img className="svg-icon icon-destructive" src={banIconUrl} alt="" aria-hidden="true" />
              <span>Block user</span>
            </AdminActionButton>
          )}
          <AdminActionButton
            className="button button-tone-destructive button-type-filled button-size-compact"
            disabled={!canRemove || isUpdating}
            label={!isSuperAdmin ? 'Only super admins can remove users' : 'Remove user'}
            onClick={handleRemoveUser}
            type="button"
          >
            <img className="svg-icon icon-on-brand-primary" src={trashIconUrl} alt="" aria-hidden="true" />
            <span>Delete user</span>
          </AdminActionButton>
        </div>
      </section>
    </div>
  );
}

function AdminDetail({ label, value }) {
  return (
    <div className="detail-row admin-detail-field">
      <span>{label}</span>
      <strong>{value || '-'}</strong>
    </div>
  );
}

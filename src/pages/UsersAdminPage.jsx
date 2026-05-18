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
import viewIconUrl from '../assets/icons/actions/ico-view.svg?url&no-inline';
import { supabase } from '../lib/supabaseClient.js';
import { navigateTo } from '../routes/router.js';
import { getPhoneDisplayParts } from '../utils/phoneFlags.js';

function formatDate(value) {
  if (!value) return '—';
  return new Intl.DateTimeFormat('en', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  }).format(new Date(value));
}

function formatDateTime(value) {
  if (!value) return 'Never';

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return 'Never';

  const datePart = new Intl.DateTimeFormat('en', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  }).format(date);
  const timePart = new Intl.DateTimeFormat('en', {
    hour: 'numeric',
    minute: '2-digit',
  }).format(date);

  return `${datePart} · ${timePart}`;
}

const validRoles = ['user', 'admin', 'super_admin'];

function normalizeAdminUser(row) {
  if (!row) return row;

  return {
    ...row,
    avatar_url: row.auth_avatar_url || row.avatar_url || null,
  };
}

function getAdminPhoneDisplay(phone) {
  const display = getPhoneDisplayParts(phone);
  if (!display) return null;

  return {
    countryCode: display.country?.countryCode ?? null,
    label: display.country?.name ?? '',
    text: display.text,
  };
}

export default function UsersAdminPage() {
  const { refreshProfile, user: currentUser, role: currentUserRole } = useAuth();
  const [users, setUsers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [updatingUserId, setUpdatingUserId] = useState(null);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');

  const normalizedCurrentUserRole = normalizeRole(currentUserRole);
  const isSuperAdmin = canManageRoles(normalizedCurrentUserRole);

  const loadUsers = async () => {
    if (!supabase) {
      setError('Supabase is not configured.');
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError('');

    const { data: adminUsers, error: rpcError } = await supabase.rpc('get_admin_users');

    if (!rpcError) {
      setUsers((adminUsers ?? []).map(normalizeAdminUser));
      setIsLoading(false);
      return;
    }

    const isMissingRpc =
      rpcError.code === '42883' ||
      rpcError.message?.toLowerCase().includes('function public.get_admin_users');

    if (!isMissingRpc) {
      console.error('[UsersAdminPage] admin users fetch error:', rpcError);
      setError(rpcError.message);
      setIsLoading(false);
      return;
    }

    const { data, error: loadError } = await supabase
      .from('profiles')
      .select('*')
      .order('created_at', { ascending: false });

    if (loadError) {
      console.error('[UsersAdminPage] profiles fetch error:', loadError);
      setError(loadError.message);
    } else {
      setUsers(data ?? []);
    }

    setIsLoading(false);
  };

  useEffect(() => {
    loadUsers();
  }, []);

  const filteredUsers = useMemo(() => {
    return users.filter((u) => {
      const matchesSearch = 
        (u.email?.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (u.full_name?.toLowerCase().includes(searchQuery.toLowerCase()));
      const matchesRole = roleFilter === 'all' || normalizeRole(u.role) === roleFilter;
      return matchesSearch && matchesRole;
    });
  }, [users, searchQuery, roleFilter]);

  const stats = useMemo(() => {
    const now = new Date();
    const thisMonth = now.getMonth();
    const thisYear = now.getFullYear();

    return [
      { label: 'Registered users', value: users.length },
      { 
        label: 'Admin users', 
        value: users.filter(u => canAccessAdmin(u.role)).length 
      },
      { 
        label: 'New this month', 
        value: users.filter(u => {
          const d = new Date(u.created_at);
          return d.getMonth() === thisMonth && d.getFullYear() === thisYear;
        }).length 
      },
      { 
        label: 'Pending profiles', 
        value: users.filter(u => !u.full_name || u.status === 'pending').length 
      },
    ];
  }, [users]);

  const handleUpdateRole = async (targetUser, newRole) => {
    if (!isSuperAdmin) {
      setError('Only super admins can change user roles.');
      return;
    }

    if (targetUser.id === currentUser?.id) {
      setError('You cannot change your own role.');
      return;
    }

    if (!validRoles.includes(newRole)) {
      setError('Invalid role selected.');
      return;
    }

    if (newRole === normalizeRole(targetUser.role)) return;

    const confirmed = window.confirm(`Change role for ${targetUser.email} to ${newRole}?`);
    if (!confirmed) return;

    setMessage('');
    setError('');
    setUpdatingUserId(targetUser.id);

    const { error: updateError } = await supabase.rpc('update_user_role', {
      target_user_id: targetUser.id,
      new_role: newRole,
    });

    if (updateError) {
      setError(updateError.message);
    } else {
      setMessage(`Role updated for ${targetUser.email}.`);
      await loadUsers();
      if (targetUser.id === currentUser?.id) {
        await refreshProfile();
      }
    }
    setUpdatingUserId(null);
  };

  const handleUpdateStatus = async (targetUser, newStatus) => {
    if (targetUser.id === currentUser?.id) {
      setError('You cannot change your own status.');
      return;
    }

    // Admins can block users, but only super_admins can block other admins
    if (normalizedCurrentUserRole === 'admin' && canAccessAdmin(targetUser.role)) {
      setError('Admins cannot change status of other admins or super admins.');
      return;
    }

    const action = newStatus === 'blocked' ? 'Block' : 'Unblock';
    const confirmed = window.confirm(`${action} user ${targetUser.email}?`);
    if (!confirmed) return;

    setMessage('');
    setError('');

    const { error: updateError } = await supabase.rpc('update_user_status', {
      target_user_id: targetUser.id,
      new_status: newStatus,
    });

    if (updateError) {
      setError(updateError.message);
    } else {
      setMessage(`User ${targetUser.email} ${newStatus === 'blocked' ? 'blocked' : 'unblocked'}.`);
      loadUsers();
    }
  };

  const handleRemoveUser = async (targetUser) => {
    if (targetUser.id === currentUser?.id) {
      setError('You cannot remove yourself.');
      return;
    }

    if (!isSuperAdmin) {
      setError('Only super admins can remove users.');
      return;
    }

    const confirmed = window.confirm(`Permanently remove user ${targetUser.email}? This will delete their profile.`);
    if (!confirmed) return;

    setMessage('');
    setError('');

    const { error: deleteError } = await supabase.rpc('remove_admin_user', {
      target_user_id: targetUser.id,
    });

    if (deleteError) {
      setError(deleteError.message);
    } else {
      setMessage(`User removed for ${targetUser.email}.`);
      loadUsers();
    }
  };

  return (
    <div className="admin-users-module">
      {message && <p className="admin-alert admin-alert-success">{message}</p>}
      {error && <p className="admin-alert admin-alert-error">{error}</p>}

      <div className="admin-stats-grid">
        {stats.map((stat) => (
          <article className="admin-stat-card" key={stat.label}>
            <span>{stat.label}</span>
            <strong>{stat.value}</strong>
          </article>
        ))}
      </div>

      {import.meta.env.DEV && !isSuperAdmin && (
        <p className="admin-dev-note" style={{ color: 'var(--primary-600)', fontSize: '12px', marginBottom: '10px' }}>
          <strong>Dev Note:</strong> Role editing is only enabled for <code>super_admin</code>. 
          Current role: <code>{normalizedCurrentUserRole || 'none'}</code>.
          To test, manually update your role to <code>super_admin</code> in the Supabase <code>profiles</code> table.
        </p>
      )}

      <section className="admin-card admin-table-card">
        <div className="admin-card-header">
          <h3 className="title-section">Manage users</h3>
          <div className="admin-table-filters">
            <div className="admin-search-field">
              <Icon name="ico-search" size={18} />
              <input 
                type="text" 
                placeholder="Search by name or email" 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <select className="select-control" value={roleFilter} onChange={(e) => setRoleFilter(e.target.value)}>
              <option value="all">All Roles</option>
              <option value="user">User</option>
              <option value="admin">Admin</option>
              <option value="super_admin">Super Admin</option>
            </select>
          </div>
        </div>

        {isLoading ? (
          <p className="admin-empty-state">Loading users...</p>
        ) : filteredUsers.length === 0 ? (
          <p className="admin-empty-state">No users found matching your criteria.</p>
        ) : (
          <div className="admin-cms-table" role="table" aria-label="User records">
            <div className="admin-cms-row admin-cms-head" role="row">
              <span>User</span>
              <span className="admin-cell-left">Email</span>
              <span className="admin-cell-left">Phone</span>
              <span>Provider</span>
              <span>Type</span>
              <span>Role</span>
              <span>Status</span>
              <span>Joined</span>
              <span>Last Sign In</span>
              <span>Actions</span>
            </div>
            {filteredUsers.map((u) => {
              const canChangeRole = isSuperAdmin && u.id !== currentUser?.id;

              // Provider identification
              const appMetadata = u.app_metadata || {};
              const userMetadata = u.user_metadata || {};
              const provider = u.provider || appMetadata.provider || (userMetadata.iss ? 'Google' : 'Email');
              const normalizedProvider = provider.toLowerCase();
              const providerName = provider.charAt(0).toUpperCase() + provider.slice(1);
              
              // Provider type identification
              const providers = appMetadata.providers || [];
              const isOAuth = normalizedProvider === 'google' || providers.includes('google') || Boolean(userMetadata.iss);
              const providerType = isOAuth ? 'OAuth' : 'Email/password';
              const isGoogleProvider = normalizedProvider === 'google' || providers.includes('google') || Boolean(userMetadata.iss);
              const phoneDisplay = getAdminPhoneDisplay(u.phone);
              const userProfilePath = `/admin/users/${encodeURIComponent(u.id)}`;
              const avatarUser = u.id === currentUser?.id
                ? {
                    ...u,
                    ...currentUser,
                    app_metadata: u.app_metadata || currentUser.app_metadata,
                    auth_avatar_url: u.auth_avatar_url || currentUser.auth_avatar_url,
                    identities: currentUser.identities || u.identities,
                    user_metadata: {
                      ...(u.user_metadata || {}),
                      ...(currentUser.user_metadata || {}),
                    },
                  }
                : u;

              return (
                <div className="admin-cms-row" role="row" key={u.id}>
                  <span className="admin-user-cell">
                    <Avatar
                      className="admin-user-avatar"
                      fallbackName={u.full_name || u.email || 'User'}
                      profile={{ full_name: u.full_name, email: u.email, avatar_url: u.avatar_url, auth_avatar_url: u.auth_avatar_url }}
                      user={avatarUser}
                    />
                    <a
                      aria-label={`View profile for ${u.full_name || u.email || 'user'}`}
                      className="admin-user-profile-link"
                      href={userProfilePath}
                      onClick={(event) => {
                        event.preventDefault();
                        navigateTo(userProfilePath);
                      }}
                    >
                      <strong>{u.full_name || 'No Name'}</strong>
                    </a>
                  </span>
                  <span className="admin-user-email admin-cell-left" title={u.email}>{u.email}</span>
                  <span className="admin-cell-left">
                    {phoneDisplay ? (
                      <span className="admin-phone-value" title={phoneDisplay.text}>
                        {phoneDisplay.countryCode && (
                          <FlagIcon className="admin-phone-flag" countryCode={phoneDisplay.countryCode} />
                        )}
                        <span>{phoneDisplay.text}</span>
                      </span>
                    ) : (
                      '—'
                    )}
                  </span>
                  <span className="admin-user-provider" title={providerName}>
                    {isGoogleProvider ? (
                      <span className="admin-provider-icon" title="Google">
                        <Icon name="ico-google" size={16} />
                        <span className="sr-only">Google</span>
                      </span>
                    ) : (
                      providerName
                    )}
                  </span>
                  <span className="admin-user-provider-type">{providerType}</span>
                  <span>
                    <div className="admin-inline-select-wrapper">
                      <select 
                        value={normalizeRole(u.role) || 'user'} 
                        disabled={!canChangeRole || updatingUserId === u.id}
                        onChange={(e) => handleUpdateRole(u, e.target.value)}
                        className="select-control admin-inline-select"
                      >
                        <option value="user">User</option>
                        <option value="admin">Admin</option>
                        <option value="super_admin">Super Admin</option>
                      </select>
                      {updatingUserId === u.id && <span className="admin-inline-loader" />}
                    </div>
                  </span>
                <span>
                  <StatusBadge status={u.status || 'active'} />
                </span>
                <span>{formatDate(u.created_at)}</span>
                <span className="admin-user-last-sign-in">{formatDateTime(u.last_sign_in_at)}</span>
                <span className="admin-table-actions">
                  <AdminActionButton
                    type="button"
                    onClick={() => navigateTo(userProfilePath)}
                    label="View user profile"
                  >
                    <img className="admin-action-icon" src={viewIconUrl} alt="" aria-hidden="true" />
                  </AdminActionButton>
                  {u.status === 'blocked' ? (
                    <AdminActionButton
                      type="button" 
                      onClick={() => handleUpdateStatus(u, 'active')}
                      label="Unblock user"
                      disabled={u.id === currentUser?.id}
                    >
                      <img className="admin-action-icon" src={banIconUrl} alt="" aria-hidden="true" />
                    </AdminActionButton>
                  ) : (
                    <AdminActionButton
                      type="button" 
                      onClick={() => handleUpdateStatus(u, 'blocked')}
                      label="Block user"
                      disabled={u.id === currentUser?.id || (normalizedCurrentUserRole === 'admin' && canAccessAdmin(u.role))}
                    >
                      <img className="admin-action-icon" src={banIconUrl} alt="" aria-hidden="true" />
                    </AdminActionButton>
                  )}
                  <AdminActionButton
                    type="button" 
                    onClick={() => handleRemoveUser(u)}
                    label={!isSuperAdmin ? 'Only super admins can remove users' : 'Remove user'}
                    disabled={!isSuperAdmin || u.id === currentUser?.id}
                  >
                    <img className="admin-action-icon" src={trashIconUrl} alt="" aria-hidden="true" />
                  </AdminActionButton>
                </span>
              </div>
            );
          })}
        </div>
      )}
    </section>

      <style>{`
        .admin-users-module { display: grid; gap: 20px; }
        .admin-table-filters { display: flex; gap: 16px; align-items: center; width: 100%; }
        .admin-search-field { 
          display: flex; 
          align-items: center; 
          gap: 8px; 
          background: rgba(255, 255, 255, 0.9); 
          border: 1px solid rgba(10, 36, 48, 0.14);
          border-radius: var(--control-radius);
          min-height: var(--control-height-default);
          padding: 0 var(--control-padding-x);
          flex: 1;
        }
        .admin-search-field input {
          border: none;
          background: transparent;
          height: calc(var(--control-height-default) - 2px);
          width: 100%;
          outline: none;
          font-size: 14px;
          color: var(--color-text-primary, var(--ink));
          font-family: var(--text-font-family-body, Open Sans, sans-serif);
          line-height: 22px;
        }
        .admin-search-field input::placeholder {
          color: var(--color-text-tertiary, var(--muted-light));
          opacity: 1;
        }
        .admin-search-field input:focus::placeholder {
          color: transparent;
        }
        .admin-table-filters select {
          min-width: 140px;
        }
        .admin-inline-select {
          width: 100%;
        }
        .admin-inline-select-wrapper {
          position: relative;
          display: flex;
          align-items: center;
          width: 100%;
        }
        .admin-inline-loader {
          position: absolute;
          right: -18px;
          width: 12px;
          height: 12px;
          border: 2px solid var(--primary-300);
          border-top-color: transparent;
          border-radius: 50%;
          animation: admin-spin 0.6s linear infinite;
        }
        @keyframes admin-spin {
          to { transform: rotate(360deg); }
        }
        .admin-users-module .admin-cms-table {
          --users-table-columns: 240px 280px 180px 110px 130px 150px 120px 150px 170px 150px;
          position: relative;
          overflow-x: auto;
          overflow-y: hidden;
        }
        .admin-users-module .admin-cms-row {
          grid-template-columns: var(--users-table-columns);
          gap: 0;
          min-width: 1650px;
          width: max-content;
          padding: 0;
        }
        .admin-users-module .admin-cms-row > span {
          display: flex;
          align-items: center;
          min-width: 0;
          min-height: 56px;
          padding: 14px 12px;
          white-space: nowrap;
          overflow: hidden;
        }
        .admin-users-module .admin-cms-row > span:first-child {
          position: sticky;
          left: 0;
          z-index: 2;
          min-width: 240px;
          padding-left: 16px;
          background: var(--color-surface-default, var(--surface, #fff));
          box-shadow: 1px 0 0 rgba(10, 36, 48, 0.1);
        }
        .admin-users-module .admin-cms-head > span:first-child {
          z-index: 3;
          background: var(--color-surface-subtle, #f3f6f7);
        }
        .admin-users-module .admin-cms-row > span:nth-child(4),
        .admin-users-module .admin-cms-row > span:nth-child(5),
        .admin-users-module .admin-cms-row > span:nth-child(7) {
          justify-content: center;
          text-align: center;
        }
        .admin-user-cell { flex-direction: row; gap: 10px; }
        .admin-user-cell strong { overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
        .admin-user-profile-link {
          min-width: 0;
          color: inherit;
          text-decoration: none;
          cursor: pointer;
          transition: color 180ms var(--ease-luxury);
        }
        .admin-user-profile-link:hover,
        .admin-user-profile-link:focus-visible {
          color: var(--color-text-link, var(--primary-600));
          text-decoration: underline;
          text-underline-offset: 3px;
        }
        .admin-user-profile-link:focus-visible {
          outline: 1px solid var(--color-focus-outline, var(--primary-500));
          outline-offset: 3px;
        }
        .admin-cell-left {
          justify-content: flex-start !important;
          text-align: left !important;
        }
        .admin-user-email {
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
          min-width: 0;
        }
        .admin-user-provider {
          justify-content: center;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
          min-width: 0;
        }
        .admin-provider-icon {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          width: 20px;
          height: 20px;
        }
        .admin-provider-icon svg {
          display: block;
          flex: 0 0 auto;
        }
        .admin-user-provider-type {
          justify-content: center;
          text-align: center;
          white-space: nowrap;
        }
        .admin-phone-value {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          min-width: 0;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }
        .admin-phone-value span {
          min-width: 0;
          overflow: hidden;
          text-overflow: ellipsis;
        }
        .admin-phone-flag {
          width: 18px;
          height: 18px;
          flex: 0 0 18px;
          object-fit: contain;
        }
        .admin-user-last-sign-in {
          color: var(--text-muted);
          font-size: 13px;
          white-space: nowrap;
        }
        .admin-user-avatar {
          width: 32px;
          height: 32px;
          border-radius: 999px;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          flex: 0 0 32px;
          overflow: hidden;
          border: 1px solid rgba(10, 36, 48, 0.12);
          background: rgba(74, 131, 144, 0.14);
          color: var(--color-text-primary, var(--ink));
          font-family: var(--text-font-family-ui, Inter, sans-serif);
          font-size: 11px;
          font-weight: 600;
          line-height: 1;
        }
        .admin-user-avatar img {
          width: 100%;
          height: 100%;
          display: block;
          object-fit: cover;
        }
      `}</style>
    </div>
  );
}

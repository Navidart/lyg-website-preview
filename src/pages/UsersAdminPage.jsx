import React, { useEffect, useMemo, useState } from 'react';
import { useAuth } from '../auth/AuthContext.jsx';
import { canAccessAdmin, canManageRoles, normalizeRole } from '../auth/roles.js';
import AdminActionButton from '../components/AdminActionButton.jsx';
import Avatar from '../components/Avatar.jsx';
import Icon from '../components/Icons.jsx';
import { supabase } from '../lib/supabaseClient.js';

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
const adminPhoneFlagAssets = {
  ae: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABgAAAAYCAYAAADgdz34AAAACXBIWXMAAAsTAAALEwEAmpwYAAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8YQUAAAAOdEVYdFNvZnR3YXJlAEZpZ21hnrGWYwAAAJRJREFUeAHt1DsKwlAQheF/JJ0IKUTQFVgIii5DCwtdh4vSTSjY2Wtl0iVkBdlAMkn6PCCXSwjcr5niDExxYMAZmujx8kXVrwufh4DX/k9fAqlXjh0iTQsIZiZYNv4DXlu4XpyYbm5YO7CcbZmvzphwJXdq7SCOEsL3BxPlq7hqU3jP4JFjxJXcqSr5h+JjgSopzuAK3M0a+QMPpUIAAAAASUVORK5CYII=',
  au: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABgAAAAYCAYAAADgdz34AAAACXBIWXMAAAsTAAALEwEAmpwYAAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8YQUAAAAOdEVYdFNvZnR3YXJlAEZpZ21hnrGWYwAAAiBJREFUeAHtlNtLFFEcx787uyvFDOtKMLvmg84SGbQTghTRU4qh3diHgg1Ro8cg6Ep/QE8RCAU9SEIIkhVhBFJEDaviy4p4YXUVfHBBFnXH++WMuIs7njmKqLPoLCi++GHOzJzfmd/5/n6/c84AJxw3tuS3H/1hLt/d8CeOickVZlTKluhdR0V7Luu7hBw8LnXi8nkX7jdOWp9d1xccdb9TJe/KVby97kRzQoISGoNut8NGBYx2SRLwSk4hXViAN6F5ZrMePr3KKhuZR025F7WeJfxNn8XN2QibqOu0hGviOprVXPwKxUFIEtliSzZ9MYVk7+mj2elIXyk1OVR+1Uw2ny8PgdvF+PS5lwaR2jXmsA+PmBxANHAagS3TGApNlkSCYDCaAKvJ3gyCtS0sg8CdYtwTphGJEZSsxlmJ4rcCcHV04ufyGfyPLjMHVSU4iOqgzNZSnSbgOGp4ebcAVTMRNHQTvG6b2/7w0QsFracuoEZ2os6zmCE+MwLvhCgK7MkyGG9q1afo7qwPrzFFg38VGsvghsKzvkfk8fzBOeTHRvGwbZXZnj25Ck1L0rr37Su4vYuyxRA1HHeWrDroR8v3ocMRsAqXyeil0cl+D45EwCe58ZTW16ixr8gNqwh8jkWBojxItBk7xi97YQX5oogP9VXgt3bOThx7DUp7bPO86FvvFhiMqnj/MWw6xQZHvshGBgNUx3qxs4H+rnHCsbMBGD65dqxrjegAAAAASUVORK5CYII=',
  de: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABgAAAAYCAYAAADgdz34AAAACXBIWXMAAAsTAAALEwEAmpwYAAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8YQUAAAAOdEVYdFNvZnR3YXJlAEZpZ21hnrGWYwAAAGNJREFUeAHt1LENgDAMBMA3eABGoWUAMgEtW7AnjJINzFNRpnpFkXyS27yilw2k3qyU4wZigUCEVWfGyoGC8dkJYuMH+DVDynfxH7LkJsemWbI/4HQoZclNXwEPR3KuqSJ19wJ8TQk2tburiAAAAABJRU5ErkJggg==',
  es: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABgAAAAYCAYAAADgdz34AAAACXBIWXMAAAsTAAALEwEAmpwYAAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8YQUAAAAOdEVYdFNvZnR3YXJlAEZpZ21hnrGWYwAAAVRJREFUeAHt1MtKAlEcx/HvXFDzQpZkohFYROQq2hRdoF2FtOxheoTeoH3QCwTdIFpmJBREULaRwshL5BjaTDpzsnZDLXJocOMHzuFwFufHn3POH3q6Tcospy9BhHGBBFW1PU9/L10g2kPGZWpi1d0MdWRN+bEpFD+mZwrRslCtOySzgVPqb5uatkRh5xyzIYhtLBIdPeZfArSbFr4hCauwj1dp4Z9PEYw8UM+bCCEIJtVOz7cH+OfSSK0y1YMzZA9EVjaR6k3k6G77RfihfkSnbDf8litTOiliGXBhjLN3eotu1KhkSmjXJZywVfD1G4KTIWTNItV45jW7TTVXoX9hAr0qcMIWoAcFAa+BMhwj7osQbozRzGfRBxXMUAAnbAEvtSd0b5PkjIbZlyBs3SPPfpAvatSNd+IDdEx63Fp3VvsfqYVDCze534va48rNdk1P130CBKpzK4AFtgoAAAAASUVORK5CYII=',
  fr: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABgAAAAYCAYAAADgdz34AAAACXBIWXMAAAsTAAALEwEAmpwYAAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8YQUAAAAOdEVYdFNvZnR3YXJlAEZpZ21hnrGWYwAAAGNJREFUeAHtlLENgDAQA22UiopRGIGOCShoWIwd6JgDRskGkAUwUhQpKXzS64t/+ToDpjac5v1Ka/h6OI9VBvTLpuJjIDACD7JhJ8/6WgALLLDAghYEIc2t6pqkDPgp4ghTnRdL7gmW6YP91QAAAABJRU5ErkJggg==',
  it: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABgAAAAYCAYAAADgdz34AAAACXBIWXMAAAsTAAALEwEAmpwYAAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8YQUAAAAOdEVYdFNvZnR3YXJlAEZpZ21hnrGWYwAAAGBJREFUeAHtlKERgDAUQxMOhWIUpmADLEswAgMxCoxSgy4wAKlo71qRJ77JvzwXwNSG24EzAuPfwz7fsmBYVlUf+vdORAbsZKzTAlhggQUWtCD41vRSc00mtjbKNMBU5wGSPgqVta9BnAAAAABJRU5ErkJggg==',
  pk: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABgAAAAYCAYAAADgdz34AAAACXBIWXMAAAsTAAALEwEAmpwYAAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8YQUAAAAOdEVYdFNvZnR3YXJlAEZpZ21hnrGWYwAAAWtJREFUeAHtlL9Lw0AUx79XUkgHaesgqNBqO+ggUsGlg9A66eDg5KCLkyI4i3VX/wCnDi4Ojp2EbhYVQTq0okKXUlvBX0NtMMGAQr0LGoxJ4NIQuvSzHPfevfu+d+94QI9uQ2RZLhFCQv8d2asUHqQi3ECAlkAvT1g5BZ/IDrjGB49xJCD6g5gaWtZWTwRWp/OoNS+gfkq6bXxgQRMdCc+4E0jHMrQnBC21rttEIYhkZAOLE1nbOG6BxPAKnt6vDTb1S0Lubh2XjQPbOAEcsEzDgShe5BuTr/VRR76yZRvLVQHLlMHe2UmDuQUYteaZVkk6tg0ncAucVve0NRndxPzYPkKBiME/2k+rE0wDAURRlLbVhYfFOdy/nRtsqXgGs/EdfV+jftYD9nSlxyMUfpL4C1eTfylUd1F5PUGaCg32TSIsRqlAA7nbNVMyHQkwnulXPS4vcZ/3fBaxCspW49ovBNCGO9i4Ro+u8w3tg17JPN4D7wAAAABJRU5ErkJggg==',
  uk: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABgAAAAYCAYAAADgdz34AAAACXBIWXMAAAsTAAALEwEAmpwYAAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8YQUAAAAOdEVYdFNvZnR3YXJlAEZpZ21hnrGWYwAAAv9JREFUeAHtVG1IU1EYfu42J5SB35bhnESYllakIVphBhUqKORHSrnyI8IPMpLUP84wndY0P1IydWaBs8QfZqmQ2Y9ASmdm5moUMbVmThEpl+uqu93dcKkzWkH4xwcunPPe533Pc55zzgusYbVBzAtz+76fjLLsUelQKZFBNTptRHLcZAFJgjPMc8XMfCZPiPhi+YrczTT30jlv8NuaQZHaKc4nvtsux8pa+Pj7wUkYAOm9AXR0fliSpJvXAVwuLYf1UxU5i3k6RoBawgsJdsUJDzNYVVdgzn8fVF5+YF3s1KLNPQDEoAJOjVKkRmyBKOcQHOzXw1RspLn56b5IJBSwfNgKbVoKmnQ8pFxoA2tMrUFRw3ukjfExaucE84oa7B7qR2lhIKPoT9BzyuJc4NUkAeVgi5HEFGSW9aNK8gIaDQnWAnHgtRpJLV/Q6HYEhHoC1lfFSAjmoeZGyIq7Maie6TNSPTCoNvCIyBgptTzZwW4dsiL5sKq7jbnAw4yfbPlbmGfnM/+1wgxMgw3rujsgw0Pw1d2TVizDK/m4kRBipruXgglgK4dgVidlxqQgGjo+z5Q0EFRQuEkL/CtY+M8gtD2mWcRSDsPsVj0zJgVRoFycTUkDR1CqMAp6brdH/Ok9sJQ9B6f1ESYFMdiwyHMd3xkUPWc/eUofvgKTYWG4XCuH/sobCVPTwYXvm2YWIUHbcP74VtiIi0AoRyA7FoucBqVRYoaoCypvP5Cnohmu2GMaoUGuzN1fXNNwBh477FFSeBRhLCW4V0owFRiICp0rMgq6oB43VjZGx2LP3sfNliFMFOSBoihEtFehLN2bruXwyyKL9VxERXgg1McG3PLrzPXrDYtDUU3/ioWXo/mBAs+6PyI12ReeB/eDR78VMf1u2v19UE/3NdbfqP4d9N5nZj3GtbvvMCzMZnYT1FQOUfJOcJxqq19S9raWyoQkZBX3YPSzvgUTSwqw2bSTXDMYmidJgqOPLeN1dCohfzOBM/E+2HvAFzxR8RTWsOr4AaNvPuoJA7KuAAAAAElFTkSuQmCC',
  us: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABgAAAAYCAYAAADgdz34AAAACXBIWXMAAAsTAAALEwEAmpwYAAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8YQUAAAAOdEVYdFNvZnR3YXJlAEZpZ21hnrGWYwAAAZZJREFUeAHtlM9KAlEYxc/NUdBroJAjoQt1FxK0Mt31R2jRukXPILRKaNGiR2jRrm0EPUCLIFrUoj8bITUi0DEoaJyFLuaOpuH03ekFZoLBjT8YZvNxznfP4V5gxrRha1unNfrF3AyfBW6RgoB7WF9ZVPlKOBKCYQhkMzHUm12UVtO4f/zAcl5Fu9PDPA9Bzkw2dzHic/CCYooxVJUjymNgDCSewldXoFhIQyPxXCYOOWNZIzBjAGZ5NABstLQ+SoUU2loPnAdhiRGQ4FDpcw5KM9Ik8PKGAGdeDYBcNoaHp08UKZp6Q3eEGxSVjEzCoyGoZDPc38NQjXrR/zOgBR0xQZtLM50iikSCjnBXN50RGVG4UkWEDeAFx0CngpO0dYsiKq/n8NwwyCjuRJakfkxzDNtm+D46wEDl3g2kuCw0S4WeX9RR3sji+kZziq43dcjUZWzK5RWCHjtgxyd3tozGDZW5V0QxhheY1Xm34SPM3t7x10AI4a/BT/XQVwNlkl+Cnyh2YgF+Ikuu0U129Vz/gz5mTJ1fYyCP82nvLicAAAAASUVORK5CYII=',
};
const adminPhoneCountries = [
  { code: '+971', flag: adminPhoneFlagAssets.ae, label: 'United Arab Emirates' },
  { code: '+44', flag: adminPhoneFlagAssets.uk, label: 'United Kingdom' },
  { code: '+92', flag: adminPhoneFlagAssets.pk, label: 'Pakistan' },
  { code: '+61', flag: adminPhoneFlagAssets.au, label: 'Australia' },
  { code: '+33', flag: adminPhoneFlagAssets.fr, label: 'France' },
  { code: '+49', flag: adminPhoneFlagAssets.de, label: 'Germany' },
  { code: '+39', flag: adminPhoneFlagAssets.it, label: 'Italy' },
  { code: '+34', flag: adminPhoneFlagAssets.es, label: 'Spain' },
  { code: '+1', flag: adminPhoneFlagAssets.us, label: 'United States' },
];

function normalizeAdminUser(row) {
  if (!row) return row;

  return {
    ...row,
    avatar_url: row.auth_avatar_url || row.avatar_url || null,
  };
}

function getAdminPhoneDisplay(phone) {
  const normalized = typeof phone === 'string' ? phone.trim().replace(/\s+/g, ' ') : '';
  if (!normalized) return null;

  const compact = normalized.replace(/[().\-\s]/g, '');
  const country = adminPhoneCountries.find((item) => normalized.startsWith(item.code) || compact.startsWith(item.code));

  if (!country) {
    return { flag: null, label: '', text: normalized };
  }

  const rest = normalized.startsWith(country.code)
    ? normalized.slice(country.code.length).trim()
    : compact.slice(country.code.length).trim();

  return {
    flag: country.flag,
    label: country.label,
    text: rest ? `${country.code} ${rest}` : country.code,
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

    const { error: updateError } = await supabase
      .from('profiles')
      .update({ status: newStatus })
      .eq('id', targetUser.id);

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

    const confirmed = window.confirm(`Permanently remove user ${targetUser.email}? This will delete their profile. Note: Actual Auth deletion requires a secure backend function.`);
    if (!confirmed) return;

    setMessage('');
    setError('');

    // We only delete from profiles here. 
    // TODO: Implement secure Edge Function for auth.users deletion.
    const { error: deleteError } = await supabase
      .from('profiles')
      .delete()
      .eq('id', targetUser.id);

    if (deleteError) {
      setError(deleteError.message);
    } else {
      setMessage(`Profile removed for ${targetUser.email}.`);
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
            <select value={roleFilter} onChange={(e) => setRoleFilter(e.target.value)}>
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

              return (
                <div className="admin-cms-row" role="row" key={u.id}>
                  <span className="admin-user-cell">
                    <Avatar
                      className="admin-user-avatar"
                      fallbackName={u.full_name || u.email || 'User'}
                      profile={{ full_name: u.full_name, email: u.email, avatar_url: u.avatar_url }}
                      user={u}
                    />
                    <strong>{u.full_name || 'No Name'}</strong>
                  </span>
                  <span className="admin-user-email admin-cell-left" title={u.email}>{u.email}</span>
                  <span className="admin-cell-left">
                    {phoneDisplay ? (
                      <span className="admin-phone-value" title={phoneDisplay.text}>
                        {phoneDisplay.flag && (
                          <img className="admin-phone-flag" src={phoneDisplay.flag} alt="" aria-hidden="true" />
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
                        className="admin-inline-select"
                      >
                        <option value="user">User</option>
                        <option value="admin">Admin</option>
                        <option value="super_admin">Super Admin</option>
                      </select>
                      {updatingUserId === u.id && <span className="admin-inline-loader" />}
                    </div>
                  </span>
                <span>
                  <em className={`admin-status admin-status-${u.status === 'blocked' ? 'draft' : 'published'}`}>
                    {u.status || 'active'}
                  </em>
                </span>
                <span>{formatDate(u.created_at)}</span>
                <span className="admin-user-last-sign-in">{formatDateTime(u.last_sign_in_at)}</span>
                <span className="admin-table-actions">
                  {u.status === 'blocked' ? (
                    <AdminActionButton
                      type="button" 
                      onClick={() => handleUpdateStatus(u, 'active')}
                      label="Unblock user"
                      disabled={u.id === currentUser?.id}
                    >
                      <Icon name="shield" size={16} />
                    </AdminActionButton>
                  ) : (
                    <AdminActionButton
                      type="button" 
                      onClick={() => handleUpdateStatus(u, 'blocked')}
                      label="Block user"
                      disabled={u.id === currentUser?.id || (normalizedCurrentUserRole === 'admin' && canAccessAdmin(u.role))}
                    >
                      <Icon name="ico-ban" size={16} />
                    </AdminActionButton>
                  )}
                  <AdminActionButton
                    type="button" 
                    onClick={() => handleRemoveUser(u)}
                    label="Remove user"
                    disabled={!isSuperAdmin || u.id === currentUser?.id}
                  >
                    <Icon name="ico-trash" size={16} />
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
          height: var(--control-height-default);
          border: 1px solid rgba(10, 36, 48, 0.14);
          border-radius: var(--control-radius);
          padding: 0 var(--control-select-padding-right) 0 var(--control-padding-x);
          background-color: rgba(255, 255, 255, 0.9);
          min-width: 140px;
        }
        .admin-inline-select {
          background: transparent;
          border: 1px solid rgba(10, 36, 48, 0.08);
          border-radius: 2px;
          font-size: 12px;
          padding: 2px 4px;
          width: 100%;
        }
        .admin-inline-select-wrapper {
          position: relative;
          display: flex;
          align-items: center;
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
          --users-table-columns: 240px 280px 180px 110px 130px 150px 120px 150px 170px 120px;
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
        .admin-users-module .admin-cms-row > span:nth-child(5) {
          justify-content: center;
          text-align: center;
        }
        .admin-user-cell { flex-direction: row; gap: 10px; }
        .admin-user-cell strong { overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
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

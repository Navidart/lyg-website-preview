import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useAuth } from '../auth/AuthContext.jsx';
import { resolveAvatarUrl } from '../auth/avatar.js';
import Avatar from '../components/Avatar.jsx';
import PhoneInput, { formatPhoneForStorage, getInitialCountry, getInitialPhone, phoneCountries } from '../components/PhoneInput.jsx';
import editIconUrl from '../assets/icons/actions/ico-edit.svg?url&no-inline';
import { supabase } from '../lib/supabaseClient.js';

function cleanField(value) {
  const trimmed = value.trim();
  return trimmed || null;
}

export default function AccountPage() {
  const { profile, refreshProfile, user } = useAuth();
  const avatarInputRef = useRef(null);
  const initialCountry = useMemo(() => getInitialCountry(profile?.phone), [profile?.phone]);
  const initialValues = useMemo(() => ({
    firstName: profile?.first_name ?? '',
    lastName: profile?.last_name ?? '',
    phone: profile?.phone ?? '',
    phoneCountryName: initialCountry.name,
    phoneNumber: getInitialPhone(profile?.phone, initialCountry),
    avatarUrl: profile?.avatar_url ?? '',
  }), [initialCountry, profile]);
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [phone, setPhone] = useState('');
  const [selectedCountryName, setSelectedCountryName] = useState(phoneCountries[0].name);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [avatarUrl, setAvatarUrl] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);
  const [isAvatarDragging, setIsAvatarDragging] = useState(false);
  const selectedCountry = phoneCountries.find((country) => country.name === selectedCountryName) ?? phoneCountries[0];
  const formattedPhone = formatPhoneForStorage(phone, selectedCountry) ?? '';
  const hasAvatarImage = Boolean(avatarUrl || resolveAvatarUrl({ profile, user }));

  useEffect(() => {
    setFirstName(initialValues.firstName);
    setLastName(initialValues.lastName);
    setPhone(initialValues.phoneNumber);
    setSelectedCountryName(initialValues.phoneCountryName);
    setAvatarUrl(initialValues.avatarUrl);
  }, [initialValues]);

  const isDirty =
    firstName !== initialValues.firstName ||
    lastName !== initialValues.lastName ||
    formattedPhone !== initialValues.phone ||
    avatarUrl !== initialValues.avatarUrl;

  const handleCancel = () => {
    setFirstName(initialValues.firstName);
    setLastName(initialValues.lastName);
    setPhone(initialValues.phoneNumber);
    setSelectedCountryName(initialValues.phoneCountryName);
    setAvatarUrl(initialValues.avatarUrl);
    setMessage('');
    setError('');
  };

  const handleAvatarUpload = async (file) => {
    if (!file) return;

    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      setError('Please upload a JPG, PNG, or WebP image.');
      return;
    }

    if (!supabase || !user) {
      setError('Profile image upload is not available right now.');
      return;
    }

    setIsUploadingAvatar(true);
    setMessage('');
    setError('');

    const extension = file.name.split('.').pop()?.toLowerCase() || 'jpg';
    const filePath = `${user.id}/avatar-${Date.now()}.${extension}`;
    const { error: uploadError } = await supabase.storage.from('avatars').upload(filePath, file, {
      cacheControl: '3600',
      upsert: true,
    });

    if (uploadError) {
      setError(uploadError.message);
      setIsUploadingAvatar(false);
      return;
    }

    const { data } = supabase.storage.from('avatars').getPublicUrl(filePath);
    setAvatarUrl(data.publicUrl);
    setMessage('Profile image ready. Save your profile to apply it.');
    setIsUploadingAvatar(false);
  };

  const handleAvatarInputChange = async (event) => {
    await handleAvatarUpload(event.target.files?.[0]);
    event.target.value = '';
  };

  const handleAvatarDrop = async (event) => {
    event.preventDefault();
    setIsAvatarDragging(false);
    await handleAvatarUpload(event.dataTransfer.files?.[0]);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!supabase || !user) {
      setError('Profile updates are not available right now.');
      return;
    }

    const trimmedFirstName = firstName.trim();
    const trimmedLastName = lastName.trim();
    const fullName = [trimmedFirstName, trimmedLastName].filter(Boolean).join(' ');
    const hasPendingAvatarChange = avatarUrl !== initialValues.avatarUrl;

    setIsSaving(true);
    setMessage('');
    setError('');

    const { data: updatedProfile, error: updateError } = await supabase
      .from('profiles')
      .update({
        first_name: cleanField(firstName),
        last_name: cleanField(lastName),
        phone: formattedPhone || null,
        full_name: fullName || null,
        avatar_url: avatarUrl || null,
      })
      .eq('id', user.id)
      .select('avatar_url')
      .maybeSingle();

    if (updateError) {
      setError(hasPendingAvatarChange ? `Image uploaded, but profile image was not saved: ${updateError.message}` : updateError.message);
    } else if (hasPendingAvatarChange && (updatedProfile?.avatar_url ?? '') !== avatarUrl) {
      setError('Image uploaded, but profiles.avatar_url did not update. Please try saving again.');
    } else {
      await refreshProfile();
      setMessage('Profile updated.');
    }

    setIsSaving(false);
  };

  return (
    <div className="profile-page">
      <p className="subtitle-page">Profile</p>
      <h1 className="title-page">Your Profile</h1>
      <p className="shell-copy">
        Manage the personal details connected to your LYG account.
      </p>

      {message && <p className="admin-alert admin-alert-success">{message}</p>}
      {error && <p className="admin-alert admin-alert-error">{error}</p>}

      <form className="profile-form" onSubmit={handleSubmit}>
        <div className="profile-avatar-row">
          {hasAvatarImage ? (
            <div className="profile-avatar-control">
              {avatarUrl ? (
                <span className="profile-avatar" aria-label="Profile avatar">
                  <img src={avatarUrl} alt="" referrerPolicy="no-referrer" />
                </span>
              ) : (
                <Avatar
                  ariaLabel="Profile avatar"
                  className="profile-avatar"
                  fallbackName={profile?.full_name || user?.email || 'User'}
                  profile={profile}
                  user={user}
                />
              )}
              <button
                className="profile-avatar-edit"
                disabled={isUploadingAvatar}
                onClick={() => avatarInputRef.current?.click()}
                type="button"
              >
                <img className="svg-icon" src={editIconUrl} alt="" aria-hidden="true" />
                <span>{isUploadingAvatar ? 'Uploading...' : 'Edit image'}</span>
              </button>
            </div>
          ) : (
            <button
              aria-label="Upload profile image"
              className={`profile-avatar-dropzone ${isAvatarDragging ? 'is-dragging' : ''}`}
              disabled={isUploadingAvatar}
              onClick={() => avatarInputRef.current?.click()}
              onDragEnter={(event) => {
                event.preventDefault();
                setIsAvatarDragging(true);
              }}
              onDragLeave={() => setIsAvatarDragging(false)}
              onDragOver={(event) => event.preventDefault()}
              onDrop={handleAvatarDrop}
              type="button"
            >
              <span>{isUploadingAvatar ? 'Uploading...' : 'Add image'}</span>
              <small>Drop or browse</small>
            </button>
          )}
          <input
            accept="image/jpeg,image/png,image/webp"
            className="profile-avatar-input"
            onChange={handleAvatarInputChange}
            ref={avatarInputRef}
            type="file"
          />
          <div>
            <strong>{profile?.full_name || user?.email || 'LYG account'}</strong>
            <span>Personal profile</span>
          </div>
        </div>

        <div className="profile-form-grid">
          <label>
            <span>First name</span>
            <input value={firstName} onChange={(event) => setFirstName(event.target.value)} type="text" />
          </label>
          <label>
            <span>Last name</span>
            <input value={lastName} onChange={(event) => setLastName(event.target.value)} type="text" />
          </label>
          <label>
            <span>Email address</span>
            <input readOnly type="email" value={user?.email ?? profile?.email ?? ''} />
          </label>
          <label>
            <span>Phone number (optional)</span>
            <PhoneInput
              onCountryChange={setSelectedCountryName}
              onPhoneChange={setPhone}
              phone={phone}
              selectedCountryName={selectedCountryName}
            />
          </label>
        </div>

        <div className="profile-actions">
          <button className="button button-outlined-luxury profile-cancel-button" disabled={!isDirty || isSaving} onClick={handleCancel} type="button">
            Cancel
          </button>
          <button className="button button-primary" disabled={!isDirty || isSaving} type="submit">
            {isSaving ? 'Saving...' : 'Save profile'}
          </button>
        </div>
      </form>
    </div>
  );
}

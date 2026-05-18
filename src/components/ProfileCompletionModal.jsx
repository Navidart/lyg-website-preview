import React, { useEffect, useId, useState } from 'react';
import { useAuth } from '../auth/AuthContext.jsx';
import { supabase } from '../lib/supabaseClient.js';
import PhoneInput, { formatPhoneForStorage, getInitialCountry, getInitialPhone, phoneCountries } from './PhoneInput.jsx';

function cleanNameValue(value) {
  const normalized = value?.trim() ?? '';
  return normalized && !normalized.includes('@') ? normalized : '';
}

function isProfileComplete(profile) {
  return Boolean(cleanNameValue(profile?.first_name) && cleanNameValue(profile?.last_name));
}

function getIdentityData(user) {
  return Array.isArray(user?.identities)
    ? user.identities.map((identity) => identity?.identity_data ?? identity?.identityData ?? {}).filter(Boolean)
    : [];
}

function splitDisplayName(value) {
  const normalized = cleanNameValue(value);
  if (!normalized) return { firstName: '', lastName: '' };

  const [firstName, ...rest] = normalized.split(/\s+/);
  return {
    firstName: cleanNameValue(firstName),
    lastName: cleanNameValue(rest.join(' ')),
  };
}

function getRealNameParts(profile, user) {
  const profileFirstName = cleanNameValue(profile?.first_name);
  const profileLastName = cleanNameValue(profile?.last_name);

  if (profileFirstName || profileLastName) {
    return { firstName: profileFirstName, lastName: profileLastName };
  }

  const metadata = user?.user_metadata ?? {};
  const identities = getIdentityData(user);
  const displayName =
    cleanNameValue(metadata.full_name) ||
    cleanNameValue(metadata.name) ||
    identities.map((identityData) => cleanNameValue(identityData.full_name)).find(Boolean) ||
    identities.map((identityData) => cleanNameValue(identityData.name)).find(Boolean) ||
    '';

  return splitDisplayName(displayName);
}

export default function ProfileCompletionModal() {
  const { isProfileLoading, profile, profileError, refreshProfile, user } = useAuth();
  const titleId = useId();
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [selectedCountryName, setSelectedCountryName] = useState(phoneCountries[0].name);
  const [phone, setPhone] = useState('');
  const [error, setError] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const shouldShow = Boolean(user && profile && !profileError && !isProfileLoading && !isProfileComplete(profile));
  const selectedCountry = phoneCountries.find((country) => country.name === selectedCountryName) ?? phoneCountries[0];

  useEffect(() => {
    if (!shouldShow) return;

    const initialCountry = getInitialCountry(profile?.phone);
    const realNameParts = getRealNameParts(profile, user);
    setFirstName(realNameParts.firstName);
    setLastName(realNameParts.lastName);
    setSelectedCountryName(initialCountry.name);
    setPhone(getInitialPhone(profile?.phone, initialCountry));
    setError('');
  }, [profile, shouldShow, user]);

  if (!shouldShow) return null;

  const handleSubmit = async (event) => {
    event.preventDefault();

    const trimmedFirstName = firstName.trim();
    const trimmedLastName = lastName.trim();
    const formattedPhone = formatPhoneForStorage(phone, selectedCountry);

    if (!trimmedFirstName || !trimmedLastName) {
      setError('First name and last name are required.');
      return;
    }

    if (!supabase || !user) {
      setError('Profile saving is unavailable right now.');
      return;
    }

    setError('');
    setIsSaving(true);

    const { error: updateError } = await supabase
      .from('profiles')
      .update({
        first_name: trimmedFirstName,
        last_name: trimmedLastName,
        phone: formattedPhone,
        full_name: `${trimmedFirstName} ${trimmedLastName}`,
      })
      .eq('id', user.id);

    setIsSaving(false);

    if (updateError) {
      setError(updateError.message);
      return;
    }

    await refreshProfile();
  };

  return (
    <div className="auth-modal-layer" role="presentation">
      <div className="auth-modal-backdrop" aria-hidden="true" />
      <section className="auth-modal profile-completion-modal" role="dialog" aria-modal="true" aria-labelledby={titleId}>
        <div className="auth-modal-header">
          <h2 id={titleId}>
            <span>Welcome to</span>
            <span>Luxury Yacht Group</span>
          </h2>
          <p>A few details to personalize your experience.</p>
        </div>

        <form className="auth-form" onSubmit={handleSubmit}>
          <label>
            <span>First name</span>
            <input
              autoComplete="given-name"
              onChange={(event) => setFirstName(event.target.value)}
              placeholder="Enter your first name"
              required
              type="text"
              value={firstName}
            />
          </label>

          <label>
            <span>Last name</span>
            <input
              autoComplete="family-name"
              onChange={(event) => setLastName(event.target.value)}
              placeholder="Enter your last name"
              required
              type="text"
              value={lastName}
            />
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

          <button className="button button-primary auth-submit" disabled={isSaving} type="submit">
            {isSaving ? 'Saving...' : 'Save and continue'}
          </button>
        </form>

        {error && <p className="auth-alert auth-alert-error">{error}</p>}
      </section>
    </div>
  );
}

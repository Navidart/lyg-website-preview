import React, { useEffect, useId, useState } from 'react';
import { useAuth } from '../auth/AuthContext.jsx';
import { supabase } from '../lib/supabaseClient.js';

const phoneCountries = [
  { abbreviation: 'US', code: '+1', flag: '🇺🇸', name: 'United States', placeholder: '(555) 123-4567' },
  { abbreviation: 'UK', code: '+44', flag: '🇬🇧', name: 'United Kingdom', placeholder: '07123 456789' },
  { abbreviation: 'PK', code: '+92', flag: '🇵🇰', name: 'Pakistan', placeholder: '0300 1234567' },
  { abbreviation: 'CA', code: '+1', flag: '🇨🇦', name: 'Canada', placeholder: '(555) 123-4567' },
  { abbreviation: 'AU', code: '+61', flag: '🇦🇺', name: 'Australia', placeholder: '0412 345 678' },
  { abbreviation: 'AE', code: '+971', flag: '🇦🇪', name: 'United Arab Emirates', placeholder: '050 123 4567' },
  { abbreviation: 'FR', code: '+33', flag: '🇫🇷', name: 'France', placeholder: '06 12 34 56 78' },
  { abbreviation: 'DE', code: '+49', flag: '🇩🇪', name: 'Germany', placeholder: '01512 3456789' },
  { abbreviation: 'IT', code: '+39', flag: '🇮🇹', name: 'Italy', placeholder: '312 345 6789' },
  { abbreviation: 'ES', code: '+34', flag: '🇪🇸', name: 'Spain', placeholder: '612 34 56 78' },
];

function getInitialCountry(phoneValue) {
  const normalized = phoneValue?.trim() ?? '';
  return phoneCountries.find((country) => normalized.startsWith(country.code)) ?? phoneCountries[0];
}

function getInitialPhone(phoneValue, country) {
  const normalized = phoneValue?.trim() ?? '';
  if (!normalized) return '';
  return normalized.startsWith(country.code) ? normalized.slice(country.code.length).trim() : normalized;
}

function formatPhoneForStorage(phoneValue, country) {
  const normalized = phoneValue.trim();
  if (!normalized) return null;
  if (normalized.startsWith('+')) return normalized;
  return `${country.code} ${normalized}`;
}

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
            <div className="auth-phone-row">
              <div className="auth-phone-country">
                <span aria-hidden="true" className="auth-phone-country-display">
                  <span className="auth-phone-flag">{selectedCountry.flag}</span>
                  <span>{selectedCountry.abbreviation}</span>
                  <span>{selectedCountry.code}</span>
                </span>
                <select
                  aria-label="Phone country code"
                  className="auth-country-select"
                  onChange={(event) => setSelectedCountryName(event.target.value)}
                  value={selectedCountryName}
                >
                  {phoneCountries.map((country) => (
                    <option key={country.name} value={country.name}>
                      {country.flag} {country.abbreviation} {country.code}
                    </option>
                  ))}
                </select>
              </div>
              <input
                autoComplete="tel-national"
                inputMode="tel"
                onChange={(event) => setPhone(event.target.value)}
                placeholder={selectedCountry.placeholder}
                type="tel"
                value={phone}
              />
            </div>
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

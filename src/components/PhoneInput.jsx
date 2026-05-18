import React from 'react';
import FlagIcon from './FlagIcon.jsx';
import { phoneCountries } from '../utils/phoneFlags.js';

export { phoneCountries };

export function getInitialCountry(phoneValue) {
  const normalized = phoneValue?.trim() ?? '';
  return phoneCountries.find((country) => normalized.startsWith(country.code)) ?? phoneCountries[0];
}

export function getInitialPhone(phoneValue, country) {
  const normalized = phoneValue?.trim() ?? '';
  if (!normalized) return '';
  return normalized.startsWith(country.code) ? normalized.slice(country.code.length).trim() : normalized;
}

export function formatPhoneForStorage(phoneValue, country) {
  const normalized = phoneValue.trim();
  if (!normalized) return null;
  if (normalized.startsWith('+')) return normalized;
  return `${country.code} ${normalized}`;
}

export default function PhoneInput({
  onCountryChange,
  onPhoneChange,
  phone,
  selectedCountryName,
}) {
  const selectedCountry = phoneCountries.find((country) => country.name === selectedCountryName) ?? phoneCountries[0];

  return (
    <div className="phone-input auth-phone-row">
      <div className="phone-input-country auth-phone-country">
        <span aria-hidden="true" className="phone-input-country-display auth-phone-country-display">
          <FlagIcon className="phone-input-flag auth-phone-flag" countryCode={selectedCountry.countryCode} />
          <span>{selectedCountry.abbreviation}</span>
          <span>{selectedCountry.code}</span>
        </span>
        <select
          aria-label="Phone country code"
          className="phone-input-country-select auth-country-select"
          onChange={(event) => onCountryChange(event.target.value)}
          value={selectedCountryName}
        >
          {phoneCountries.map((country) => (
            <option key={country.name} value={country.name}>
              {country.abbreviation} {country.code}
            </option>
          ))}
        </select>
      </div>
      <input
        autoComplete="tel-national"
        className="phone-input-number"
        inputMode="tel"
        onChange={(event) => onPhoneChange(event.target.value)}
        placeholder={selectedCountry.placeholder}
        type="tel"
        value={phone}
      />
    </div>
  );
}

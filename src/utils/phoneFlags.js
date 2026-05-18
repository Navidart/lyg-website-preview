import aeFlag from '../assets/flag/flag-united-arab-emirates.svg';
import auFlag from '../assets/flag/flag-australia.svg';
import caFlag from '../assets/flag/flag-canada.svg';
import deFlag from '../assets/flag/flag-germany.svg';
import esFlag from '../assets/flag/flag-spain.svg';
import frFlag from '../assets/flag/flag-france.svg';
import gbFlag from '../assets/flag/flag-united-kingdom.svg';
import itFlag from '../assets/flag/flag-italy.svg';
import pkFlag from '../assets/flag/flag-pakistan.svg';
import usFlag from '../assets/flag/flag-united-states.svg';

export const countryCodeToFlagAsset = {
  AE: aeFlag,
  AU: auFlag,
  CA: caFlag,
  DE: deFlag,
  ES: esFlag,
  FR: frFlag,
  GB: gbFlag,
  IT: itFlag,
  PK: pkFlag,
  UK: gbFlag,
  US: usFlag,
};

export const phoneCountries = [
  { abbreviation: 'US', code: '+1', countryCode: 'US', flagSrc: usFlag, name: 'United States', placeholder: '(555) 123-4567' },
  { abbreviation: 'UK', code: '+44', countryCode: 'GB', flagSrc: gbFlag, name: 'United Kingdom', placeholder: '07123 456789' },
  { abbreviation: 'PK', code: '+92', countryCode: 'PK', flagSrc: pkFlag, name: 'Pakistan', placeholder: '0300 1234567' },
  { abbreviation: 'CA', code: '+1', countryCode: 'CA', flagSrc: caFlag, name: 'Canada', placeholder: '(555) 123-4567' },
  { abbreviation: 'AU', code: '+61', countryCode: 'AU', flagSrc: auFlag, name: 'Australia', placeholder: '0412 345 678' },
  { abbreviation: 'AE', code: '+971', countryCode: 'AE', flagSrc: aeFlag, name: 'United Arab Emirates', placeholder: '050 123 4567' },
  { abbreviation: 'FR', code: '+33', countryCode: 'FR', flagSrc: frFlag, name: 'France', placeholder: '06 12 34 56 78' },
  { abbreviation: 'DE', code: '+49', countryCode: 'DE', flagSrc: deFlag, name: 'Germany', placeholder: '01512 3456789' },
  { abbreviation: 'IT', code: '+39', countryCode: 'IT', flagSrc: itFlag, name: 'Italy', placeholder: '312 345 6789' },
  { abbreviation: 'ES', code: '+34', countryCode: 'ES', flagSrc: esFlag, name: 'Spain', placeholder: '612 34 56 78' },
];

export function getFlagByCountryCode(countryCode) {
  const normalized = countryCode?.trim().toUpperCase();
  const lookupCode = normalized === 'UK' ? 'GB' : normalized;
  return countryCodeToFlagAsset[lookupCode] ?? null;
}

export const getFlagIcon = getFlagByCountryCode;

export function getPhoneCountry(phoneValue) {
  const normalized = phoneValue?.trim().replace(/\s+/g, ' ') ?? '';
  const compact = normalized.replace(/[().\-\s]/g, '');
  if (!normalized) return null;

  return phoneCountries
    .slice()
    .sort((a, b) => b.code.length - a.code.length)
    .find((country) => normalized.startsWith(country.code) || compact.startsWith(country.code)) ?? null;
}

export function getPhoneDisplayParts(phoneValue) {
  const normalized = typeof phoneValue === 'string' ? phoneValue.trim().replace(/\s+/g, ' ') : '';
  if (!normalized) return null;

  const compact = normalized.replace(/[().\-\s]/g, '');
  const country = getPhoneCountry(normalized);
  if (!country) {
    return { country: null, flagSrc: null, localNumber: normalized, text: normalized };
  }

  const localNumber = normalized.startsWith(country.code)
    ? normalized.slice(country.code.length).trim()
    : compact.slice(country.code.length).trim();

  return {
    country,
    flagSrc: country.flagSrc,
    localNumber,
    text: localNumber ? `${country.code} ${localNumber}` : country.code,
  };
}

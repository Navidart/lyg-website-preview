import React from 'react';

const statusToneMap = {
  active: 'success',
  approved: 'success',
  published: 'success',
  draft: 'warning',
  pending: 'warning',
  'pending-profile': 'warning',
  review: 'info',
  'in-review': 'info',
  scheduled: 'info',
  blocked: 'destructive',
  failed: 'destructive',
  rejected: 'destructive',
  deleted: 'disabled',
  disabled: 'disabled',
  inactive: 'disabled',
  removed: 'disabled',
  unpublished: 'disabled',
};

function normalizeStatus(value) {
  return String(value ?? '')
    .trim()
    .toLowerCase()
    .replace(/[_\s/]+/g, '-')
    .replace(/-+/g, '-');
}

function formatStatusLabel(value, fallback = 'Status') {
  const label = String(value ?? '').trim();
  if (!label) return fallback;

  return label
    .replace(/[_-]+/g, ' ')
    .replace(/\s+/g, ' ')
    .replace(/\b\w/g, (character) => character.toUpperCase());
}

export function getStatusTone(status, fallbackTone = 'info') {
  const normalizedStatus = normalizeStatus(status);
  return statusToneMap[normalizedStatus] ?? fallbackTone;
}

export default function StatusBadge({ className = '', label, status, tone }) {
  const badgeTone = tone ?? getStatusTone(status);
  const badgeLabel = label ?? formatStatusLabel(status);
  const classes = ['admin-status', `admin-status-${badgeTone}`, className].filter(Boolean).join(' ');

  return <em className={classes}>{badgeLabel}</em>;
}

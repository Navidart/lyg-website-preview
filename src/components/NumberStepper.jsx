import React from 'react';

function normalizeNumberValue(value, min) {
  if (value === '' || value === null || value === undefined) return min;
  const numberValue = Number(value);
  if (!Number.isFinite(numberValue)) return min;
  return Math.max(numberValue, min);
}

function formatStepperValue(value, min) {
  return String(normalizeNumberValue(value, min));
}

export default function NumberStepper({
  disabled = false,
  label,
  min = 0,
  onChange,
  step = 1,
  value,
}) {
  const currentValue = normalizeNumberValue(value, min);

  const updateValue = (nextValue) => {
    onChange(String(Math.max(nextValue, min)));
  };

  const handleInputChange = (event) => {
    const nextValue = event.target.value;
    if (nextValue === '') {
      onChange('');
      return;
    }

    const numberValue = Number(nextValue);
    if (!Number.isFinite(numberValue)) return;
    onChange(String(Math.max(numberValue, min)));
  };

  const handleInputBlur = () => {
    onChange(formatStepperValue(value, min));
  };

  return (
    <span className={`number-stepper ${disabled ? 'is-disabled' : ''}`}>
      <button
        aria-label={`Decrease ${label}`}
        disabled={disabled || currentValue <= min}
        onClick={() => updateValue(currentValue - step)}
        type="button"
      >
        <span aria-hidden="true">−</span>
      </button>
      <input
        aria-label={label}
        disabled={disabled}
        inputMode={step % 1 === 0 ? 'numeric' : 'decimal'}
        min={min}
        onBlur={handleInputBlur}
        onChange={handleInputChange}
        type="text"
        value={value === '' || value === null || value === undefined ? '' : value}
      />
      <button
        aria-label={`Increase ${label}`}
        disabled={disabled}
        onClick={() => updateValue(currentValue + step)}
        type="button"
      >
        <span aria-hidden="true">+</span>
      </button>
    </span>
  );
}

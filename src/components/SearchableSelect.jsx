import React, { useId, useMemo, useRef, useState } from 'react';
import chevronDownIconUrl from '../assets/icons/navigation/ico-chevron-down.svg?url&no-inline';

function normalizeValue(value) {
  return String(value ?? '').trim().toLowerCase();
}

function getOptionLabel(option) {
  return typeof option === 'object' && option !== null ? option.label : option;
}

function getOptionShortLabel(option) {
  return typeof option === 'object' && option !== null ? option.shortLabel || option.label : option;
}

function getOptionValue(option) {
  return typeof option === 'object' && option !== null ? option.value || option.label : option;
}

function getOptionSearchText(option) {
  if (typeof option !== 'object' || option === null) return option;

  return [option.label, option.shortLabel, option.slug, option.group].filter(Boolean).join(' ');
}

function getFilteredOptions(options, query, selectedValues, multiple) {
  const normalizedQuery = normalizeValue(query);
  const selectedSet = new Set((selectedValues ?? []).map(normalizeValue));

  return options.filter((option) => {
    const optionValue = getOptionValue(option);
    const normalizedOption = normalizeValue(getOptionSearchText(option));
    if (multiple && selectedSet.has(normalizeValue(optionValue))) return false;
    if (!normalizedQuery) return true;
    return normalizedOption.includes(normalizedQuery);
  });
}

export default function SearchableSelect({
  helperText,
  label,
  multiple = false,
  onChange,
  options,
  placeholder = 'Search',
  value,
}) {
  const listboxId = useId();
  const inputRef = useRef(null);
  const selectedValues = multiple ? (Array.isArray(value) ? value : []) : [];
  const [query, setQuery] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);
  const optionByValue = useMemo(
    () => new Map(options.map((option) => [getOptionValue(option), option])),
    [options],
  );

  const filteredOptions = useMemo(
    () => getFilteredOptions(options, query, selectedValues, multiple),
    [multiple, options, query, selectedValues],
  );

  const displayValue = multiple ? query : query || value || '';
  const isAllSelected = multiple && selectedValues.length >= options.length && !query;
  const emptyMessage = isAllSelected ? 'All regions selected' : 'No matching regions';

  const openList = () => {
    setIsOpen(true);
    setActiveIndex(0);
  };

  const closeList = () => {
    setIsOpen(false);
    setActiveIndex(0);
  };

  const selectOption = (option) => {
    if (!option) return;
    const optionValue = getOptionValue(option);

    if (multiple) {
      onChange([...selectedValues, optionValue]);
      setQuery('');
      setIsOpen(false);
      setActiveIndex(0);
      return;
    }

    onChange(optionValue);
    setQuery('');
    closeList();
  };

  const removeOption = (option) => {
    onChange(selectedValues.filter((selectedValue) => selectedValue !== option));
  };

  const handleInputChange = (event) => {
    const nextQuery = event.target.value;
    setQuery(nextQuery);
    if (!multiple) onChange(nextQuery);
    openList();
  };

  const handleInputKeyDown = (event) => {
    if (event.key === 'Escape') {
      closeList();
      return;
    }

    if (event.key === 'ArrowDown') {
      event.preventDefault();
      openList();
      setActiveIndex((current) => Math.min(current + 1, Math.max(filteredOptions.length - 1, 0)));
      return;
    }

    if (event.key === 'ArrowUp') {
      event.preventDefault();
      setActiveIndex((current) => Math.max(current - 1, 0));
      return;
    }

    if (event.key === 'Enter') {
      event.preventDefault();
      selectOption(filteredOptions[activeIndex] || query);
    }
  };

  return (
    <label className="searchable-select-field">
      <span>{label}</span>
      <span className={`searchable-select ${isOpen ? 'is-open' : ''}`}>
        <span
          className={`searchable-select-control ${multiple ? 'searchable-select-control-multiple' : ''}`}
          onMouseDown={(event) => {
            if (event.target.closest('button')) return;
            inputRef.current?.focus();
            openList();
          }}
        >
          {multiple && selectedValues.length > 0 && (
            <span className="admin-region-chip-list" aria-label={`Selected ${label.toLowerCase()}`}>
              {selectedValues.map((selectedValue) => (
                <button className="admin-region-chip" key={selectedValue} onClick={() => removeOption(selectedValue)} type="button">
                  <span>{getOptionShortLabel(optionByValue.get(selectedValue) || selectedValue)}</span>
                  <span aria-hidden="true">x</span>
                </button>
              ))}
            </span>
          )}
          <input
            aria-autocomplete="list"
            aria-controls={listboxId}
            aria-expanded={isOpen}
            onBlur={() => window.setTimeout(closeList, 120)}
            onChange={handleInputChange}
            onClick={openList}
            onFocus={openList}
            onKeyDown={handleInputKeyDown}
            placeholder={placeholder}
            ref={inputRef}
            role="combobox"
            type="text"
            value={displayValue}
          />
          <button
            aria-label={isOpen ? 'Close suggestions' : 'Open suggestions'}
            className="searchable-select-toggle"
            onMouseDown={(event) => event.preventDefault()}
            onClick={() => {
              if (isOpen) closeList();
              else openList();
            }}
            type="button"
          >
            <img className="svg-icon" src={chevronDownIconUrl} alt="" aria-hidden="true" />
          </button>
        </span>

        {isOpen && (
          <span className="searchable-select-menu" id={listboxId} role="listbox">
            {filteredOptions.length > 0 ? (
              filteredOptions.map((option, index) => (
                <button
                  aria-selected={index === activeIndex}
                  className={index === activeIndex ? 'is-active' : ''}
                  key={getOptionValue(option)}
                  onMouseDown={(event) => event.preventDefault()}
                  onMouseEnter={() => setActiveIndex(index)}
                  onClick={() => selectOption(option)}
                  role="option"
                  type="button"
                >
                  {getOptionLabel(option)}
                </button>
              ))
            ) : (
              <span className="searchable-select-empty">{emptyMessage}</span>
            )}
          </span>
        )}
      </span>
      {helperText && <small className="form-helper-text">{helperText}</small>}
    </label>
  );
}

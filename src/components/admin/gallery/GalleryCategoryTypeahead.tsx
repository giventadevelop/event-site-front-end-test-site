'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import type { GalleryCategoryDTO } from '@/types';
import { createGalleryCategoryServer } from '@/app/admin/gallery/albums/ApiServerActions';

const SUGGESTION_LIMIT = 30;

interface GalleryCategoryTypeaheadProps {
  id?: string;
  categories: GalleryCategoryDTO[];
  value: number | null;
  onChange: (categoryId: number | null) => void;
  onCategoryCreated?: (category: GalleryCategoryDTO) => void;
  onPendingDisplayNameChange?: (displayName: string | null) => void;
  className?: string;
  disabled?: boolean;
}

function distinctCategories(categories: GalleryCategoryDTO[]): GalleryCategoryDTO[] {
  const seen = new Set<string>();
  const result: GalleryCategoryDTO[] = [];
  for (const category of categories) {
    const key = category.displayName.trim().toLowerCase();
    if (!key || seen.has(key)) continue;
    seen.add(key);
    result.push(category);
  }
  return result;
}

function filterCategories(categories: GalleryCategoryDTO[], query: string): GalleryCategoryDTO[] {
  const normalized = query.trim().toLowerCase();
  const pool = normalized
    ? categories.filter(
        (c) =>
          c.displayName.toLowerCase().includes(normalized) ||
          c.slug.toLowerCase().includes(normalized)
      )
    : categories;
  return pool.slice(0, SUGGESTION_LIMIT);
}

export function GalleryCategoryTypeahead({
  id = 'galleryCategoryId',
  categories,
  value,
  onChange,
  onCategoryCreated,
  onPendingDisplayNameChange,
  className = '',
  disabled = false,
}: GalleryCategoryTypeaheadProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const [highlightIndex, setHighlightIndex] = useState(-1);
  const [creating, setCreating] = useState(false);
  const [createError, setCreateError] = useState<string | null>(null);

  const distinctList = useMemo(() => distinctCategories(categories), [categories]);
  const quickPickList = useMemo(() => distinctList.slice(0, SUGGESTION_LIMIT), [distinctList]);
  const suggestions = useMemo(
    () => filterCategories(distinctList, searchTerm),
    [distinctList, searchTerm]
  );

  const trimmedTerm = searchTerm.trim();
  const exactMatch = useMemo(
    () =>
      trimmedTerm
        ? distinctList.find((c) => c.displayName.toLowerCase() === trimmedTerm.toLowerCase()) ??
          null
        : null,
    [distinctList, trimmedTerm]
  );
  const canCreate = trimmedTerm.length > 0 && !exactMatch && value == null;

  const listItemCount = (canCreate ? 1 : 0) + suggestions.length;

  const selectedCategory = useMemo(
    () => (value != null ? distinctList.find((c) => c.id === value) ?? null : null),
    [distinctList, value]
  );

  useEffect(() => {
    if (selectedCategory) {
      setSearchTerm(selectedCategory.displayName);
    } else if (value == null && !searchTerm) {
      setSearchTerm('');
    }
  }, [selectedCategory, value]);

  useEffect(() => {
    if (!onPendingDisplayNameChange) return;
    if (value != null || !trimmedTerm || exactMatch) {
      onPendingDisplayNameChange(null);
    } else {
      onPendingDisplayNameChange(trimmedTerm);
    }
  }, [value, trimmedTerm, exactMatch, onPendingDisplayNameChange]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
        setHighlightIndex(-1);
        if (selectedCategory) {
          setSearchTerm(selectedCategory.displayName);
        } else if (!trimmedTerm) {
          setSearchTerm('');
        }
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [selectedCategory, trimmedTerm]);

  const handleSelect = (category: GalleryCategoryDTO) => {
    onChange(category.id);
    setSearchTerm(category.displayName);
    setIsOpen(false);
    setHighlightIndex(-1);
    setCreateError(null);
  };

  const handleCreate = async () => {
    if (!canCreate || creating || disabled) return;

    setCreating(true);
    setCreateError(null);
    try {
      const category = await createGalleryCategoryServer(trimmedTerm);
      onCategoryCreated?.(category);
      handleSelect(category);
    } catch (err) {
      setCreateError(err instanceof Error ? err.message : 'Failed to create category');
    } finally {
      setCreating(false);
    }
  };

  const handleClear = () => {
    onChange(null);
    setSearchTerm('');
    setIsOpen(false);
    setHighlightIndex(-1);
    setCreateError(null);
    inputRef.current?.focus();
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const term = e.target.value;
    setSearchTerm(term);
    setIsOpen(true);
    setHighlightIndex(-1);
    setCreateError(null);

    if (!term.trim()) {
      onChange(null);
      return;
    }

    const exact = distinctList.find(
      (c) => c.displayName.toLowerCase() === term.trim().toLowerCase()
    );
    if (exact) {
      onChange(exact.id);
    } else if (value != null) {
      onChange(null);
    }
  };

  const handleInputBlur = () => {
    window.setTimeout(() => {
      if (selectedCategory) {
        setSearchTerm(selectedCategory.displayName);
      } else if (!searchTerm.trim()) {
        onChange(null);
      }
    }, 150);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!isOpen && (e.key === 'ArrowDown' || e.key === 'ArrowUp')) {
      setIsOpen(true);
      return;
    }

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setHighlightIndex((prev) => Math.min(prev + 1, listItemCount - 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setHighlightIndex((prev) => Math.max(prev - 1, 0));
    } else if (e.key === 'Enter') {
      if (highlightIndex >= 0) {
        e.preventDefault();
        if (canCreate && highlightIndex === 0) {
          void handleCreate();
        } else {
          const suggestionIndex = canCreate ? highlightIndex - 1 : highlightIndex;
          if (suggestions[suggestionIndex]) {
            handleSelect(suggestions[suggestionIndex]);
          }
        }
      } else if (canCreate && trimmedTerm) {
        e.preventDefault();
        void handleCreate();
      }
    } else if (e.key === 'Escape') {
      setIsOpen(false);
      setHighlightIndex(-1);
    }
  };

  const inputClassName =
    'w-full border border-gray-300 rounded-lg px-3 py-2 pr-9 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500';

  return (
    <div ref={containerRef} className={`space-y-2 ${className}`}>
      <div className="relative">
        <input
          ref={inputRef}
          id={id}
          type="text"
          role="combobox"
          aria-expanded={isOpen}
          aria-autocomplete="list"
          aria-controls={`${id}-listbox`}
          autoComplete="off"
          value={searchTerm}
          onChange={handleInputChange}
          onFocus={() => setIsOpen(true)}
          onBlur={handleInputBlur}
          onKeyDown={handleKeyDown}
          disabled={disabled || creating}
          placeholder="Type to search or create a category…"
          className={inputClassName}
        />
        {(searchTerm || value != null) && !disabled && !creating && (
          <button
            type="button"
            onClick={handleClear}
            className="absolute right-2 top-1/2 -translate-y-1/2 w-7 h-7 rounded-md text-gray-400 hover:text-gray-600 hover:bg-gray-100 flex items-center justify-center"
            title="Clear category"
            aria-label="Clear category"
          >
            ×
          </button>
        )}
        {isOpen && !disabled && (
          <div
            id={`${id}-listbox`}
            role="listbox"
            className="absolute z-[100] w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-y-auto"
          >
            {listItemCount === 0 ? (
              <div className="px-3 py-2 text-sm text-gray-500">
                {distinctList.length === 0
                  ? 'No categories yet. Type a name above to create one.'
                  : 'No matching categories. Type a new name to create one.'}
              </div>
            ) : (
              <ul className="py-1">
                {canCreate && (
                  <li
                    role="option"
                    aria-selected={highlightIndex === 0}
                    onMouseDown={(e) => e.preventDefault()}
                    onClick={() => void handleCreate()}
                    className={`px-3 py-2 cursor-pointer text-sm border-b border-gray-100 ${
                      highlightIndex === 0
                        ? 'bg-green-100 text-green-900'
                        : 'hover:bg-green-50 text-green-800'
                    }`}
                  >
                    <span className="font-medium">
                      {creating ? 'Creating…' : `Create category “${trimmedTerm}”`}
                    </span>
                  </li>
                )}
                {suggestions.map((category, index) => {
                  const rowIndex = canCreate ? index + 1 : index;
                  return (
                    <li
                      key={category.id}
                      role="option"
                      aria-selected={value === category.id}
                      onMouseDown={(e) => e.preventDefault()}
                      onClick={() => handleSelect(category)}
                      className={`px-3 py-2 cursor-pointer text-sm ${
                        highlightIndex === rowIndex
                          ? 'bg-blue-100 text-blue-900'
                          : value === category.id
                            ? 'bg-blue-50 text-blue-800'
                            : 'hover:bg-gray-50 text-gray-900'
                      }`}
                    >
                      <span className="font-medium">{category.displayName}</span>
                      {category.slug && (
                        <span className="ml-2 text-xs text-gray-500">{category.slug}</span>
                      )}
                    </li>
                  );
                })}
              </ul>
            )}
          </div>
        )}
      </div>

      {createError && <p className="text-sm text-red-600">{createError}</p>}

      {quickPickList.length > 0 && (
        <div>
          <label htmlFor={`${id}-quick-pick`} className="block text-xs text-gray-500 mb-1">
            Or pick from existing categories (first {Math.min(quickPickList.length, SUGGESTION_LIMIT)})
          </label>
          <select
            id={`${id}-quick-pick`}
            value={value ?? ''}
            onChange={(e) => {
              const raw = e.target.value;
              if (raw === '') {
                handleClear();
                return;
              }
              const picked = quickPickList.find((c) => c.id === parseInt(raw, 10));
              if (picked) handleSelect(picked);
            }}
            disabled={disabled || creating}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-gray-50"
          >
            <option value="">Choose a category…</option>
            {quickPickList.map((category) => (
              <option key={category.id} value={category.id}>
                {category.displayName}
              </option>
            ))}
          </select>
        </div>
      )}

      <p className="text-xs text-gray-500">
        Search existing categories, pick from the dropdown, or type a new name and choose{' '}
        <span className="font-medium">Create category</span> (or save the album — the category will
        be created automatically).
      </p>
    </div>
  );
}

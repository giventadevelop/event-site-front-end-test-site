'use client';

import { useCallback, useEffect, useId, useRef, useState } from 'react';
import type { GalleryAlbumDTO } from '@/types';
import { searchAlbumsForTypeaheadServer } from './ApiServerActions';

const SUGGESTION_LIMIT = 20;

export type GalleryAlbumSearchField = 'title' | 'description' | 'id';

function formatAlbumSuggestion(album: GalleryAlbumDTO): string {
  const title = album.title?.trim() || 'Untitled album';
  const idPart = album.id != null ? `#${album.id}` : null;
  return idPart ? `${title} · ${idPart}` : title;
}

function commitValueForField(
  album: GalleryAlbumDTO,
  searchField: GalleryAlbumSearchField,
): string {
  if (searchField === 'id' && album.id != null) return String(album.id);
  if (searchField === 'description' && album.description?.trim()) {
    return album.description.trim();
  }
  if (album.title?.trim()) return album.title.trim();
  if (album.id != null) return String(album.id);
  return '';
}

function filterAlbumsLocally(albums: GalleryAlbumDTO[], query: string): GalleryAlbumDTO[] {
  const q = query.trim().toLowerCase();
  if (!q) return albums.slice(0, SUGGESTION_LIMIT);
  return albums
    .filter((album) =>
      [album.title, album.description, album.id != null ? String(album.id) : '']
        .some((v) => (v ?? '').toLowerCase().includes(q)),
    )
    .slice(0, SUGGESTION_LIMIT);
}

function mergeAlbums(primary: GalleryAlbumDTO[], secondary: GalleryAlbumDTO[]): GalleryAlbumDTO[] {
  const byKey = new Map<string, GalleryAlbumDTO>();
  for (const album of [...primary, ...secondary]) {
    const key =
      album.id != null
        ? `id:${album.id}`
        : album.title
          ? `title:${album.title}`
          : null;
    if (!key || byKey.has(key)) continue;
    byKey.set(key, album);
  }
  return Array.from(byKey.values()).slice(0, SUGGESTION_LIMIT);
}

interface GalleryAlbumSearchComboboxProps {
  searchField: GalleryAlbumSearchField;
  /** Committed filter value that drives the album list fetch — not updated on every keystroke. */
  committedValue: string;
  onCommit: (value: string) => void;
  localAlbums?: GalleryAlbumDTO[];
  fieldLabel?: string;
  disabled?: boolean;
}

export default function GalleryAlbumSearchCombobox({
  searchField,
  committedValue,
  onCommit,
  localAlbums = [],
  fieldLabel = 'Title',
  disabled = false,
}: GalleryAlbumSearchComboboxProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const listboxId = useId();
  const inputId = 'gallery-album-search';

  const [inputValue, setInputValue] = useState(committedValue);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [suggestions, setSuggestions] = useState<GalleryAlbumDTO[]>([]);
  const [cachedAlbums, setCachedAlbums] = useState<GalleryAlbumDTO[]>(localAlbums);

  useEffect(() => {
    setInputValue(committedValue);
  }, [committedValue]);

  useEffect(() => {
    if (localAlbums.length === 0) return;
    setCachedAlbums((prev) => mergeAlbums(localAlbums, prev));
  }, [localAlbums]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, []);

  const runSearch = useCallback(
    (term: string) => {
      const trimmed = term.trim();
      const localMatches = filterAlbumsLocally(
        mergeAlbums(localAlbums, cachedAlbums),
        trimmed,
      );
      setSuggestions(localMatches);

      if (!trimmed) {
        setSuggestions(mergeAlbums(localAlbums, cachedAlbums).slice(0, SUGGESTION_LIMIT));
        return;
      }

      if (debounceRef.current) clearTimeout(debounceRef.current);
      debounceRef.current = setTimeout(async () => {
        setLoading(true);
        try {
          const remote = await searchAlbumsForTypeaheadServer(trimmed);
          const merged = mergeAlbums(remote, localMatches);
          setSuggestions(merged);
          if (remote.length > 0) {
            setCachedAlbums((prev) => mergeAlbums(remote, prev));
          }
        } catch {
          setSuggestions(localMatches);
        } finally {
          setLoading(false);
        }
      }, 280);
    },
    [cachedAlbums, localAlbums],
  );

  const commitTypedOrSelected = (value: string) => {
    const next = value.trim();
    onCommit(next);
    setInputValue(next);
    setOpen(false);
  };

  const handleSelect = (album: GalleryAlbumDTO) => {
    const value = commitValueForField(album, searchField);
    commitTypedOrSelected(value);
  };

  const handleClear = () => {
    setInputValue('');
    onCommit('');
    setSuggestions(mergeAlbums(localAlbums, cachedAlbums).slice(0, SUGGESTION_LIMIT));
    setOpen(true);
  };

  const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Escape') {
      event.preventDefault();
      setOpen(false);
      return;
    }
    if (event.key === 'ArrowDown') {
      event.preventDefault();
      setOpen(true);
      if (suggestions.length === 0) runSearch(inputValue);
      return;
    }
    if (event.key === 'Enter') {
      event.preventDefault();
      if (suggestions.length === 1) {
        handleSelect(suggestions[0]);
        return;
      }
      commitTypedOrSelected(inputValue);
    }
  };

  return (
    <div ref={containerRef} className="relative flex-1 min-w-0 h-12">
      <div className="relative h-12">
        <input
          id={inputId}
          type={searchField === 'id' ? 'number' : 'text'}
          role="combobox"
          aria-expanded={open}
          aria-controls={listboxId}
          aria-autocomplete="list"
          aria-label={`Search albums by ${fieldLabel}, description, or album ID`}
          autoComplete="off"
          placeholder={
            searchField === 'id'
              ? 'Numeric album ID...'
              : `Search by ${fieldLabel}, description, or ID...`
          }
          value={inputValue}
          disabled={disabled}
          onChange={(e) => {
            const next = e.target.value;
            setInputValue(next);
            setOpen(true);
            runSearch(next);
          }}
          onFocus={() => {
            setOpen(true);
            runSearch(inputValue);
          }}
          onKeyDown={handleKeyDown}
          className="box-border block h-12 w-full min-w-0 border border-gray-400 rounded-r-xl focus:ring-blue-500 focus:border-blue-500 px-4 pr-10 text-base bg-white disabled:bg-gray-50 disabled:cursor-not-allowed"
        />
        {inputValue ? (
          <button
            type="button"
            onMouseDown={(e) => e.preventDefault()}
            onClick={handleClear}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 text-xl leading-none"
            title="Clear search"
            aria-label="Clear search"
          >
            ×
          </button>
        ) : null}
      </div>

      {open ? (
        <ul
          id={listboxId}
          role="listbox"
          className="absolute z-50 left-0 right-0 mt-1 max-h-72 overflow-y-auto rounded-lg border border-gray-300 bg-white py-1 shadow-lg"
        >
          {loading && suggestions.length === 0 ? (
            <li className="px-4 py-3 text-sm text-gray-500">Searching albums...</li>
          ) : suggestions.length === 0 ? (
            <li className="px-4 py-3 text-sm text-gray-500">
              {inputValue.trim()
                ? 'No matching albums. Press Enter to filter the list by this text.'
                : 'Type a title, description, or album ID'}
            </li>
          ) : (
            suggestions.map((album) => {
              const key = album.id ?? album.title ?? formatAlbumSuggestion(album);
              return (
                <li key={String(key)} role="option" aria-selected={false}>
                  <button
                    type="button"
                    onMouseDown={(e) => e.preventDefault()}
                    onClick={() => handleSelect(album)}
                    className="w-full px-4 py-2.5 text-left hover:bg-blue-50 transition-colors"
                  >
                    <span className="block text-sm font-medium text-gray-900">
                      {formatAlbumSuggestion(album)}
                    </span>
                    <span className="block text-xs text-gray-500 truncate mt-0.5">
                      {[
                        album.isPublic === false ? 'Private' : 'Public',
                        album.description?.trim(),
                      ]
                        .filter(Boolean)
                        .join(' · ')}
                    </span>
                  </button>
                </li>
              );
            })
          )}
        </ul>
      ) : null}
    </div>
  );
}

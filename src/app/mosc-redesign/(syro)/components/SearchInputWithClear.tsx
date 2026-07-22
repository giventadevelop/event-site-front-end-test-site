'use client';

import React, { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';

export type SearchInputWithClearProps = Omit<
  React.InputHTMLAttributes<HTMLInputElement>,
  'type' | 'value' | 'defaultValue' | 'onChange'
> & {
  value?: string;
  defaultValue?: string;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  /** Controlled clear handler (preferred when using `value`). */
  onClear?: () => void;
  /**
   * For server GET search forms: navigate here when clearing so filtered
   * results reset (same as a "Clear search" link).
   */
  clearHref?: string;
  /** Sizing / layout classes for the wrapper (e.g. flex-1 min-w-[200px] w-full). */
  wrapperClassName?: string;
};

function withClearPadding(className: string): string {
  const base = className
    .replace(/\bpr-\d+\b/g, '')
    .replace(/\bflex-1\b/g, '')
    .replace(/\bmin-w-\[[^\]]+\]\b/g, '')
    .replace(/\s+/g, ' ')
    .trim();
  return `${base} pr-10 [&::-webkit-search-cancel-button]:hidden [&::-webkit-search-decoration]:hidden`.trim();
}

/**
 * Search input with an in-field clear (×) icon. Icon is absolutely positioned
 * so the control’s height/width stay the same; right padding reserves space.
 */
export default function SearchInputWithClear({
  value,
  defaultValue = '',
  onChange,
  onClear,
  clearHref,
  wrapperClassName = '',
  className = '',
  id,
  ...rest
}: SearchInputWithClearProps) {
  const isControlled = value !== undefined;
  const [text, setText] = useState(String(value ?? defaultValue ?? ''));
  const inputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  useEffect(() => {
    setText(String(value ?? defaultValue ?? ''));
  }, [value, defaultValue]);

  const showClear = text.length > 0;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setText(e.target.value);
    onChange?.(e);
  };

  const handleClear = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setText('');
    if (inputRef.current) {
      inputRef.current.value = '';
      inputRef.current.focus();
    }
    if (onClear) {
      onClear();
    } else if (isControlled && onChange) {
      const target = inputRef.current ?? ({ value: '' } as HTMLInputElement);
      onChange({
        target,
        currentTarget: target,
      } as React.ChangeEvent<HTMLInputElement>);
    }
    if (clearHref) {
      router.push(clearHref);
    }
  };

  return (
    <div className={`relative ${wrapperClassName}`.trim()}>
      <input
        {...rest}
        ref={inputRef}
        id={id}
        type="search"
        value={text}
        onChange={handleChange}
        className={withClearPadding(className)}
      />
      {showClear ? (
        <button
          type="button"
          onClick={handleClear}
          className="absolute inset-y-0 right-0 z-10 flex w-10 items-center justify-center text-syro-dark-gray/70 hover:text-syro-red focus:outline-none focus-visible:ring-2 focus-visible:ring-syro-red/40 rounded-r-lg"
          aria-label="Clear search"
          title="Clear search"
        >
          <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      ) : null}
    </div>
  );
}

'use client';

import React from 'react';

type HomeSectionTitleProps = {
  /** Plain string title; use when the text is dynamic. */
  text?: string;
  children?: string;
  className?: string;
  as?: 'h2' | 'h3';
};

function splitLastWord(text: string): { lead: string; last: string } {
  const parts = text.trim().split(/\s+/).filter(Boolean);
  if (parts.length <= 1) {
    return { lead: '', last: parts[0] ?? '' };
  }
  const last = parts.pop()!;
  return { lead: parts.join(' '), last };
}

export function HomeSectionTitle({
  text,
  children,
  className = '',
  as: Tag = 'h2',
}: HomeSectionTitleProps) {
  const titleText = text ?? children ?? '';
  const { lead, last } = splitLastWord(titleText);
  const classes = ['home-section-title', className].filter(Boolean).join(' ');

  return (
    <Tag className={classes}>
      {lead ? (
        <>
          <span className="home-section-title-lead">{lead}</span>{' '}
          <span className="home-section-title-accent">{last}</span>
        </>
      ) : (
        <span className="home-section-title-accent">{last}</span>
      )}
    </Tag>
  );
}

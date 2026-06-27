'use client';

import React from 'react';
import { BlocksRenderer } from '@strapi/blocks-react-renderer';
import type { BlocksContent } from '@strapi/blocks-react-renderer';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

interface ArticleContentProps {
  /** Strapi Rich Text (Blocks) — array of blocks. Rendered with BlocksRenderer. */
  description?: BlocksContent;
  /** Fallback: Markdown string. Rendered as Markdown so paragraphs, images (![alt](url)), and links display correctly. */
  body?: string;
  excerpt?: string | null;
  emptyMessage?: string;
  className?: string;
}

/**
 * Renders article main content from Strapi.
 * - If description is a non-empty blocks array → BlocksRenderer.
 * - If body is a string → Markdown (paragraphs, images, links).
 * - Otherwise excerpt or empty message.
 */
export function ArticleContent({
  description,
  body,
  excerpt,
  emptyMessage = 'No additional content for this article.',
  className = '',
}: ArticleContentProps) {
  const hasBlocks = Array.isArray(description) && description.length > 0;
  const hasBody = typeof body === 'string' && body.trim().length > 0;

  const wrapClasses = 'min-w-0 max-w-full break-words overflow-x-clip [&>*]:min-w-0 [&>*]:max-w-full [&>*]:break-words';

  if (hasBlocks) {
    return (
      <div className={`${wrapClasses} ${className}`.trim()}>
        <BlocksRenderer content={description ?? []} />
      </div>
    );
  }

  if (hasBody) {
    return (
      <div className={`${wrapClasses} ${className}`.trim()}>
        <ReactMarkdown
          remarkPlugins={[remarkGfm]}
          components={{
            img: ({ src, alt }) => {
              if (!src) return null;
              return (
                <span className="relative block w-full my-4 rounded-lg overflow-hidden bg-muted">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={src}
                    alt={alt ?? ''}
                    className="w-full h-auto object-contain"
                    style={{ borderRadius: '0.75rem', backgroundColor: 'transparent' }}
                  />
                </span>
              );
            },
          }}
        >
          {body}
        </ReactMarkdown>
      </div>
    );
  }

  if (excerpt) return null;
  return <p>{emptyMessage}</p>;
}

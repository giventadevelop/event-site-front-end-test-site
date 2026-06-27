import React from 'react';
import Image from 'next/image';
import type { AdSlot as AdSlotType } from '../types';

interface AdSlotsProps {
  slots: AdSlotType[];
}

/**
 * Renders sidebar advertisement slots (embed HTML or image + link).
 * Shows empty placeholder when no slots (per layout requirements).
 */
export function AdSlots({ slots }: AdSlotsProps) {
  if (slots.length === 0) {
    return (
      <div className="rounded-xl bg-card border border-border sacred-shadow-sm overflow-hidden p-4">
        <h3 className="font-heading font-semibold text-lg text-foreground mb-2">Advertisement</h3>
        <p className="font-body text-sm text-muted-foreground">No advertisements at the moment.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {slots.map((slot) => (
        <div
          key={slot.id}
          className="rounded-xl bg-card border border-border sacred-shadow-sm overflow-hidden p-4"
        >
          {slot.embedHtml && slot.embedHtml.trim().length > 0 ? (
            <div
              className="prose prose-sm max-w-none [&>iframe]:max-w-full [&>iframe]:rounded-lg"
              dangerouslySetInnerHTML={{ __html: slot.embedHtml }}
            />
          ) : slot.mediaUrl ? (
            slot.linkUrl ? (
              <a
                href={slot.linkUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="block rounded-lg overflow-hidden border border-border hover:opacity-90 reverent-transition"
              >
                <div className="relative aspect-[120/60] w-full">
                  <Image
                    src={slot.mediaUrl}
                    alt="Advertisement"
                    fill
                    className="object-contain"
                    sizes="320px"
                    unoptimized
                  />
                </div>
              </a>
            ) : (
              <div className="relative aspect-[120/60] w-full rounded-lg overflow-hidden border border-border">
                <Image
                  src={slot.mediaUrl}
                  alt="Advertisement"
                  fill
                  className="object-contain"
                  sizes="320px"
                  unoptimized
                />
              </div>
            )
          ) : null}
        </div>
      ))}
    </div>
  );
}

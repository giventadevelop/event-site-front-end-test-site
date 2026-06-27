'use client';

import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import GivebutterWidget from '@/components/GivebutterWidget';
import type { GivebutterCheckoutData } from './GivebutterCheckoutServerData';

interface GivebutterCheckoutClientProps {
  initialData: GivebutterCheckoutData;
  eventId: string;
}

/**
 * GiveButter Event Campaign Embed Checkout – hero at top, embedded widget in center.
 * Uses givebutterWidgetId from donation_metadata when available; falls back to givebutterCampaignId.
 */
export default function GivebutterCheckoutClient({ initialData, eventId }: GivebutterCheckoutClientProps) {
  const { event, heroImageUrl, givebutterWidgetId, givebutterCampaignId } = initialData;

  const hasWidgetId = Boolean(givebutterWidgetId?.trim());
  const hasCampaignId = Boolean(givebutterCampaignId?.trim());

  return (
    <div className="min-h-screen bg-background">
      {/* Event Hero – Top */}
      {heroImageUrl && (
        <div className="relative w-full h-auto min-h-[240px] sm:min-h-[280px] md:min-h-[320px] overflow-hidden rounded-t-2xl">
          <Image
            src={heroImageUrl}
            alt={event.title}
            width={1200}
            height={400}
            className="w-full h-auto object-contain sm:object-cover min-h-[240px] sm:min-h-[280px] md:min-h-[320px]"
            style={{ backgroundColor: 'transparent', borderRadius: '1rem 1rem 0 0' }}
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent pointer-events-none" />
          <div className="absolute bottom-0 left-0 right-0 p-6 text-white pointer-events-none">
            <h1 className="font-heading font-semibold text-2xl sm:text-3xl text-white drop-shadow-md">
              {event.title}
            </h1>
            {event.caption && (
              <p className="text-lg opacity-90 mt-1 line-clamp-2">{event.caption}</p>
            )}
          </div>
        </div>
      )}

      {/* Embedded GiveButter Widget – Center */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-12">
        <div className="bg-card rounded-2xl sacred-shadow p-6 sm:p-8 lg:p-10">
          {hasWidgetId ? (
            <GivebutterWidget
              widgetId={givebutterWidgetId!}
              className="min-h-[320px]"
            />
          ) : hasCampaignId ? (
            <GivebutterWidget
              campaignId={givebutterCampaignId!}
              className="min-h-[320px]"
            />
          ) : (
            <div className="text-center py-12">
              <p className="text-muted-foreground font-body text-lg mb-4">
                GiveButter is not configured for this event.
              </p>
              <div className="flex flex-wrap justify-center gap-3">
                <Link
                  href={`/events/${eventId}/donation-checkout`}
                  className="inline-flex items-center justify-center rounded-xl bg-primary px-5 py-2.5 text-primary-foreground font-semibold hover:opacity-90 transition-opacity"
                >
                  Open donation checkout
                </Link>
                <Link
                  href={`/events/${eventId}`}
                  className="inline-flex items-center justify-center rounded-xl border-2 border-border bg-background px-5 py-2.5 text-foreground font-semibold hover:bg-muted transition-colors"
                >
                  Return to event
                </Link>
              </div>
            </div>
          )}
        </div>

        <div className="mt-6 text-center">
          <Link
            href={`/events/${eventId}`}
            className="font-body text-sm font-medium text-primary hover:underline"
          >
            ← Return to event
          </Link>
        </div>
      </div>
    </div>
  );
}

'use client';

import { useEffect, useState } from 'react';
import type { EventCompetitionContentBlockDTO, EventCompetitionDTO, EventCompetitionResultDTO } from '@/types';
import { parseApiListResponse } from '@/lib/parseApiListResponse';
import { PLACEMENT_LABELS } from '@/lib/competitionEligibility';
import {
  hydrateCompetitionResults,
  isResultsPodiumBlock,
  parseResultsPodiumFromBlocks,
} from '@/lib/competitions/resultsPodium';

interface Props {
  eventId: number;
  eventTitle: string;
}

function groupByCompetition(results: EventCompetitionResultDTO[]) {
  const map = new Map<string, EventCompetitionResultDTO[]>();
  for (const result of results) {
    const key = result.competition?.name ?? 'Official placements';
    if (!map.has(key)) map.set(key, []);
    map.get(key)!.push(result);
  }
  for (const [, items] of map) {
    items.sort((a, b) => (a.placement ?? 99) - (b.placement ?? 99));
  }
  return Array.from(map.entries());
}

function placementTone(placement?: number | null) {
  if (placement === 1) return 'gold';
  if (placement === 2) return 'silver';
  if (placement === 3) return 'bronze';
  return 'plain';
}

function placementMark(result: EventCompetitionResultDTO) {
  if (result.placement && result.placement > 0) return String(result.placement);
  return '·';
}

export default function EventCardResultsPanel({ eventId, eventTitle }: Props) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [results, setResults] = useState<EventCompetitionResultDTO[]>([]);
  const [blocks, setBlocks] = useState<EventCompetitionContentBlockDTO[]>([]);
  const [lightbox, setLightbox] = useState<{ src: string; alt: string } | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      setLoading(true);
      setError(false);
      try {
        const [resultsRes, blocksRes, compsRes] = await Promise.all([
          fetch(
            `/api/proxy/event-competition-results?eventId.equals=${eventId}&isPublished.equals=true&sort=placement,asc`,
            { cache: 'no-store' }
          ),
          fetch(
            `/api/proxy/event-competition-content-blocks?eventId.equals=${eventId}&sort=sortOrder,asc`,
            { cache: 'no-store' }
          ),
          fetch(
            `/api/proxy/event-competitions?eventId.equals=${eventId}&sort=displayOrder,asc`,
            { cache: 'no-store' }
          ),
        ]);

        const resultsJson = resultsRes.ok ? await resultsRes.json() : [];
        const blocksJson = blocksRes.ok ? await blocksRes.json() : [];
        const compsJson = compsRes.ok ? await compsRes.json() : [];
        if (cancelled) return;

        const competitions = parseApiListResponse<EventCompetitionDTO>(compsJson);
        const hydratedResults = hydrateCompetitionResults(
          parseApiListResponse<EventCompetitionResultDTO>(resultsJson),
          competitions
        );

        setResults(hydratedResults);
        setBlocks(parseApiListResponse<EventCompetitionContentBlockDTO>(blocksJson));
        if (!resultsRes.ok && !blocksRes.ok) setError(true);
      } catch {
        if (!cancelled) setError(true);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, [eventId]);

  useEffect(() => {
    if (!lightbox) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setLightbox(null);
    };
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    window.addEventListener('keydown', onKeyDown);
    return () => {
      document.body.style.overflow = prevOverflow;
      window.removeEventListener('keydown', onKeyDown);
    };
  }, [lightbox]);

  const documents = blocks.filter(
    (block) => !isResultsPodiumBlock(block) && ((block.title || '').trim() || (block.bodyMarkdown || '').trim())
  );
  const fallbackResults = parseResultsPodiumFromBlocks(blocks);
  const displayResults = results.length > 0 ? results : fallbackResults;
  const grouped = groupByCompetition(displayResults);
  const hasResults = displayResults.length > 0;

  return (
    <div
      id={`event-results-${eventId}`}
      className="mh-event-results-panel"
      role="region"
      aria-label={`Results for ${eventTitle}`}
    >
      <div className="mh-event-results-kicker">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" aria-hidden="true">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M8 21h8M12 17v4M7 4h10v5a5 5 0 01-10 0V4zm-2 4h14"
          />
        </svg>
        Official results
      </div>

      {loading && (
        <div className="mh-event-results-pending" aria-live="polite">
          <span className="mh-event-results-pending-line" />
          <span className="mh-event-results-pending-line mh-event-results-pending-line--short" />
        </div>
      )}

      {!loading && error && (
        <p className="mh-event-results-empty-copy">
          We could not load the results just now. Please try again in a moment.
        </p>
      )}

      {!loading && !error && !hasResults && (
        <div className="mh-event-results-empty">
          <p className="mh-event-results-empty-title">Results are still being prepared</p>
          <p className="mh-event-results-empty-copy">
            The judges’ list will appear here as soon as it is published — usually after the awards
            announcement. Check back shortly, or open the event page for any last-minute notes.
          </p>
        </div>
      )}

      {!loading && !error && hasResults && (
        <div className="mh-event-results-groups">
          {grouped.map(([competitionName, placements]) => (
            <section key={competitionName} className="mh-event-results-group">
              <h4 className="mh-event-results-group-title">{competitionName}</h4>
              <ol className="mh-event-results-list">
                {placements.map((result) => (
                  <li
                    key={result.id ?? `${result.displayName}-${result.placement}`}
                    className={`mh-event-results-row mh-event-results-row--${placementTone(result.placement)}`}
                  >
                    <span className="mh-event-results-medal" aria-hidden="true">
                      {placementMark(result)}
                    </span>
                    <div className="mh-event-results-copy">
                      {(result.winnerPhotoUrl || result.workPhotoUrl) && (
                        <div className="mh-event-results-photos">
                          {result.winnerPhotoUrl && (
                            <button
                              type="button"
                              className="mh-event-results-photo-btn"
                              onClick={() =>
                                setLightbox({
                                  src: result.winnerPhotoUrl!,
                                  alt: `${result.displayName} — winner photo`,
                                })
                              }
                              title={`Open photo of ${result.displayName}`}
                              aria-label={`Open photo of ${result.displayName}`}
                            >
                              {/* eslint-disable-next-line @next/next/no-img-element */}
                              <img
                                src={result.winnerPhotoUrl}
                                alt=""
                                className="mh-event-results-photo"
                              />
                            </button>
                          )}
                          {result.workPhotoUrl && (
                            <button
                              type="button"
                              className="mh-event-results-photo-btn"
                              onClick={() =>
                                setLightbox({
                                  src: result.workPhotoUrl!,
                                  alt: `${result.displayName} — winning work`,
                                })
                              }
                              title={`Open work photo for ${result.displayName}`}
                              aria-label={`Open work photo for ${result.displayName}`}
                            >
                              {/* eslint-disable-next-line @next/next/no-img-element */}
                              <img
                                src={result.workPhotoUrl}
                                alt=""
                                className="mh-event-results-photo mh-event-results-photo--work"
                              />
                            </button>
                          )}
                        </div>
                      )}
                      <p className="mh-event-results-name">{result.displayName}</p>
                      <p className="mh-event-results-place">
                        {result.placementLabel ||
                          (result.placement ? PLACEMENT_LABELS[result.placement] ?? `#${result.placement}` : 'Placement')}
                        {result.prizeTitle ? ` · ${result.prizeTitle}` : ''}
                      </p>
                      {result.prizeDetails && (
                        <p className="mh-event-results-detail">{result.prizeDetails}</p>
                      )}
                      {result.notes && <p className="mh-event-results-detail">{result.notes}</p>}
                    </div>
                  </li>
                ))}
              </ol>
            </section>
          ))}
        </div>
      )}

      {!loading && !error && documents.length > 0 && (
        <div className="mh-event-results-docs">
          <h4 className="mh-event-results-group-title">Notes & documents</h4>
          {documents.map((block) => (
            <article key={block.id ?? block.title} className="mh-event-results-doc">
              {block.title && <h5>{block.title}</h5>}
              {block.bodyMarkdown && <p>{block.bodyMarkdown}</p>}
            </article>
          ))}
        </div>
      )}

      {lightbox && (
        <div
          className="mh-event-results-lightbox"
          role="dialog"
          aria-modal="true"
          aria-label={lightbox.alt}
          onClick={() => setLightbox(null)}
        >
          <button
            type="button"
            className="mh-event-results-lightbox-close"
            onClick={() => setLightbox(null)}
            title="Close"
            aria-label="Close image"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={lightbox.src}
            alt={lightbox.alt}
            className="mh-event-results-lightbox-img"
            onClick={(e) => e.stopPropagation()}
          />
        </div>
      )}
    </div>
  );
}

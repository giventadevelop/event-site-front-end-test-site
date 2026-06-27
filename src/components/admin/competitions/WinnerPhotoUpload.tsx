'use client';

import { useState, useTransition } from 'react';
import { patchCompetitionResultDirectServer } from '@/app/admin/events/[id]/competitions/ApiServerActions';

interface Props {
  eventId: string;
  resultId: number;
  onUploaded: (winnerPhotoUrl: string, winnerMediaId: number) => void;
}

export default function WinnerPhotoUpload({ eventId, resultId, onUploaded }: Props) {
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    startTransition(async () => {
      try {
        setError(null);
        const formData = new FormData();
        formData.append('file', file);
        const params = new URLSearchParams({
          eventId: String(eventId),
          title: `Winner photo ${resultId}`,
          isPublic: 'true',
        });
        const res = await fetch(`/api/proxy/event-medias/upload?${params.toString()}`, {
          method: 'POST',
          body: formData,
        });
        if (!res.ok) throw new Error(await res.text());
        const media = await res.json();
        const mediaId = media.id as number;
        const fileUrl = media.fileUrl as string;
        await patchCompetitionResultDirectServer(resultId, {
          winnerMedia: { id: mediaId },
          winnerPhotoUrl: fileUrl,
        });
        onUploaded(fileUrl, mediaId);
      } catch (err: unknown) {
        setError(err instanceof Error ? err.message : 'Upload failed');
      }
    });
  };

  return (
    <div>
      <input type="file" accept="image/*" onChange={handleFile} disabled={isPending} className="text-sm" />
      {isPending && <span className="text-xs text-gray-500 ml-2">Uploading...</span>}
      {error && <p className="text-xs text-red-600 mt-1">{error}</p>}
    </div>
  );
}

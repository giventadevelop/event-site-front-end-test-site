'use client';

import { useState } from 'react';
import { FaCheck, FaTimes, FaSpinner } from 'react-icons/fa';

interface PriorityRankingEditorProps {
  mediaId: number;
  currentPriority: number;
  onSave: (mediaId: number, priorityRanking: number) => Promise<void>;
  onCancel?: () => void;
  isInline?: boolean;
}

export default function PriorityRankingEditor({
  mediaId,
  currentPriority,
  onSave,
  onCancel,
  isInline = false,
}: PriorityRankingEditorProps) {
  const [priority, setPriority] = useState(currentPriority);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSave = async () => {
    // Validate
    if (priority < 0) {
      setError('Priority ranking must be >= 0');
      return;
    }

    if (priority === currentPriority) {
      if (onCancel) onCancel();
      return;
    }

    setLoading(true);
    setError(null);

    try {
      await onSave(mediaId, priority);
      // onSave will handle closing the editor
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update priority');
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    setPriority(currentPriority);
    setError(null);
    if (onCancel) {
      onCancel();
    }
  };

  if (isInline) {
    return (
      <div className="space-y-2">
        <label className="block text-xs font-body font-medium text-foreground">
          Priority Ranking (lower = higher priority)
        </label>
        <div className="flex items-center gap-2">
          <input
            type="number"
            min="0"
            value={priority}
            onChange={(e) => {
              const value = parseInt(e.target.value);
              if (!isNaN(value) && value >= 0) {
                setPriority(value);
                setError(null);
              }
            }}
            className="flex-1 px-2 py-1 border border-border rounded bg-input text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-ring"
            disabled={loading}
          />
          <button
            onClick={handleSave}
            disabled={loading || priority < 0}
            className="bg-primary hover:bg-primary/90 text-primary-foreground p-1.5 rounded reverent-transition disabled:opacity-50"
            title="Save"
          >
            {loading ? (
              <FaSpinner className="w-3 h-3 animate-spin" />
            ) : (
              <FaCheck className="w-3 h-3" />
            )}
          </button>
          {onCancel && (
            <button
              onClick={handleCancel}
              disabled={loading}
              className="bg-secondary hover:bg-secondary/90 text-secondary-foreground p-1.5 rounded reverent-transition"
              title="Cancel"
            >
              <FaTimes className="w-3 h-3" />
            </button>
          )}
        </div>
        {error && (
          <p className="text-xs text-destructive">{error}</p>
        )}
      </div>
    );
  }

  // Modal version
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-card rounded-lg sacred-shadow max-w-sm w-full mx-4 p-6">
        <h3 className="text-lg font-heading font-semibold text-foreground mb-4">
          Edit Priority Ranking
        </h3>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-body font-medium text-foreground mb-2">
              Priority Ranking
            </label>
            <p className="text-xs font-body text-muted-foreground mb-2">
              Lower values indicate higher priority (0 = highest priority)
            </p>
            <input
              type="number"
              min="0"
              value={priority}
              onChange={(e) => {
                const value = parseInt(e.target.value);
                if (!isNaN(value) && value >= 0) {
                  setPriority(value);
                  setError(null);
                }
              }}
              className="w-full px-3 py-2 border border-border rounded bg-input text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
              disabled={loading}
            />
            {error && (
              <p className="text-xs text-destructive mt-1">{error}</p>
            )}
          </div>

          <div className="flex gap-3">
            {onCancel && (
              <button
                onClick={handleCancel}
                disabled={loading}
                className="flex-1 bg-muted hover:bg-muted/80 text-foreground px-4 py-2 rounded-md reverent-transition"
              >
                Cancel
              </button>
            )}
            <button
              onClick={handleSave}
              disabled={loading || priority < 0}
              className="flex-1 bg-primary hover:bg-primary/90 text-primary-foreground px-4 py-2 rounded-md reverent-transition disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <FaSpinner className="w-4 h-4 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <FaCheck className="w-4 h-4" />
                  Save
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}


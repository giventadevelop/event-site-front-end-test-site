'use client';

import { useState } from 'react';
import Link from 'next/link';
import type { TeamGroupDTO } from '@/types/teamGroup';
import TeamGroupForm from './TeamGroupForm';
import { Modal } from '@/components/Modal';
import { deleteTeamGroup } from './ApiServerActions';

interface TeamGroupsClientProps {
  initialGroups: TeamGroupDTO[];
}

export default function TeamGroupsClient({ initialGroups }: TeamGroupsClientProps) {
  const [groups, setGroups] = useState<TeamGroupDTO[]>(initialGroups);
  const [editing, setEditing] = useState<TeamGroupDTO | null>(null);
  const [creating, setCreating] = useState(false);
  const [deleting, setDeleting] = useState<TeamGroupDTO | null>(null);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold text-gray-900">Squads / bands ({groups.length})</h2>
        <button
          type="button"
          onClick={() => setCreating(true)}
          className="h-14 rounded-xl bg-violet-100 hover:bg-violet-200 px-6 font-semibold text-violet-700 transition-all hover:scale-105"
        >
          Add group
        </button>
      </div>

      <div className="overflow-x-auto rounded-lg border border-gray-200">
        <table className="min-w-full divide-y divide-gray-200 text-sm">
          <thead className="bg-gradient-to-r from-blue-600 to-blue-800 text-white">
            <tr>
              <th className="px-4 py-3 text-left">Name</th>
              <th className="px-4 py-3 text-left">Type</th>
              <th className="px-4 py-3 text-left">Slug</th>
              <th className="px-4 py-3 text-left">Order</th>
              <th className="px-4 py-3 text-left">Active</th>
              <th className="px-4 py-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 bg-white">
            {groups.map((g) => (
              <tr key={g.id}>
                <td className="px-4 py-3 font-medium">{g.name}</td>
                <td className="px-4 py-3">{g.teamType}</td>
                <td className="px-4 py-3">{g.slug || '—'}</td>
                <td className="px-4 py-3">{g.displayOrder ?? 0}</td>
                <td className="px-4 py-3">{g.isActive ? 'Yes' : 'No'}</td>
                <td className="px-4 py-3 text-right space-x-2">
                  {g.id && (
                    <Link
                      href={`/admin/team-members?groupId=${g.id}`}
                      className="text-blue-600 hover:underline"
                    >
                      Members
                    </Link>
                  )}
                  <button type="button" onClick={() => setEditing(g)} className="text-violet-600 hover:underline">
                    Edit
                  </button>
                  <button type="button" onClick={() => setDeleting(g)} className="text-red-600 hover:underline">
                    Delete
                  </button>
                </td>
              </tr>
            ))}
            {groups.length === 0 && (
              <tr>
                <td colSpan={6} className="px-4 py-8 text-center text-gray-500">
                  No team groups yet. Create one to start adding roster members.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {(creating || editing) && (
        <Modal
          open
          onClose={() => {
            setCreating(false);
            setEditing(null);
          }}
          title={editing ? 'Edit team group' : 'New team group'}
        >
          <TeamGroupForm
            group={editing}
            onSuccess={(saved) => {
              if (editing?.id) {
                setGroups((prev) => prev.map((x) => (x.id === saved.id ? saved : x)));
              } else {
                setGroups((prev) => [...prev, saved]);
              }
              setCreating(false);
              setEditing(null);
            }}
            onCancel={() => {
              setCreating(false);
              setEditing(null);
            }}
          />
        </Modal>
      )}

      {deleting?.id && (
        <Modal open onClose={() => setDeleting(null)} title="Delete team group?">
          <p className="text-gray-700 mb-4">
            Delete <strong>{deleting.name}</strong>? All members in this group will be removed.
          </p>
          <div className="flex gap-3">
            <button
              type="button"
              className="px-4 py-2 rounded-lg bg-red-100 text-red-700 font-semibold"
              onClick={async () => {
                const ok = await deleteTeamGroup(deleting.id!);
                if (ok) {
                  setGroups((prev) => prev.filter((x) => x.id !== deleting.id));
                  setDeleting(null);
                }
              }}
            >
              Delete
            </button>
            <button type="button" className="px-4 py-2 rounded-lg bg-gray-100" onClick={() => setDeleting(null)}>
              Cancel
            </button>
          </div>
        </Modal>
      )}
    </div>
  );
}

'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import type { TeamGroupDTO } from '@/types/teamGroup';
import type { TeamMemberDTO } from '@/types/teamMember';
import TeamMemberForm from './TeamMemberForm';
import { Modal } from '@/components/Modal';
import { deleteTeamMember } from './ApiServerActions';

interface TeamMembersClientProps {
  initialMembers: TeamMemberDTO[];
  groups: TeamGroupDTO[];
  filterGroupId?: number;
}

export default function TeamMembersClient({
  initialMembers,
  groups,
  filterGroupId,
}: TeamMembersClientProps) {
  const [members, setMembers] = useState(initialMembers);
  const [groupFilter, setGroupFilter] = useState<number | ''>(filterGroupId ?? '');
  const [creating, setCreating] = useState(false);
  const [editing, setEditing] = useState<TeamMemberDTO | null>(null);
  const [deleting, setDeleting] = useState<TeamMemberDTO | null>(null);

  const filtered = useMemo(() => {
    if (groupFilter === '') return members;
    return members.filter((m) => m.teamGroupId === groupFilter);
  }, [members, groupFilter]);

  const groupName = (id: number) => groups.find((g) => g.id === id)?.name ?? String(id);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap justify-between items-center gap-4">
        <div className="flex items-center gap-3">
          <h2 className="text-xl font-semibold text-gray-900">Roster members ({filtered.length})</h2>
          <Link href="/admin/team-groups" className="text-violet-600 text-sm hover:underline">
            Manage groups
          </Link>
        </div>
        <div className="flex items-center gap-3">
          <select
            value={groupFilter}
            onChange={(e) => setGroupFilter(e.target.value === '' ? '' : Number(e.target.value))}
            className="border border-gray-300 rounded-lg px-3 py-2 text-sm"
          >
            <option value="">All groups</option>
            {groups.map((g) => (
              <option key={g.id} value={g.id ?? ''}>
                {g.name}
              </option>
            ))}
          </select>
          <button
            type="button"
            disabled={groups.length === 0}
            onClick={() => setCreating(true)}
            className="h-14 rounded-xl bg-rose-100 hover:bg-rose-200 px-6 font-semibold text-rose-700 disabled:opacity-50"
          >
            Add member
          </button>
        </div>
      </div>

      <div className="overflow-x-auto rounded-lg border border-gray-200">
        <table className="min-w-full divide-y divide-gray-200 text-sm">
          <thead className="bg-gradient-to-r from-blue-600 to-blue-800 text-white">
            <tr>
              <th className="px-4 py-3 text-left">Name</th>
              <th className="px-4 py-3 text-left">Group</th>
              <th className="px-4 py-3 text-left">#</th>
              <th className="px-4 py-3 text-left">Role</th>
              <th className="px-4 py-3 text-left">Order</th>
              <th className="px-4 py-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 bg-white">
            {filtered.map((m) => (
              <tr key={m.id}>
                <td className="px-4 py-3">
                  {m.firstName} {m.lastName}
                </td>
                <td className="px-4 py-3">{groupName(m.teamGroupId)}</td>
                <td className="px-4 py-3">{m.jerseyNumber ?? '—'}</td>
                <td className="px-4 py-3">{m.position || m.instrument || m.title || '—'}</td>
                <td className="px-4 py-3">{m.priorityOrder ?? 0}</td>
                <td className="px-4 py-3 text-right space-x-2">
                  <button type="button" onClick={() => setEditing(m)} className="text-violet-600 hover:underline">
                    Edit
                  </button>
                  <button type="button" onClick={() => setDeleting(m)} className="text-red-600 hover:underline">
                    Delete
                  </button>
                </td>
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr>
                <td colSpan={6} className="px-4 py-8 text-center text-gray-500">
                  No members found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {(creating || editing) && groups.length > 0 && (
        <Modal
          open
          onClose={() => {
            setCreating(false);
            setEditing(null);
          }}
          title={editing ? 'Edit roster member' : 'New roster member'}
        >
          <TeamMemberForm
            member={editing}
            groups={groups}
            defaultGroupId={
              typeof groupFilter === 'number' ? groupFilter : filterGroupId ?? groups[0]?.id ?? undefined
            }
            onSuccess={(saved) => {
              if (editing?.id) {
                setMembers((prev) => prev.map((x) => (x.id === saved.id ? saved : x)));
              } else {
                setMembers((prev) => [...prev, saved]);
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
        <Modal open onClose={() => setDeleting(null)} title="Delete member?">
          <p className="mb-4 text-gray-700">
            Remove {deleting.firstName} {deleting.lastName} from the roster?
          </p>
          <div className="flex gap-3">
            <button
              type="button"
              className="px-4 py-2 rounded-lg bg-red-100 text-red-700 font-semibold"
              onClick={async () => {
                const ok = await deleteTeamMember(deleting.id!);
                if (ok) {
                  setMembers((prev) => prev.filter((x) => x.id !== deleting.id));
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

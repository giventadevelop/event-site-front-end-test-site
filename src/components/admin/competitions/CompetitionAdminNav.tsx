'use client';

import Link from 'next/link';
import { FaCog, FaCalendarAlt, FaList, FaClipboardList, FaTrophy } from 'react-icons/fa';

interface CompetitionAdminNavProps {
  eventId: string;
}

const links = [
  { href: 'settings', label: 'Settings', icon: FaCog, bg: 'bg-violet-50 hover:bg-violet-100', iconBg: 'bg-violet-100', iconColor: 'text-violet-500', text: 'text-violet-800' },
  { href: 'days', label: 'Schedule Days', icon: FaCalendarAlt, bg: 'bg-teal-50 hover:bg-teal-100', iconBg: 'bg-teal-100', iconColor: 'text-teal-500', text: 'text-teal-800' },
  { href: 'list', label: 'Competitions', icon: FaList, bg: 'bg-emerald-50 hover:bg-emerald-100', iconBg: 'bg-emerald-100', iconColor: 'text-emerald-500', text: 'text-emerald-800' },
  { href: 'registrations', label: 'Registrations', icon: FaClipboardList, bg: 'bg-amber-50 hover:bg-amber-100', iconBg: 'bg-amber-100', iconColor: 'text-amber-500', text: 'text-amber-800' },
  { href: 'results', label: 'Results', icon: FaTrophy, bg: 'bg-rose-50 hover:bg-rose-100', iconBg: 'bg-rose-100', iconColor: 'text-rose-500', text: 'text-rose-800' },
] as const;

export default function CompetitionAdminNav({ eventId }: CompetitionAdminNavProps) {
  const base = `/admin/events/${eventId}/competitions`;
  return (
    <div className="w-full mb-8">
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
        {links.map((item) => {
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={`${base}/${item.href}`}
              className={`flex flex-col items-center justify-center ${item.bg} ${item.text} rounded-lg shadow-md p-3 text-xs transition-all group`}
              title={item.label}
              aria-label={item.label}
            >
              <div className={`flex-shrink-0 w-11 h-11 rounded-xl ${item.iconBg} flex items-center justify-center mb-2 group-hover:scale-110 transition-transform duration-300`}>
                <Icon className={`w-8 h-8 ${item.iconColor}`} />
              </div>
              <span className="font-semibold text-center leading-tight">{item.label}</span>
            </Link>
          );
        })}
      </div>
    </div>
  );
}

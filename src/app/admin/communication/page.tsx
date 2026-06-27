import { safeAuth } from '@/lib/safe-auth';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import AdminNavigation from '@/components/AdminNavigation';

export default async function CommunicationCenterPage() {
  const { userId } = await safeAuth();

  if (!userId) {
    redirect('/sign-in');
  }

  return (
    <div className="container mx-auto px-4 py-8" style={{ paddingTop: '180px' }}>
      <AdminNavigation currentPage="communication" />

      {/* Page Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-4">
          Communication Center
        </h1>
        <div className="bg-amber-50 border-l-4 border-amber-500 p-4 rounded-r-lg mb-4">
          <p className="text-amber-800 font-medium">
            Partially implemented — this is a placeholder only. Some links below go to existing features; others are planned and not yet built.
          </p>
        </div>
        <div className="bg-gray-50 border-l-4 border-blue-500 p-4 rounded-r-lg">
          <p className="text-gray-700 leading-relaxed mb-2">
            This page is the hub for event-related communication: email, newsletters, WhatsApp, and SMS. Use it to send announcements to registrants, run promotional campaigns, manage newsletter templates, and (when available) WhatsApp and SMS. Each button below opens a specific tool or placeholder for that channel.
          </p>
          <p className="text-gray-600 text-sm mt-2">
            Buttons marked as placeholder are for future integration and do not navigate to a working page yet.
          </p>
        </div>
      </div>

      {/* Button grid - unique color per button, no gray */}
      <div className="w-full mb-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          <Link
            href="/admin/bulk-email"
            className="flex flex-col items-center justify-center bg-yellow-50 hover:bg-yellow-100 text-yellow-800 rounded-lg shadow-md p-4 text-xs transition-all group"
            title="Bulk Email — Send emails to many recipients at once"
            aria-label="Bulk Email"
          >
            <div className="flex-shrink-0 w-14 h-14 rounded-xl bg-yellow-100 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform duration-300">
              <svg className="w-10 h-10 text-yellow-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
            </div>
            <span className="font-semibold text-center leading-tight">Bulk Email</span>
            <span className="text-[10px] text-yellow-600 mt-1 text-center">Send to many recipients at once</span>
          </Link>

          <Link
            href="/admin/promotion-emails"
            className="flex flex-col items-center justify-center bg-pink-50 hover:bg-pink-100 text-pink-800 rounded-lg shadow-md p-4 text-xs transition-all group"
            title="Promotional Emails — Templates and campaigns for event promotions"
            aria-label="Promotional Emails"
          >
            <div className="flex-shrink-0 w-14 h-14 rounded-xl bg-pink-100 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform duration-300">
              <svg className="w-10 h-10 text-pink-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5.882V19.24a1.76 1.76 0 01-3.417.592l-2.147-6.15M18 13a3 3 0 100-6M5.436 13a3 3 0 100-6m12.268 0a3 3 0 100-6M8.683 7a3 3 0 100-6m12.268 0a3 3 0 100-6M8.683 7v12" />
              </svg>
            </div>
            <span className="font-semibold text-center leading-tight">Promotional Emails</span>
            <span className="text-[10px] text-pink-600 mt-1 text-center">Templates & campaigns for events</span>
          </Link>

          <Link
            href="/admin/newsletter-emails"
            className="flex flex-col items-center justify-center bg-cyan-50 hover:bg-cyan-100 text-cyan-800 rounded-lg shadow-md p-4 text-xs transition-all group"
            title="Newsletter Emails — Manage newsletter templates and sends"
            aria-label="Newsletter Emails"
          >
            <div className="flex-shrink-0 w-14 h-14 rounded-xl bg-cyan-100 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform duration-300">
              <svg className="w-10 h-10 text-cyan-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" />
              </svg>
            </div>
            <span className="font-semibold text-center leading-tight">Newsletter Emails</span>
            <span className="text-[10px] text-cyan-600 mt-1 text-center">Newsletter templates & sends</span>
          </Link>

          <span
            className="flex flex-col items-center justify-center bg-emerald-50 text-emerald-800 rounded-lg shadow-md p-4 text-xs border-2 border-dashed border-emerald-300 cursor-not-allowed opacity-90"
            title="WhatsApp Integration — Placeholder (not yet implemented)"
            aria-label="WhatsApp Integration (placeholder)"
          >
            <div className="flex-shrink-0 w-14 h-14 rounded-xl bg-emerald-100 flex items-center justify-center mb-3">
              <svg className="w-10 h-10 text-emerald-500" fill="currentColor" viewBox="0 0 24 24">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
              </svg>
            </div>
            <span className="font-semibold text-center leading-tight">WhatsApp Integration</span>
            <span className="text-[10px] text-amber-600 mt-1 font-medium">Placeholder</span>
          </span>

          <span
            className="flex flex-col items-center justify-center bg-violet-50 text-violet-800 rounded-lg shadow-md p-4 text-xs border-2 border-dashed border-violet-300 cursor-not-allowed opacity-90"
            title="SMS — Placeholder (not yet implemented)"
            aria-label="SMS (placeholder)"
          >
            <div className="flex-shrink-0 w-14 h-14 rounded-xl bg-violet-100 flex items-center justify-center mb-3">
              <svg className="w-10 h-10 text-violet-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
              </svg>
            </div>
            <span className="font-semibold text-center leading-tight">SMS</span>
            <span className="text-[10px] text-amber-600 mt-1 font-medium">Placeholder</span>
          </span>
        </div>
      </div>
    </div>
  );
}

import Link from 'next/link';
import SyroPageBanner from '../../components/SyroPageBanner';
import { fetchPublicOfficialDocumentCategoriesServer } from '../ApiServerActions';

export const dynamic = 'force-dynamic';

export default async function DownloadsCategoriesPage() {
  const categories = await fetchPublicOfficialDocumentCategoriesServer();

  return (
    <div className="bg-syro-bg-gray">
      <SyroPageBanner
        title="Download Categories"
        breadcrumbFrom="home"
        description="Browse every official document category. Select a category to filter the downloads library."
      />

      <section className="py-16 bg-syro-bg-gray">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
            <h3 className="text-2xl font-light text-[#798daf] pl-8 border-l-[7px] border-syro-red">
              All categories ({categories.length})
            </h3>
            <Link
              href="/mosc-redesign/downloads"
              className="inline-flex items-center rounded-lg border-2 border-syro-gold/40 bg-white px-4 py-2 text-sm font-semibold text-syro-blue hover:border-syro-blue hover:bg-blue-50"
            >
              Back to downloads
            </Link>
          </div>

          <div className="bg-white rounded-xl border border-syro-gold/25 shadow-[rgba(50,50,93,0.25)_0px_6px_12px_-2px,rgba(0,0,0,0.3)_0px_3px_7px_-3px] p-6 md:p-8">
            {categories.length === 0 ? (
              <p className="text-sm text-gray-600">No categories are available right now.</p>
            ) : (
              <ul className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 list-none m-0 p-0">
                {categories.map((cat) => (
                  <li key={cat.id}>
                    <Link
                      href={`/mosc-redesign/downloads?categoryId=${cat.id}&page=1`}
                      className="block rounded-lg border-2 border-syro-gold/30 bg-syro-bg-gray/40 px-4 py-3 text-sm font-semibold text-syro-blue transition-colors hover:border-syro-blue hover:bg-blue-50"
                      title={cat.displayName}
                    >
                      {cat.displayName}
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}

import Link from 'next/link';
import { MOSC_CMS_SIDEBAR_CLASS, moscCmsSidebarLinkClass } from '../../components/MoscCmsHubCard';

export interface DiocesesCmsSidebarEntry {
  documentId: string;
  name: string;
  href: string;
}

export default function DiocesesCmsSidebar({
  entries,
  currentDocumentId,
}: {
  entries: DiocesesCmsSidebarEntry[];
  currentDocumentId: string;
}) {
  return (
    <div className={MOSC_CMS_SIDEBAR_CLASS}>
      <h3 className="font-syro-display font-semibold text-lg text-syro-blue mb-4">
        Dioceses
      </h3>
      <nav className="space-y-1">
        {entries.map((entry) => (
          <Link
            key={entry.documentId}
            href={entry.href}
            className={moscCmsSidebarLinkClass(entry.documentId === currentDocumentId)}
          >
            {entry.name}
          </Link>
        ))}
      </nav>
    </div>
  );
}

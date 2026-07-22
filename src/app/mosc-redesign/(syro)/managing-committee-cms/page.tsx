import { createDirectoryEntriesCmsPage } from '../lib/createDirectoryEntriesCmsPage';

export const dynamic = 'force-dynamic';

const { Page, metadata } = createDirectoryEntriesCmsPage({
  directoryType: 'managing-committee',
  basePath: '/mosc-redesign/managing-committee-cms',
  sectionTitle: 'The Managing Committee',
  description: 'Managing Committee of the Malankara Orthodox Syrian Church.',
  metadataTitle: 'Managing Committee | MOSC',
  itemLabel: 'committee members',
});

export { metadata };
export default Page;

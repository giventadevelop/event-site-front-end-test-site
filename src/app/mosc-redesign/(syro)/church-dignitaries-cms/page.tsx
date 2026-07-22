import { createDirectoryEntriesCmsPage } from '../lib/createDirectoryEntriesCmsPage';

export const dynamic = 'force-dynamic';

const { Page, metadata } = createDirectoryEntriesCmsPage({
  directoryType: 'church-dignitaries',
  basePath: '/mosc-redesign/church-dignitaries-cms',
  sectionTitle: 'Church Dignitaries',
  description: 'Church dignitaries of the Malankara Orthodox Syrian Church.',
  metadataTitle: 'Church Dignitaries | MOSC',
  itemLabel: 'dignitaries',
});

export { metadata };
export default Page;

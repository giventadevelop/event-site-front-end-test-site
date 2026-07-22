import { createDirectoryEntriesCmsPage } from '../lib/createDirectoryEntriesCmsPage';

export const dynamic = 'force-dynamic';

const { Page, metadata } = createDirectoryEntriesCmsPage({
  directoryType: 'pilgrim-centres',
  basePath: '/mosc-redesign/pilgrim-centres-cms',
  sectionTitle: 'Pilgrim Centres',
  description: 'Pilgrim centres of the Malankara Orthodox Syrian Church.',
  metadataTitle: 'Pilgrim Centres | MOSC',
  itemLabel: 'pilgrim centres',
});

export { metadata };
export default Page;

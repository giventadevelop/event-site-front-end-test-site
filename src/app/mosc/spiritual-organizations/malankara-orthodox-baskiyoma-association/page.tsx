import React from 'react';
import SpiritualOrgSubpageLayout from '../SpiritualOrgSubpageLayout';

export const metadata = {
  title: 'Malankara Orthodox Baskiyoma Association | MOSC',
  description: 'Malankara Orthodox Baskiyoma Association. President H. G. Dr. Mathews Mar Thimothios Metropolitan. Vice Presidents Fr. Solu Koshy Raju, Smt. Jessy Varghese. Secretary Rachel P Jose.',
};

const MalankaraOrthodoxBaskiyomaAssociationPage = () => {
  return (
    <SpiritualOrgSubpageLayout
      title="Malankara Orthodox Baskiyoma Association"
      currentHref="/mosc/spiritual-organizations/malankara-orthodox-baskiyoma-association"
    >
      <div className="space-y-6 font-syro-primary text-syro-dark-gray leading-relaxed">
        <h2 className="font-syro-display font-semibold text-2xl text-syro-blue mb-4 pl-4 border-l-4 border-syro-red">
          Office Bearers
        </h2>

        <h3 className="font-syro-display font-semibold text-xl text-syro-blue border-b border-syro-table-border pb-2">
          President
        </h3>
        <p>H. G. Dr. Mathews Mar Thimothios Metropolitan</p>

        <h3 className="font-syro-display font-semibold text-xl text-syro-blue border-b border-syro-table-border pb-2 mt-8">
          Vice Presidents
        </h3>
        <div className="space-y-2">
          <p>Fr. Solu Koshy Raju</p>
          <p>Smt. Jessy Varghese</p>
        </div>

        <h3 className="font-syro-display font-semibold text-xl text-syro-blue border-b border-syro-table-border pb-2 mt-8">
          Secretary
        </h3>
        <p>Rachel P Jose</p>
        <p>Ph: +91 9497675787</p>
      </div>
    </SpiritualOrgSubpageLayout>
  );
};

export default MalankaraOrthodoxBaskiyomaAssociationPage;

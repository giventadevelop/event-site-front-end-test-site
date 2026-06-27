import React from 'react';
import SpiritualOrgSubpageLayout from '../SpiritualOrgSubpageLayout';

export const metadata = {
  title: 'Ecological Commission | MOSC',
  description: 'Ecological Commission of the Malankara Orthodox Syrian Church. President H. G. Dr. Joseph Mar Dionysius Metropolitan. Vice President Fr. Kurian Daniel. General Secretary Fr. Thomas George.',
};

const EcologicalCommissionPage = () => {
  return (
    <SpiritualOrgSubpageLayout
      title="Ecological Commission"
      currentHref="/mosc/spiritual-organizations/ecological-commission"
    >
      <div className="space-y-6 font-syro-primary text-syro-dark-gray leading-relaxed">
        <h2 className="font-syro-display font-semibold text-2xl text-syro-blue mb-4 pl-4 border-l-4 border-syro-red">
          Office Bearers
        </h2>

        <h3 className="font-syro-display font-semibold text-xl text-syro-blue border-b border-syro-table-border pb-2">
          President
        </h3>
        <p>H. G. Dr. Joseph Mar Dionysius Metropolitan</p>

        <h3 className="font-syro-display font-semibold text-xl text-syro-blue border-b border-syro-table-border pb-2 mt-8">
          Vice President
        </h3>
        <p>Fr. Kurian Daniel</p>

        <h3 className="font-syro-display font-semibold text-xl text-syro-blue border-b border-syro-table-border pb-2 mt-8">
          General Secretary
        </h3>
        <p>Fr. Thomas George</p>
      </div>
    </SpiritualOrgSubpageLayout>
  );
};

export default EcologicalCommissionPage;

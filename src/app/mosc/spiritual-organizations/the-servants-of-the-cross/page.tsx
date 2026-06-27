import React from 'react';
import SpiritualOrgSubpageLayout from '../SpiritualOrgSubpageLayout';

export const metadata = {
  title: 'The Servants of the Cross | MOSC',
  description: 'The Servants of the Cross. President H. G. Geevarghese Mar Coorilos Metropolitan. General Secretary Fr. Somu K. Samuel. Office: Carmel Dayara, Kandanad.',
};

const TheServantsOfTheCrossPage = () => {
  return (
    <SpiritualOrgSubpageLayout
      title="The Servants of the Cross"
      currentHref="/mosc/spiritual-organizations/the-servants-of-the-cross"
    >
      <div className="space-y-6 font-syro-primary text-syro-dark-gray leading-relaxed">
        <h2 className="font-syro-display font-semibold text-2xl text-syro-blue mb-4 pl-4 border-l-4 border-syro-red">
          Office Bearers & Contact
        </h2>

        <h3 className="font-syro-display font-semibold text-xl text-syro-blue border-b border-syro-table-border pb-2">
          President
        </h3>
        <p>H. G. Geevarghese Mar Coorilos Metropolitan</p>

        <h3 className="font-syro-display font-semibold text-xl text-syro-blue border-b border-syro-table-border pb-2 mt-8">
          General Secretary
        </h3>
        <p>Fr. Somu K. Samuel</p>
        <p>Ph: +91 9447933220</p>

        <h3 className="font-syro-display font-semibold text-xl text-syro-blue border-b border-syro-table-border pb-2 mt-8">
          Office Address
        </h3>
        <p>Carmel Dayara. Kandanad</p>
        <p>Ph: 0484 2792159</p>
      </div>
    </SpiritualOrgSubpageLayout>
  );
};

export default TheServantsOfTheCrossPage;

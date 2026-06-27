import React from 'react';
import Image from 'next/image';
import SpiritualOrgSubpageLayout from '../SpiritualOrgSubpageLayout';

export const metadata = {
  title: 'Akhila Malankara Orthodox Shusrushaka Sangham (AMOSS) | MOSC',
  description: 'AMOSS gives instructions to altar boys for uniformity in worship, trains attendants in church tradition and ritual. President H. G. Dr. Yuhanon Mar Thevodoros Metropolitan.',
};

const AkhilaMalankaraOrthodoxShusrushakaSanghamAmossPage = () => {
  return (
    <SpiritualOrgSubpageLayout
      title="Akhila Malankara Orthodox Shusrushaka Sangham (AMOSS)"
      currentHref="/mosc/spiritual-organizations/akhila-malankara-orthodox-shusrushaka-sangham-amoss"
    >
      <div className="space-y-6 font-syro-primary text-syro-dark-gray leading-relaxed">
        <div className="mb-8 flex justify-center">
          <Image
            src="/images/logos/Current_Edits/MOSC-Logo-only.png"
            alt="Akhila Malankara Orthodox Shusrushaka Sangham (AMOSS)"
            width={175}
            height={175}
            className="rounded-lg object-contain" style={{ width: '175px', height: '175px' }}
          />
        </div>
        <p>
          AMOSS is a movement working on the following objectives:
        </p>

        <ol className="list-decimal list-inside space-y-3 pl-2">
          <li>
            To give instructions to the altar boys of all parishes in the Malankara Church to make uniformity in the worship of the church and to serve systematically.
          </li>
          <li>
            To mould people who have God&apos;s grace, dedication, who follow spiritual &amp; sacramental life, and who have worldly experience to reside as servants in the sacramental service of the holy church.
          </li>
          <li>
            To train attendants to practice the holy church&apos;s tradition and ritual service without any alteration and to perform it timely with all its meaning and value and to ordain and make them members of the church&apos;s serving community. The training to these altar boys is given under the supervision of &quot;SRUTI&quot; in the Kottayam Theological Seminary.
          </li>
        </ol>

        <h2 className="font-syro-display font-semibold text-2xl text-syro-blue mb-4 pl-4 border-l-4 border-syro-red mt-10">
          Activities
        </h2>
        <p>The activities under AMOSS are:</p>
        <ol className="list-decimal list-inside space-y-2 pl-2">
          <li>Periodical training programmes at the diocese and zonal levels.</li>
          <li>Annual conferences aiming in the upliftment and encouragement of youngsters as the altar boys.</li>
        </ol>
        <p>AMOSS have units in almost all parishes.</p>

        <h2 className="font-syro-display font-semibold text-2xl text-syro-blue mb-4 pl-4 border-l-4 border-syro-red mt-10">
          Office Bearers
        </h2>

        <h3 className="font-syro-display font-semibold text-xl text-syro-blue border-b border-syro-table-border pb-2">
          President
        </h3>
        <p>H. G. Dr. Yuhanon Mar Thevodoros Metropolitan</p>

        <h3 className="font-syro-display font-semibold text-xl text-syro-blue border-b border-syro-table-border pb-2 mt-8">
          Vice President
        </h3>
        <p>Fr. Jose Thomas Poovathumkal, Ph: 9447231131</p>

        <h3 className="font-syro-display font-semibold text-xl text-syro-blue border-b border-syro-table-border pb-2 mt-8">
          General Secretary
        </h3>
        <p>Biju V. Panthaplave, Ph: 9447558620</p>

        <h3 className="font-syro-display font-semibold text-xl text-syro-blue border-b border-syro-table-border pb-2 mt-8">
          Treasurer
        </h3>
        <p>Roy M. Muthoottu, Ph: 9847032251</p>
      </div>
    </SpiritualOrgSubpageLayout>
  );
};

export default AkhilaMalankaraOrthodoxShusrushakaSanghamAmossPage;

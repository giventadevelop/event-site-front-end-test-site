import React from 'react';
import Image from 'next/image';
import SpiritualOrgSubpageLayout from '../SpiritualOrgSubpageLayout';

export const metadata = {
  title: 'Ministry of Human Empowerment | MOSC',
  description: 'MOHE is a Department of Malankara Orthodox Syrian Church. It aims to explore, enlighten and empower human potential through awareness campaigns. Main thrust: Family Empowerment.',
};

const MinistryOfHumanEmpowermentPage = () => {
  return (
    <SpiritualOrgSubpageLayout
      title="Ministry of Human Empowerment"
      currentHref="/mosc-redesign/spiritual-organizations/ministry-of-human-empowerment"
    >
      <div className="space-y-6 font-syro-primary text-syro-dark-gray leading-relaxed">
        <div className="mb-8 flex justify-center">
          <Image
            src="/images/logos/Current_Edits/MOSC-Logo-only.png"
            alt="Ministry of Human Empowerment"
            width={175}
            height={175}
            className="rounded-lg object-contain" style={{ width: '175px', height: '175px' }}
          />
        </div>
        <p>
          MOHE is a Department of Malankara Orthodox Syrian Church. It aims to explore, enlighten and empower the human potential of the society through various awareness campaigns. The main thrust of this Ministry is Family Empowerment.
        </p>
        <p>
          In an era of privatization, globalization and urbanization, the lifestyle of human kind has changed tremendously. Technology has made the geography a history. This incredible progress of the society has not just pumped in the comfort and luxury and made mankind techno savvy but ipso facto to all revolving evil in the universe. The de facto of today&apos;s degrading human standard is due to the erosion of values, disintegration of families, drug addiction, gay and lesbian issues, Satan worship etc. In order to improve the life style, modus operandi of living need to be rectified with deep rooted Christian values, moral policing, righteous and fruitful life. The Ministry of Human Empowerment (MOHE) through its various projects endeavors to empower and enrich our families. The MOHE is neither a governmental organization nor religious group, spiritual organization /association but a distinct department of Malankara Orthodox Church.
        </p>

        <h2 className="font-syro-display font-semibold text-2xl text-syro-blue mb-4 pl-4 border-l-4 border-syro-red mt-10">
          Family Empowerment and Welfare Programme
        </h2>
        <p>
          Family plays a vital role in building up human resources in the society. Family ambience tends to mould and nurture an individual&apos;s character consisting of good moral values, habits and sensitivity towards societal issues. The focal point of the MOHE is to evaluate, guide and enhance family values. The Ministry aims to cater the needs of various segments of the family like children, youth, senior citizens, couples and women as they together contribute to the harmonious existence of church and society. Looking at the contemporary problems, the Church feels to create a department which caters holistically the ebb and flows of society. Through awareness campaigns, workshop, talks and seminars the Ministry looks forward to modulate and fixate the individual&apos;s psychological, physiological and spiritual issues.
        </p>

        <h2 className="font-syro-display font-semibold text-2xl text-syro-blue mb-4 pl-4 border-l-4 border-syro-red mt-10">
          Office Bearers & Contact
        </h2>

        <h3 className="font-syro-display font-semibold text-xl text-syro-blue border-b border-syro-table-border pb-2">
          President
        </h3>
        <p>H. G. Geevarghese Mar Coorilos Metropolitan</p>

        <h3 className="font-syro-display font-semibold text-xl text-syro-blue border-b border-syro-table-border pb-2 mt-8">
          Director
        </h3>
        <p>Fr. P. A. Philip, Ph: +91 9496155461</p>

        <h3 className="font-syro-display font-semibold text-xl text-syro-blue border-b border-syro-table-border pb-2 mt-8">
          Contact Us
        </h3>
        <p>
          The Ministry of Human Empowerment<br />
          Catholicate Palace, Devalokam P.O,<br />
          Kottayam, Kerala- 686004
        </p>
        <p>
          Phone: 0481-2572800, 0481-2578500, 2578499<br />
          Mobile: +91 9496155461
        </p>
        <p>
          Email:{' '}
          <a href="mailto:hrm@mosc.in" className="text-syro-red hover:underline">
            hrm@mosc.in
          </a>
        </p>
        <p>
          Website:{' '}
          <a href="https://hrm.mosc.in" target="_blank" rel="noopener noreferrer" className="text-syro-red hover:underline">
            hrm.mosc.in
          </a>
        </p>
      </div>
    </SpiritualOrgSubpageLayout>
  );
};

export default MinistryOfHumanEmpowermentPage;

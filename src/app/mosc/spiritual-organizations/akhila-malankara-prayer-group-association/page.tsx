import React from 'react';
import Image from 'next/image';
import SpiritualOrgSubpageLayout from '../SpiritualOrgSubpageLayout';

export const metadata = {
  title: 'Akhila Malankara Prayer Group Association | MOSC',
  description: 'The Akhila Malankara Prayer Group Association monitors and streamlines prayer and reading habits in prayer groups across parishes. President H.G Abraham Mar Ephiphanios Metropolitan.',
};

const AkhilaMalankaraPrayerGroupAssociationPage = () => {
  return (
    <SpiritualOrgSubpageLayout
      title="Akhila Malankara Prayer Group Association"
      currentHref="/mosc/spiritual-organizations/akhila-malankara-prayer-group-association"
    >
      <div className="space-y-6 font-syro-primary text-syro-dark-gray leading-relaxed">
        <div className="mb-8 flex justify-center">
          <Image
            src="/images/logos/Current_Edits/MOSC-Logo-only.png"
            alt="Akhila Malankara Prayer Group Association"
            width={175}
            height={175}
            className="rounded-lg object-contain" style={{ width: '175px', height: '175px' }}
          />
        </div>
        <p>
          The Akhila Malankara Prayer Group Association has been constituted to monitor and streamline the prayer and reading habits of congregations in different prayer groups functioning in the various parishes under the Malankara Syrian Orthodox Christian Church.
        </p>
        <p>
          The objective of this group is to ascertain the inculcation of firm faith, love of the church and brotherhood and bring about the spiritual, material and educational upliftment of the people.
        </p>
        <p>
          A unit consists of 20-30 heads of families and grown-up men. However, the women and children of these families can participate in these meetings. Once in a week (preferably Sunday) the prayer meetings are conducted at a convenient time in different houses or in a common place of convenience.
        </p>
        <p>
          Each unit has the vicar of the parish as the president and should have a secretary who should maintain the credit and debit account as well as the report. Once in three months, a common meeting as per the directions of the Vicar is to be convened with a general Secretary to oversee the conduct of the meeting.
        </p>

        <h2 className="font-syro-display font-semibold text-2xl text-syro-blue mb-4 pl-4 border-l-4 border-syro-red mt-10">
          Office Bearers
        </h2>

        <h3 className="font-syro-display font-semibold text-xl text-syro-blue border-b border-syro-table-border pb-2">
          President
        </h3>
        <p>H.G Abraham Mar Ephiphanios Metropolitan</p>

        <h3 className="font-syro-display font-semibold text-xl text-syro-blue border-b border-syro-table-border pb-2 mt-8">
          Vice President
        </h3>
        <p>Fr. Johnson Kallittathil, Ph: 9447463066</p>

        <h3 className="font-syro-display font-semibold text-xl text-syro-blue border-b border-syro-table-border pb-2 mt-8">
          General Secretary
        </h3>
        <p>Fr. Geevarghese John, Ph: 9447211799</p>
      </div>
    </SpiritualOrgSubpageLayout>
  );
};

export default AkhilaMalankaraPrayerGroupAssociationPage;

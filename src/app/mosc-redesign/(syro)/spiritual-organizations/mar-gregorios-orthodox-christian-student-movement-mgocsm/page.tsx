import React from 'react';
import Image from 'next/image';
import SpiritualOrgSubpageLayout from '../SpiritualOrgSubpageLayout';

export const metadata = {
  title: 'Mar Gregorios Orthodox Christian Student Movement (MGOCSM) | MOSC',
  description: 'MGOCSM is the student wing of the Malankara Orthodox Syrian Church. Founded 1907. President H. G. Dr. Abraham Mar Seraphim Metropolitan. General Secretary Fr. Dr. Vivek Varughese.',
};

const MarGregoriosOrthodoxChristianStudentMovementMgocsmPage = () => {
  return (
    <SpiritualOrgSubpageLayout
      title="Mar Gregorios Orthodox Christian Student Movement (MGOCSM)"
      currentHref="/mosc-redesign/spiritual-organizations/mar-gregorios-orthodox-christian-student-movement-mgocsm"
    >
      <div className="space-y-6 font-syro-primary text-syro-dark-gray leading-relaxed">
        <div className="mb-8 flex justify-center">
          <Image
            src="/images/spiritual/mgocsm.jpg"
            alt="Mar Gregorios Orthodox Christian Student Movement (MGOCSM)"
            width={175}
            height={175}
            className="rounded-lg object-contain" style={{ width: '175px', height: '175px' }}
          />
        </div>
        <p>
          Mar Gregorios Orthodox Christian Student Movement (MGOCSM) is the student wing of the Malankara Orthodox Syrian Church. The students and senior leaders of our church who were residing in Madras (Chennai), India in the early part of this century felt the need for an organization to bring together our students in various colleges and high schools with a view to deepening their spiritual life and to create in them a livelier sense of fellowship. So they founded the Syrian Student Conference in 1907 and first conference was convened on January 1st, 1908 at Tiruvalla, Kerala, India. Annual conferences have been a regular feature since that year. The Syrian student conference, the parent organization, assumed its present name MGOCSM in 1960. Ours is the oldest Christian student organization in India. Our motto is Worship – Service – Study.
        </p>
        <p>
          MGOCSM have been maintaining inter-disciplinary contacts in the academic field for a long time by the formation of its wings. There are college student&apos;s wing, high school student&apos;s wing, University teacher&apos;s association, School teacher&apos;s association, Medical Auxiliary, Technical Auxiliary, Missionary forum, Literary forum, Publication wing, and etc.
        </p>
        <p>
          Our student centers at Kottayam, Trivandrum, always stand as fitting monuments to the continuous and tireless efforts of the movement during the past years. The long cherished dream of other centers at Kothamangalam, Pampady, and Bangalore is also coming to life. Each student center provides hostel facilities in addition to chapel, auditorium, reading room and guest rooms.
        </p>
        <p>
          MGOCSM Book shop and publishing house at Kottayam, India, continues to function purposefully. The movement publishes books relating to historical, patristic, and sacramental matters of the Church.
        </p>
        <p>
          Above all, the greatest contribution the movement has made to the church is that, it has prepared and provided able and outstanding leaders for his/her service from time to time. In spite of the chaos in the academic world, the movement is going ahead with its dynamic programs seeking the intercession of our patron St. Gregorios of Parumala.
        </p>

        <h2 className="font-syro-display font-semibold text-2xl text-syro-blue mb-4 pl-4 border-l-4 border-syro-red mt-10">
          Office Bearers & Contact
        </h2>

        <h3 className="font-syro-display font-semibold text-xl text-syro-blue border-b border-syro-table-border pb-2">
          President
        </h3>
        <p>H. G. Dr. Abraham Mar Seraphim Metropolitan</p>

        <h3 className="font-syro-display font-semibold text-xl text-syro-blue border-b border-syro-table-border pb-2 mt-8">
          Executive Vice President
        </h3>
        <p>H. G. Dr. Zacharias Mar Aprem Metropolitan</p>

        <h3 className="font-syro-display font-semibold text-xl text-syro-blue border-b border-syro-table-border pb-2 mt-8">
          General Secretary
        </h3>
        <p>Fr. Dr. Vivek Varughese, Ph: +91 8547783374</p>

        <h3 className="font-syro-display font-semibold text-xl text-syro-blue border-b border-syro-table-border pb-2 mt-8">
          Contact Address
        </h3>
        <p>MGOCSM Student Centre, College Road, Kottayam, Kerala- 686 001</p>
        <p>Ph: 0481 2567338</p>
        <p>
          Website:{' '}
          <a href="https://www.mgocsmmosc.com" target="_blank" rel="noopener noreferrer" className="text-syro-red hover:underline">
            www.mgocsmmosc.com
          </a>
        </p>
        <p>
          Email:{' '}
          <a href="mailto:mgocsmoffice@yahoo.com" className="text-syro-red hover:underline">
            mgocsmoffice@yahoo.com
          </a>
        </p>
      </div>
    </SpiritualOrgSubpageLayout>
  );
};

export default MarGregoriosOrthodoxChristianStudentMovementMgocsmPage;

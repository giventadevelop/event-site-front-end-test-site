import React from 'react';
import Image from 'next/image';
import SpiritualOrgSubpageLayout from '../SpiritualOrgSubpageLayout';

export const metadata = {
  title: 'Orthodox Syrian Sunday School Association of the East (SUNDAY SCHOOL) | MOSC',
  description: 'Orthodox Syrian Sunday School Association of the East is a spiritual organization functioning in all the parishes of the Malankara Orthodox Church throughout the world. It takes care of the spiritual nurturing of the children, by bringing them up in the knowledge and fellowship of Jesus Christ and His Church.',
};

const OrthodoxSyrianSundaySchoolAssociationOfTheEastPage = () => {
  return (
    <SpiritualOrgSubpageLayout
      title="Orthodox Syrian Sunday School Association of the East (SUNDAY SCHOOL)"
      currentHref="/mosc-redesign/spiritual-organizations/orthodox-syrian-sunday-school-association-of-the-east"
    >
      <div className="space-y-6 font-syro-primary text-syro-dark-gray leading-relaxed">
        <div className="mb-8 flex justify-center">
          <Image
            src="/images/spiritual/OSSSAE.png"
            alt="Orthodox Syrian Sunday School Association of the East"
            width={175}
            height={175}
            className="rounded-lg object-contain" style={{ width: '175px', height: '175px' }}
          />
        </div>

        <h2 className="font-syro-display font-semibold text-2xl text-syro-blue mb-4 pl-4 border-l-4 border-syro-red">
          About O.S.S.A.E.
        </h2>
        <p>
          Orthodox Syrian Sunday School Association of the East is a spiritual organization functioning in all the parishes of the Malankara Orthodox Church throughout the world. It takes care of the spiritual nurturing of the children, by bringing them up in the knowledge and fellowship of Jesus Christ and His Church. The classes are conducted for the children. It has a separate wing for the Outside Kerala Region (OKR).
        </p>
        <p>
          The classes range from Pre-primary to the twelfth (Vedapraveen Diploma). We follow a curriculum, jointly prepared and published by the Oriental Orthodox Churches which is revised from time to time. The Vacation Bible School conducted (OVBS) is a very vibrant wing of the O.S.S.A.E. The movement publish textbooks, devotional materials, song books, songs and animations for the OVBS every year. The headquarters of O.S.S.A.E is located in the complex of the Devalokom Catholicate Aramana, Kottayam.
        </p>

        <h2 className="font-syro-display font-semibold text-2xl text-syro-blue mb-4 pl-4 border-l-4 border-syro-red mt-10">
          Office Bearers & Contact
        </h2>

        <h3 className="font-syro-display font-semibold text-xl text-syro-blue border-b border-syro-table-border pb-2">
          President
        </h3>
        <ul className="space-y-2">
          <li>H.G. Dr. Joseph Mar Dionysius Metropolitan</li>
          <li>H.G. Dr. Youhanon Mar Demetrios Metropolitan (President, Outside Kerala Region)</li>
        </ul>

        <h3 className="font-syro-display font-semibold text-xl text-syro-blue border-b border-syro-table-border pb-2 mt-8">
          Director General
        </h3>
        <p>Rev. Fr. Dr. Varghese Varghese, Mob: +91 9947362708</p>

        <h3 className="font-syro-display font-semibold text-xl text-syro-blue border-b border-syro-table-border pb-2 mt-8">
          Office Administrator
        </h3>
        <p>Rev. Fr. Jobsam Mathew, Mob: +91 9846670920</p>

        <h3 className="font-syro-display font-semibold text-xl text-syro-blue border-b border-syro-table-border pb-2 mt-8">
          Outside Kerala Region
        </h3>
        <p>Director: Rev. Fr. Dr. Jossi Jacob, Mob: +91 9400352724</p>

        <h3 className="font-syro-display font-semibold text-xl text-syro-blue border-b border-syro-table-border pb-2 mt-8">
          Address
        </h3>
        <address className="not-italic leading-relaxed">
          O.S.S.A.E Central Office,<br />
          Catholicate Aramana,<br />
          Devalokam P.O, Kottayam,<br />
          Kerala<br />
          Phone: 0481 2572890
        </address>

        <h3 className="font-syro-display font-semibold text-xl text-syro-blue border-b border-syro-table-border pb-2 mt-8">
          Websites
        </h3>
        <ul className="space-y-2">
          <li>
            <a href="http://www.ossae.org/" target="_blank" rel="noopener noreferrer" className="text-syro-red hover:underline">
              www.ossae.org
            </a>
          </li>
          <li>
            <a href="https://ossaebodhanam.org/" target="_blank" rel="noopener noreferrer" className="text-syro-red hover:underline">
              ossaebodhanam.org
            </a>
          </li>
        </ul>
      </div>
    </SpiritualOrgSubpageLayout>
  );
};

export default OrthodoxSyrianSundaySchoolAssociationOfTheEastPage;

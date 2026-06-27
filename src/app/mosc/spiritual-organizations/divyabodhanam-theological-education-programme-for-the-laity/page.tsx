import React from 'react';
import SpiritualOrgSubpageLayout from '../SpiritualOrgSubpageLayout';

export const metadata = {
  title: 'Divyabodhanam (Theological Education Programme for the Laity) | MOSC',
  description: 'The Divyabodhanam is a theological training programme for laity in the Church, founded in 1984. It educates in basic Orthodoxy, equips people to face contemporary challenges with a Christian mind, encourages lay leaders in spiritual organizations, and helps Christian parents and families nurture the next generation.',
};

const DivyabodhanamTheologicalEducationProgrammeForTheLaityPage = () => {
  return (
    <SpiritualOrgSubpageLayout
      title="Divyabodhanam (Theological Education Programme for the Laity)"
      currentHref="/mosc/spiritual-organizations/divyabodhanam-theological-education-programme-for-the-laity"
    >
      <div className="space-y-6 font-syro-primary text-syro-dark-gray leading-relaxed">
        <p>
          The Divyabodhanam is a theological training programme for laity in the Church. It was founded in 1984 by the late HH Baselius Marthoma Mathews I by the initiative of the late Metropolitan Dr. Paulose Mar Gregorios.
        </p>
        <p>
          Divyabodhanam aims to educate people in basic Orthodoxy—its faith and practices, by training people to build up a true Christian life-pattern in the midst of its challenges. It equips people to face the contemporary challenges, ideologies and problems of the time and to respond with a Christian mind filled with deep faith and complete trust in God. It also encourages lay leaders to work in the spiritual organizations of the Church at parish and diocesan levels. It helps Christian parents and families, by which the growing generation shall be properly cared for and nurtured in a true Christian way.
        </p>

        <h2 className="font-syro-display font-semibold text-2xl text-syro-blue mb-4 pl-4 border-l-4 border-syro-red mt-10">
          Office Bearers & Contact
        </h2>

        <h3 className="font-syro-display font-semibold text-xl text-syro-blue border-b border-syro-table-border pb-2">
          President
        </h3>
        <p>H. G. Dr. Yakoob Mar Irenaios Metropolitan</p>

        <h3 className="font-syro-display font-semibold text-xl text-syro-blue border-b border-syro-table-border pb-2 mt-8">
          Director
        </h3>
        <p>Fr. Dr. T. J. Joshua</p>

        <h3 className="font-syro-display font-semibold text-xl text-syro-blue border-b border-syro-table-border pb-2 mt-8">
          Joint Director
        </h3>
        <p>Fr. C. C. Cherian</p>

        <h3 className="font-syro-display font-semibold text-xl text-syro-blue border-b border-syro-table-border pb-2 mt-8">
          Principal, Old Theological Seminary, Kottayam
        </h3>
        <p>Fr. Dr. Reji Mathew</p>

        <h3 className="font-syro-display font-semibold text-xl text-syro-blue border-b border-syro-table-border pb-2 mt-8">
          Registrar
        </h3>
        <p>Fr. Mathews John Manayil</p>

        <h3 className="font-syro-display font-semibold text-xl text-syro-blue border-b border-syro-table-border pb-2 mt-8">
          Central Organizer
        </h3>
        <p>Prof. Dr. Cherian Thomas</p>

        <h3 className="font-syro-display font-semibold text-xl text-syro-blue border-b border-syro-table-border pb-2 mt-8">
          Co-ordinator
        </h3>
        <p>Fr. Dr. Varghese P. Varghese</p>

        <h3 className="font-syro-display font-semibold text-xl text-syro-blue border-b border-syro-table-border pb-2 mt-8">
          Office Address
        </h3>
        <p>Orthodox Seminary, PB. No. 98, Kottayam- 686001</p>
        <p>Ph: +91 6282761354</p>
        <p>
          Email:{' '}
          <a href="mailto:divyabodhanamots@gmail.com" className="text-syro-red hover:underline">
            divyabodhanamots@gmail.com
          </a>
        </p>
        <p>
          Website:{' '}
          <a href="https://www.divyabodhanam.org" target="_blank" rel="noopener noreferrer" className="text-syro-red hover:underline">
            www.divyabodhanam.org
          </a>
        </p>
      </div>
    </SpiritualOrgSubpageLayout>
  );
};

export default DivyabodhanamTheologicalEducationProgrammeForTheLaityPage;

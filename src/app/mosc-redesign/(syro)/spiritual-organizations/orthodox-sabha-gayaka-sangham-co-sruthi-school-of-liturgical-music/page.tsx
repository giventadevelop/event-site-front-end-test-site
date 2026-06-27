import React from 'react';
import SpiritualOrgSubpageLayout from '../SpiritualOrgSubpageLayout';

export const metadata = {
  title: 'Orthodox Sabha Gayaka Sangham C/o Sruthi School of Liturgical Music | MOSC',
  description: 'Orthodox Sabha Gayaka Sangham C/o Sruthi School of Liturgical Music. Director H. G. Dr. Zacharias Mar Aprem Metropolitan. Contact: sruthischoolofmusic89@rediffmail.com.',
};

const OrthodoxSabhaGayakaSanghamCoSruthiSchoolOfLiturgicalMusicPage = () => {
  return (
    <SpiritualOrgSubpageLayout
      title="Orthodox Sabha Gayaka Sangham C/o Sruthi School of Liturgical Music"
      currentHref="/mosc-redesign/spiritual-organizations/orthodox-sabha-gayaka-sangham-co-sruthi-school-of-liturgical-music"
    >
      <div className="space-y-6 font-syro-primary text-syro-dark-gray leading-relaxed">
        <h2 className="font-syro-display font-semibold text-2xl text-syro-blue mb-4 pl-4 border-l-4 border-syro-red">
          Office Bearers & Contact
        </h2>

        <h3 className="font-syro-display font-semibold text-xl text-syro-blue border-b border-syro-table-border pb-2">
          Director
        </h3>
        <p>H. G. Dr. Zacharias Mar Aprem Metropolitan</p>

        <h3 className="font-syro-display font-semibold text-xl text-syro-blue border-b border-syro-table-border pb-2 mt-8">
          Email
        </h3>
        <p>
          <a href="mailto:sruthischoolofmusic89@rediffmail.com" className="text-syro-red hover:underline">
            sruthischoolofmusic89@rediffmail.com
          </a>
        </p>
      </div>
    </SpiritualOrgSubpageLayout>
  );
};

export default OrthodoxSabhaGayakaSanghamCoSruthiSchoolOfLiturgicalMusicPage;

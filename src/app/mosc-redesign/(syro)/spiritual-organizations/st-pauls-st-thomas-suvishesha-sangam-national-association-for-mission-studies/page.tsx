import React from 'react';
import SpiritualOrgSubpageLayout from '../SpiritualOrgSubpageLayout';

export const metadata = {
  title: "St. Paul's & St.Thomas Suvishesha Sangam National Association for Mission Studies | MOSC",
  description: "St. Paul's & St.Thomas Suvishesha Sangam National Association for Mission Studies. President H.G. Dr. Yuhanon Mar Thevodoros Metropolitan. Office: St.Paul's M.T.C, Mavelikara. Ph: 0479 2302473, 2342709.",
};

const StPaulsStThomasSuvisheshaSangamNationalAssociationForMissionStudiesPage = () => {
  return (
    <SpiritualOrgSubpageLayout
      title="St. Paul's & St.Thomas Suvishesha Sangam National Association for Mission Studies"
      currentHref="/mosc-redesign/spiritual-organizations/st-pauls-st-thomas-suvishesha-sangam-national-association-for-mission-studies"
    >
      <div className="space-y-6 font-syro-primary text-syro-dark-gray leading-relaxed">
        <h2 className="font-syro-display font-semibold text-2xl text-syro-blue mb-4 pl-4 border-l-4 border-syro-red">
          Office Bearers & Contact
        </h2>

        <h3 className="font-syro-display font-semibold text-xl text-syro-blue border-b border-syro-table-border pb-2">
          President
        </h3>
        <p>H.G. Dr. Yuhanon Mar Thevodoros Metropolitan</p>

        <h3 className="font-syro-display font-semibold text-xl text-syro-blue border-b border-syro-table-border pb-2 mt-8">
          Office Address
        </h3>
        <p>St.Paul&apos;s M.T.C , Mavelikara</p>
        <p>Ph: 0479 2302473, 2342709</p>
        <p>
          Email:{' '}
          <a href="mailto:stpaulsmtc@yahoo.com" className="text-syro-red hover:underline">
            stpaulsmtc@yahoo.com
          </a>
        </p>
      </div>
    </SpiritualOrgSubpageLayout>
  );
};

export default StPaulsStThomasSuvisheshaSangamNationalAssociationForMissionStudiesPage;

import React from 'react';
import Image from 'next/image';
import SpiritualOrgSubpageLayout from '../SpiritualOrgSubpageLayout';

export const metadata = {
  title: 'The Orthodox Christian Youth Movement | MOSC',
  description: 'OCYM is the Youth-wing of the Malankara Orthodox Syrian Church. President H. G. Dr. Geevarghese Mar Yulios Metropolitan. Central Office: St. Thomas Bhavan, Kottayam.',
};

const TheOrthodoxChristianYouthMovementPage = () => {
  return (
    <SpiritualOrgSubpageLayout
      title="The Orthodox Christian Youth Movement"
      currentHref="/mosc-redesign/spiritual-organizations/the-orthodox-christian-youth-movement"
    >
      <div className="space-y-6 font-syro-primary text-syro-dark-gray leading-relaxed">
        <div className="mb-8 flex justify-center">
          <Image
            src="/images/spiritual/OCYM-ahmedabad.png"
            alt="The Orthodox Christian Youth Movement"
            width={175}
            height={175}
            className="rounded-lg object-contain" style={{ width: '175px', height: '175px' }}
          />
        </div>
        <p>
          The Orthodox Christian Youth Movement (OCYM), the Youth-wing of the Malankara Orthodox Syrian Church is in its 77th year of active leadership and Christian witness in the Church and society. It contributes to the goodness and progress of the Church and community in the three-fold path of worship, study and service. It aims at molding the minds and visions of the youth against the background of the contemporary issues.
        </p>

        <h2 className="font-syro-display font-semibold text-2xl text-syro-blue mb-4 pl-4 border-l-4 border-syro-red mt-10">
          Movement through the years (Historical Survey)
        </h2>

        <p>
          Looking back, we see the seeds of the Youth Movement planted by the visionary leaders of the church during the latter half of the nineteenth century. A spiritual organisation with the name Yuvajana Sangam was working effectively in various places and parishes along with other organisations like Sunday school, suvishesha sangam etc. They helped a lot to anchor the mother church safely in the storm created by the renewal group.
        </p>

        <p>
          It was in the year 1933 that the attempts to bring together the local youth fellowships and to start a Parish–Centered Syrian Yuvajana Sangam, (Youth league) was materialized with the active leadership of Joseph Mar Severios Valakuzhyil Episcopa (President) and Rev Fr TS Abraham (Secretary).
        </p>

        <p>
          The historic conference in 1936 held at Mavelikara broadened the vision of the Yuvajana Sangam and the Sangam was established as the official wing of the Church with Metropolitan Geevarghese Mar Philexinos (Puthenkavil Kochu Thirumeni) as president and Clergy P E Daniel (Later Daniel Mar Philexinos) as general secretary.
        </p>

        <p>
          The year 1958 was decisive for the youth in the sense that the annual conference held in Puthupally officially accepted the title &apos;The Orthodox Christian Youth Movement&apos; and initiatives were taken to start a monthly publication with the title Orthodox Youth (now published with the title Orthodox Yuvajanam). The Movement continues its spiritual journey with broader visions and effective Christian youth leadership.
        </p>

        <h2 className="font-syro-display font-semibold text-2xl text-syro-blue mb-4 pl-4 border-l-4 border-syro-red mt-10">
          Leadership
        </h2>

        <h3 className="font-syro-display font-semibold text-xl text-syro-blue border-b border-syro-table-border pb-2">
          President
        </h3>
        <p>H. G. Dr. Geevarghese Mar Yulios Metropolitan</p>

        <h3 className="font-syro-display font-semibold text-xl text-syro-blue border-b border-syro-table-border pb-2 mt-8">
          Vice President
        </h3>
        <p>Fr. Shiji Koshy, Ph: +91 9496466192</p>

        <h3 className="font-syro-display font-semibold text-xl text-syro-blue border-b border-syro-table-border pb-2 mt-8">
          General Secretary
        </h3>
        <p>Fr. Viju Elias, Ph: +91 9447507880</p>

        <h3 className="font-syro-display font-semibold text-xl text-syro-blue border-b border-syro-table-border pb-2 mt-8">
          Treasurer
        </h3>
        <p>Sri. Pearl Kanneth, Ph: +91 9946291947</p>

        <h3 className="font-syro-display font-semibold text-xl text-syro-blue border-b border-syro-table-border pb-2 mt-8">
          Central Office
        </h3>
        <p>
          Orthodox Christian Youth Movement of the East<br />
          St. Thomas Bhavan,<br />
          Orthodox Youth Centre,<br />
          Old Seminary Road, Chungam,<br />
          Kottayam, Kerala, India 689 001
        </p>
        <p>Contact Number: 0481 – 2583997</p>
        <p>
          Email:{' '}
          <a href="mailto:indianocym@gmail.com" className="text-syro-red hover:underline">
            indianocym@gmail.com
          </a>
        </p>
        <p>
          Website:{' '}
          <a href="https://www.ocymonline.org" target="_blank" rel="noopener noreferrer" className="text-syro-red hover:underline">
            www.ocymonline.org
          </a>
        </p>
      </div>
    </SpiritualOrgSubpageLayout>
  );
};

export default TheOrthodoxChristianYouthMovementPage;

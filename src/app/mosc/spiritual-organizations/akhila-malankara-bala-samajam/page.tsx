import React from 'react';
import Image from 'next/image';
import SpiritualOrgSubpageLayout from '../SpiritualOrgSubpageLayout';

export const metadata = {
  title: 'Akhila Malankara Balasamajam | MOSC',
  description: 'Akhila Malankara Balasamajam is the student portion of the Malankara Orthodox Syrian Church. President H.G.Dr. Joseph Mar Dionysius Metropolitan. Central office: St Thomas Aramana, Ranni.',
};

const AkhilaMalankaraBalaSamajamPage = () => {
  return (
    <SpiritualOrgSubpageLayout
      title="Akhila Malankara Balasamajam"
      currentHref="/mosc/spiritual-organizations/akhila-malankara-bala-samajam"
    >
      <div className="space-y-6 font-syro-primary text-syro-dark-gray leading-relaxed">
        <div className="mb-8 flex justify-center">
          <Image
            src="/images/spiritual/BALASAMAJAM.png"
            alt="Akhila Malankara Balasamajam"
            width={175}
            height={175}
            className="rounded-lg object-contain" style={{ width: '175px', height: '175px' }}
          />
        </div>
        <p>
          AKHILA MALANKARA BALASAMAJAM is the student portion of the Malankara Orthodox Syrian Church. Balasamajam aims at the integrated personal development of the youth in the Church. The main objectives are worship, study and virtuous life among all the boys and girls inside the Church. The Balasamajam was organized on an all Malankara basis in 1982.
        </p>
        <p>
          Through this programme, an all round development of personality of the children is accomplished as they are encouraged to study the Holy Bible, the tradition and history of the Church along with their academic studies. The life history of Saints of the church presented before them develops in them a spiritual and moral life aiming the service for the society.
        </p>
        <p>
          The Samajam through its activities encourages the children to participate regularly in the Sunday Schools and Church services. Every child between the age of 5 and 15 years are supposed to be its members.
        </p>

        <h2 className="font-syro-display font-semibold text-2xl text-syro-blue mb-4 pl-4 border-l-4 border-syro-red mt-10">
          Administration
        </h2>

        <h3 className="font-syro-display font-semibold text-xl text-syro-blue border-b border-syro-table-border pb-2">
          Central level
        </h3>
        <p>
          Balasamajam is led in the central level by a Metropolitan as its President and Priests as its Vice-president and General Secretary. Two joint secretaries are also there to support the general secretary (one male and one female). There is a treasurer also who is elected from the central committee. The central committee is constituted with the general secretary and joint secretary of each diocese.
        </p>

        <h3 className="font-syro-display font-semibold text-xl text-syro-blue border-b border-syro-table-border pb-2 mt-8">
          Diocese level
        </h3>
        <p>
          Every diocese contain the same pattern as President (the diocesan bishop) Vice president (priest who is selected by the bishop), general secretary and joint secretary. An executive committee is also there.
        </p>

        <h3 className="font-syro-display font-semibold text-xl text-syro-blue border-b border-syro-table-border pb-2 mt-8">
          Church level
        </h3>
        <p>
          Each parish has its own unit led by the Priest as the President. Vice president, General secretary and a joint secretary for leading the church programmes.
        </p>

        <h2 className="font-syro-display font-semibold text-2xl text-syro-blue mb-4 pl-4 border-l-4 border-syro-red mt-10">
          Programmes
        </h2>
        <p>
          Annual meets, annual camps, Bible study classes, competitions in various subjects, pilgrimages, tours, humanitarian services and educational counselling can be arranged at the Central, Diocesan and parish levels. At the parish level at least once in a month, the balasamajams can meet and arrange songs, bible reading, talks, worship and choir practice, reading relating to ideal biographic and science, retreat, regular participation in the Eucharist, various lecture sessions (religious and materialistic), debates on the promotion of health and humanitarian activities.
        </p>

        <h2 className="font-syro-display font-semibold text-2xl text-syro-blue mb-4 pl-4 border-l-4 border-syro-red mt-10">
          Funds
        </h2>
        <p>
          The fund for the balasamajam mainly comprises the financial contributions, grants, financial assistance received from the various parishes by the balasamajam. The money thus collected will have to be deposited in the joint account of the Treasurer and President at the central parish and bishopric levels. This can be spent only as per the direction of the committee.
        </p>

        <h2 className="font-syro-display font-semibold text-2xl text-syro-blue mb-4 pl-4 border-l-4 border-syro-red mt-10">
          Present Office Bearers at Central Level
        </h2>

        <h3 className="font-syro-display font-semibold text-xl text-syro-blue border-b border-syro-table-border pb-2">
          President
        </h3>
        <p>H.G.Dr. Joseph Mar Dionysius Metropolitan</p>

        <h3 className="font-syro-display font-semibold text-xl text-syro-blue border-b border-syro-table-border pb-2 mt-8">
          Vice President
        </h3>
        <p>Rev. Fr. Cherian Jacob, Ph: 9446600912</p>

        <h3 className="font-syro-display font-semibold text-xl text-syro-blue border-b border-syro-table-border pb-2 mt-8">
          General Secretary
        </h3>
        <p>Fr. jim M. George, Ph: 9961595167</p>

        <h3 className="font-syro-display font-semibold text-xl text-syro-blue border-b border-syro-table-border pb-2 mt-8">
          Central Office
        </h3>
        <p>St Thomas Aramana, Pazhavangadi, Ranni. 689673.</p>
        <p>
          Email:{' '}
          <a href="mailto:orthodoxbalasamajam@gmail.com" className="text-syro-red hover:underline">
            orthodoxbalasamajam@gmail.com
          </a>
        </p>
      </div>
    </SpiritualOrgSubpageLayout>
  );
};

export default AkhilaMalankaraBalaSamajamPage;

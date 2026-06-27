import React from 'react';
import Image from 'next/image';
import SpiritualOrgSubpageLayout from '../SpiritualOrgSubpageLayout';

export const metadata = {
  title: 'St. Thomas Orthodox Vaidika Sanghom | MOSC',
  description: 'St. Thomas Orthodox Vaidhika Sanghom (STOVS) is the clergy association of the Malankara Orthodox Church. President H. G. Dr. Mathews Mar Thimothios Metropolitan.',
};

const StThomasOrthodoxVaidikaSanghomPage = () => {
  return (
    <SpiritualOrgSubpageLayout
      title="St. Thomas Orthodox Vaidika Sanghom"
      currentHref="/mosc/spiritual-organizations/st-thomas-orthodox-vaidika-sanghom"
    >
      <div className="space-y-6 font-syro-primary text-syro-dark-gray leading-relaxed">
        <div className="mb-8 flex justify-center">
          <Image
            src="/images/spiritual/vaidika-sanghom.jpg"
            alt="St. Thomas Orthodox Vaidika Sanghom"
            width={175}
            height={175}
            className="rounded-lg object-contain" style={{ width: '175px', height: '175px' }}
          />
        </div>
        <p>
          The antecedents of the <strong className="text-syro-blue">St. Thomas Orthodox Vaidhika Sanghom</strong> can be traced back to the period of <strong className="text-syro-blue">St. Gregorios of Parumala</strong>. The Saint, whose organizational skills and vision for the Malankara Orthodox Church, were exceptional, called together the first meeting of the Church&apos;s priests into an association. The time period being fraught with several internal and external problems, the clergy association was not an active force. It was revived again during the days of Joseph Mar Dionysius II, the founder of the M.D. Seminary and functioned with varying results. The objective for this association was to constitute a forum where the priests could interact with one another, discuss issues and relay them to the attention of the Holy Synod and collectively organize programmes for their welfare.
        </p>

        <p>
          The more recent chapter of the Malankara Orthodox Church&apos;s clergy association to further these goals can be placed in 1983 when the clergy were formally called together and proposed the name of the organization as The St. Thomas Orthodox Vaidhika Sanghom (The St. Thomas Orthodox Clergy Association). Its first meeting was held at the St. Peter&apos;s & St. Paul&apos;s Church, Parumala under the guidance of H.G. Dr. Paulos Mar Gregorios and was presided over by the then Catholicos, H.H. Moran Mar Baselios Marthoma Mathews I.
        </p>

        <h2 className="font-syro-display font-semibold text-2xl text-syro-blue mb-4 pl-4 border-l-4 border-syro-red mt-10">
          The meeting formally adopted a constitution and resolved the following:
        </h2>
        <ul className="list-disc pl-6 space-y-2">
          <li>H.G. Dr. Paulos Mar Gregorios would function as its president, while Fr. Dr. Mathew Vaidyan was named as its General Secretary. The Sanghom (STOVS) would be under the patronage of H.H. the Catholicos.</li>
          <li>The Association would be constituted of all the ordained priests of the Malankara Orthodox Church in good standing in their respective dioceses or spiritual organizations (monasteries, Mission Board, MGOCSM).</li>
          <li>A Clergy Endowment would be instituted to which all the members were to contribute a one-time donation of a month&apos;s basic salary.</li>
          <li>STOVS would hold a general assembly meeting once every three years, and it would print a magazine to be called &quot;The Purohithan&quot; thrice a year (January, April and December) which would feature articles and bulletins of interest to the clergy.</li>
          <li>The working of STOVS was to be guided by the President, two Vice-Presidents, the General Secretary, Joint Secretary and a Council, comprising of a diocesan Secretary and Clergy Association Secretary from each diocese. This body would meet periodically to review and plan the activities of the Sanghom.</li>
        </ul>

        <h2 className="font-syro-display font-semibold text-2xl text-syro-blue mb-4 pl-4 border-l-4 border-syro-red mt-10">
          Since its formal organization in 1983, STOVS has been functioning actively and regularly to ensure that the Church&apos;s clergy have a forum in which they can interact, which can interface with the Holy Synod to communicate important issues and to pursue their welfare. In an effort to meet these objectives STOVS conducts the following programmes:
        </h2>

        <h3 className="font-syro-display font-semibold text-xl text-syro-blue border-b border-syro-table-border pb-2 mt-6">
          Triennial General Assembly
        </h3>
        <p>
          This is the meeting that calls together all the priests of the Malankara Orthodox Church and is usually held at the Sts. Peter and Paul Church, Parumala once in three years, usually before the Feast of the Pentecost (May). The conference features a relevant theme of interest to the priests and its implications are discussed in various working groups. Its major resolutions are then communicated to the Holy Synod for its consideration and decision.
        </p>

        <h3 className="font-syro-display font-semibold text-xl text-syro-blue border-b border-syro-table-border pb-2 mt-8">
          Regional Meetings
        </h3>
        <p>
          A suggestion was proposed by the General Assembly in 1999 for regional meetings during the interim between the general body meetings for the priests to meet and discuss relevant issues. Accordingly, the dioceses in Kerala were grouped into five regions and regional conferences held at accessible churches. The one-day meetings feature classes on theology, ministry and church history during the first part and a time for discussion of relevant issues during the second part. These meetings have elicited a very favourable response and widespread participation is seen from the priests of all dioceses.
        </p>

        <h3 className="font-syro-display font-semibold text-xl text-syro-blue border-b border-syro-table-border pb-2 mt-8">
          The Purohithan
        </h3>
        <p>
          This journal, published thrice a year, includes articles by well-respected theologians, priests and professors on various issues, besides including bulletins of interest to the members. This widely respected and appreciated journal is available to all priests for a nominal subscription of Rs. 50 per year.
        </p>

        <h3 className="font-syro-display font-semibold text-xl text-syro-blue border-b border-syro-table-border pb-2 mt-8">
          The Clergy Welfare Fund
        </h3>
        <p>
          This corpus, to which every member is to contribute a one-time donation of a month&apos;s basic salary (which is to be paid in one sum or in installments), has been placed in a fixed deposit and the interest accruing is used to provide relief for the medical treatment of the priests and their immediate family members. The sums are disbursed upon an application being filled in, bearing the recommendation of the diocesan metropolitan and sent to the General Secretary.
        </p>

        <h2 className="font-syro-display font-semibold text-2xl text-syro-blue mb-4 pl-4 border-l-4 border-syro-red mt-10">
          Contact Address
        </h2>

        <h3 className="font-syro-display font-semibold text-xl text-syro-blue border-b border-syro-table-border pb-2">
          President
        </h3>
        <p>H. G. Dr. Mathews Mar Thimothios Metropolitan</p>
        <p>STOVS Office, PB No. 98, Kottayam, 686001</p>

        <h3 className="font-syro-display font-semibold text-xl text-syro-blue border-b border-syro-table-border pb-2 mt-8">
          General Secretary
        </h3>
        <p>Rev. Fr. Dr. Ninan V. George, Mob: +91 9447471641</p>
        <p>
          Email:{' '}
          <a href="mailto:admin@orthodoxvaidikasanghom.org" className="text-syro-red hover:underline">
            admin@orthodoxvaidikasanghom.org
          </a>
        </p>
        <p>
          Website:{' '}
          <a href="https://www.orthodoxvaidikasanghom.org/" target="_blank" rel="noopener noreferrer" className="text-syro-red hover:underline">
            www.orthodoxvaidikasanghom.org
          </a>
        </p>
      </div>
    </SpiritualOrgSubpageLayout>
  );
};

export default StThomasOrthodoxVaidikaSanghomPage;

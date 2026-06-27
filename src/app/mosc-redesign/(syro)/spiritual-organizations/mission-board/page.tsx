import React from 'react';
import Image from 'next/image';
import SpiritualOrgSubpageLayout from '../SpiritualOrgSubpageLayout';

export const metadata = {
  title: 'Mission Board and Mission Society | MOSC',
  description: `Mission Board and Mission Society fulfils the Church's mission in India. President H. G. Dr. Gabriel Mar Gregorios Metropolitan. Secretary, St. Pauls Mission Centre, Mavelikara.`,
};

const MissionBoardPage = () => {
  return (
    <SpiritualOrgSubpageLayout
      title="Mission Board and Mission Society"
      currentHref="/mosc-redesign/spiritual-organizations/mission-board"
    >
      <div className="space-y-6 font-syro-primary text-syro-dark-gray leading-relaxed">
        <div className="mb-8 flex justify-center">
          <Image
            src="/images/logos/Current_Edits/MOSC-Logo-only.png"
            alt="Mission Board and Mission Society"
            width={175}
            height={175}
            className="rounded-lg object-contain" style={{ width: '175px', height: '175px' }}
          />
        </div>
        <p>
          Orthodox Church which has been existing in India for the last two thousand years has started the mission society and mission board to fulfil its mission in India and hence to activate Indian Christianization. Our forefathers could declare the strong presence of God in the land through their witnessing life. From the time of St. Gregarious of Parumala itself organized missionary activities were there in India. In the time of H. G. Pathrose Mar Osthathios, mission among the gentiles became very active. But by the formation of Mission society and Mission Board the Christian mission was taken up by the Church as a whole. The Society initiates and leads mission centres all over India. Kalhandi in Orissa is a place where a lot of people die of starvation. Balagrams are functioning under Mission Board at four places in Kalhandi. Education for poor children, works among the illiterate who lives in the woods, dispensaries which provides medical assistance etc are some of the field of activities there. Yacharam St. Gregorios Balagram in Andhra Pradesh, the eye clinic associated with it, St George Balikagram in Pune, Itarsy Balagram, Karasseri Karunya Bhavan in TamilNadu, etc are all functioning efficiently. These centres extend education and medical assistance to the neighboring villages also.
        </p>
        <p>
          Not only that, the centre teaches Orthodox faith to the Christians there and equips them for missionary works in the villages around. The Bhilai Maccodia mission works efficiently in the field of education and rural development in North India. St Gregorios Daya Bhavan near Bangalore looks after children of AIDS patients. The palliative Care Centre attached to Daya Bhavan is working to give peace and hope to the dying aids patients. &quot;Sneha Sandesam&quot; is a traveling Gospel project which works in Indian evangelization and for the spiritual development of the faithful. More than one thousand five hundred programme has been conducted across sixteen states of India. NARSOC is an associated organization which is formed to give assistance to those who are suffering from natural disasters. At the time of the earthquake of Gujarat and tsunami the organization took initiative in rehabilating hundreds of people. There are only a few among the various activities of the Mission Board.
        </p>

        <h2 className="font-syro-display font-semibold text-2xl text-syro-blue mb-4 pl-4 border-l-4 border-syro-red mt-10">
          Office Bearers & Contact
        </h2>

        <h3 className="font-syro-display font-semibold text-xl text-syro-blue border-b border-syro-table-border pb-2">
          President
        </h3>
        <p>H. G. Dr. Gabriel Mar Gregorios Metropolitan</p>

        <h3 className="font-syro-display font-semibold text-xl text-syro-blue border-b border-syro-table-border pb-2 mt-8">
          Co-Presidents
        </h3>
        <div className="space-y-2">
          <p>H.G. Dr. Yuhanon Mar Chrisostomos Metropolitan</p>
          <p>H. G. Dr. Yuhanon Mar Thevodoros Metropolitan</p>
          <p>H. G. Yakob Mar Elias Metropolitan</p>
        </div>

        <h3 className="font-syro-display font-semibold text-xl text-syro-blue border-b border-syro-table-border pb-2 mt-8">
          Secretary
        </h3>
        <p>Prof. K. C. Mani</p>

        <h3 className="font-syro-display font-semibold text-xl text-syro-blue border-b border-syro-table-border pb-2 mt-8">
          Office Secretary
        </h3>
        <p>Fr. Joseph Antony, Ph: +91 9947399066</p>

        <h3 className="font-syro-display font-semibold text-xl text-syro-blue border-b border-syro-table-border pb-2 mt-8">
          Treasurer
        </h3>
        <p>Prof. Dr. Varughese Mathew</p>

        <h3 className="font-syro-display font-semibold text-xl text-syro-blue border-b border-syro-table-border pb-2 mt-8">
          Address
        </h3>
        <p>
          Secretary, Mission Board, St. Pauls Mission Centre,<br />
          Mavelikara -3, PH : 0479 2302473
        </p>
      </div>
    </SpiritualOrgSubpageLayout>
  );
};

export default MissionBoardPage;

import React from 'react';
import QuickLinks from '@/components/holy-synod/QuickLinks';
import SpiritualOrganizationsSidebar from '../SpiritualOrganizationsSidebar';

export const metadata = {
  title: 'Mission Board and Mission Society | MOSC',
  description: `Mission Board and Mission Society fulfils the Church's mission in India. President H. G. Dr. Gabriel Mar Gregorios Metropolitan. Secretary, St. Pauls Mission Centre, Mavelikara.`,
};

const MissionBoardPage = () => {
  return (
    <div className="bg-background">
      <section className="py-16 bg-gradient-to-br from-background to-muted">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="w-20 h-20 bg-primary rounded-lg flex items-center justify-center mx-auto mb-6 sacred-shadow-lg">
              <span className="text-primary-foreground text-4xl font-bold" role="img" aria-label="Mission Board">🌍</span>
            </div>
            <h1 className="font-heading font-semibold text-4xl text-foreground mb-4">
              Mission Board and Mission Society
            </h1>
            <p className="font-body text-lg text-muted-foreground max-w-3xl mx-auto leading-relaxed">
              The Orthodox Church has started the mission society and mission board to fulfil its mission in India and hence to activate Indian Christianization.
            </p>
          </div>
        </div>
      </section>

      <section className="py-16 bg-card">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
            <div className="lg:col-span-2">
              <div className="bg-background rounded-lg sacred-shadow p-8">
                <div className="space-y-6 font-body text-muted-foreground leading-relaxed">
                  <p>
                    Orthodox Church which has been existing in India for the last two thousand years has started the mission society and mission board to fulfil its mission in India and hence to activate Indian Christianization. Our forefathers could declare the strong presence of God in the land through their witnessing life. From the time of St. Gregarious of Parumala itself organized missionary activities were there in India. In the time of H. G. Pathrose Mar Osthathios, mission among the gentiles became very active. But by the formation of Mission society and Mission Board the Christian mission was taken up by the Church as a whole. The Society initiates and leads mission centres all over India.
                  </p>
                  <p>
                    Kalhandi in Orissa is a place where a lot of people die of starvation. Balagrams are functioning under Mission Board at four places in Kalhandi. Education for poor children, works among the illiterate who lives in the woods, dispensaries which provides medical assistance etc are some of the field of activities there. Yacharam St. Gregorios Balagram in Andhra Pradesh, the eye clinic associated with it, St George Balikagram in Pune, Itarsy Balagram, Karasseri Karunya Bhavan in TamilNadu, etc are all functioning efficiently. These centres extend education and medical assistance to the neighboring villages also. Not only that, the centre teaches Orthodox faith to the Christians there and equips them for missionary works in the villages around. The Bhilai Maccodia mission works efficiently in the field of education and rural development in North India. St Gregorios Daya Bhavan near Bangalore looks after children of AIDS patients. The palliative Care Centre attached to Daya Bhavan is working to give peace and hope to the dying aids patients.
                  </p>
                  <p>
                    &quot;Sneha Sandesam&quot; is a traveling Gospel project which works in Indian evangelization and for the spiritual development of the faithful. More than one thousand five hundred programme has been conducted across sixteen states of India. NARSOC is an associated organization which is formed to give assistance to those who are suffering from natural disasters. At the time of the earthquake of Gujarat and tsunami the organization took initiative in rehabilating hundreds of people. There are only a few among the various activities of the Mission Board.
                  </p>
                </div>

                <div className="mt-10 space-y-6">
                  <h3 className="font-heading font-semibold text-xl text-foreground border-b border-border pb-2">
                    President
                  </h3>
                  <p className="font-body text-muted-foreground">
                    H. G. Dr. Gabriel Mar Gregorios Metropolitan
                  </p>

                  <h3 className="font-heading font-semibold text-xl text-foreground border-b border-border pb-2 mt-8">
                    Co-Presidents
                  </h3>
                  <div className="font-body text-muted-foreground space-y-2">
                    <p>H.G. Dr. Yuhanon Mar Chrisostomos Metropolitan</p>
                    <p>H. G. Dr. Yuhanon Mar Thevodoros Metropolitan</p>
                    <p>H. G. Yakob Mar Elias Metropolitan</p>
                  </div>

                  <h3 className="font-heading font-semibold text-xl text-foreground border-b border-border pb-2 mt-8">
                    Secretary
                  </h3>
                  <p className="font-body text-muted-foreground">
                    Prof. K. C. Mani
                  </p>

                  <h3 className="font-heading font-semibold text-xl text-foreground border-b border-border pb-2 mt-8">
                    Office Secretary
                  </h3>
                  <p className="font-body text-muted-foreground">
                    Fr. Joseph Antony
                  </p>
                  <p className="font-body text-muted-foreground">
                    Ph: +91 9947399066
                  </p>

                  <h3 className="font-heading font-semibold text-xl text-foreground border-b border-border pb-2 mt-8">
                    Treasurer
                  </h3>
                  <p className="font-body text-muted-foreground">
                    Prof. Dr. Varughese Mathew
                  </p>

                  <h3 className="font-heading font-semibold text-xl text-foreground border-b border-border pb-2 mt-8">
                    Address
                  </h3>
                  <p className="font-body text-muted-foreground">
                    Secretary, Mission Board, St. Pauls Mission Centre,<br />
                    Mavelikara -3
                  </p>
                  <p className="font-body text-muted-foreground">
                    Ph: 0479 2302473
                  </p>
                </div>
              </div>
            </div>

            <SpiritualOrganizationsSidebar currentHref="/mosc-old/spiritual-organizations/mission-board" />
          </div>
        </div>
      </section>

      <QuickLinks />
    </div>
  );
};

export default MissionBoardPage;

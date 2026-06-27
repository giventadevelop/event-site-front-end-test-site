import React from 'react';
import QuickLinks from '@/components/holy-synod/QuickLinks';
import SpiritualOrganizationsSidebar from '../SpiritualOrganizationsSidebar';

export const metadata = {
  title: 'Akhila Malankara Balasamajam | MOSC',
  description: 'Akhila Malankara Balasamajam is the student portion of the Malankara Orthodox Syrian Church. President H.G.Dr. Joseph Mar Dionysius Metropolitan. Central office: St Thomas Aramana, Ranni.',
};

const AkhilaMalankaraBalaSamajamPage = () => {
  return (
    <div className="bg-background">
      <section className="py-16 bg-gradient-to-br from-background to-muted">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="w-20 h-20 bg-primary rounded-lg flex items-center justify-center mx-auto mb-6 sacred-shadow-lg">
              <span className="text-primary-foreground text-4xl font-bold" role="img" aria-label="Akhila Malankara Balasamajam">📚</span>
            </div>
            <h1 className="font-heading font-semibold text-4xl text-foreground mb-4">
              Akhila Malankara Balasamajam
            </h1>
            <p className="font-body text-lg text-muted-foreground max-w-3xl mx-auto leading-relaxed">
              AKHILA MALANKARA BALASAMAJAM is the student portion of the Malankara Orthodox Syrian Church. Balasamajam aims at the integrated personal development of the youth in the Church. The main objectives are worship, study and virtuous life among all the boys and girls inside the Church. The Balasamajam was organized on an all Malankara basis in 1982.
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
                    Through this programme, an all round development of personality of the children is accomplished as they are encouraged to study the Holy Bible, the tradition and history of the Church along with their academic studies. The life history of Saints of the church presented before them develops in them a spiritual and moral life aiming the service for the society. The Samajam through its activities encourages the children to participate regularly in the Sunday Schools and Church services. Every child between the age of 5 and 15 years are supposed to be its members.
                  </p>
                  <p>
                    <strong className="text-foreground">Central level:</strong> Balasamajam is led in the central level by a Metropolitan as its President and Priests as its Vice-president and General Secretary. Two joint secretaries are also there to support the general secretary (one male and one female). There is a treasurer also who is elected from the central committee. The central committee is constituted with the general secretary and joint secretary of each diocese.
                  </p>
                  <p>
                    <strong className="text-foreground">Diocese level:</strong> Every diocese contain the same pattern as President (the diocesan bishop) Vice president (priest who is selected by the bishop), general secretary and joint secretary. An executive committee is also there.
                  </p>
                  <p>
                    <strong className="text-foreground">Church level:</strong> Each parish has its own unit led by the Priest as the President. Vice president, General secretary and a joint secretary for leading the church programmes.
                  </p>
                  <p>
                    Programmes include annual meets, annual camps, Bible study classes, competitions, pilgrimages, tours, humanitarian services and educational counselling at Central, Diocesan and parish levels. Funds comprise financial contributions, grants and assistance from various parishes.
                  </p>
                </div>

                <div className="mt-10 space-y-6">
                  <h3 className="font-heading font-semibold text-xl text-foreground border-b border-border pb-2">
                    Present Office Bearers at Central Level
                  </h3>

                  <h4 className="font-heading font-semibold text-lg text-foreground mt-6">President</h4>
                  <p className="font-body text-muted-foreground">
                    H.G.Dr. Joseph Mar Dionysius Metropolitan
                  </p>

                  <h4 className="font-heading font-semibold text-lg text-foreground mt-6">Vice President</h4>
                  <p className="font-body text-muted-foreground">
                    Rev. Fr. Cherian Jacob
                  </p>
                  <p className="font-body text-muted-foreground">
                    Ph: 9446600912
                  </p>

                  <h4 className="font-heading font-semibold text-lg text-foreground mt-6">General Secretary</h4>
                  <p className="font-body text-muted-foreground">
                    Fr. jim M. George
                  </p>
                  <p className="font-body text-muted-foreground">
                    Ph: 9961595167
                  </p>

                  <h4 className="font-heading font-semibold text-lg text-foreground mt-6">Central Office</h4>
                  <p className="font-body text-muted-foreground">
                    St Thomas Aramana, Pazhavangadi, Ranni. 689673.
                  </p>
                  <p className="font-body text-muted-foreground">
                    Email:{' '}
                    <a href="mailto:orthodoxbalasamajam@gmail.com" className="text-primary hover:underline">
                      orthodoxbalasamajam@gmail.com
                    </a>
                  </p>
                </div>
              </div>
            </div>

            <SpiritualOrganizationsSidebar currentHref="/mosc-old/spiritual-organizations/akhila-malankara-bala-samajam" />
          </div>
        </div>
      </section>

      <QuickLinks />
    </div>
  );
};

export default AkhilaMalankaraBalaSamajamPage;

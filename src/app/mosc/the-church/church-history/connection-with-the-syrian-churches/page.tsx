import React from 'react';
import Image from 'next/image';
import QuickLinks from '../../../components/QuickLinks';
import SyroPageBanner from '../../../components/SyroPageBanner';
import TheChurchSidebar from '../../TheChurchSidebar';

export const metadata = {
  title: 'The Syrian Connections | History | The Church | MOSC',
  description:
    'West Syrianization from 1665, Patriarchal jurisdictional claims, Mar Gabriel and the final attempt to reinforce East Syrianism, and the end of the Indian church’s connection with the East Syrian church.',
};

export default async function ConnectionWithSyrianChurchesPage({
  searchParams,
}: {
  searchParams: Promise<{ from?: string }>;
}) {
  const params = await searchParams;
  const breadcrumbFrom = params.from === 'the-church' ? 'the-church' : 'home';

  return (
    <div className="bg-syro-bg-gray">
      <SyroPageBanner
        title="Connection with the Syrian Churches"
        breadcrumbFrom={breadcrumbFrom}
        breadcrumbParent={breadcrumbFrom === 'the-church' ? { label: 'History', href: '/mosc/the-church/church-history' } : undefined}
      />

      <section className="py-16 bg-syro-bg-gray">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
            <div className="lg:col-span-2">
              <div className="bg-white rounded-lg shadow-[rgba(50,50,93,0.25)_0px_6px_12px_-2px,rgba(0,0,0,0.3)_0px_3px_7px_-3px] p-8">
                <div className="mb-8 flex justify-center">
                  <Image
                      src="/images/logos/Current_Edits/MOSC-Logo-only.png"
                      alt="Connection with the Syrian Churches"
                      width={125} height={125}
                      className="rounded-lg w-full max-w-[125px] max-h-[125px] object-contain" priority
                    />
                </div>

                <div className="prose prose-lg max-w-none">
                  <h2 className="font-syro-display font-semibold text-2xl text-syro-blue mt-6 mb-4">
                    The Syrian Connections
                  </h2>

                  <h3 className="font-syro-display font-semibold text-xl text-syro-blue mt-8 mb-3">
                    West Syrianization
                  </h3>
                  <p className="font-syro-primary text-syro-dark-gray leading-relaxed mb-6">
                    The West Syrian bishops who had been present among the Orthodox Thomas Christians from 1665 gradually introduced their Church traditions among them. Exploiting the severe opposition mentality that prevailed within the Orthodox against the Roman Catholics the West Syrians tried to introduce doctrinal, liturgical and other Church disciplinary measures among them. This was not too difficult to achieve, though it needed time for people to accept the change. From the time of Mar Gregorios in 1665 he had obviously begun to work on it and those who came after him continued on what he had done. However it was from the middle of the 19th cent. that the West Syrianization process was speeded up in the Orthodox.
                  </p>
                  <p className="font-syro-primary text-syro-dark-gray leading-relaxed mb-6">
                    Substantial affinities prevalent in languages, traditions, disciplines—except in the case of subtle theological differences between the East Syrian and West Syrian traditions—were conducive to the introduction of West Syrian among the Orthodox of India. Moreover different situations prevalent from time to time also speeded up West Syrianization. But it should be observed another thing here. While accepting the services of Mar Gregorios the Orthodox of Malabar was not coming into the jurisdictional setup of the Antioch Syrian Church. In order to impart the services of Mar Gregorios to the Orthodox of India, with which the Patriarch of the West Syrian Church had no connection then, that Patriarch had to get one thing done at once. It was necessary that the Indian church formally accept that Patriarch as the Supreme head of the church. As the Portuguese had done in 1599 by extracting submission to Rome from the Indian church the West Syrian Patriarch from the beginning of the Indian Church&apos;s relationship with him desired similar submission of the Indian church to him. But to fulfill this intention it was not easy: Mar Gregorios does not seem to have taken any step to promote it. After his time those two West Syrian dignitaries who came in 1685 intended to achieve the Patriarchal destination. But unfortunately they achieved nothing, because of the death of one soon after their arrival. Mar Ivanios lived for about nine years and there were two opportunities before him to exercise the patriarchal demand because it was he who conferred Episcopal positions on Mar Thoma III and IV. Some historians suggest that he had made such demand but Mar Thomas abruptly rejected such claim. Hence till 1751 the patriarch sent no bishops to Mar Thomas in spite of repeated requests from them. Moreover the West Syrian delegation which came in 1751 had clear motivation to implement the intention of their patriarch with regard to the Indian church. When Mar Thoma V refused a rival metran was consecrated against him getting a group of supporters from the adherents of Mar Thoma V. In 1772 the appointment of the Thozhiyoor metran secretly by Gregorios was another attempt in the same direction. But Mar Thoma V and VI foiled all these attempts and the Patriarch&apos;s jurisdictional claim remains unrealized while all Mar Thoma metrans were serving their church. But a party within the followers of Mar Thomas, who were favourably disposed to the West Syrian bishops and to their patriarch&apos;s realization of jurisdictional claims over the Indian Church, had been formed during the middle of the 18th century. Mar Thomas V, VI and VII were seriously troubled by this party from time to time. This party was very active while the Indian Church was involved in collaboration with the Anglican mission between 1816 and 1836 and the major factor behind the collapse of that co-operation was again the activities of that party. This we shall analyse in the forthcoming section.
                  </p>

                  <h3 className="font-syro-display font-semibold text-xl text-syro-blue mt-8 mb-3">
                    The Final Attempt to Reinforce East Syrianism
                  </h3>
                  <p className="font-syro-primary text-syro-dark-gray leading-relaxed mb-6">
                    It should be also observed here before entering into other issues—the Thomas Christians who were under the Mar Thoma bishops and their East Syrian Church identity. Between 1709 and 1731 a bishop named Mar Gabriel from the East Syrian Patriarch had arrived in Kerala to reclaim his flocks with which from the time of 1599 that Patriarch had lost all relation. Seeing the changed political condition of South India this arrival of Mar Gabriel took place. At this arrival a number of churches and a considerable body of Thomas Christians, both from the non-Roman and Roman Thomas Christians, accepted him. He died at Kottayam and was buried at Cheriapally, which later on came under the Orthodox where his anniversary feast used to be celebrated every year till the end of the 19th cent. This goes to show that during the 18th and 19th centuries, till the Orthodox were fully identified with the West Syrian Church, they were also remaining identified ecclesiastically with the East Syrian Christianity. They were following the Eastern Syrian liturgical language and this practice was prevalent till Western Syriac was imposed upon them from 1876 after the Synod of Mulanthuruthy.
                  </p>
                  <p className="font-syro-primary text-syro-dark-gray leading-relaxed mb-6">
                    It is a fact that with the arrival of Mar Gabriel it was not possible to achieve full reintroduction and reinforcement of East Syrian Christianity among the Thomas Christians. Because the Thomas Christians were remaining in a divided state: one under the Roman Catholics and the other under the Mar Thoma bishops. Mar Thoma bishops IV and V were not ready to receive Mar Gabriel, but they clashed with him both theologically and administratively. As Mar Gabriel died without a successor his hopes upon the future of his church&apos;s continuation remained unrealized. Thus with this event the connection of the Indian church with the East Syrian church came to an end forever. Although the Indian Church continued basically in the East Syrian Church traditions along with the West Syrian ones which were newly introduced, the hold of the East Syrian ones gradually began to decline. There were two basic causes behind: The Portuguese all along had condemned the East Syrian Church as Nestorian—a dreadful heresy—and they had accomplished a substantial amount of spade work and the Malabar church had begun to assimilate this standpoint. The West Syrian contact with the Orthodox of India also opened an era of denouncing the East Syrian Christianity as heretical. In these situations gradually the Indian Orthodox had to quit their East Syrian identity; instead as substitute to it they were fixed to embrace West Syrian identity.
                  </p>
                </div>

                <div className="mt-10 hidden lg:block">
                  <QuickLinks />
                </div>
              </div>
            </div>

            <div className="space-y-6 lg:col-span-1">
              <TheChurchSidebar />
            </div>
          </div>
          <div className="mt-8 lg:hidden">
            <QuickLinks />
          </div>
        </div>
      </section>
    </div>
  );
}

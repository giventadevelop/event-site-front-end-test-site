import React from 'react';
import Image from 'next/image';
import QuickLinks from '../../../components/QuickLinks';
import SyroPageBanner from '../../../components/SyroPageBanner';
import TheChurchSidebar from '../../TheChurchSidebar';

export const metadata = {
  title: 'Fasting and Abstinence | Spirituality | MOSC',
  description:
    'Fasting in the Malankara Orthodox Syrian tradition. The Fast before Nativity, Ninevites, Great Fast, Apostles\' Fast, Migration of Virgin Mary, Wednesdays and Fridays, and other traditional fasts.',
};

export default async function FastingAndAbstinencePage({
  searchParams,
}: {
  searchParams: Promise<{ from?: string }>;
}) {
  const params = await searchParams;
  const breadcrumbFrom = params.from === 'the-church' ? 'the-church' : 'home';

  return (
    <div className="bg-syro-bg-gray">
      <SyroPageBanner
        title="Fasting and Abstinence"
        breadcrumbFrom={breadcrumbFrom}
        breadcrumbParent={breadcrumbFrom === 'the-church' ? { label: 'Spirituality', href: '/mosc/the-church/spirituality' } : undefined}
      />

      <section className="py-16 bg-syro-bg-gray">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
            <div className="lg:col-span-2">
              <div className="bg-white rounded-lg shadow-[rgba(50,50,93,0.25)_0px_6px_12px_-2px,rgba(0,0,0,0.3)_0px_3px_7px_-3px] p-8">
                <div className="mb-8 flex justify-center">
                  <Image
                      src="/images/church/spirituality.jpg"
                      alt="Fasting and Abstinence - Malankara Orthodox Church"
                      width={125} height={125}
                      className="rounded-lg w-full max-w-[125px] max-h-[125px] object-contain" priority
                    />
                </div>

                <div className="prose prose-lg max-w-none">
                  <h2 className="font-syro-display font-semibold text-2xl text-syro-blue mt-0 mb-4">
                    Fasting in the Malankara Orthodox Syrian tradition
                  </h2>

                  <p className="font-syro-primary text-syro-dark-gray leading-relaxed mb-4">
                    It is widely known that the Orthodox Churches give much importance to fasting, following the example of Jesus Christ and of the apostolic community. The noun fasting means non-eating and non-feeding. But every non-eater is by no means a faster and everyone who is an eater and restrains himself by an interior dedication from nourishment because of heavenly things is a faster.
                  </p>
                  <p className="font-syro-primary text-syro-dark-gray leading-relaxed mb-4">
                    In our materialistic society we learn to identify ourselves through self-indulgence and we tend to see the fasting only as a time of deprivation and penance. But this is not at all the view of the Orthodox Church on fasting and abstinence and it is clearly explained by the Fathers in their spiritual discourses. For them, fasting is the feast of the soul and good fasts are like medicine which cures our soul and mind, and, along with other virtuous works, it leads us to the eternal life. In our spiritual battle, fasting protects us from the evil one. It not only resists the attack but also trains our body and mind for the battle. According to Mar Aprem (4th Century Church Father) fasting is a great weapon against the evil one. Through fasting Christ defeated the Satan and has given us this weapon to overcome the evil. For Philixenus of Maboug (6th century Church Father), fasting and abstinence are the two virtuous weapons for cultivating the field of Christian life. &apos;Fasting must be undertaken voluntarily and it must be of divine dispensation&apos;. This is the primary teaching of our Church on Fasting. Fast is of free will and it is the voluntary fast which is accessible and permanent. Fasting becomes highly acceptable when it is joined with humility of hearts, charity towards all men and continuous prayers. The Lenten prayers and liturgy of our Church extols this kind of fasting by giving the Old Testament figures as good examples (Moses, Daniel, Elijah etc.). Fasting is the root by which all the fruits of sanctity are sustained and on this same root grows purity, delights virginity and rejoices patience. Fasting dispels immodesty, controls the lust and offers the body as a holy temple of God. Therefore, the Church exhorts the faithful to love and practice this highly acceptable form of Christian life so that it may lead them to the great eternal fast which is going to happen in the eternal bride chamber of life. Through it, the strength of the soul is confirmed, the riches of the body are increased and good aspirations aroused in the heart. The following are the main fasts mentioned by the Fathers of the Church according to the order in which they appear in the liturgical calendar.
                  </p>

                  <h3 className="font-syro-display font-semibold text-xl text-syro-blue mt-8 mb-3">
                    The Fast before the Nativity of our Lord
                  </h3>
                  <p className="font-syro-primary text-syro-dark-gray leading-relaxed mb-6">
                    This is a traditional fast observed in the Church with great enthusiasm. It seems that in the Syrian tradition this fast is of spontaneous origin and lasted forty days for to glorify and to give thanks to God the Father remembering his selfless love by giving His unique Son for the salvation of the world. The Church thinks it is right for every believer to fast this season, before the Nativity of Jesus Christ, that is designed for the Father for having given us His Son, for forty days. At present, however, in the Malankara Church, this fast lasts for 25 days, from the first of December till the Christmas day, and all the faithful are bound to observe it with great vigour.
                  </p>

                  <h3 className="font-syro-display font-semibold text-xl text-syro-blue mt-8 mb-3">
                    The Fast of Ninevites
                  </h3>
                  <p className="font-syro-primary text-syro-dark-gray leading-relaxed mb-6">
                    This is one of the most strictly observed fasts in the Syrian Church tradition. This fast lasts for three days beginning on the Monday, the third week before the beginning of the Great Lent. The origin of this fast was to commemorate a miraculous cessation of plague which broke out in the region of Beth-gammae. When struck with disaster, the faithful of the place gathered in the Church to pray and began to do great acts of penance and the plague ceased suddenly. To remember this great mercy of Lord, this fast came to be observed annually. Since it is observed for three days, it is commonly known as Moonnunoimbu (three days fast) in the Malankara Church. It is also known as the fast of Jonah since it commemorates the conversion of Nineveh through the preaching of prophet Jonah. It is time for the penitential practice for the whole Church and the Church does her penance and prayers like that of Jonah in the belly of the big fish and that of the Ninevites.
                  </p>

                  <h3 className="font-syro-display font-semibold text-xl text-syro-blue mt-8 mb-3">
                    The Great Fast
                  </h3>
                  <p className="font-syro-primary text-syro-dark-gray leading-relaxed mb-6">
                    The importance of this fast is much evident from the name itself. This is observed to actively participate in the Resurrection of Christ through a life of passion and suffering. The Church prescribes the forty days of fast in seven weeks which ends on Friday (Nalpatham Velly) before the passion week. But the fast gets completed only with the Easter and therefore it is also called fifty days Lent (Anpathu Noimbu). The Monday, the beginning of the Lent, there is a special service called the service of reconciliation (Subukono) and the purpose of which is that the faithful enter into the season of fast having reconciled with all. This means that the fast is holy and being holy it would become proper only if it is approached with preparation. The Church recommends the faithful to get content with one meal a day and avoid all delicious food.
                  </p>

                  <h3 className="font-syro-display font-semibold text-xl text-syro-blue mt-8 mb-3">
                    The Apostles&apos; Fast
                  </h3>
                  <p className="font-syro-primary text-syro-dark-gray leading-relaxed mb-6">
                    The Apostles, following the example of Jesus Christ, fasted twice forty days each, namely from the day of Pentecost and the days before the feast of Epiphany (Denha). But, as to how this fast originated in the Church is not exactly known. One could say that since Christ has said to the apostles that &apos;the sons of the bride chamber cannot fast as long as the bridegroom is with them, but days shall come when the bridegroom will be taken from them and then they shall fast&apos; (Lk 5:34-35). Thus, after the ascension of Jesus Christ and after the day of Pentecost, the apostles began to keep this fast and gradually it was adopted as a custom in the Church. At present, in the Malankara Church, this fast is reduced into 13 days corresponding to the number of 12 apostles and St. Paul (June 16-29). This fast is observed in order to become aware of the responsibility of the faithful in the Church and missionary activities.
                  </p>

                  <h3 className="font-syro-display font-semibold text-xl text-syro-blue mt-8 mb-3">
                    The Fast before the Migration of Virgin Mary the Mother of God
                  </h3>
                  <p className="font-syro-primary text-syro-dark-gray leading-relaxed mb-6">
                    This is one of the traditional fasts observed in all the Eastern Churches. A feast in commemoration of the Mother of God was celebrated in the East as early as fourth century. Later this was identified as the migration of the blessed Virgin and it came to be called the feast of Sunoyo (Migration) of the Mother of God. This fast starts from the first day of August and ends with the Sunoyo feast on the fifteenth day. This is the time for the faithful to prepare themselves for their death because the death of the Mother of God is a desirable and exemplary death for all.
                  </p>

                  <h3 className="font-syro-display font-semibold text-xl text-syro-blue mt-8 mb-3">
                    The fast of Wednesdays and Fridays
                  </h3>
                  <p className="font-syro-primary text-syro-dark-gray leading-relaxed mb-6">
                    Besides the aforesaid fasts, the Church fasts on Wednesdays and Fridays throughout the year except any solemn feast falling on these days and the fifty days after the Easter. The Significance of Wednesday is that it was on this day that the Jews made plot to crucify Jesus Christ and Friday to commemorate His passion, crucifixion and death for the whole world.
                  </p>

                  <h3 className="font-syro-display font-semibold text-xl text-syro-blue mt-8 mb-3">
                    The Fast before the Nativity of St. Mary
                  </h3>
                  <p className="font-syro-primary text-syro-dark-gray leading-relaxed mb-6">
                    This is an eight days fast observed only by the Syrian Christians in India, which begins from the first day of September (Ettu Noimbu). It seems that this fast originated in connection with the Islamic invasion and the subsequent fall of Kodungallur, the Christian centre. The Christians vowed to observe a fast so that God might protect their women from the hands of invaders. During this season, women used to remain in the church in prayer and meditation till the afternoon. But it is not considered as an obligatory fast and hence it is not in the canonical list of the Church.
                  </p>

                  <h3 className="font-syro-display font-semibold text-xl text-syro-blue mt-8 mb-3">
                    Fast before the Feast of Pentecost
                  </h3>
                  <p className="font-syro-primary text-syro-dark-gray leading-relaxed mb-6">
                    This fast is observed only in the Malankara Church. It begins from the day of Ascension and ends with the feast of Pentecost. The Church thinks it as a preparatory time of the faithful for the empowering of the Holy Spirit on the day of Pentecost.
                  </p>

                  <h3 className="font-syro-display font-semibold text-xl text-syro-blue mt-8 mb-3">
                    Some Special Notes
                  </h3>
                  <p className="font-syro-primary text-syro-dark-gray leading-relaxed mb-6">
                    Saturdays and Sundays are the days of the Lord and of joy and therefore it is prohibited to fast on these days (with the exception of Holy Saturday) except for the motive of fasting before the reception of Holy Qurbana. The believers who prepare themselves to receive the sacraments must observe the fasting as per the recommendation of the Church. Holy Qurbana is not conducted on fast days (especially the Great Fast and the Nineveh Fast) except on Saturday, Sundays, mid-day lent, fortieth Friday of the Great Lent and on the feast day of Annunciation. Celebration of marriage is prohibited and that of baptism is permitted in the case of extreme necessity. The feasts of martyrs, saints and departed are celebrated only on Sundays and Saturdays. The married people are asked to refrain from using their conjugal rights during the fasting season.
                  </p>

                  <div className="bg-syro-red/5 rounded-lg p-6 mt-8 border border-syro-table-border">
                    <p className="font-syro-primary text-syro-dark-gray leading-relaxed text-center font-semibold">
                      Malankara Orthodox Syrian Church
                    </p>
                  </div>
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

import React from 'react';
import Image from 'next/image';
import QuickLinks from '../../../components/QuickLinks';
import SyroPageBanner from '../../../components/SyroPageBanner';
import TheChurchSidebar from '../../TheChurchSidebar';

export const metadata = {
  title: '19th Century | History | The Church | MOSC',
  description:
    '19th-century history: British in Kerala, founding of the Seminary, CMS mission of help, origins of the Jacobites and Mar Thoma Church, Synod of Mulanthuruthy, and the metropolitans of the Orthodox.',
};

export default async function Orthodox19thCenturyPage({
  searchParams,
}: {
  searchParams: Promise<{ from?: string }>;
}) {
  const params = await searchParams;
  const breadcrumbFrom = params.from === 'the-church' ? 'the-church' : 'home';

  return (
    <div className="bg-syro-bg-gray">
      <SyroPageBanner
        title="19th Century"
        breadcrumbFrom={breadcrumbFrom}
        breadcrumbParent={breadcrumbFrom === 'the-church' ? { label: 'History', href: '/mosc-redesign/the-church/church-history' } : undefined}
      />

      <section className="py-16 bg-syro-bg-gray">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
            <div className="lg:col-span-2">
              <div className="bg-white rounded-lg shadow-[rgba(50,50,93,0.25)_0px_6px_12px_-2px,rgba(0,0,0,0.3)_0px_3px_7px_-3px] p-8">
                <div className="mb-8 flex justify-center">
                  <Image
                      src="/images/logos/Current_Edits/MOSC-Logo-only.png"
                      alt="Church History – 19th Century"
                      width={125} height={125}
                      className="rounded-lg w-full max-w-[125px] max-h-[125px] object-contain" priority
                    />
                </div>

                <div className="prose prose-lg max-w-none">
                  <h2 className="font-syro-display font-semibold text-2xl text-syro-blue mt-6 mb-4">
                    Background
                  </h2>
                  <p className="font-syro-primary text-syro-dark-gray leading-relaxed mb-6">
                    By the dawn of the 19th century the British had established themselves in India and Kerala had come under their sway. Residents Col. Colin Macaulay and Col. John Munro,
                    Anglican Christians of evangelical persuasion, befriended both Roman and
                    Orthodox communities and departed from the Portuguese and Dutch policy of
                    oppressing or ignoring the Orthodox. A Trust Fund was instituted with the East
                    India Company to yield 8% annual interest. Munro (succeeded 1810) desired cooperation with the Anglican Church and helped in various ways: (1) founding the seminary at Kottayam—now the Orthodox Theological Seminary, centre of the Orthodox clergy&apos;s training; (2) implementing a plan of collaboration with the Church Missionary Society (CMS). The Seminary was founded in 1815 but passed through long periods of strain and inactivity in the 19th and 20th centuries. The programme of missionary co-operation led to unfortunate divisions; the after-effects plagued the Orthodox. Munro also helped found the Seminary and promoted a “Mission of Help” by the Church
                    Missionary Society (CMS) in collaboration with the Orthodox Church.
                  </p>

                  <h3 className="font-syro-display font-semibold text-xl text-syro-blue mt-8 mb-3">
                    The Founding of Seminary
                  </h3>
                  <p className="font-syro-primary text-syro-dark-gray leading-relaxed mb-6">
                    The Orthodox Church had no educational institution of its own for the training of candidates to priesthood. To remedy this in 1813 Pulikottil Joseph Ramban, a senior priest from Kunnamkulam, took the initiative and the Seminary was started in 1815. Col. Munro encouraged the Ramban and secured from Rani Lakshmibai of Travancore 16 acres tax-free land, Rs 20000/-, timber and other grants. Munro was both resident and chief minister; he also enabled the Ramban to draw the interest on the Trust Fund deposit. By 1815 the Seminary began functioning. The recipient of the interest had to be the Metropolitan; the only bishop who could consecrate Joseph Ramban was the Syrian metropolitan of Thozhiyur. At the resident&apos;s request he agreed. Joseph Ramban was appointed bishop as Mar Dionysius II in 1816; royal proclamations from Travancore and Cochin confirmed the appointment. A party headed by Konattu Malpan at the seminary questioned the validity of Dionysius&apos; Episcopal status from Thozhiyoor. The royal proclamations silenced them for a time but they waited to revolt. While this internal dispute prevailed, the CMS mission of help started in the Church and at the Seminary.
                  </p>

                  <h3 className="font-syro-display font-semibold text-xl text-syro-blue mt-8 mb-3">
                    The CMS Mission of Help
                  </h3>
                  <p className="font-syro-primary text-syro-dark-gray leading-relaxed mb-6">
                    As part of his programme of assistance Col. Munro requested the CMS to send a &quot;Mission of Help to the Indian Orthodox&quot;. Between 1816 and 1818 four missionaries arrived in Travancore. In 1806 under Col. Macaulay, Claudius Buchanan and Richard Hall Kerr had visited the Orthodox and metropolitan Dionysius I; they discussed collaboration with the Anglican Church. The metropolitan favoured the idea but insisted that collaboration must not tamper with the faith or priestly succession. The missionaries were well received. They taught at the Seminary, translated the Bible into Malayalam, and established schools. A section in the Church, however, appealed to the West Syrian Patriarch
                    to send a bishop and take control. Patriarch sent Mar Athanasius (1825); the
                    resident refused to accept him as bishop instead of the Indian bishops and
                    asked him to leave. The pro-patriarchal party blamed the missionaries for their
                    failure. When Bishop Daniel Wilson of Calcutta proposed a six-point programme in
                    1835, the Church at Mavelikara (January 1836) rejected it, declaring: “We are
                    Jacobite Syrians subject to the patriarch of Antioch… We cannot permit the
                    same.” Thus ended the CMS collaboration after twenty years. The missionaries
                    claimed most assets; a reform movement within the Church led to divisions and
                    eventually to the Mar Thoma Church and the Jacobite Syrian Church.
                  </p>

                  <h3 className="font-syro-display font-semibold text-xl text-syro-blue mt-8 mb-3">
                    The Origins of the Jacobites and the Mar Thoma Churches
                  </h3>
                  <p className="font-syro-primary text-syro-dark-gray leading-relaxed mb-6">
                    Dionysius IV banned the reform leaders. They sent deacon Mathews of Maramon (nephew of Abraham Malpan) to the Patriarch; Patriarch Elias II consecrated him as Malankara metropolitan in 1841—the first Indian ordained by a West Syrian Patriarch. He returned in 1843 as Mar Athanasius. At Kallungathara he produced a declaration and made three claims to the authorities: the Patriarch was Head of the Orthodox church of India; Dionysius IV had no right to hold office; Dionysius IV should be expelled in favour of Athanasius. He made not less than 9 representations with no success. Dionysius realized he must win the Patriarch over. He wrote to the Patriarch acknowledging the Patriarch as head; the Patriarch sent Yuyakim Coorilos with blank letters in 1846. Dionysius abandoned his office and surrendered the royal proclamation to Coorilose. Coorilose proclaimed himself Metropolitan. A committee at Quilon in March 1848 proclaimed Athanasius metropolitan and rejected Coorilose. Royal proclamation for Athanasius followed in 1852. Coorilose was banished to British Malabar. Athanasius was strengthened. Dionysius died Oct 1855. Koorilose organized a party against Athanasius; Pulikottil Joseph (Joseph Kathanar) was consecrated by the Patriarch as Dionysius V in 1865. The church was clearly divided between Dionysius V and Athanasius till 1889 and further.
                  </p>

                  <h3 className="font-syro-display font-semibold text-xl text-syro-blue mt-8 mb-3">
                    Final Defeat of the Reform Party in 1889
                  </h3>
                  <p className="font-syro-primary text-syro-dark-gray leading-relaxed mb-6">
                    Dionysius V requested the Patriarch to come to Kerala to dethrone Athanasius. The Patriarch obliged; Athanasius was dethroned and the section with Dionysius V declared themselves under the Patriarch. The dethroned formed the Mar Thoma Syrian Christians after a 10-year litigious course in 1889. Patriarch Peter IV reached Kerala in 1875; he obtained a state ruling cancelling the royal proclamation for the Malankara Metropolitan. He convened a synod at Mulanthuruthy in June 1876 and obtained from the followers of Dionysius V an official acknowledgement of his supremacy.
                  </p>

                  <h3 className="font-syro-display font-semibold text-xl text-syro-blue mt-8 mb-3">
                    The Synod of Mulanthuruthy
                  </h3>
                  <p className="font-syro-primary text-syro-dark-gray leading-relaxed mb-6">
                    The Synod of Mulanthuruthy was an important milestone, called and presided over by Patriarch Peter IV. 103 churches of the Orthodox were present; the churches that followed Athanasius did not participate. Patriarch Peter IV came to Kerala in 1875, dethroned Mar Athanasius (the reform party leader), and convened a synod at Mulanthuruthy in June 1876. The Synod
                    decided to adhere closely to West Syrian doctrinal, liturgical and disciplinary
                    norms and to accept the Patriarch’s jurisdictional claims. The Patriarch then
                    consecrated six bishops on his own authority. The outcomes were momentous: the
                    faith, liturgy, episcopacy and administration of the Orthodox in India were
                    aligned with the West Syrian Church. Litigation between the party under
                    Dionysius V and the reform party (Mar Athanasius / Thomas Athanasius) continued
                    till 1889, when the reform party yielded and formed themselves as the Mar Thoma
                    Syrian Church. The section under Dionysius V came to be called the Jacobite
                    Church in India under the West Syrian Patriarch.
                  </p>

                  <h3 className="font-syro-display font-semibold text-xl text-syro-blue mt-8 mb-3">
                    The Impact of the Synod of Mulanthuruthy and the Royal Court Judgement
                  </h3>
                  <p className="font-syro-primary text-syro-dark-gray leading-relaxed mb-6">
                    The faith, liturgy, episcopacy, church polity and disciplines of the Orthodox of India were carried to that of the West Syrian Church. Church administration became like that of the West Syrian Church. Patriarchal supremacy was enforced upon the Orthodox of India. The Patriarch did not desire to strengthen Dionysius V but tried to weaken him and degrade his status as Malankara Metropolitan. By rescinding the royal proclamation, by calling the Synod and consecrating bishops, the Patriarch made clear that he was the head of the Orthodox in India; Dionysius was placed in a dilapidated and voiceless state. Nothing was done to heal the divisions; the Patriarch exploited the situation and stabilized his power. The impact on the sense of history of the St. Thomas Christians was highly disastrous: they were held to have been under the West Syrian Patriarch from ancient times; the Orthodox had to remain in darkness about the facts of their own ancient church. The patriarchal jurisdictional claim became an issue of further dispute all through the next century.
                  </p>

                  <h3 className="font-syro-display font-semibold text-xl text-syro-blue mt-8 mb-3">
                    The Metropolitans of the Orthodox in the 19th Century
                  </h3>
                  <p className="font-syro-primary text-syro-dark-gray leading-relaxed mb-6">
                    The Church was led by metropolitans whose common insignia was Dionysius. Dionysius II, III, IV and V were the leaders in the 19th century. Apart from these, Mathews Mar Athanasius enforced his rule between 1852 and 1877. Only Dionysius III had a peaceful period; the rest were in troubled condition. The headquarters was usually Kottayam at the Old Seminary. The metropolitans from Dionysius II possessed royal proclamations; when Athanasius came to power this became extremely troublesome. Patriarch Peter IV forced the Travancore State to stop the practice. The Patriarch consecrated six bishops on his own accord in 1876 and 1877: (1) Gheevarghese Juliose Konattu (1876–84), (2) Paulose Athanasius Kadavil (1876–1907), (3) Gheevarghese Coorilose Ambattu (1876–91), (4) Gheevarghese Gregorios Chathurithil (1876–1902), (5) Simon Dionysius Karavattu (1877–86), (6) Paulose Ivanios Murimattathu (1877–1913). They were suffragans under Dionysius V. Dionysius V did least care to revive these bishoprics; the first batch slowly died out except Paulose Ivanios who became the first Catholicos when the Catholicate was instituted in 1912 by Dionysius VI. In 1888 a group of Konkani Roman Catholic Christians joined under Fr. Alvares of South Canara; with the Patriarch&apos;s permission he was consecrated bishop as Alvares Julius at the Old Seminary in 1889. Renevilathy Thimothios was also consecrated in 1892. The Orthodox Church of India had to face the after consequences of these developments in the course of the 20th century.
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

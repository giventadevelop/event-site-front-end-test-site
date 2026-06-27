import React from 'react';
import Image from 'next/image';
import QuickLinks from '../../../components/QuickLinks';
import SyroPageBanner from '../../../components/SyroPageBanner';
import TheChurchSidebar from '../../TheChurchSidebar';

export const metadata = {
  title: '20th Century | History | The Church | MOSC',
  description:
    '20th-century history of the Malankara Church: Synod of Mulanthuruthy, Royal Court 1889, Dionysius VI, establishment of the Catholicate in 1912, Catholicoses, and relations with the Patriarchate.',
};

export default async function TwentiethCenturyPage({
  searchParams,
}: {
  searchParams: Promise<{ from?: string }>;
}) {
  const params = await searchParams;
  const breadcrumbFrom = params.from === 'the-church' ? 'the-church' : 'home';

  return (
    <div className="bg-syro-bg-gray">
      <SyroPageBanner
        title="20th Century"
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
                      alt="Church History – 20th Century"
                      width={125} height={125}
                      className="rounded-lg w-full max-w-[125px] max-h-[125px] object-contain" priority
                    />
                </div>

                <div className="prose prose-lg max-w-none">
                  <h2 className="font-syro-display font-semibold text-2xl text-syro-blue mt-6 mb-4">
                    Introduction
                  </h2>
                  <p className="font-syro-primary text-syro-dark-gray leading-relaxed mb-6">
                    Following the Synod of Mulanthuruthy, the Royal Court Judgement of 1889 caused the Orthodox to be in a divided condition. Those who stood for reform formed themselves as the Mar Thoma Syrian Church independent of the West Syrian Patriarch, while those who opposed them, very closely adhering to that Patriarch and his church traditions, formed themselves as the Jacobite (Orthodox) Syrian Church under the Patriarch.
                  </p>
                  <p className="font-syro-primary text-syro-dark-gray leading-relaxed mb-6">
                    Though the Synod of Mulanthuruthy had concluded somehow satisfactorily, yet with regard to the nature of the exercise of the Patriarchal authority over this Jacobite Indian Church, there remained substantial differences of opinions and ambiguities. A few aspects of it had unveiled while Dionysius V was alive. But it was after his death, during the period of his successor Dionysius VI, that the issue became an even worse subject of dispute and complicated, and caused divisions in that church. As the result the Jacobite Syrians were divided into two as the Orthodox and Jacobites in the 20th century. The Orthodox section established, to preserve and safeguard their claims of internal jurisdictional autonomy, the office of the Catholicos, declaring that their Patriarch possesses over them only spiritual authority but in other temporal matters related to their church they are free in which the Patriarch has no business. While a division of the Church stood with the Patriarch. They opposed the move of the other section all along. In 1934 the Orthodox section framed and introduced a constitution of their church explicitly explaining the nature of it and its relation with the Patriarch. It also united the office of the Malankara Metropolitan with the office of the Catholicos in one dignitary so that it might thereafter become stronger in the service of the Church. Now hereafter with regards to many matters such as the possessions of the Church properties, main church offices, and bearers and the validity of the Catholicosate, litigations began and were carried on all through from 1913 to 1958, in which the final victory was won by the Orthodox. As the result the Jacobites and their Patriarch got bewildered fearing that would cause the payment of enormous sum of money to the court expenses of the Orthodox if they decide to move on that direction. So the bishops of the patriarchal side advised the Patriarch for a truce with the Orthodox and the Orthodox, fed up with the long and tiresome litigations, finally yielded for a peace in 1958. As long as the res judicata of the court prevailed there was moderate peace and harmony among them. But from 1972 the patriarchal side again resumed their clashing mentality on the question of the patriarchal authority, for which the Supreme Court of India had given after a prolonged period of actions, from 1995 onwards, verdicts, yet no amicable solution has been reached so far, and each division of the Church claiming themselves as separate continues—one under the authority of the Patriarch and the other under the leadership of the Catholicos.
                  </p>
                  <p className="font-syro-primary text-syro-dark-gray leading-relaxed mb-6">
                    Thus, how the issue of the West Syrian patriarchal claims of jurisdiction over the Indian church had caused endless problems and divisions in the 20th century. Some details of it are given hereafter.
                  </p>

                  <h3 className="font-syro-display font-semibold text-xl text-syro-blue mt-8 mb-3">
                    Dionysius VI or the Great and His Great Endeavours for the Freedom of the Church
                  </h3>
                  <p className="font-syro-primary text-syro-dark-gray leading-relaxed mb-6">
                    After the death of Dionysius V his successor Dionysius VI—the so-called Vattasseril Dionysius the Great and Holy—took charge as the Malankara Metropolitan in accordance with the wills and the best wishes of the Malankara Christian Association and Dionysius V. His Episcopal consecration and appointment as Malankara Metropolitan were done by Patriarch Abdulla II. This Patriarch soon after those things visited Kerala church and desired to stabilize again the patriarchal jurisdiction claims over the Indian Church. Although Patriarch Peter IV all through his rest of life after the Synod of Mulanthuruthy had tried in vain to establish it, this Patriarch dreamed the new situation is quite favourable to him to realize it.
                  </p>
                  <p className="font-syro-primary text-syro-dark-gray leading-relaxed mb-6">
                    One, Dionysius VI was consecrated and appointed by him. So the Patriarch has right to ask him to do whatever he deems necessary towards the stabilization of his claims. Two, this Patriarch had a first hand knowledge of the Kerala people while he had been there along with Patriarch Peter IV, that they were well-disposed to the patriarchal causes. He also had friends there and could count on a party in the church under the leadership of none other than the Co-trustees and Metropolitan Paulose Koorilose. The latter had received consecration with Dionysius VI himself. In such a background he could ask the members of the Malankara Syrian Christian Association to do whatever was required for the advancement of his claims.
                  </p>
                  <p className="font-syro-primary text-syro-dark-gray leading-relaxed mb-6">
                    Three, if all the former two rejected his claims he knew how to deal further. Because almost all of the offices of bishops were remaining vacant except one. He could readily fill them in with his own aspirants by executing his plans against which no one in the Church, he was sure, was dare enough to protest. By such all means he could realize his plans with regard to the Indian Church.
                  </p>
                  <p className="font-syro-primary text-syro-dark-gray leading-relaxed mb-6">
                    Soon after his coming to Kerala he called a meeting of the Association at Kottayam in Nov 1909 and asked them to submit a registered deed accepting his authority over everything in the church but the meeting outright rejected it.
                  </p>
                  <p className="font-syro-primary text-syro-dark-gray leading-relaxed mb-6">
                    His proposal to consecrate and appoint bishops was also rejected by this assembly. The Patriarch could however count on a party in the church under the leadership of the two Co-trustees—Konat Mathews Malpan and C.J. Kurian. They finally decided to move on contrary to the resolutions of the Nov 1909 assembly in favour of the Patriarch. It is held they had personal revenge against Dionysius VI, so siding with the Patriarch they avenged the bishop, and put the church in a state of oblivion then onwards. Instead of moving united against such perils and persuading the Patriarch to do whatever that are deemed favourable to the well being of the Indian Church and to its affectionate relationship with the Patriarchate, what such kind of people in the church did on the occasion could not be in no way legitimized.
                  </p>
                  <p className="font-syro-primary text-syro-dark-gray leading-relaxed mb-6">
                    Now Abdulla II proceeded as he liked. As he came to know that people who came for the Kottayam Association of 1909 were unwilling to make a statement acknowledging his authority beyond what has been established in the Royal Court Judgement of 1889 or to agree to his consecrating a large number of bishops, he adopted other tactics to gain his end. He denied that he ever asked for any authority, as all authority had been given to him by God himself and Apostle Peter. In other words Abdulla asserted that he had the authority whether the Indian Church admitted it or not, transcending the Royal Court.
                  </p>
                  <p className="font-syro-primary text-syro-dark-gray leading-relaxed mb-6">
                    Because the Royal Court in its decision had declared that the nature of the Patriarchal authority extended over the Indian was purely spiritual and never on its temporalities. In the latter the Indian metropolitan was entitled to enjoy the authority. Now Abdulla with the support of co-trustees found it easy to persuade the wealth-minded Paulose Koorilose, who intended to be jealous of his Episcopal colleague in his rise, to submit to the Patriarch the registered deed as required by him. However, in order to make things easy for Koorilose, Abdulla saw to it that the two other newly consecrated bishops Paulose Athanasius and Geevarghese Severios presented to him the required documents before he did it.
                  </p>
                  <p className="font-syro-primary text-syro-dark-gray leading-relaxed mb-6">
                    The party that took side of Abdulla submitted to him the names of two candidates for elevation to the Episcopal rank. The Patriarch asked them to present to him the registered deed and they obeyed. Following them Paulose Koorilose also did. By arranging the programme in such a way he now asked Dionysius VI too to submit a registered deed. But the metropolitan declined.
                  </p>
                  <p className="font-syro-primary text-syro-dark-gray leading-relaxed mb-6">
                    The Community was now split into two. Abdulla had on his side two co-trustees, three Indian Bishops and the Syrian bishops including Sleeba Osthathios. Dionysius had with him two bishops Ivanios Murimattam and Julius Alvares, and a large body of the community&apos;s elite. The old seminary, where Dionysius stayed, turned out to be the battle ground. To capture it and throw out the metropolitan were the first attempts. When that failed the Patriarch, advised by his supporters, proceeded to strike the decisive blow by serving excommunication letters to Dionysius VI which he did on 8th June 1911. In net result the letter was rejected by the followers of Dionysius and it was not given a reading in a large number of churches including the Old Seminary.
                  </p>
                  <p className="font-syro-primary text-syro-dark-gray leading-relaxed mb-6">
                    Following this the metropolitan called an Association on 7 Sept. 1911 at Kottayam which was attended by a large body of representatives and resolved to stand by the metropolitan against the action of the Patriarch. It also resolved to remove Mathan Malpan and C.J. Kurian from trusteeship and substitutes were appointed.
                  </p>
                  <p className="font-syro-primary text-syro-dark-gray leading-relaxed mb-6">
                    Patriarch Abdulla held a meeting of his partisans at Alwaye and made Paulose Koorilose the Association President and not the Malankara Metropolitan and resolved to fight against Dionysius. Thus he returned dividing the Indian Church.
                  </p>
                  <p className="font-syro-primary text-syro-dark-gray leading-relaxed mb-6">
                    Now Dionysius and his adherents decided to strike back so that for ever the Antiochene suzerainty would be ended. The establishment of the Catholicate in Sept. 1912 was the response to it. Through Dionysius VI&apos;s effort it was established to defend and safeguard the independence of the Indian Church. Taking advantage of the divisive situation prevalent in the West Syrian Patriarchate of the time Dionysius and party invited Abdul Messiah, the predecessor of Abdulla II. Abdul Messiah had been not functioning at the time due to the withdrawal of his recognition by the Turkish Govt. and due to the vested interest and plot of Abdulla II. However, he had not been degraded from his patriarchal status. Accepting invitation from Dionysius he arrived in Kerala to establish the Catholicate which he did in Sept 1912 and thereby the division of the church declared their freedom. But to realize this fact and to get legitimacy the next 46 years had to be fought in various courts by Dionysius and his successors. Now we look into the Catholicate and its initial struggle in protecting the freedom of the church.
                  </p>

                  <h3 className="font-syro-display font-semibold text-xl text-syro-blue mt-8 mb-3">
                    The Establishment of the Catholicate in 1912
                  </h3>
                  <p className="font-syro-primary text-syro-dark-gray leading-relaxed mb-6">
                    An event of remarkable dimension in the history of the Orthodox church of India in the 20th century was this. But the church as a whole could have established it provided there had been such an atmosphere, but unfortunately that had not been there. And that was the most defective side of the Malankara church and not of this very institution. A group within that Indian church siding unqualifiedly with the Patriarch and his ambitions which were not justifiable by any means, tried all their best to undermine the institution. That was the history of the church all through the 20th century and even in the present century. As a result the Patriarch after Abdulla II, siding with a party, used them to fight against this free movement of the other faction of the church which was under Dionysius and followers. In legal battles, though this patriarchal party failed disastrously in 1958 and then again from 1995 onwards they are stubborn in their stand and still continuing to trouble with division. However, the Orthodox division of the church as independent of Antioch is developing day by day as an autonomous church under the name of Malankara Orthodox Church of India.
                  </p>
                  <p className="font-syro-primary text-syro-dark-gray leading-relaxed mb-6">
                    Indeed within it through the initiative and indomitable persistent efforts of its dear independence lover metropolitan—Vattasseril Dionysius the Great—the Catholicate was established in 1912. Till 1934 the metropolitan ably and committedly guided it, built it against all contrary threats and diabolic forces within and without. He installed 3 Catholicoses and framed a constitution for his church and made a vain visit to the Patriarchate to find out some solution to the division in the church. But the last one was of no advantage.
                  </p>
                  <p className="font-syro-primary text-syro-dark-gray leading-relaxed mb-6">
                    The office of the Catholicos was originally a patriarchal office which independently originated and strengthened within Syrian Christianity in the Persian Empire with which the Indian church of St. Thomas had historic relation till 16th century. This office of the church supreme continues even now in the East Syrian church and other churches. In 1912 in a particular context, it was established in the Indian church that too within the division of the Jacobite church in India under Dionysius to defend its national autonomy and jurisdictional freedom from the West Syrian Patriarch. It is to be noted that during the time of the introduction of this office the Indian Jacobites were not followers of the East Syrian church but the West Syrian church. In the West Syrian tradition there had been no such office other than Patriarchate. But from the 7th century in the north-west of the Persian Empire there among the West Syrian church followers there had an office of the archbishop under the suzerainty of the West Syrian Patriarchate who was known as the Maphrian. This was not the office of the Catholicate as it was in the East Syrian church of the Persian Empire.
                  </p>
                  <p className="font-syro-primary text-syro-dark-gray leading-relaxed mb-6">
                    From the time of the introduction of the office of Catholicate within the section of the church under Dionysius in Kerala it had to face a lot of oddity with regard to its history, and other ecclesiastical characteristics. During the introduction of this office in India its introducers might not have been well aware of those things. They thought that the offices of the Maphrian and Catholicos were the same. Hence the introduction of it was viewed as the revival of the Catholicate from then onwards and to such a view, in fact, there are no sufficient basis in church annals. So what was introduced out of the efforts of Dionysius VI and Abdul Messiah in the Orthodox church of India was in fact the office of the Maphrian which originally had been a subordinate office under the West Syrian Patriarch.
                  </p>
                  <p className="font-syro-primary text-syro-dark-gray leading-relaxed mb-6">
                    Anyhow in the course of time the office of the Catholicos introduced among the division of the church in India developed and strengthened to a position that was equal to the Patriarchate and it now represents the supreme church head of the Indian Orthodox Church, who is independent in his church administration like all other church heads around the world. This is neither under the West Syrian Patriarch juridically or spiritually nor an institution to be established and developed by the sole will of that Patriarch. It is the self-declared church supreme of the Orthodox church of India. Thus the office of the Catholicos which was introduced and developed as such now is a peculiar institution suited to the needs of the Indian Orthodox church.
                  </p>

                  <h3 className="font-syro-display font-semibold text-xl text-syro-blue mt-8 mb-3">
                    The Catholicoses
                  </h3>
                  <p className="font-syro-primary text-syro-dark-gray leading-relaxed mb-6">
                    The first Catholicos of this church was Moran Mar Baselius Paulose I (1912–14). The next Catholicoses were Baselios Geevarghese I (1925–28) and Baselios Geevarghese II (1929–64). The latter served and guided the church for 35 years, perhaps the longest single tenure in the history of this church. Since the times of the second Catholicos the Catholicoses of this church except one were elevated to their office by the synod of the Indian Orthodox bishops and not by anyone from outside or the Patriarch of Antioch. This shows the autocephalous and autonomous status of this Indian church to select and declare it.
                  </p>
                  <p className="font-syro-primary text-syro-dark-gray leading-relaxed mb-6">
                    The reign of the third Catholicos Geevarghese II marks an important chapter in the chequered history of this Indian church. During his time the Orthodox introduced a church constitution, won final victory in legal battle against the patriarchal faction in the Supreme Court of India in 1958, and following this a reconciliation took place etc. In his later years he became a well-known figure on the Indian scene. Moreover he enabled his church to associate with the World Council of Churches from its very start in all its functions. He sent representatives to Amsterdam (1948), Evanston (1954) and New Delhi (1961). This Catholicos personally with other delegates of his church attended the Edinburgh Faith and Order World Conference in 1937. Mar Theophilos, Mar Gregorios, Fr. K.C. Joseph, Miss Sarah Chacko, Fr. V.C. Samuel etc. from his church were deputed to service in various functions of the WCC from time to time.
                  </p>
                  <p className="font-syro-primary text-syro-dark-gray leading-relaxed mb-6">
                    During his time the headquarters of the Orthodox supreme, the Catholicos, was shifted to another quarters within Kottayam called Devalokam from the Old Seminary.
                  </p>
                  <p className="font-syro-primary text-syro-dark-gray leading-relaxed mb-6">
                    In the field of education too outstanding developments were achieved. A college of higher education at Pathanamthitta was established. Multifaceted as such he did remarkable service to his church. He had the rare opportunity of becoming Catholicos, the only one in that respect so far, of the united Indian Orthodox church. He raised 12 bishops and about a thousand clergy and deacons. He passed away after a distinguished career on January 3, 1964. However, another remarkable event during his tenure was the defection of Geevarghese Ivanios to Roman Catholicism. He was an eminent bishop of the church who toiled a lot for the establishment and development of the Catholicate with Dionysius VI, standing beside him as his right hand. He was consecrated as the bishop of Bethany on 1st May 1925 by Catholicos Geevarghese I and raised as metropolitan on 13th January 1929 by Catholicos Geevarghese II. He had probably reason of his own to feel unhappy in the Orthodox Church. It is held that he had desired to become Catholicos but unfortunately he was not selected. As the result, dissatisfied, in 1930 he joined with Rome to become the founder of the Syro-Antiochene rite in the Roman Catholic Church of India. When he went he also took with him another bishop and a large number of people from the Orthodox.
                  </p>
                  <p className="font-syro-primary text-syro-dark-gray leading-relaxed mb-6">
                    Catholicos Geevarghese II was succeeded by Catholicos Augen I (1964–75). He was a great Malayalam and Syriac scholar. Raised to the office of the bishop on 15 May 1927 by the Patriarch as he stood with the Patriarchal side till his change over to the Catholicos side in 1942, and till that time he was the metropolitan of the diocese of Kandanad.
                  </p>
                  <p className="font-syro-primary text-syro-dark-gray leading-relaxed mb-6">
                    In 1962 the Malankara Christian Association elected him as successor to Catholicos Geevarghese II. In January 1964 he assumed the office as Catholicos. For his enthronement the West Syrian Patriarch Paulos III was invited to be present so that the function might be acceptable to all especially to those who still stood on the Patriarchal side aggrieved emotionally. However during the last days of his tenure as Catholicos again peace within the church was broken down by the actions of the former Patriarchal group, who were encouraged by the Patriarch himself. As the result by August 1974 all relation with the Patriarch once again broke down forever. The main reasons for such were briefly these:
                  </p>
                  <ol className="font-syro-primary text-syro-dark-gray leading-relaxed mb-6 list-decimal pl-6 space-y-3">
                    <li>On 21st June 1967 the Patriarch wrote a letter to the Catholicos informing that the Catholicos should not use the words &quot;Throne of St. Thomas&quot; and &quot;Holiness&quot; and red-inked letter heads in his correspondences. He held a blasphemy that St. Thomas the Apostle of India was not even a priest at all, if so how it could be held that he had Episcopal throne. By the same and the similar, what he held was that the Catholicos was subservient to him and was not equal in status to him. Unwillingness to accept the autonomy of the church under the Catholicos could be seen here.</li>
                    <li>He sent a Syrian bishop as his delegate to the Indian church ordering to accept him which the Indian church refused to comply with. As he was forcefully sent here in return he was sent back by force by the actions of the Indian church.</li>
                    <li>Patriarch sent several notorious letters to individuals and parishes of the Catholicos inviting them to revolt against the Catholicos and his bishops repudiating their authority.</li>
                    <li>The Patriarch called to Syria a number of individuals from the Indian side and made them bishops and appointed them as rivals such as Paulose Athanasius, Thomas Dionysius, Geevarghese Gregorios. Thus from 1974 onwards this process of reproducing bishops in as possible number as he could to outnumber the Catholicos side bishops, was his way of works.</li>
                    <li>Finally issuing an excommunication letter against the Catholicos and bishops on his side. He appointed a rival Catholicos subordinate to him.</li>
                    <li>In 2002 a rival constitution was framed and the section of the church with him in India was named as the Jacobite Syrian Christian Church under the Jacobite Patriarch of Antioch.</li>
                  </ol>
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

import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import SyroPageBanner from '../../components/SyroPageBanner';
import QuickLinks from '../../components/QuickLinks';
import { SAINTS_SIDEBAR_LINKS } from '../saintsSidebarLinks';

const PAGE_TITLE = 'St. Gregorios Of Parumala – Metropolitan Geevarghese Mar Gregorios';

export const metadata = {
  title: PAGE_TITLE,
  description:
    'Saint Gregorios of Parumala is popularly known as Parumala Thirumeni. Metropolitan Geevarghese Mar Gregorios of the Malankara Orthodox Church who passed away on November 2nd 1902, became the first declared saint from Malankara (Kerala, India).',
};

const currentSlug = '/mosc/saints/st-gregorios-of-parumala-metropolitan-geevarghese-mar-gregorios';

export default async function StGregoriosOfParumalaPage({
  searchParams,
}: {
  searchParams: Promise<{ from?: string }>;
}) {
  const params = await searchParams;
  const breadcrumbFrom = params.from === 'saints' ? 'saints' : 'home';
  return (
    <div className="bg-syro-bg-gray">
      <SyroPageBanner title={PAGE_TITLE} breadcrumbFrom={breadcrumbFrom} />
      <section className="py-16 bg-syro-bg-gray">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
            <div className="lg:col-span-2">
              <div className="bg-white rounded-lg shadow-[rgba(50,50,93,0.25)_0px_6px_12px_-2px,rgba(0,0,0,0.3)_0px_3px_7px_-3px] p-8">
                <div className="mb-8 flex justify-center">
                  <Image
                    src="/images/saints/st-gregorios-of-parumala.jpg"
                    alt={PAGE_TITLE}
                    width={175}
                    height={175}
                    className="rounded-lg object-contain"
                    style={{ width: '175px', height: '175px' }}
                    priority
                  />
                </div>
                <div className="prose prose-lg max-w-none font-syro-primary text-syro-dark-gray leading-relaxed space-y-4">
                  <p>
                    Saint Gregorios of Parumala is popularly known as &lsquo;Parumala Thirumeni&rsquo;. Metropolitan
                    Geevarghese Mar Gregorios of the Malankara Orthodox Church who passed away on November 2nd 1902,
                    became the first declared saint from Malankara (Kerala, India) naturally to be called, &lsquo;Parumala
                    Thirumeni&rsquo;. He shines in the cloud of witnesses as a bright luminary giving rays of hope to
                    millions in their suffering and struggles.
                  </p>

                  <h2 className="font-syro-display font-semibold text-xl text-syro-blue pt-4">BIRTH AND PARENTAGE</h2>
                  <p>
                    Mar Gregorios was born on 15th June 1848 (M.E. Mithunam 3, 1023) to Kochu Mathai and Mariam of
                    Pallathetta family in the Chathuruthy house at Mulamthuruthy. He was called by the name
                    &lsquo;Kochaippora&rsquo; and was given the baptismal name &lsquo;Geevarghese&rsquo;. Kochaippora had
                    two brothers and two sisters; Kurian, Eli, Mariam and Varkey. Kochaippora was the youngest and was
                    therefore the most beloved to everyone. Unfortunately, his mother passed away when he was only two
                    years old. His eldest sister Mariam became to him all that a mother was meant. Mariam was married at
                    that time and had a child of Kochaippora&rsquo;s age.
                  </p>

                  <h2 className="font-syro-display font-semibold text-xl text-syro-blue pt-4">
                    READER-DEACON AND FURTHER EDUCATION
                  </h2>
                  <p>
                    He was ordained as a reader-deacon (Korooyo) on 14th Sept, 1858 at the age of ten by Palakkunnath
                    Mathews Mar Athanasios at Karingachira Church. Koroyo Geevarghese continued his training under
                    Geevarghese Malpan until the latter died due to small pox. Although Deacon Geevarghese was also
                    infected with small pox, he miraculously survived it. Afterwards Deacon Geevarghese moved to Pampakuda
                    to continued his studies under Konat Geevarghese Malpan. In the mean time Deacon became associated
                    with the visiting Syrian Bishop Yuyakim Mar Coorilos. Mar Coorilos had great admiration for the deacon
                    and was pleased to ordain him as full deacon, priest and cor-episcopa within few months in 1865.
                  </p>

                  <h2 className="font-syro-display font-semibold text-xl text-syro-blue pt-4">VETTICKAL DAYARA</h2>
                  <p>
                    The new priest&rsquo;s short stay at Mulanthuruthy Marthommen Church gave him an inner conviction that
                    he should lead a hermit&rsquo;s life in a quieter place. Therefore he shifted his residence to
                    Vettickal Dayara. At Vettickal Dayara, Corepiscopa Geevarghese started a strenuous life of prayer and
                    fasting. Having heard about the vigorous asceticism practised by corepiscopa Geevarghese, the then
                    Malankara Metropolitan Pulikkottil Joseph Mar Dionysius made him a &lsquo;Ramban&rsquo; (Monk Priest) in
                    1872.
                  </p>

                  <h2 className="font-syro-display font-semibold text-xl text-syro-blue pt-4">
                    PATRIARCHAL VISIT AND THE SYNOD OF MULAMTHURUTHY
                  </h2>
                  <p>
                    In 1875, the Antioch Patriarch His Holiness Peter III visited Malankara. The Patriarch chose Ramban
                    Geevarghese as his Secretary and translator during the entire visit. Along with the Patriarch, the
                    Ramban visited many churches. Ramban Geevarghese also assisted the Patriarch in the consecration of
                    the Holy Mooron and in the historic synod of Mulanthuruthy in 1876.
                  </p>

                  <h2 className="font-syro-display font-semibold text-xl text-syro-blue pt-4">
                    CONSECRATION AS METROPOLITAN
                  </h2>
                  <p>
                    Being pleased with the Ramban Geevarghese, the Patriarch decided to consecrate him as Metropolitan. On
                    December 10, 1876 the Patriarch consecrated six priests as bishops including Ramban Geevarghese at St.
                    Thomas Church, N Paravur. He was given the new name Geevarghese Mar Gregorios and was given the charge
                    of Niranam Diocese. The other bishops and their Diocese were:
                  </p>
                  <ul className="list-disc pl-6 space-y-1 my-4">
                    <li>Murimattath Mar Ivanios (Kandanad)</li>
                    <li>Kadavil Mar Athanasios (Kottayam)</li>
                    <li>Ambattu Mar Coorilos (Ankamaly)</li>
                    <li>Karottuveetil Simon Mar Dionysius (Cochin)</li>
                    <li>Konat Mar Julius (Thumpamon)</li>
                  </ul>
                  <p className="italic text-syro-dark-gray">St. Thomas Church, N Paravur</p>
                  <p>
                    Mar Gregorios was only 28 when he was made a bishop. Since he was the youngest among all the bishops,
                    he was dearly called by all as &lsquo;Kochu Thirumeni&rsquo;. The first thing the new bishops undertook
                    was a special fasting-vigil for forty days at Vettickal Dayara under the leadership of &lsquo;Kochu
                    Thirumeni&rsquo;. This fasting was both symbolic and effective in the pursuit of new life in an old
                    church.
                  </p>
                  <p>
                    Mar Gregorios took charge of the Niranam Diocese and started staying at Parumala. There was at Parumala,
                    at that time, a land donated by Arikupurath Koruth Mathen to the church and in this plot a small
                    building was erected by the Malankara Metropolitan Pulikkottil Joseph Mar Dionysius. This building was
                    known as &lsquo;Azhippura&rsquo;. Mar Gregorios lived there along with few other deacons who came for
                    priestly training. They worshipped in a thatched chapel during that time.
                  </p>

                  <h2 className="font-syro-display font-semibold text-xl text-syro-blue pt-4">THREEFOLD ACTIVITY</h2>
                  <p>
                    Mar Gregorios engaged in a threefold activity of tireless service for the church: Diocesan
                    administration, Ministerial formation of deacons, Missionary witness of the church through inner
                    spiritual and theological consolidation, along with evangelical reaching out.
                  </p>
                  <p>
                    In addition to these, Mar Gregorios undertook the task of building a church and seminary at Parumala.
                    The diocesan administration, in the mean time, was extended to two more dioceses, Thumpamon and Quilon.
                    The newly constructed church was consecrated in 1895. Mar Gregorios was the co-celebrant for the
                    consecration of two ex-Roman Catholic priests as bishops: Fr. Alvaris as Alvaris Mar Kulius for
                    Bombay-Mangalore Diocese; Fr. Rene Vilatti as Rene Vilatti Mar Timotheos for America.
                  </p>

                  <h2 className="font-syro-display font-semibold text-xl text-syro-blue pt-4">HOLY LAND – PILGRIMAGE</h2>
                  <p>
                    Mar Gregorios made the Holy Land Pilgrimage in 1895 as the fulfillment of a long cherished dream. On
                    his return he published a travelogue under the title &lsquo;Oorslem yathra vivaranam&rsquo; (a narrative
                    of the Jerusalem visit). This book, published in 1895 is to be considered as the earliest printed
                    travelogue in Malayalam. This book had its centenary edition in 1996 and translation into English in
                    2000.
                  </p>

                  <h2 className="font-syro-display font-semibold text-xl text-syro-blue pt-4">
                    A VISION AND MISSION FOR THE ENTIRE CHURCH
                  </h2>
                  <p>
                    Mar Gregorios believed that the church should engage in educational activity especially to facilitate
                    primary education and English teaching without discriminating gender or religion. Accordingly he started
                    schools at Kunnamkulam, Mulamthuruthy, Niranam, Thumpamon, Thiruvalla etc. The missionary task of the
                    Church was also evinced by his outreach programme to the socially down trodden communities at
                    Chennithala, Kalikunnu, Mallappally, Puthupally, Kallumkathara etc. He also organized evangelical
                    awakening programme for non-Christians at various places like Aluva, under the leadership of the
                    Seminary students.
                  </p>
                  <p>
                    A major task of Mar Gregorios was to motivate the clergy for effective ministry. With this aim, he
                    formed the Malankara Syrian Clergy Association and took many progressive decisions and made many
                    suggestions for the effective functioning of the priestly ministry.
                  </p>

                  <h2 className="font-syro-display font-semibold text-xl text-syro-blue pt-4">DISCIPLES OF THIRUMENI</h2>
                  <p>Among the many disciples of Mar Gregorios, three deserve special notice:</p>
                  <ol className="list-decimal pl-6 space-y-2 my-4">
                    <li>
                      Vattasseril Rev. Fr. Geevarghese (later, Malankara Metropolitan Geevarghese Mar Dionysius)
                    </li>
                    <li>Kuttikattu Rev. Fr. Paulose (later, Paulose Mar Athanasios of Aluva)</li>
                    <li>
                      Kallasseril Rev. Fr. Geevarghese (Punnoose) (later, Catholicos Baselios Geevarghese II)
                    </li>
                  </ol>

                  <h2 className="font-syro-display font-semibold text-xl text-syro-blue pt-4">DEPARTURE FROM THE WORLD</h2>
                  <p>
                    Mar Gregorios was already a piles-patient. It became chronic in 1902. Treatments proved futile and
                    slowly His Grace became physically weaker and weaker. At last the blessed soul left the earthly abode
                    on 2nd November 1902. The funeral was conducted at Parumala on Tuesday the 3rd of November 1902 in the
                    presence of thousands of people and hundreds of priests. The many testimonies to the saintly
                    intercession of Mar Gregorios made Parumala Church and the tomb a centre of pilgrimage. In 1947 Mar
                    Gregorios of blessed memory was declared a saint by the then Catholicos of the church, His Holiness
                    Baselius Geevarghese II.
                  </p>
                </div>
              </div>

              <div className="mt-8 hidden lg:block">
                <QuickLinks />
              </div>
            </div>
            <div className="space-y-6 lg:col-span-1">
              <div className="bg-syro-bg-gray rounded-lg shadow-syro-card p-6 mb-6">
                <h3 className="font-syro-display font-semibold text-lg text-syro-blue mb-4">Saints Categories</h3>
                <nav className="space-y-2">
                  {SAINTS_SIDEBAR_LINKS.map((link) => (
                    <Link
                      key={link.href}
                      href={link.href === '/mosc/saints' ? link.href : `${link.href}?from=saints`}
                      className={`block px-3 py-2 rounded-md font-syro-primary text-sm transition-all duration-300 ${
                        link.href === '/mosc/saints'
                          ? 'hidden'
                          : link.href === currentSlug
                            ? 'bg-syro-red text-white'
                            : 'text-syro-dark-gray hover:text-syro-red hover:bg-syro-bg-gray'
                      }`}
                    >
                      {link.label}
                    </Link>
                  ))}
                </nav>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

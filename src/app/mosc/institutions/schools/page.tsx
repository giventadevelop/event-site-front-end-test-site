import React from 'react';
import Image from 'next/image';
import { Metadata } from 'next';
import QuickLinks from '../../components/QuickLinks';
import SyroPageBanner from '../../components/SyroPageBanner';
import InstitutionsSidebar from '../components/InstitutionsSidebar';
import { formatPhoneNumbers } from '../lib/formatPhone';

export const metadata: Metadata = {
  title: 'Schools | Institutions | MOSC',
  description: 'Catholicate and M D Schools and Public Schools operated by the Malankara Orthodox Syrian Church, providing quality education from primary to higher secondary levels.',
};

type SchoolEntry = { name: string; location: string; phone?: string };

function SchoolCard({ school, index }: { school: SchoolEntry; index: number }) {
  return (
    <div className="bg-syro-bg-gray/20 rounded-lg p-6 shadow-syro-card-sm hover:shadow-syro-card transition-all duration-300 border-l-4 border-syro-red">
      <h3 className="font-syro-display font-semibold text-lg text-syro-blue mb-3">{school.name}</h3>
      <div className="space-y-2 font-syro-primary text-sm text-syro-dark-gray">
        <p>{school.location}</p>
        {school.phone && (
          <p className="font-medium text-syro-blue">
            {formatPhoneNumbers(school.phone).map((num, i) => (
              <span key={i} className="block">{i === 0 ? `Ph: ${num}` : num}</span>
            ))}
          </p>
        )}
      </div>
    </div>
  );
}

function SchoolCardCompact({ school, index }: { school: SchoolEntry; index: number }) {
  return (
    <div className="bg-white rounded-lg p-4 shadow-syro-card-sm hover:shadow-syro-card transition-all duration-300 border-l-4 border-syro-red">
      <h3 className="font-syro-display font-semibold text-base text-syro-blue mb-1">{school.name}</h3>
      <p className="font-syro-primary text-sm text-syro-dark-gray">{school.location}</p>
      {school.phone && (
        <p className="font-syro-primary text-sm font-medium text-syro-blue mt-1">
          {formatPhoneNumbers(school.phone).map((num, i) => (
            <span key={i} className="block">{i === 0 ? `Ph: ${num}` : num}</span>
          ))}
        </p>
      )}
    </div>
  );
}

export default function SchoolsPage() {
  // Content from https://mosc.in/institutions/schools/
  const higherSecondarySchools: SchoolEntry[] = [
    { name: 'M.D. Seminary Higher Secondary School', location: 'Kottayam.', phone: '0481 – 2563949' },
    { name: 'M.G.M Higher Secondary School', location: 'Thiruvalla.', phone: '0469 – 2602425, 2630902' },
    { name: 'Catholicate Higher Secondary School', location: 'Pathanamthitta.', phone: '0468 – 2222294' },
    { name: 'J.M. Higher Secondary School', location: 'Vakathanam,', phone: '0481 – 2462356, 2465556' },
    { name: 'M.G. Higher Secondary School', location: 'Thumpamon', phone: '04734 – 266802, 268234' },
    { name: 'Metropolitan Higher Secondary School', location: 'Puthencavu, Chengannur', phone: '0479 – 2452991, 2458690' },
    { name: "St. Behanan's Higher Secondary School", location: 'Vennikulam, Thiruvalla – 689544', phone: '0469 -2650555, 2650772' },
    { name: 'R.M. Higher Secondary School', location: 'Vadavucode, Puthencruz, Eranakulam- 682310', phone: '0484 – 2731109, 0484-2734909' },
    { name: 'M.P.M. Higher Secondary School', location: 'Chungathara, Malappuram – 679 334', phone: '04931 230374' },
  ];

  const highSchools: SchoolEntry[] = [
    { name: 'M.G.D. High School', location: 'Puthussery, Kallooppara', phone: '0469 – 2782175' },
    { name: 'M.G.D. High School for Boys', location: 'Kundara, Kollam – 691501', phone: '0474-2522616' },
    { name: 'M.G.D. High School for Girls', location: 'Kundara, Kollam – 691501', phone: '0474 – 2523008' },
    { name: 'St. Thomas High School', location: 'Karthigappally – 690516', phone: '0479 – 2485488' },
    { name: 'M.S.S. High School', location: 'Thazhakara, Mavelikara – 690102', phone: '0479-2301545' },
    { name: 'St. Pauls High School', location: 'Pulickakavala, Vazhoor – 686515', phone: '0481 -2456310' },
    { name: 'M.G.M. High School', location: 'Engapuzha, Puduppady, Kozhikode – 673586.', phone: '0495 – 2235035' },
    { name: "St. George's High School", location: 'Kizhavalloor, Konni – 689703', phone: '0468-2341108' },
    { name: 'L.M. High School', location: 'Venmony, Chengannur.', phone: '0479 – 2352225' },
    { name: 'J.M. High School', location: 'Kodukulanji, Chengannur', phone: '0479-2368738' },
  ];

  const upperPrimarySchools: SchoolEntry[] = [
    { name: 'St. George U.P. School', location: 'Chathannoor. P.O, Kollam' },
    { name: 'T.M.U U.P. School', location: 'Meenadam, Kottayam' },
    { name: 'M.G. U.P. School', location: 'Thumpamon, Pandalam' },
    { name: 'Mar Philexenos Memorial U.P School', location: 'Puthencavu P.O; Chengannur-689123' },
    { name: 'M.D. U.P. School', location: 'Vellaramemala; Vennikulam – 689544' },
    { name: 'M.D. U.P. School', location: 'Vakathanam; Puthenchantha P.O. Vakathanam – 686538' },
    { name: 'U.P. School', location: 'Vakathanam – 686538' },
    { name: "St. John's U.P. School", location: 'Ulanad; Kulanada, Pandalam – 689503' },
    { name: 'M.G.M. U.P. School', location: 'Kottamala P.O, Nileshwar – 671314.', phone: '0467 – 2245083' },
    { name: 'U.P. School', location: 'Pongamthanam, Vakathanam Kottayam – 686538' },
    { name: "St. Mary's U.P. School", location: 'Kollad, Kottayam – 686029' },
    { name: 'St. Thomas U.P. School', location: 'Eravinallor, Kottayam' },
  ];

  const lowerPrimarySchools: SchoolEntry[] = [
    { name: "St. Peter's L.P.S", location: 'Pulikakavala, Vazhoor – 686515' },
    { name: 'M.D.S L.P. School', location: 'Kottayam – 686001' },
    { name: 'M.D.L.P. School', location: 'Pampady, Pallivathukal, Pampady – 686502' },
    { name: 'M.D.L.P. School', location: 'Thazhathangadi, Kottayam – West' },
    { name: 'M.D.L.P. School', location: 'Perumkannary, Melpadom P.O., Mannar.' },
    { name: 'M.D.L.P. School', location: 'Pavukkara, Mannar Thiruvalla – 689622' },
    { name: "St. George's L.P. School", location: 'Theyyappara, Kodencherry, Kozhikode – 673580' },
    { name: 'M.D.L.P. School', location: 'Mannamthottuvazhy, Niranam Thiruvalla-689621' },
    { name: 'M.D.L.P. School', location: 'Valanjavattom East Thiruvalla – 689104' },
    { name: 'Parumala Seminary L.P. School', location: 'Parumala, Mannar' },
    { name: 'M.D.L.P. School', location: 'Kottayil, Kizhakkumbhagam P.O Niranam – 689628' },
    { name: 'M.D.L.P. School', location: 'Kallumkal P.O, Thiruvalla' },
    { name: 'M.D.L.P. School', location: 'Pathicad, Mallappally West – 689586' },
    { name: 'M.D.L.P. School', location: 'Vennikulam, Vennikulam P.O, Thiruvalla – 689544' },
    { name: 'St. Kuriakose L.P. School', location: 'Kundara Kollam-691501' },
    { name: 'M.G.M.LP. School', location: 'Thiruvalla – 689101' },
    { name: 'M.D.L.P. School', location: 'Madathumbhagam North P.O Puramattom, Thiruvalla – 689543' },
    { name: 'Puthussery Syrian M.D.L.P. School', location: 'Kadamankulam, Kallooppara – 689543' },
    { name: 'M.D.L.P. School', location: 'Mozhassery, Kadapra, Mannar Niranam – 689630' },
    { name: 'M.D.L.P. School', location: 'Sakthimangalam, Niranam North, Niranam – 689621' },
    { name: 'Niranam Mar Beselious M.D.L.P. School', location: 'Kadapra, Mannar – 689630' },
    { name: 'Mannar Syrian M.D.L.P. School', location: 'Kuttemperoor P.O, Chengannur' },
    { name: 'M.D.L.P. School', location: 'Neervilakam, Angadical, Chengannur – 689122' },
    { name: 'M.D.L.P. School', location: 'Kaipuzha, Panangad P.O, Kulanada, Pandalam' },
    { name: 'M.D.L.P. School', location: 'Puthencavu, Piralassery P.O; Angadical Chengannur -689122' },
    { name: 'M.D.L.P. School', location: 'Kumbazha, Pathanamthitta -689653' },
    { name: 'M.D.L.P. School', location: 'Melkozhoor P.O, Mylapra, Pathanamthitta -689678' },
    { name: 'M.D.L.P. School', location: 'Naranganam; Kozhencherry – 689642' },
    { name: 'M.D.L.P. School', location: 'Poozhikunnu, Chellackadu P.O Ranni – 689677' },
    { name: 'M.D.L.P. School', location: 'Thalavady South, Anaprampal South P.O, Thiruvalla -689576' },
    { name: 'St. Thomas L.P. School', location: 'Nellipoil, Meemmutty, Kodencherry, Kozhikode – 673580' },
    { name: "St. Behanans L.P. School", location: 'Thelliyoor P.O., Vennikulam, Thiruvalla – 689576' },
    { name: 'M.D.L.P. School', location: 'Chennithala, Eramathoor P.O., Mavelikara – 689622' },
    { name: 'L.P School', location: 'Vellukutta, Puthuppally Kottayam – 686011' },
    { name: "St. John's A.L.P. School", location: 'Kolithattu P.O., Kilianthara, Kannur – 670706' },
    { name: 'St. Thomas L.P. School', location: 'Nellimoodu, Puthussery Chengaroor – 689594' },
  ];

  const unAidedSchools: SchoolEntry[] = [
    { name: 'St. Thomas L.P School', location: 'Karthigappally' },
  ];

  const boardingHomes: SchoolEntry[] = [
    { name: 'Mar Baselius Augen Boarding Home M.D Seminary Higher Secondary School', location: 'Kottayam – 686001', phone: '0481 – 2562373' },
    { name: 'M.G.M. Boarding Home M.G.M H.S. School', location: 'Thiruvalla', phone: '0469-2602925' },
    { name: 'B.M.M. Boarding Home; R.M. Higher Secondary School', location: 'Vadavucode, Puthencruz, Eranakulam.', phone: '0484 – 2731113' },
    { name: 'Mar Dionysius Hostel, Mar Dionysius School', location: 'Rishivalley, Mallappally', phone: '0469 – 2682447' },
  ];

  const teacherTraining: SchoolEntry[] = [
    { name: 'MSSTTI', location: 'Thazhakara', phone: '0479 – 2303299' },
    { name: 'RMTTI', location: 'Vadavucode P.O, Puthencruze, Eranakulam', phone: '0484-2731723' },
  ];

  const publicSchools: SchoolEntry[] = [
    { name: 'Mar Baselios Public School', location: 'Kottayam', phone: '0481 2575160' },
    { name: 'Mar Dionysius School', location: 'Rishivalley, Mallappally', phone: '0469-2688547, 2688080' },
    { name: 'Nirmala Matha Public School', location: 'Kuppady P.O., Sultan Bethery – 673592', phone: '0493-6222015' },
    { name: 'St. George Public School', location: 'Kozhuvalloor, Chengannur' },
    { name: 'Baselius Vidyanikethan', location: 'Vettickal, Mulamthuruthy', phone: '0484-2742250' },
    { name: 'M.G.M. English Medium School', location: 'Punnappallam, Kolayad P.O., Kannur – 670 550.', phone: '0490 2303895' },
    { name: 'M.G.M. English Medium School', location: 'Chettukuzhy, Kochara P.O- 685 551, Vandanmettu', phone: '04868 -277577' },
    { name: 'Baselius Augen Public School', location: 'Kodanadu, Perumbavoor-683 544', phone: '0484-2646135, 0484 – 2646268' },
  ];

  return (
    <div className="min-h-screen bg-syro-bg-gray">
      <SyroPageBanner title="Schools" breadcrumbFrom="institutions" />

      <section className="py-16 bg-syro-bg-gray">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
            <div className="lg:col-span-2">
              <div className="bg-white rounded-lg shadow-[rgba(50,50,93,0.25)_0px_6px_12px_-2px,rgba(0,0,0,0.3)_0px_3px_7px_-3px] p-8">
                <div className="mb-8 flex justify-center">
                  <div className="relative w-full h-auto rounded-lg overflow-hidden flex items-center justify-center bg-syro-bg-gray/20">
                    <Image
                      src="/images/institutions/raj.jpg"
                      alt="Schools"
                      width={800}
                      height={600}
                      className="w-full h-auto object-contain"
                      style={{ backgroundColor: 'transparent', borderRadius: '0.5rem' }}
                      priority
                    />
                  </div>
                </div>
                <div className="bg-syro-red/10 rounded-lg p-4 mb-4">
                  <h2 className="font-syro-display font-semibold text-xl text-syro-blue mb-2">Catholicate and M D Schools</h2>
                  <p className="font-syro-primary text-syro-dark-gray">
                    <span className="font-medium text-syro-blue">Manager:</span> H.G. Dr. Gabriel Mar Gregorios Metropolitan
                  </p>
                </div>
                <p className="font-syro-primary text-lg text-syro-dark-gray leading-relaxed">
                  A comprehensive network of schools providing quality education rooted in Christian values and academic excellence.
                </p>
              </div>

              <div className="mt-8">
          <h2 className="font-syro-display font-semibold text-3xl text-syro-blue mb-8 pb-4 border-b-2 border-syro-red">
            Higher Secondary Schools
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {higherSecondarySchools.map((school, index) => (
              <SchoolCard key={index} school={school} index={index} />
            ))}
          </div>

          <h2 className="font-syro-display font-semibold text-3xl text-syro-blue mb-8 pb-4 border-b-2 border-syro-red mt-12">
            High Schools
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {highSchools.map((school, index) => (
              <SchoolCard key={index} school={school} index={index} />
            ))}
          </div>

          <h2 className="font-syro-display font-semibold text-3xl text-syro-blue mb-8 pb-4 border-b-2 border-syro-red mt-12">
            Upper Primary Schools
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {upperPrimarySchools.map((school, index) => (
              <SchoolCard key={index} school={school} index={index} />
            ))}
          </div>

          <h2 className="font-syro-display font-semibold text-3xl text-syro-blue mb-8 pb-4 border-b-2 border-syro-red mt-12">
            Lower Primary Schools
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {lowerPrimarySchools.map((school, index) => (
              <SchoolCardCompact key={index} school={school} index={index} />
            ))}
          </div>

          <h2 className="font-syro-display font-semibold text-3xl text-syro-blue mb-8 pb-4 border-b-2 border-syro-red mt-12">
            Un Aided Schools
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {unAidedSchools.map((school, index) => (
              <SchoolCard key={index} school={school} index={index} />
            ))}
          </div>

          <h2 className="font-syro-display font-semibold text-3xl text-syro-blue mb-8 pb-4 border-b-2 border-syro-red mt-12">
            Boarding Homes
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {boardingHomes.map((school, index) => (
              <SchoolCard key={index} school={school} index={index} />
            ))}
          </div>

          <h2 className="font-syro-display font-semibold text-3xl text-syro-blue mb-8 pb-4 border-b-2 border-syro-red mt-12">
            Teacher Training Institutions
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {teacherTraining.map((school, index) => (
              <SchoolCard key={index} school={school} index={index} />
            ))}
          </div>

          <h2 className="font-syro-display font-semibold text-3xl text-syro-blue mb-8 pb-4 border-b-2 border-syro-red mt-12">Public Schools</h2>
          <div className="bg-syro-red/10 rounded-lg p-6 mb-8">
            <h2 className="font-syro-display font-semibold text-2xl text-syro-blue mb-2">Public Schools</h2>
            <p className="font-syro-primary text-syro-dark-gray">
              <span className="font-medium text-syro-blue">Manager:</span> H.G. Dr. Geevarghese Mar Barnabas Metropolitan
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {publicSchools.map((school, index) => (
              <SchoolCard key={index} school={school} index={index} />
            ))}
          </div>

          <div className="mt-12 bg-gradient-to-br from-muted to-background rounded-lg shadow-syro-card p-8 text-center">
            <h2 className="font-syro-display font-semibold text-2xl text-syro-blue mb-4">
              Educational Excellence with Spiritual Foundation
            </h2>
            <p className="font-syro-primary text-lg text-syro-dark-gray leading-relaxed">
              Our schools are dedicated to nurturing young minds with quality education while instilling Christian values, preparing students to become responsible citizens and faithful members of the Church.
            </p>
          </div>
              </div>

              <div className="mt-8 hidden lg:block">
                <QuickLinks />
              </div>
            </div>
            <div className="space-y-6 lg:col-span-1">
              <InstitutionsSidebar currentSlug="schools" />
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

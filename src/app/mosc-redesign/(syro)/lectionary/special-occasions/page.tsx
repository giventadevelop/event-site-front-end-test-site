import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Metadata } from 'next';
import QuickLinks from '../../components/QuickLinks';
import SyroPageBanner from '../../components/SyroPageBanner';
import LectionarySidebar from '../components/LectionarySidebar';

export const metadata: Metadata = {
  title: 'Special Occasions | Lectionary | MOSC',
  description: 'Scripture readings for special occasions and feast days in the Malankara Orthodox Syrian Church, including feasts of saints, martyrs, and sacraments.',
};

export default function SpecialOccasionsPage() {
  const specialOccasions = [
    {
      title: 'Memory of St. Mary for Special Feasts',
      sections: [
        { time: 'Evening', verses: ['St. Luke 8:16-21'] },
        { time: 'Morning', verses: ['St. Mark 3:31-35'] },
        { time: 'Before Holy Qurbana', verses: ['Judges 13:2-14', 'Zechariah 2:10-13, 4:1-7, 8:3'] },
        { time: 'Holy Qurbana', verses: ['I John 3:2-17', 'Hebrews 2:14-18', 'St. Luke 1:26-38'] },
      ],
    },
    {
      title: 'Feast of an Apostle',
      sections: [
        { time: 'Evening', verses: ['St. Matthew 9:35-10:10'] },
        { time: 'Morning', verses: ['St. Matthew 19:27-30'] },
        { time: 'Before Holy Qurbana', verses: ['Genesis 12:1-9', 'Daniel 1:8-21', 'Isaiah 43:1-7'] },
        { time: 'Holy Qurbana', verses: ['Acts 1:12-14', 'I Corinthians 12:28-13:10', 'St. Luke 6:12-23'] },
      ],
    },
    {
      title: 'Feast of St. Thomas',
      sections: [
        { time: 'Evening', verses: ['St. John 11:5-16'] },
        { time: 'Morning', verses: ['St. John 14:1-7'] },
        { time: 'Before Holy Qurbana', verses: ['Genesis 9:1-12', 'Daniel 1:8-21', 'Isaiah 43:1-7'] },
        { time: 'Holy Qurbana', verses: ['Acts 1:12-14', 'I Corinthians 12:28-13:10', 'St. John 20:19-31'] },
      ],
    },
    {
      title: 'Feast of a Martyr',
      sections: [
        { time: 'Evening', verses: ['St. Matthew 10:16-33'] },
        { time: 'Morning', verses: ['St. Luke 12:1-12'] },
        { time: 'Before Holy Qurbana', verses: ['Genesis 4:3-12', 'Daniel 3:14-30'] },
        { time: 'Holy Qurbana', verses: ['Acts 23:11-25', 'Romans 8:31-39', 'St. Mark 8:34-38, 13:9-13'] },
      ],
    },
    {
      title: 'Feast of a Saint',
      sections: [
        { time: 'Evening', verses: ['St. John 15:12-21, 16:1-3'] },
        { time: 'Morning', verses: ['St. Mark 10:28-31'] },
        { time: 'Before Holy Qurbana', verses: ['Genesis 19:15-23', 'Job 1:12-22', 'Isaiah 38:1-8'] },
        { time: 'Holy Qurbana', verses: ['Acts 27:9-26', 'Hebrews 10:33-11:7', 'St. Matthew 10:34-42'] },
      ],
    },
    {
      title: 'Memory of a Saint Lady',
      sections: [
        { time: 'Evening', verses: ['St. Luke 10:38-42, 8:1-3'] },
        { time: 'Morning', verses: ['St. Luke 8:1-3'] },
        { time: 'Before Holy Qurbana', verses: ['Genesis 21:1-8, 24:15-27', 'Ecclesiastes 12:1-8', 'Isaiah 56:1-5'] },
        { time: 'Holy Qurbana', verses: ['Acts 9:36-43', 'Romans 16:1-16', 'St. Matthew 25:1-13'] },
      ],
    },
    {
      title: 'Memory of Martyrs, Malpans, and Holy Fathers',
      sections: [
        { time: 'Evening', verses: ['St. John 17:11-26'] },
        { time: 'Morning', verses: ['St. Matthew 25:31-46'] },
        { time: 'Before Holy Qurbana', verses: ['Numbers 27:1, 5-23', 'II Kings 2:1-15'] },
        { time: 'Holy Qurbana', verses: ['Acts 12:1-17', 'Romans 3:19-26', 'St. Luke 18:9-14'] },
      ],
    },
    {
      title: 'Mission Sunday (First Sunday of July)',
      sections: [
        { time: 'Before Holy Qurbana', verses: ['Jonah 3:1-10', 'Ezekiel 37:1-14'] },
        { time: 'Holy Qurbana', verses: ['Acts 1:2-8, 2:1-13', 'Romans 10:13-21', 'I Corinthians 9:15-17', 'St. Matthew 28:16-20'] },
      ],
    },
    {
      title: `During God's Wrath and Punishment`,
      sections: [
        { time: 'Evening', verses: ['St. Luke 13:6-17'] },
        { time: 'Morning', verses: ['St. Matthew 7:7-11'] },
        { time: 'Before Holy Qurbana', verses: ['Genesis 18:17, 20-33', 'Jonah 3:1-10'] },
        { time: 'Holy Qurbana', verses: ['St. James 5:7-20', 'Hebrews 12:3-11', 'St. Mark 11:23-12:13', 'St. Luke 11:2-13'] },
      ],
    },
  ];

  const sacraments = [
    {
      title: 'Holy Baptism',
      readings: ['Romans 5:20-6:14', 'Colossians 2:1-12', 'St. Luke 3:15-16', 'St. John 3:1-8'],
    },
    {
      title: 'Holy Mooron (Chrismation)',
      readings: [
        'Genesis 28:10-20',
        'Numbers 6:22-7:11',
        'I Samuel 16:1-13',
        'Psalms 45:1-17',
        'I Kings 1:32-40',
        'Song of Solomon 1:2-11, 3:6, 4:10-15',
        'II Kings 9:1-6',
        'Isaiah 61:1-6',
        'I John 2:21-3:1',
        'I Corinthians 2:12-17',
        'St. Matthew 26:6-13',
        'St. John 12:3-8',
      ],
    },
    {
      title: 'Holy Confession',
      readings: [
        'Exodus 20:2-17',
        'Psalms 6, 32, 38, 51, 102, 130, 143',
        'Deuteronomy 5:6-21',
        'Job 22:22-30',
        'St. James 5:12-18',
        'I Corinthians 6:9-20',
        'Colossians 3:12-17',
        'St. Luke 15:1-32',
        'St. John 20:21-23',
      ],
    },
    {
      title: 'Holy Qurbana (Eucharist)',
      readings: ['Psalms 8, 15, 16, 23, 29, 34, 40, 84, 103, 116, 119:23-40, 119:97-112, 121, 139, 147, 150'],
    },
  ];

  const ordinations: { title: string; readings: string[]; note?: string }[] = [
    { title: `M'samrono (Reader)`, readings: ['Psalms 50', 'St. Luke 10:17-24'] },
    { title: 'Qorooyo (Sub-Deacon)', readings: ['Proverbs 1:1-9', 'I John 2:12-29', 'St. Luke 10:16-25'] },
    { title: 'Youphidakino (Sub-Deacon)', readings: ['Isaiah 44:1-4, 61:1-4', 'I Timothy 3:8-13', 'St. Luke 10:1-16'] },
    { title: `M'Shamshono (The Full Deacon)`, readings: ['Acts 6:1-8', 'I Timothy 3:8-13, 1-7', 'St. John 12:24-26, 13:1-15'] },
    { title: 'Kasheesho (Priest)', readings: ['Acts 2:14-21', 'I Timothy 1:18-20, 3:1-7', 'St. John 20:19-29'] },
    { title: 'Cor-Episcopa', readings: ['II Timothy 2:1-13', 'Titus 2:1-9', 'St. John 14:1-16'] },
    { title: 'Dayaroyooso (Ramban)', readings: ['Genesis 12:1-9', 'Numbers 6:1-9', 'Deuteronomy 30:15-20', 'Baruch 3:16-21', 'Job 22:22-30', 'I Peter 1:13-25', 'Colossians 3:1-17', 'St. Luke 14:25-15:11'] },
    {
      title: 'Arkhadhayakon',
      readings: ['Acts 6:1-8', 'I Timothy 3:8-13', 'St. John 12:24-28'],
      note: 'Newly elevated Arkhadhiyakon reads the Holy Gospel standing on the steps of the Holy Sanctuary: St. John 17:3-26 OR St. Luke 10:1-24',
    },
    {
      title: 'Episcopa',
      readings: ['Acts 1:2-8, 24-26, 2:1-4, 8:14-21, 14:23', 'I Peter 1:13-16, 2:1-10, 5:1-4', 'I Timothy 1:18, 3:1-7, 13, 4:6-11, 5:17-22', 'St. Matthew 16:13-19'],
      note: 'New bishop reads the Holy Gospel sitting on the throne: St. Matthew 10:1-16',
    },
  ];

  const otherServices = [
    { title: 'Holy Matrimony', readings: ['Ephesians 5:21-6:3', 'St. Matthew 19:1-12'] },
    { title: 'The Anointing of the Sick', readings: ['St. James 5:13-16', 'Romans 13:11-14', 'St. Matthew 10:5-10'] },
  ];

  const kantheelaServices = [
    { service: 'First Service', readings: ['Acts 3:1-10', 'St. Luke 18:35-43'] },
    { service: 'Second Service', readings: ['St. James 3:10-18', 'St. Luke 10:25-37'] },
    { service: 'Third Service', readings: ['II Corinthians 12:7-10', 'St. Mark 5:25-34'] },
    { service: 'Fourth Service', readings: ['II Corinthians 12:7-10', 'St. Matthew 15:21-31'] },
    { service: 'Fifth Service', readings: ['Acts 9:32-35', 'Ephesians 6:10-20', 'St. Matthew 9:36-10:10'] },
  ];

  const churchAndBlessings = [
    { title: 'Sanctification of a Church Building', readings: ['I Chronicles 29:10-14', 'I Kings 8:22-43', 'Isaiah 6:1-8', 'Acts 7:44-53', 'Hebrews 9:1-14', 'St. Matthew 16:13-20', 'St. John 10:22-30'] },
    { title: 'Laying the Foundation Stone of a Church Building', readings: ['I Peter 2:1-10', 'Ephesians 2:11-22', 'St. Matthew 16:13-20'] },
    { title: 'Dedication of the Holy Cross', readings: ['Galatians 6:11-18', 'St. Matthew 10:34-42'] },
    { title: 'Mooron Sacrament', readings: ['Numbers 7:1-11', 'Genesis 28:10-20', 'I Samuel 16:1-13', 'I John 2:20-3:1', 'II Corinthians 2:12-17', 'St. Luke 7:36-50'] },
    { title: 'Blessing of the Home', readings: ['Genesis 28:10-22', 'Proverbs 3:1-9', 'Acts 10:1-8', 'Hebrews 13:1-6', 'St. Luke 19:1-10'] },
  ];

  const funeralReadings = [
    { category: 'Men', readings: ['Genesis 48:21-22, 49:33-50', 'Psalms 34', 'I Peter 3:8-12', 'I Corinthians 15:33-53', 'St. John 15:19-29'] },
    { category: 'Women', readings: ['Acts 9:36-42', 'I Thessalonians 4:13-18', 'St. Matthew 25:1-13'] },
    { category: 'Children', readings: ['I Kings 17:17-24', 'Acts 20:7-12', 'I Corinthians 15:12-19', 'St. Luke 7:11-17'] },
    { category: 'Bishops & Priests', readings: ['Deuteronomy 34:1-12', 'Numbers 20:23-29', 'II Peter 3:8-18', 'I Corinthians 15:33-57', 'St. Matthew 24:45-25:30'] },
  ];

  return (
    <div className="bg-syro-bg-gray">
      <SyroPageBanner title="Special Occasions" breadcrumbFrom="lectionary" />

      <section className="py-16 bg-syro-bg-gray">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
            <div className="lg:col-span-2">
              <div className="bg-white rounded-lg shadow-[rgba(50,50,93,0.25)_0px_6px_12px_-2px,rgba(0,0,0,0.3)_0px_3px_7px_-3px] p-8">
                <div className="mb-8 flex justify-center">
                  <Image
                    src="/images/lectionary/sp.jpg"
                    alt="Special Occasions"
                    width={175} height={175}
                    className="rounded-lg object-contain" style={{ width: '175px', height: '175px' }}
                    sizes="(min-width: 1024px) 37.5vw, 50vw"
                  />
                </div>
                <div className="font-syro-primary text-syro-dark-gray leading-relaxed mb-12">
                  <p className="mb-4">
                    Scripture readings for special feast days, commemorations of saints and martyrs, and the celebration of the holy sacraments of the Church.
                  </p>
                  <p>
                    These readings guide us through the sacred occasions that mark important moments in the life of the Church and the spiritual journey of the faithful.
                  </p>
                </div>

                <h2 className="font-syro-display font-semibold text-3xl text-syro-blue mb-8 pb-4 border-b-2 border-syro-red">
                  Feast Days and Commemorations
                </h2>
                <div className="space-y-12 mb-12">
                  {specialOccasions.map((occasion, index) => (
                    <div key={index} className="bg-syro-bg-gray rounded-lg p-6 shadow-syro-card-sm">
                      <h3 className="font-syro-display font-medium text-2xl text-syro-blue mb-6">
                        {occasion.title}
                      </h3>
                      <div className="space-y-4">
                        {occasion.sections.map((section, sIndex) => (
                          <div key={sIndex} className="border-l-4 border-syro-red pl-6">
                            <h4 className="font-syro-display font-medium text-lg text-syro-red mb-2">
                              {section.time}
                            </h4>
                            <ul className="space-y-1">
                              {section.verses.map((verse, vIndex) => (
                                <li key={vIndex} className="font-syro-primary text-syro-dark-gray flex items-start">
                                  <span className="w-2 h-2 bg-syro-red rounded-full mt-2 mr-3 flex-shrink-0"></span>
                                  <span>{verse}</span>
                                </li>
                              ))}
                            </ul>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>

                <h2 className="font-syro-display font-semibold text-3xl text-syro-blue mb-8 pb-4 border-b-2 border-syro-red">
                  Holy Sacraments
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
                  {sacraments.map((sacrament, index) => (
                    <div key={index} className="bg-syro-bg-gray rounded-lg p-6 shadow-syro-card">
                      <h3 className="font-syro-display font-medium text-xl text-syro-blue mb-4">
                        {sacrament.title}
                      </h3>
                      <div className="border-l-4 border-syro-red pl-6">
                        <h4 className="font-syro-display font-medium text-sm text-syro-red mb-2">
                          Readings
                        </h4>
                        <ul className="space-y-1">
                          {sacrament.readings.map((reading, rIndex) => (
                            <li key={rIndex} className="font-syro-primary text-sm text-syro-dark-gray flex items-start">
                              <span className="w-1.5 h-1.5 bg-syro-red rounded-full mt-2 mr-3 flex-shrink-0"></span>
                              <span>{reading}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  ))}
                </div>

                <h2 className="font-syro-display font-semibold text-3xl text-syro-blue mb-8 pb-4 border-b-2 border-syro-red">
                  Holy Priesthood Ordinations
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
                  {ordinations.map((ordination, index) => (
                    <div key={index} className="bg-syro-bg-gray rounded-lg p-6 shadow-syro-card-sm">
                      <h3 className="font-syro-display font-medium text-lg text-syro-blue mb-4">
                        {ordination.title}
                      </h3>
                      <div className="border-l-4 border-syro-red pl-6">
                        <h4 className="font-syro-display font-medium text-sm text-syro-red mb-2">
                          Readings
                        </h4>
                        <ul className="space-y-1">
                          {ordination.readings.map((reading, rIndex) => (
                            <li key={rIndex} className="font-syro-primary text-sm text-syro-dark-gray flex items-start">
                              <span className="w-1.5 h-1.5 bg-syro-red rounded-full mt-2 mr-3 flex-shrink-0"></span>
                              <span>{reading}</span>
                            </li>
                          ))}
                        </ul>
                        {ordination.note && (
                          <p className="mt-3 text-sm text-syro-dark-gray italic">{ordination.note}</p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>

                <h2 className="font-syro-display font-semibold text-3xl text-syro-blue mb-8 pb-4 border-b-2 border-syro-red">
                  Holy Matrimony & Anointing of the Sick
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
                  {otherServices.map((item, index) => (
                    <div key={index} className="bg-syro-bg-gray rounded-lg p-6 shadow-syro-card">
                      <h3 className="font-syro-display font-medium text-xl text-syro-blue mb-4">
                        {item.title}
                      </h3>
                      <div className="border-l-4 border-syro-red pl-6">
                        <h4 className="font-syro-display font-medium text-sm text-syro-red mb-2">
                          Readings
                        </h4>
                        <ul className="space-y-1">
                          {item.readings.map((reading, rIndex) => (
                            <li key={rIndex} className="font-syro-primary text-sm text-syro-dark-gray flex items-start">
                              <span className="w-1.5 h-1.5 bg-syro-red rounded-full mt-2 mr-3 flex-shrink-0"></span>
                              <span>{reading}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  ))}
                </div>

                <h2 className="font-syro-display font-semibold text-3xl text-syro-blue mb-8 pb-4 border-b-2 border-syro-red">
                  Kantheela
                </h2>
                <div className="space-y-6 mb-12">
                  {kantheelaServices.map((item, index) => (
                    <div key={index} className="bg-syro-bg-gray rounded-lg p-6 shadow-syro-card-sm border-l-4 border-syro-red pl-6">
                      <h3 className="font-syro-display font-medium text-lg text-syro-blue mb-3">
                        {item.service}
                      </h3>
                      <ul className="space-y-1">
                        {item.readings.map((reading, rIndex) => (
                          <li key={rIndex} className="font-syro-primary text-syro-dark-gray flex items-start">
                            <span className="w-1.5 h-1.5 bg-syro-red rounded-full mt-2 mr-3 flex-shrink-0"></span>
                            <span>{reading}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </div>

                <h2 className="font-syro-display font-semibold text-3xl text-syro-blue mb-8 pb-4 border-b-2 border-syro-red">
                  Church Sanctification, Dedications & Blessings
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
                  {churchAndBlessings.map((item, index) => (
                    <div key={index} className="bg-syro-bg-gray rounded-lg p-6 shadow-syro-card">
                      <h3 className="font-syro-display font-medium text-xl text-syro-blue mb-4">
                        {item.title}
                      </h3>
                      <div className="border-l-4 border-syro-red pl-6">
                        <h4 className="font-syro-display font-medium text-sm text-syro-red mb-2">
                          Readings
                        </h4>
                        <ul className="space-y-1">
                          {item.readings.map((reading, rIndex) => (
                            <li key={rIndex} className="font-syro-primary text-sm text-syro-dark-gray flex items-start">
                              <span className="w-1.5 h-1.5 bg-syro-red rounded-full mt-2 mr-3 flex-shrink-0"></span>
                              <span>{reading}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  ))}
                </div>

                <h2 className="font-syro-display font-semibold text-3xl text-syro-blue mb-8 pb-4 border-b-2 border-syro-red">
                  Funeral / Burial
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
                  {funeralReadings.map((item, index) => (
                    <div key={index} className="bg-syro-bg-gray rounded-lg p-6 shadow-syro-card">
                      <h3 className="font-syro-display font-medium text-xl text-syro-blue mb-4">
                        {item.category}
                      </h3>
                      <div className="border-l-4 border-syro-red pl-6">
                        <ul className="space-y-1">
                          {item.readings.map((reading, rIndex) => (
                            <li key={rIndex} className="font-syro-primary text-sm text-syro-dark-gray flex items-start">
                              <span className="w-1.5 h-1.5 bg-syro-red rounded-full mt-2 mr-3 flex-shrink-0"></span>
                              <span>{reading}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="pt-8 border-t border-syro-red/20">
                  <h2 className="font-syro-display font-semibold text-2xl text-syro-blue mb-4">
                    About Special Occasions
                  </h2>
                  <p className="font-syro-primary text-lg text-syro-dark-gray leading-relaxed mb-4">
                    The Church celebrates numerous feast days throughout the year, honoring the memory of saints, martyrs, apostles, and the blessed Mother of God. Each of these occasions has its own appointed scripture readings that reflect the life and witness of those being commemorated.
                  </p>
                  <p className="font-syro-primary text-lg text-syro-dark-gray leading-relaxed">
                    The readings for the sacraments and ordinations highlight the sacred nature of these holy mysteries through which God's grace is bestowed upon the faithful.
                  </p>
                </div>
              </div>

              <div className="mt-8 hidden lg:block">
                <QuickLinks />
              </div>
              <div className="mt-8 flex flex-col sm:flex-row justify-between items-center gap-4">
                <Link
                  href="/mosc-redesign/lectionary"
                  className="inline-flex items-center px-6 py-3 bg-syro-red text-white font-syro-primary font-medium rounded-lg hover:bg-syro-red/90 transition-all duration-300 shadow-syro-card"
                >
                  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                  Back to Lectionary
                </Link>
                <Link
                  href="/mosc-redesign/lectionary/kyomtho-easter-to-koodosh-edtho"
                  className="inline-flex items-center px-6 py-3 bg-white text-syro-blue font-syro-primary font-medium rounded-lg hover:bg-syro-bg-gray transition-all duration-300 shadow-syro-card"
                >
                  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                  Previous: Kyomtho (Easter)
                </Link>
              </div>
            </div>
            <div className="space-y-6 lg:col-span-1">
              <LectionarySidebar currentSlug="special-occasions" />
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



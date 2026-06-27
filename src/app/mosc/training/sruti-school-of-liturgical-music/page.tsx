import React from 'react';
import Image from 'next/image';
import { Metadata } from 'next';
import QuickLinks from '../../components/QuickLinks';
import SyroPageBanner from '../../components/SyroPageBanner';
import TrainingSidebar from '../components/TrainingSidebar';

export const metadata: Metadata = {
  title: 'Sruti School of Liturgical Music | Training | MOSC',
  description: 'Learn about Sruti School of Liturgical Music - training in Eastern Orthodox Church Music, Karnatic, Western, and Instrumental Music.',
};

export default function SrutiSchoolPage() {
  const objectives = [
    'To bring about a systematic and ordered enhancement of the Liturgical and devotional music of the Malankara Orthodox Syrian Church.',
    'To provide courses, seminars and classes in Liturgical, Classical, Western, Instrumental and Light Music to interested and talented students.',
    'To develop the expertise and leadership qualities of choir leaders and members so as to better equip them to organise choirs in their respective parishes and thereby to bring about a uniformity and standard in the hymnody of the Orthodox Church.',
    'To conduct training camps at Central Diocesan and District levels in Church Music, so as to assist the Orthodox Church to retrieve and preserve its ancient musical heritage.',
    'To facilitate the research and scientific study of ancient Indian, Non-Indian and Western Music and their respective historical developments, contributions and influences.',
    'To recover and popularise ancient Liturgical Music and its tunes.',
    'To produce quality audio and video cassette recordings in order to broaden the appeal of Liturgical and Christian Music.',
    'To guide talented musicians to compose tunes, songs and hymns based on indigenous foundations for utilisation in the worship and services of the Orthodox Church.',
    'To publish journals, periodicals and bulletins aimed at encouraging the scholarly and scientific study of music, thereby leading to its enrichment.',
    'To raise funds and sources to further the above objectives and to facilitate the setting up of a modern recording studio.',
  ];

  return (
    <div className="min-h-screen bg-syro-bg-gray">
      <SyroPageBanner title="Sruti School of Liturgical Music" breadcrumbFrom="training" />

      <section className="py-16 bg-syro-bg-gray">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
            <div className="lg:col-span-2">
      {/* Single card: image + content + contact (catholicate layout) */}
      <div className="bg-white rounded-lg shadow-[rgba(50,50,93,0.25)_0px_6px_12px_-2px,rgba(0,0,0,0.3)_0px_3px_7px_-3px] p-8 mb-8">
        <div className="mb-8 flex justify-center">
          <Image
            src="/images/training/sruti.jpg"
            alt="Sruti School of Liturgical Music"
            width={800}
            height={500}
            className="rounded-lg object-contain" style={{ width: '175px', height: '175px' }}
            priority
            sizes="(max-width: 768px) 100vw, 28rem"
          />
        </div>

        <div className="space-y-6 font-syro-primary text-lg text-syro-dark-gray leading-relaxed">
          <p>
            The Sruti School of Liturgical Music is the realization of a long-cherished desire of the Orthodox Theological Seminary to effect a systematised and organised form to the music and hymnody of the Malankara Orthodox Syrian Church. A prime objective of the institution is to foster the integration of the existing music in the Church with the indigenous music, so as to bring about an authentic Indian worship service in the Church. Since its inception, these objectives have been enlarged in scope to embrace not only the teaching of Eastern Orthodox Church Music, but also Karnatic, Western and Instrumental Music.
          </p>
          <p>
            The School began functioning with an informal inauguration by H.H. Moran Mar Baselius Mar Thoma Mathews I, the former Catholicos, in September, 1988. The success of this initial project can be measured by the fact that fifty (50) students participated, completing the course involving the basics of music, such as its theory, musical notation liturgical and instrumental music. The programme proved to be immensely helpful in assisting the local parishes to organise their services through the assistance of these students.
          </p>
          <p>
            The formal inauguration of the School of Liturgical music was held on 9th January, 1989 at the Orthodox Theological Seminary. His Holiness Theoktist, the Patriarch of the Romanian Orthodox Church, was the Chief guest and inaugurated the School. The first batch of students was officially enrolled in the two year diploma course in April 1989.
          </p>
          <p>
            The second and third batches were started in 1991 and 1993 respectively. The syllabus being: &ldquo;The Introduction to the theory and fundamentals of Music, Introduction to Liturgical Music, Karnatic (South Indian Classical) Music, Instrumental Music and Music Composition&rdquo;. Diplomas were awarded to the students who successfully completed the course.
          </p>
          <p>
            The School now has its own building – which was constructed in 1993 and its opening ceremony was conducted in the same year. H.H. Baselius Mar Thoma Mathews II, Catholicos of the East, was the chief guest and blessed and opened the building. The amount for the building was donated by well wishers, inside and outside India.
          </p>
          <p>
            The interest of students in the various expression of available music encouraged the school to offer courses in Light Music and Western Music. In 1995 the School offered a formal course in Western Music. At present over 80 students are undergoing training in these programmes. The school is currently working closely with the Associated Board of the Royal School of Music and with Trinity College of Music, both located in London.
          </p>
          <p>
            Taking into consideration the diverse courses offered and the interests of prospective students, the syllabus was revamped in 1996 to provide separate certificate courses specializing in Syriac, Karnatic and Instrumental Music. The courses offered by Sruti are taught by outstanding exponents in their respective musical field. This has enabled Sruti to become an outstanding and excellent centre for studying music. It is indeed an enriching experience to learn music in this institute, an experience to which we cordially invite you to share.
          </p>
        </div>

        <h2 className="font-syro-display font-semibold text-3xl text-syro-blue mt-10 mb-8 pb-4 border-b-2 border-syro-red">
          Aims & Objectives
        </h2>
        <div className="space-y-4">
          {objectives.map((objective, index) => (
            <div key={index} className="flex items-start bg-syro-bg-gray rounded-lg p-6 border border-syro-red/30">
              <div className="w-8 h-8 bg-syro-red rounded-full flex items-center justify-center flex-shrink-0 mr-4">
                <span className="font-syro-display font-semibold text-syro-red-foreground">{index + 1}</span>
              </div>
              <p className="font-syro-primary text-syro-dark-gray leading-relaxed flex-1">
                {objective}
              </p>
            </div>
          ))}
        </div>

        <h2 className="font-syro-display font-semibold text-3xl text-syro-blue mt-10 mb-8 pb-4 border-b-2 border-syro-red">
          Syriac Music
        </h2>
        <div className="space-y-6 font-syro-primary text-lg text-syro-dark-gray leading-relaxed">
          <p>
            Syriac belongs to the family of Semitic language and its development can be traced back to its source the Aramaic language around the second century A.D. At one time it was the vernacular of Syria and its adjacent regions. Today, however, its usage is restricted to the worship and liturgy of the Eastern Churches in these areas. Due to the many contacts between and the influence of these churches on the nascent Malankara church, Syriac became the dominant liturgical language of the Malankara Christians. This accounts for the popular designation &ldquo;Syrian Christians&rdquo;.
          </p>
          <p>
            There are basically two types of Syriac traditions in the Syrian church namely; Eastern and Western Syriac. While Eastern Syriac may have held sway in Malankara in the early centuries, with the course of time it was displaced by Western Syriac. Ultimately it is this Western tradition which has dominated the music of the Malankara Orthodox Church. The Western traditions of Syriac Music witnessed a period of great development around 4th century AD and is associated with such outstanding church Fathers as Mar Ephrem, Mar Jacob of Serog, Mar Balai and others.
          </p>
          <p>
            The fundamental principles of Syriac Music are based on the octo-echoes (eight modes or eight colours). The use of these modes are determined by the liturgical calendar, such as the feasts associated with the incarnation, the feasts in commemoration of St.Mary and the saints. For instance, Christmas and Easter use the first mode, on the feast of Epiphany we use the second, the feast day of saints use the eighth mode and the feast day of the departed Church leaders and fathers use the 7th (seventh) mode. As these variations are introduced, there is a note of change and in the church&rsquo;s worship services, enabling it to become attractive and appealing to its participants.
          </p>
          <p>
            In order to fully appreciate the church&rsquo;s liturgy, the study of Syriac Music is indispensable. Melodious and strongly influenced by the ascetical practice of the church, Syriac music has evolved into a sophisticated system capable of uplifting the worshippers to a blessed experience of God.
          </p>
        </div>

        <div className="mt-10 pt-8 border-t border-syro-red/20">
          <h2 className="font-syro-display font-semibold text-2xl text-syro-blue mb-6">
            Contact Address
          </h2>
          <div className="space-y-3 font-syro-primary text-syro-dark-gray">
            <p className="font-medium text-syro-blue text-lg">Sruti Liturgical School of Music</p>
            <p>Orthodox Seminary</p>
            <p>PB 98, Chungam</p>
            <p>Kottayam-686001</p>
            <p className="pt-3">
              <span className="font-medium text-syro-blue">Ph:</span> 0481 2585384
            </p>
            <p>
              <span className="font-medium text-syro-blue">Email:</span>{' '}
              <a href="mailto:srutimusics@gmail.com" className="text-syro-red hover:underline">
                srutimusics@gmail.com
              </a>
            </p>
            <p>
              <span className="font-medium text-syro-blue">Website:</span>{' '}
              <a href="http://www.srutimusic.org/" target="_blank" rel="noopener noreferrer" className="text-syro-red hover:underline">
                www.srutimusic.org
              </a>
            </p>
          </div>
        </div>
      </div>

              <div className="mt-8 hidden lg:block">
                <QuickLinks />
              </div>
            </div>
            <div className="space-y-6 lg:col-span-1">
              <TrainingSidebar currentSlug="sruti-school-of-liturgical-music" />
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





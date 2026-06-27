import React from 'react';
import Image from 'next/image';
import QuickLinks from '../../../components/QuickLinks';
import SyroPageBanner from '../../../components/SyroPageBanner';
import TheChurchSidebar from '../../TheChurchSidebar';

export const metadata = {
  title: 'Lent | Spirituality | MOSC',
  description:
    'Lent: A stone jar for our renewal and growth. Preparation for the Resurrection, spiritual warfare, simple life, and the St. Thomas Christian Lenten heritage in Kerala.',
};

export default async function LentPage({
  searchParams,
}: {
  searchParams: Promise<{ from?: string }>;
}) {
  const params = await searchParams;
  const breadcrumbFrom = params.from === 'the-church' ? 'the-church' : 'home';

  return (
    <div className="bg-syro-bg-gray">
      <SyroPageBanner
        title="Lent"
        breadcrumbFrom={breadcrumbFrom}
        breadcrumbParent={breadcrumbFrom === 'the-church' ? { label: 'Spirituality', href: '/mosc-redesign/the-church/spirituality' } : undefined}
      />

      <section className="py-16 bg-syro-bg-gray">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
            <div className="lg:col-span-2">
              <div className="bg-white rounded-lg shadow-[rgba(50,50,93,0.25)_0px_6px_12px_-2px,rgba(0,0,0,0.3)_0px_3px_7px_-3px] p-8">
                <div className="mb-8 flex justify-center">
                  <Image
                      src="/images/church/spirituality.jpg"
                      alt="Lent - Malankara Orthodox Church"
                      width={125} height={125}
                      className="rounded-lg w-full max-w-[125px] max-h-[125px] object-contain" priority
                    />
                </div>

                <div className="prose prose-lg max-w-none">
                  <h2 className="font-syro-display font-semibold text-2xl text-syro-blue mt-0 mb-4">
                    Lent; A Stone Jar for Our Renewal and Growth
                  </h2>

                  <p className="font-syro-primary text-syro-dark-gray leading-relaxed mb-4">
                    The church is helping us to progress in our spiritual life in the rhythm of its fasts and feasts. All important feasts in the church are preceded by short or long fasting. Thus the mystery of true happiness is revealed. But the secular world is attempting to draw our attention just to matters of fun only without ample preparation for having lasting joy. That is why after the excitement of material achievements, boredom and frustration dance in human minds. But Lenten preparation for the feasts is a preparation for the heavenly joy which is growing and lasting. Through the Great Lent we are progressing towards the festival of the resurrection of Christ, the feast of feasts.
                  </p>
                  <p className="font-syro-primary text-syro-dark-gray leading-relaxed mb-4">
                    In the ancient Christian community great Lent started as a preparation for the baptism of the aspirants of Christianity on Easter day. These catechumens were trained during the great Lent by the spiritual instruction of bishop, and their own fasting. Gradually all believers in the church participated in this Lent and renewed their baptismal grace. Today we commemorate Christ&apos;s fasting before his public ministry and his blessed passion during this Lent and make use of it for fifty days for our complete spiritual renewal.
                  </p>
                  <p className="font-syro-primary text-syro-dark-gray leading-relaxed mb-4">
                    There are many spiritual exercises which help us to grow in Christ. Holy sacraments like baptism, confession, Qurbana, etc, fasting and Lents, prayers, meditations, teaching and preaching in the church etc are preparing a ground for receiving grace from God for this growth. These spiritual exercises and especially Lents can be compared to the stone jars into which water was poured according to the instruction of our Lord at the wedding in Cana (St.John 2:7). By being in those stone jars, water could meet its creator and He could transform it to tasty wine. Stone jar prepared a ground for the transformation. But the source of that change was God only. Likewise we are supposed to be poured into Lent for being transformed by God.
                  </p>
                  <p className="font-syro-primary text-syro-dark-gray leading-relaxed mb-4">
                    Lent is a training for simple life. During Lents we avoid certain times of meal and certain types of meal. Ancient Christian practice was to have just one time of meal which is purely a vegetarian supper during the great Lent. Fasting and vegetarianism during the Lent are an invitation to overcome the enslaving power of consumerist culture which is based on greed. Al Gore&apos;s famous documentary film An Inconvenient Truth exposes the tragic result of such an uncontrollable life and also the waiting environmental destruction if no remedial measures and restrictions are adopted. In the midst of prosperity and over consumption we are trained to enjoy the beauty of a simple life based on need. So during the Lent we limit our life to extremely necessary things and minimum needs with regard to food, media like T.V., internet, and the use of technology in general. Along with many useful advantages, our scientific technological paradise sometimes makes us slaves of materialism. It is noticeable that two questions repeated continuously in America are about how to lose weight and where to park car. Lent gives us a wonderful experience of simple life. This freedom from the grip of over luxurious life and enslaving consumerist culture make us sensitive to the basic needs of the poor and the suffering and share with them our resources. In the book of Isaiah there is an enlightening description about the Lent which is pleasing to God: &quot;Is it not this, the fast that I have chosen? To loose the bands of wickedness, to undo the heavy burdens, and to let the oppressed go free, and that you break every yoke? Is it not to deal your bread to the hungry, and that you bring the poor that are cast out to your house? When you see the naked, that you cover him; and that you hide not yourself from your own flesh?&quot; (Isaiah 58: 6-7).
                  </p>
                  <p className="font-syro-primary text-syro-dark-gray leading-relaxed mb-4">
                    Lent is a powerful weapon for our unseen spiritual warfare. It is the human tendency to fight always. But its proper orientation is not against other people but against evil within us and evil in the society. God is helping us to conquer passions like hatred, avarice, jealousy, greed, lust etc through Lent. Jesus Christ went through a long fasting and immediately after that we see him saying a bold NO to the evil force who brought temptations. Till the last breath there will be temptations and spiritual warfare in the lives of all and those who make use of Lent as a spiritual weapon will be victorious. The prayers of the great Lent highlight Moses, Elijah and Jesus as the great champions of fasting. According to the scripture they observed fasting for forty days and it was these three who are seen in unusually bright light on the transfiguration mount. When the Jews under captivity in Babylon were released and were about to go back to Jerusalem around two and half millennia ago, they declared a fasting to ensure God&apos;s protection in their journey. (Ezra 8: 21&22) It is recorded in the book of Ezra that they did not ask the King to send soldiers to ensure their security so that the gentiles could not laugh at the shallow nature of their faith. In our transient journey in this planet to eternity our ultimate trust and security is to be in God who strengthens us to conquer all kinds of evil and to progress. In short, through fasting we humble ourselves and surrender fully to God who empowers us to face all challenges and sinful tendencies.
                  </p>
                  <p className="font-syro-primary text-syro-dark-gray leading-relaxed mb-4">
                    Lent is a time when we cooperate with God for the nourishment of our inner being. It is natural to be preoccupied with physical and mental pleasures and nourishment. But the abstinences during Lent indicate the shift of focus and we give extra care to the nourishment of our spirit, the inner spiritual icon which is like an internet explorer in a computer to get connected to a magnificent transcendent world. During Lent we give more time for Bible reading, meditation and Prayer so that our spirit is purified and enriched by God, the life giving food of our inner life. Then the Holy Spirit who resides in our spirit can smoothly guide us. Good deeds and words will flow from the inner springboard which is purified and strengthened by Christ. &apos;Blessed are the pure in heart, for they shall see God.&apos;(Mt. 5:8)
                  </p>
                  <p className="font-syro-primary text-syro-dark-gray leading-relaxed mb-6">
                    European missionaries were astonished to see the rigorous Lenten practices of the St. Thomas Christian community of Kerala in 16th century. The letters sent by these missionaries from Kerala to their mother congregations in Europe reveal many things about the Lent in those days. St. Thomas Christians used to have fasting till evening and they used to go to their churches for daily prayers during the great Lent. Most of them even avoided coffee and chewing Vettila during this time. Dr. James Aerthayil CMI has done a good study about these documents in his book The Spiritual Heritage of the St. Thomas Christians. According to this study St. Thomas Christians used to have almost 225 days of fasting a year. In spite of the fact that they were leading a simple agrarian life, our forefathers and mothers took Lents and thus their spiritual growth seriously. This may open our eyes to see the greater need of Lent today in our more complex and challenging situation. May the Holy Spirit help us to use this stone jar as cocoon for our holistic rejuvenation.
                  </p>

                  <div className="bg-syro-red/5 rounded-lg p-6 mt-8 border border-syro-table-border">
                    <p className="font-syro-primary text-syro-dark-gray leading-relaxed text-center font-semibold">
                      Fr.Dr. Bijesh Philip, Principal, St. Thomas Orthodox Seminary, Nagpur
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

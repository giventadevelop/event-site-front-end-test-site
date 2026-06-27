import React from 'react';
import QuickLinks from '../../../components/QuickLinks';
import SyroPageBanner from '../../../components/SyroPageBanner';
import TheChurchSidebar from '../../TheChurchSidebar';

export const metadata = {
  title: 'The Great Lent | Spirituality | MOSC',
  description:
    'Great Lent: Restore me to the paradise from which I departed. The joyous period of preparation for the Feast of Christ\'s Resurrection in the Malankara Orthodox Syrian Church.',
};

export default async function TheGreatLentPage({
  searchParams,
}: {
  searchParams: Promise<{ from?: string }>;
}) {
  const params = await searchParams;
  const breadcrumbFrom = params.from === 'the-church' ? 'the-church' : 'home';

  return (
    <div className="bg-syro-bg-gray">
      <SyroPageBanner
        title="The Great Lent"
        breadcrumbFrom={breadcrumbFrom}
        breadcrumbParent={breadcrumbFrom === 'the-church' ? { label: 'Spirituality', href: '/mosc-redesign/the-church/spirituality' } : undefined}
      />

      <section className="py-16 bg-syro-bg-gray">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
            <div className="lg:col-span-2">
              <div className="bg-white rounded-lg shadow-[rgba(50,50,93,0.25)_0px_6px_12px_-2px,rgba(0,0,0,0.3)_0px_3px_7px_-3px] p-8">
                <div className="prose prose-lg max-w-none">
                  <h2 className="font-syro-display font-semibold text-2xl text-syro-blue mt-0 mb-4">
                    Great Lent: &apos;Restore Me To The Paradise From Which I Departed&apos;
                  </h2>
                  <p className="font-syro-primary text-syro-dark-gray leading-relaxed mb-6">
                    The center of the liturgical year in the Orthodox Church is Kyomtho, the celebration of Christ&apos;s Resurrection. It is extolled in the services as the Feast of feasts and Triumph of triumphs. Justifiably so, for as the Apostle Paul declares, if Christ be not risen, then is our preaching vain, and your faith is also vain (I Cor. 15:14). The sense of resurrection joy forms the foundation of all the worship of the Orthodox Church; it is the one and only basis for our Christian life and hope. Through His redeeming Passion, Christ freed us from the tyranny of death and opened for us the door to Paradise and eternal life. This is the goal of our life-long spiritual journey, a journey from death to life, from darkness to light – a restoration to paradise from which we have departed. It is a long journey and we travelers get weary; we get distracted and wander off or even lose sight of the road. To help keep us focused, the Church every year compresses for us this journey as it prepares us to greet the Feast of Christ&apos;s Resurrection. This preparatory time is the joyous period of Great Lent. Without this preparation, without this expectant waiting, the deeper meaning of the Easter celebration will be lost.
                  </p>

                  <h3 className="font-syro-display font-semibold text-xl text-syro-blue mt-8 mb-3">
                    The primary aim of fasting
                  </h3>
                  <p className="font-syro-primary text-syro-dark-gray leading-relaxed mb-6">
                    The primary aim of fasting is to make us conscious of our dependence upon God. It is to lead us to a sense of inward brokenness and contrition; to bring to us, that is, to the point where we appreciate the full force of Christ&apos;s statement, &quot;Without Me you can do nothing&quot; (John 15:5). During the Great Lent, we have to strip ourselves from the specious assurance of the Pharisee who fasted, it is true, but not in the right spirit. Lenten abstinence gives us the saving self-dissatisfaction of the Publican (Luke 18:10-13). Such is the function of the hunger and the tiredness: to make us &quot;poor in spirit&quot;, aware of our helplessness and of our dependence on God&apos;s aid. Abstinence leads to a sense of lightness, wakefulness, freedom and joy.
                  </p>

                  <h3 className="font-syro-display font-semibold text-xl text-syro-blue mt-8 mb-3">
                    Lent is a time of joy
                  </h3>
                  <p className="font-syro-primary text-syro-dark-gray leading-relaxed mb-6">
                    Lent is a time of joy. It is a time when we come back to life. It is a time when we shake off what is bad and dead in us in order to become able to live, to live with all the vastness, all the depth, and all the intensity to which we are called. We are at the threshold of the Great Lent. We have to believe the power of fasting as it relates to prayer is the spiritual weapon that our Lord has given us to destroy the strongholds of evil. Fasting might seem hard, but with each passing day, God&apos;s call will grow stronger and clearer. Finally, we will be convinced that God has called us to fast, and He would not make such a call without a specific reason or purpose. With this conviction, enter the Great Lent with excitement and expectancy mounting in our hearts, praying, Lord, &quot;I have walked away from You and Your precepts. But now I return, merciful Lord, and cry to You: I have sinned.&quot;
                  </p>

                  <h3 className="font-syro-display font-semibold text-xl text-syro-blue mt-8 mb-3">
                    Confidence in the Lord
                  </h3>
                  <p className="font-syro-primary text-syro-dark-gray leading-relaxed mb-6">
                    As we begin to fast, our confidence in the Lord will help us. The longer we fast, the more we sense the presence of the Lord. The Holy Spirit refreshes our soul and spirit, and we experience the joy of the Lord as seldom before. Biblical truths leap at us from the pages of God&apos;s Word. Our faith soars as we humble ourselves and cries out to God and rejoices in His presence. Fasting calls on the Holy Spirit and brings us to repentance, prayer and almsgiving. We need to revive our commitment to fasting and prayer and the rest of the Church will respond to this call. Spent time in reading God&apos;s word and make your time with the Lord more spiritually rewarding. There is no point in fasting and prayer until it equips you for spiritual awakening. Hope this Great Lent will not slip by without having made a genuine effort to prepare ourselves for the resurrection of Jesus Christ our Savior. &quot;Let us set out with joy upon the season of the Fast, and prepare ourselves for spiritual combat. Let us purify our soul and cleanse our flesh; and as we fast from food, let us abstain also from every passion. Rejoicing in the virtues of the Spirit may we persevere with love, and so be counted worthy to see the solemn Passion of Christ our God, and with great spiritual gladness to behold His holy Passover.&quot;
                  </p>

                  <h3 className="font-syro-display font-semibold text-xl text-syro-blue mt-8 mb-3">
                    The journey into the Resurrection
                  </h3>
                  <p className="font-syro-primary text-syro-dark-gray leading-relaxed mb-6">
                    The whole journey into the Resurrection can become our own if we are able to stand in examination of our lives, see how far we have brought ourselves from the life God intends for us, and then long, truly long to return to our true home, to paradise. We must turn with tears toward the home from which we have sinfully departed and resolutely start our journey back, begging God&apos;s forgiveness in our return. True repentance begins with the acknowledgement of self-imposed exile. Such knowledge pains us, but it is a pain that leads to action, and action that leads to reform. And as Christ re-forms us into His heavenly life, we begin truly to live. Apart from God, there is nothing. We have each experienced this &apos;nothing,&apos; for we have each turned from God. But now, as we prepare to enter into Great Lent, we long for the great &apos;something&apos; that is God&apos;s love and sanctification. Begging His mercy we strive for true repentance, that we may receive His salvation in all joy.
                  </p>

                  <div className="bg-syro-red/5 rounded-lg p-6 mt-8 border border-syro-table-border">
                    <p className="font-syro-primary text-syro-dark-gray leading-relaxed mb-4">
                      &quot;Behold, O Christ, the affliction of my heart; behold my turning back; behold my tears, O Savior, and despise me not. But embrace me once again in Your compassion and count me with the multitude of the saved, that with thanksgiving I may sing the praises of Your mercy.&quot;
                    </p>
                    <p className="font-syro-primary text-syro-dark-gray leading-relaxed mb-4">
                      I end with the words of Ephrem the Syrian from his hymn &apos;On Fasting&apos;: &quot;This is the fast of the First Born, the first of His victories. Let us rejoice in His coming; for in fasting He has overcome. Though He could have overcome by any means, He revealed for us the strength hidden in fasting, Overcomer of All. For by means of it a man can overcome that one who with fruit overcame Adam; He became greedy and gobbled it. Blessed is the First-Born who encompassed our weakness with the wall of His great fasting. Blessed is the King who adorned the Holy Church with Fasting, Prayer and Vigil.&quot;
                    </p>
                    <p className="font-syro-primary text-syro-dark-gray leading-relaxed font-semibold">
                      Rahaim &apos;layn aloho abo aheed kool ethraham &apos;layn.
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

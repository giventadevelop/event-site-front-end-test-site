import React from 'react';
import Image from 'next/image';
import QuickLinks from '../../../components/QuickLinks';
import SyroPageBanner from '../../../components/SyroPageBanner';
import TheChurchSidebar from '../../TheChurchSidebar';

export const metadata = {
  title: 'Shubqono – Let us be Reconciled with One Another | Spirituality | MOSC',
  description:
    'The Service of Reconciliation (Shubqono) at the threshold of Great Lent. The Church enters the season of penitence and mutual forgiveness on the Day of Forgiveness.',
};

export default async function ShubqonoPage({
  searchParams,
}: {
  searchParams: Promise<{ from?: string }>;
}) {
  const params = await searchParams;
  const breadcrumbFrom = params.from === 'the-church' ? 'the-church' : 'home';

  return (
    <div className="bg-syro-bg-gray">
      <SyroPageBanner
        title="Shubqono – Let us be Reconciled with One Another"
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
                      alt="Shubqono – Service of Reconciliation"
                      width={125} height={125}
                      className="rounded-lg w-full max-w-[125px] max-h-[125px] object-contain" priority
                    />
                </div>

                <div className="prose prose-lg max-w-none">
                  <h2 className="font-syro-display font-semibold text-2xl text-syro-blue mt-0 mb-4">
                    SHUBQONO – Let us be Reconciled with One Another
                  </h2>

                  <p className="font-syro-primary text-syro-dark-gray leading-relaxed mb-4">
                    The Church, on this very afternoon of the &apos;Day of Forgiveness,&apos; has set her journey into penitence. And so, kneeling and prostrating, her people look ahead to Kymtho, the great feast of the Light. The service of reconciliation is conducted on Monday, the first day of the Great Lent, at the end of third hour. The Service of Reconciliation or shubqono, stands at the &apos;threshold of Great Lent.&apos; The service marks the actual doorway into Lent, the threshold on the other side of which stands the fullest measure of ascesis that the Church metes out to the whole of her faithful throughout the world. As we stand at the threshold of the fast, we sing of him who stood before the gates of Eden. As we make ready to enter in to this season of preparation, we sing often:
                  </p>

                  <div className="bg-syro-red/5 rounded-lg p-6 my-6 border border-syro-table-border">
                    <p className="font-syro-primary text-syro-dark-gray leading-relaxed italic">
                      O merciful and compassionate Lord, to You I cry aloud: I am fallen! Have mercy on me! Your grace has shown forth, O Lord, it has shone forth and given light to our souls. Behold, now is the accepted time; behold, now is the season of repentance. Let us cast off the works of darkness and put on the armor of light, that having sailed across the great sea of the Fast, we may reach the third-day Resurrection of our Lord Jesus Christ, the Savior of our souls.
                    </p>
                  </div>

                  <p className="font-syro-primary text-syro-dark-gray leading-relaxed mb-4">
                    The scene painted by the hymns of the day is one of a great and terrible sorrow. We lament the loss of so great a gift – the gift to be children of God. Our sins have forced us to be exiles from glory. We are in want. No more can we look upon the Lord our God and Maker. As Great Lent begins, we are reminded in language stronger and more direct than ever before of the gravity of our condition in sin:
                  </p>

                  <div className="bg-syro-red/5 rounded-lg p-6 my-6 border border-syro-table-border">
                    <p className="font-syro-primary text-syro-dark-gray leading-relaxed italic mb-2">
                      &apos;Woe is me, what have I suffered in my misery! I transgressed the commandments of the Master, and now I am deprived of every blessing.&apos; Then the Savior said: &apos;I desire not the loss of the creature which I fashioned, but that he should be saved and come to knowledge of the truth; and when he comes to me I will not cast him out.&apos;
                    </p>
                  </div>

                  <p className="font-syro-primary text-syro-dark-gray leading-relaxed mb-4">
                    By the transgression of the will of God we threw aside the gift of grace and blessings. However, we have a God who loves us and is abundant in His mercy. &apos;I will not cast him out.&apos; God&apos;s words in this are already the words of salvation. They are words of calling, of beckoning, of reconciliation. But they are also words of directive: &apos;when he comes to me....&apos; God does not take fallen man and, with a divine fiat that would mean little to the long-term well being of humankind, magically place him back into glory from which we ourselves have exiled. God knows that it is our heart that most desperately needs to be healed, needs to be turned away from the desire for its own ends and back to a desire for the heart of God Himself. And so the Savior whispers to us, &apos;When you come back to me, I will not cast you out&apos;.
                  </p>

                  <p className="font-syro-primary text-syro-dark-gray leading-relaxed mb-4">
                    Our prayer must be:
                  </p>
                  <div className="bg-syro-red/5 rounded-lg p-6 my-6 border border-syro-table-border">
                    <p className="font-syro-primary text-syro-dark-gray leading-relaxed italic">
                      Come, my wretched soul, and weep today over your acts, remembering how once you were stripped naked in Eden and cast out from delight and unending joy.
                    </p>
                  </div>

                  <p className="font-syro-primary text-syro-dark-gray leading-relaxed mb-4">
                    Lent is beginning, and as the personal tone of the hymns professes, this is to be my Fast, my exile, my return. I cannot of myself escape from Adam&apos;s condition. But through the Church, I need not suffer alone the whole torment of Adam. &apos;Let us love abstinence, that we may not weep as he did outside Paradise, but may enter through the gate.&apos; Great Lent is also a harbor, a safe port wherein we may suffer our repentance in the surety of divine grace and tender compassion. Thus do we petition the Lord:
                  </p>

                  <div className="bg-syro-red/5 rounded-lg p-6 my-6 border border-syro-table-border">
                    <p className="font-syro-primary text-syro-dark-gray leading-relaxed italic">
                      O God of all, Lord of mercy, look down compassionately upon my lowliness and do not send me far away from Eden; but may I perceive the glory from which I have fallen, and hasten with lamentations to regain what I have lost.
                    </p>
                  </div>

                  <p className="font-syro-primary text-syro-dark-gray leading-relaxed mb-4">
                    We are called to amend and to change our ways of living, thinking and acting from within the full scope of our lives in Christ. During Lent we are thrust into a forum for change, wherein our greatest aid is the incarnate and resurrected Son of God Himself.
                  </p>

                  <div className="bg-syro-red/5 rounded-lg p-6 my-6 border border-syro-table-border">
                    <p className="font-syro-primary text-syro-dark-gray leading-relaxed italic">
                      The arena of the virtues has been opened. Let all who wish to struggle for the prize now enter, girding themselves for the noble contest of the Fast; for those that strive lawfully are justly crowned. Taking up the armor of the Cross, let us make war against the enemy. Let us have as our invisible rampart the Faith, prayer as our breastplate, and as our helmet almsgiving; and as our sword let us use fasting that cuts away all evil from our heart. If we do this, we shall receive the true crown from Christ the King of all at the Day of Judgment.
                    </p>
                  </div>

                  <p className="font-syro-primary text-syro-dark-gray leading-relaxed mb-4">
                    &apos;Let us use fasting that cuts away all evil from our heart.&apos; The entrance into Great Lent is made as the entrance into the full fray of the spiritual and physical battle we must each wage on the journey into the Kingdom of God. And though this is a battle we must each wage ourselves, we do not enter into it alone. As an invisible rampart, we have the truth of God revealed in His Son and in all the economy of space and time, borne alive in our hearts through the illumination of baptism. And as a visible rampart we have the Church, though here, too, there is the reality of the invisible. It is within the community of all the faithful, past and present, that we struggle towards resurrection, towards Kymtho. It is amidst our neighbors that we stand in this arena and wage this battle. &apos;If we do this, we shall receive the true crown.&apos; From the usual context of &apos;I&apos; and &apos;You&apos; in which we communicate day by day, Great Lent calls us to stand before the gates of Paradise in solidarity as the great family of humankind, the united children of the one God.
                  </p>

                  <p className="font-syro-primary text-syro-dark-gray leading-relaxed mb-4">
                    And so, forgiveness. The first step in our journey through Lent must be this act of mutual forgiveness, of reconciling ourselves to one another in the context of the holy community in which we shall grow and advance together. If we set out upon the season of inner repentance without beginning here, in an act of fraternal repentance, then we will certainly find ourselves &apos;committing sin while singing hymns with our tongues.&apos; The gate of Paradise will only be more firmly shut. But if this moment of mutual forgiveness is embraced and made real in our lives, then we shall be readily equipped both as individuals and as a community to fight worthily the battle before us. It shall not be we alone in the arena, but we the united Church who stand together in the contest that leads to all the brightness of the third-day Resurrection. And from within this community we will be able to find in our own selves the authentic voice of our genuine individuality, and shall be able to cry out and say:
                  </p>

                  <div className="bg-syro-red/5 rounded-lg p-6 my-6 border border-syro-table-border">
                    <p className="font-syro-primary text-syro-dark-gray leading-relaxed italic">
                      Cleanse me in the waters of repentance, and through prayer and fasting make me shine with light, for Thou alone art merciful. Abhor me not, O Benefactor of all, supreme in love.
                    </p>
                  </div>

                  <div className="bg-syro-red/5 rounded-lg p-6 mt-8 border border-syro-table-border">
                    <p className="font-syro-primary text-syro-dark-gray leading-relaxed text-center font-medium">
                      Ashwalan moryo aloho b&apos;tayboothok l&apos;hoosoyo d&apos;hawbai w&apos;shoobqono dahtohai b&apos;hono yawmo qadisho d&apos;ithaw shooroyo d&apos;soomoyeekh qadisho.
                    </p>
                    <p className="font-syro-primary text-syro-dark-gray leading-relaxed text-center mt-3 text-sm">
                      Make us worthy, O Lord God, by Your abundant grace, for the remission of sins and the forgiveness of debts on this holy day, which is the beginning of Your Holy Fast.
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

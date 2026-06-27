import React from 'react';
import Image from 'next/image';
import QuickLinks from '../../../components/QuickLinks';
import SyroPageBanner from '../../../components/SyroPageBanner';
import TheChurchSidebar from '../../TheChurchSidebar';

export const metadata = {
  title: 'Sacraments | Liturgy | MOSC',
  description:
    'Sanctification through the sacraments (mysteries). The Church as the Body of Christ imparts holiness to its members through the sacraments; sacramental life in the Orthodox tradition.',
};

export default async function SacramentsPage({
  searchParams,
}: {
  searchParams: Promise<{ from?: string }>;
}) {
  const params = await searchParams;
  const breadcrumbFrom = params.from === 'the-church' ? 'the-church' : 'home';

  return (
    <div className="bg-syro-bg-gray">
      <SyroPageBanner
        title="Sacraments"
        breadcrumbFrom={breadcrumbFrom}
        breadcrumbParent={breadcrumbFrom === 'the-church' ? { label: 'Liturgy', href: '/mosc-redesign/the-church/liturgy-worship' } : undefined}
      />

      <section className="py-16 bg-syro-bg-gray">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
            <div className="lg:col-span-2">
              <div className="bg-white rounded-lg shadow-[rgba(50,50,93,0.25)_0px_6px_12px_-2px,rgba(0,0,0,0.3)_0px_3px_7px_-3px] p-8">
                <div className="mb-8 flex justify-center">
                  <Image
                      src="/images/church/liturgy-worship.jpg"
                      alt="Sacraments"
                      width={125} height={125}
                      className="rounded-lg w-full max-w-[125px] max-h-[125px] object-contain" priority
                    />
                </div>

                <div className="prose prose-lg max-w-none">
                  <h2 className="font-syro-display font-semibold text-2xl text-syro-blue mt-6 mb-4">
                    Sanctification Through Sacraments
                  </h2>

                  <p className="font-syro-primary text-syro-dark-gray leading-relaxed mb-6">
                    The Triune God is Holy. God&apos;s people also must be holy. None can behold God without sanctification (Hebrews 12:14). The church being the Body of Christ is intrinsically holy. Holiness of the church is imparted to and shared by the members of the church, through the sacraments (Mysteries).
                  </p>

                  <p className="font-syro-primary text-syro-dark-gray leading-relaxed mb-6">
                    In the Orthodox Tradition, although the term sacrament is not so common as the term &apos;mystery&apos; (rozo), the inner idea of the sacrament is endorsed and holistically acknowledged. The Latin term &quot;sacramentum&quot; is generally defined as the visible means of invisible grace and refers to certain specific events or acts or signs of Christian living. But according to the Orthodox understanding, sacramentality is the very nature of the new creation in Christ and therefore it sounds odd to identify certain acts or events or signs alone as &apos;sacraments&apos;. However, the sacramentality involved in our being born as the children of God in baptism, our participation in the life of the Incarnate Lord in Eucharist etc., is well recognized in the Orthodox churches.
                  </p>

                  <p className="font-syro-primary text-syro-dark-gray leading-relaxed mb-6">
                    Sacramental life is the style and order of our life in Jesus Christ. Even though the materiality is preserved and maintained, it is considered to be a transformed materiality as manifested on the mount of Transfiguration. Even though we continue to be in an earthly fellowship, we realize a heavenly fellowship around us, in sacramental life.
                  </p>

                  <p className="font-syro-primary text-syro-dark-gray leading-relaxed mb-6">
                    Matter and Body are no more to be looked down as embodiments of sin, corruption and death; rather they become the media for the manifestation of God&apos;s Glory.
                  </p>

                  <p className="font-syro-primary text-syro-dark-gray leading-relaxed mb-6">
                    Our values and relations also get sanctified in sacramental life because in sacraments the inner core of life is the sharing of common gifts. Spirit of sharing is opposite to the spirit of exploitation and selfish hoarding of resources. The church as the community of the kingdom of God imparts to its members the values of the shared life in and through the sacraments.
                  </p>

                  <p className="font-syro-primary text-syro-dark-gray leading-relaxed mb-6 italic">
                    <strong>Rev. Fr. Dr. Jacob Kurian. (Retd. Principal) Orthodox Theological Seminary, Kottayam</strong>
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

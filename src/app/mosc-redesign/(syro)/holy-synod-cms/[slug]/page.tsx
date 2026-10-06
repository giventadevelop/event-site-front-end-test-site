import React from 'react';
import Image from 'next/image';
import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import HolySynodCmsSidebar from '../../components/HolySynodCmsSidebar';
import QuickLinks from '../../components/QuickLinks';
import SyroPageBanner from '../../components/SyroPageBanner';
import { getHolySynodMemberBySlug, getHolySynodMembersData } from '../getHolySynodMembersData';

export const dynamic = 'force-dynamic';

type PageProps = {
  params: Promise<{ slug: string }>;
};

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const member = await getHolySynodMemberBySlug(slug);
  if (!member) {
    return { title: 'Member Not Found | Holy Synod | MOSC' };
  }
  return {
    title: `${member.name} | Holy Synod | Malankara Orthodox Syrian Church`,
    description: member.excerpt ?? `Holy Synod member: ${member.name}.`,
  };
}

function formatAddress(address: string): string {
  return address
    .split(/[,\n]+/)
    .map((s) => s.trim())
    .filter(Boolean)
    .join('\n');
}

function splitContactValues(value: string): string[] {
  return value
    .split(/[,\n]+/)
    .map((s) => s.trim())
    .filter(Boolean);
}

export default async function HolySynodCmsMemberPage({ params }: PageProps) {
  const { slug } = await params;
  const [member, { members }] = await Promise.all([
    getHolySynodMemberBySlug(slug),
    getHolySynodMembersData(),
  ]);

  if (!member) {
    notFound();
  }

  const sidebarMembers = members.map((m) => ({
    name: m.name,
    href: `/mosc-redesign/holy-synod-cms/${m.slug}`,
  }));

  const hasContact = Boolean(member.address || member.email || member.phones);
  const imageWidth = member.imageWidth ?? 3;
  const imageHeight = member.imageHeight ?? 4;

  return (
    <div className="bg-syro-bg-gray">
      <SyroPageBanner title={member.name} breadcrumbFrom="holy-synod-cms" />

      <section className="py-16 bg-syro-bg-gray">
        <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
            <div className="lg:col-span-2">
              <div className="bg-white rounded-lg shadow-[rgba(50,50,93,0.25)_0px_6px_12px_-2px,rgba(0,0,0,0.3)_0px_3px_7px_-3px] px-4 py-8 md:p-8">
                {member.imageUrl && (
                  <div className="mb-8">
                    <Image
                      src={member.imageUrl}
                      alt={member.imageAlt ?? member.name}
                      width={imageWidth}
                      height={imageHeight}
                      className="rounded-lg w-full h-auto object-contain"
                      priority
                      unoptimized
                      sizes="(max-width: 1024px) 100vw, 720px"
                    />
                  </div>
                )}

                <div>
                  <h3 className="font-syro-display font-semibold text-2xl text-syro-blue mb-6">
                    {member.name}
                  </h3>

                  <div className="prose prose-lg max-w-none">
                    {member.body ? (
                      <div
                        className="font-syro-primary text-syro-dark-gray leading-relaxed [&_p]:mb-4 [&_p]:leading-relaxed"
                        dangerouslySetInnerHTML={{ __html: member.body }}
                      />
                    ) : member.excerpt ? (
                      <p className="font-syro-primary text-syro-dark-gray leading-relaxed mb-4">
                        {member.excerpt}
                      </p>
                    ) : null}

                    {hasContact && (
                      <div className="mt-6 pt-6 border-t border-syro-table-border">
                        {member.address && (
                          <p className="font-syro-primary text-syro-dark-gray leading-relaxed mb-2 whitespace-pre-line">
                            Address: {formatAddress(member.address)}
                          </p>
                        )}
                        {member.phones && (
                          <p className="font-syro-primary text-syro-dark-gray leading-relaxed mb-2">
                            {splitContactValues(member.phones).map((phone, i) => (
                              <span key={phone}>
                                {i > 0 ? ', ' : 'Phone: '}
                                {phone}
                              </span>
                            ))}
                          </p>
                        )}
                        {member.email && (
                          <p className="font-syro-primary text-syro-dark-gray leading-relaxed mb-2">
                            Email:{' '}
                            {splitContactValues(member.email).map((email, i) => (
                              <span key={email}>
                                {i > 0 ? ', ' : null}
                                <a
                                  href={`mailto:${email}`}
                                  className="text-syro-blue hover:underline focus:outline-none focus:ring-2 focus:ring-syro-red focus:ring-offset-2 rounded"
                                >
                                  {email}
                                </a>
                              </span>
                            ))}
                          </p>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <div className="mt-8 hidden lg:block">
                <QuickLinks />
              </div>
            </div>

            <div className="space-y-6 lg:col-span-1">
              <HolySynodCmsSidebar members={sidebarMembers} />
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

import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import QuickLinks from '@/components/holy-synod/QuickLinks';
import TheChurchSidebar from '../TheChurchSidebar';

export const metadata = {
  title: 'The Throne of St. Thomas',
  description:
    "The concept of the Throne of St. Thomas is based on the words of our Lord—the twelve thrones promised to the apostles and the authority shared by all bishops in the Church.",
};

const ThroneOfStThomasPage = () => {
  return (
    <div className="bg-background">
      {/* Hero Section - MOSC styling */}
      <section className="py-16 bg-gradient-to-br from-background to-muted">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-6 sacred-shadow-lg border border-border/50">
              <svg
                className="w-10 h-10 text-primary"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                aria-hidden="true"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.747 5.754 18 7.5 18s3.332.747 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.747 18.247 18 16.5 18c-1.746 0-3.332.747-4.5 1.253"
                />
              </svg>
            </div>
            <h1 className="font-heading font-semibold text-4xl text-foreground mb-4">
              The Throne of St. Thomas
            </h1>
            <p className="font-body text-lg text-muted-foreground max-w-3xl mx-auto leading-relaxed">
              The concept of the &apos;Throne of St. Thomas&apos; is based on the words of our Lord
              Himself—the twelve thrones promised to the apostles and the apostolic authority shared
              by all bishops in the Church.
            </p>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <section className="py-16 bg-card">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
            <div className="lg:col-span-3">
              <div className="bg-background rounded-lg sacred-shadow p-8">
                {/* Featured Image - centered, contained */}
                <div className="mb-8 flex justify-center">
                  <div className="relative w-full max-w-[280px] h-auto">
                    <Image
                      src="/images/church/throne_of_st_thomas.jpg"
                      alt="The Throne of St. Thomas"
                      width={280}
                      height={180}
                      className="w-full h-auto object-contain rounded-lg"
                    />
                  </div>
                </div>

                <div className="prose prose-lg max-w-none">
                  <p className="font-body text-muted-foreground leading-relaxed mb-6">
                    The concept of the &apos;Throne of St. Thomas&apos; is based on the words of our
                    Lord Himself. In St. Matthew 19:28 it is written that &apos;Jesus said to them:
                    Amen, I say to you, you who have followed me, when the Son of Man is seated on
                    the throne of his glory in the rebirth, you yourselves shall also sit upon twelve
                    thrones ruling the twelve tribes of Israel&apos;. In Luke 22:28 our Lord says to
                    the twelve: &apos;You are those who have continued with me in trials. As my
                    Father appointed a Kingdom for me, so do I appoint for you that you may eat and
                    drink at my table in my Kingdom, and sit on thrones judging the twelve tribes of
                    Israel&apos;.
                  </p>

                  <p className="font-body text-muted-foreground leading-relaxed mb-6">
                    From these two passages it is quite clear that our Lord promised twelve thrones to
                    the twelve apostles and none of them was deprived of having the authority. Even
                    Judas Iscariot was promised a throne, but he fell from his honor and another
                    inherited his place. If the Twelve have thrones, then there can be no doubt at
                    all that St. Thomas the Apostle had also a throne.
                  </p>

                  <h2 className="font-heading font-semibold text-2xl text-foreground mb-4 mt-8">
                    The Meaning of &apos;Throne&apos;
                  </h2>
                  <p className="font-body text-muted-foreground leading-relaxed mb-6">
                    The word &apos;throne&apos; is derived from the Greek word &apos;Thronos&apos;
                    and the Syriac equivalent is &apos;kursyo&apos;. In Hebrew it is
                    &apos;kisse&apos;. The word primarily means the seat of authority of a king or a
                    prince or a judge. Both in Old Testament and in New Testament the word throne is
                    referred to the seat of authority (cf. 1 Kings 22:19; Isaiah 6:1; 1 Sam 4:1–13
                    etc.). In Revelation 4:2 we see a throne in heaven which is the seat of God and
                    in 4:4 we see twenty-four other thrones set around the throne of God. Twenty-four
                    elders were seated on the twenty-four thrones (4:4), clad in white garments and
                    with a golden crown on the head of each. The tradition of the Church says that
                    the twenty-four elders are the twelve tribal patriarchs of the Old Testament and
                    the twelve Apostles of the New Testament (Rev. 11:6). Thus by the word
                    &apos;throne&apos; it means the authority that proceeds from God bestowed upon
                    the disciples.
                  </p>

                  <h2 className="font-heading font-semibold text-2xl text-foreground mb-4 mt-8">
                    Biblical Assumptions
                  </h2>
                  <p className="font-body text-muted-foreground leading-relaxed mb-6">
                    The following assumptions can be drawn from the analysis of the above biblical
                    passages: The throne is the seat and symbol of authority and is primarily
                    applied to the highest of all authorities from whom every authority comes, i.e.,
                    the authority of God and therefore the Throne of God. In the Scriptural accounts
                    the throne of God is shared by Jesus Christ who sits at the right hand of God
                    the Father. He is ruler and the judge.
                  </p>

                  <p className="font-body text-muted-foreground leading-relaxed mb-6">
                    Jesus Christ shares his throne with others. In the book of Revelation
                    twenty-four elders share it with him. Jesus promises twelve thrones to the
                    twelve apostles. There is no indication in the Bible that the authority is
                    exclusively for any one of the disciples. It is a common heritage and privilege.
                    In this matter of throne, there is no difference between the authority vested on
                    St. Peter and St. Thomas. In the tradition of the Church also we do not hear very
                    much of the thrones of particular apostles; rather apostolic thrones are shared
                    by all the bishops. Every bishop succeeds to the Apostolic thrones of the whole
                    college of Apostles.
                  </p>

                  <h2 className="font-heading font-semibold text-2xl text-foreground mb-4 mt-8">
                    From Throne to Kathedra
                  </h2>
                  <p className="font-body text-muted-foreground leading-relaxed mb-6">
                    During the course of time, the word &apos;throne&apos; gradually gave place to
                    another Greek word for the seat of authority—&apos;kathedra&apos;. It is used in
                    Matthew 23:2 for the seat of Moses or the place of the teaching authority of the
                    Mosaic Law. The word &apos;Cathedral&apos; comes from &apos;kathedra&apos; which
                    in Christian use means a bishop&apos;s chair. A cathedral is not simply a large
                    church, but a church which has the bishop&apos;s throne in it as a symbol of
                    authority or &apos;throne&apos;. Every bishop possesses the authority given by
                    the Church and for the Church. No bishop has any authority independent of the
                    Church; it is the authority of the Church that they exercise in the Church.
                  </p>

                  <div className="bg-muted/30 rounded-lg p-6 mt-8 border border-border/50">
                    <p className="font-body text-muted-foreground leading-relaxed text-sm italic">
                      (The above article is prepared by H.G. Dr. Zachariah Mar Aprem based on a paper
                      submitted by the late lamented Metropolitan Dr. Paulose Mar Gregorios to the
                      Holy Episcopal Synod in 1974.)
                    </p>
                  </div>
                </div>
              </div>

              <div className="mt-8 hidden lg:block">
                <QuickLinks />
              </div>
            </div>

            {/* Sidebar - The Church (all subpages, like mosc.in) */}
            <div className="lg:col-span-1">
              <TheChurchSidebar />
            </div>
          </div>
          {/* Quick Links - mobile only: just above footer */}
          <div className="mt-8 lg:hidden">
            <QuickLinks />
          </div>
        </div>
      </section>
    </div>
  );
};

export default ThroneOfStThomasPage;

import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import TheChurchSidebar from '../TheChurchSidebar';

export const metadata = {
  title: 'Sacraments',
  description: 'The seven sacraments and their significance.',
};

const SacramentsPage = () => {
  const sacraments = [
    {
      name: 'Baptism',
      description: 'The sacrament of initiation into the Christian faith, washing away original sin and incorporating the person into the Body of Christ.',
      icon: '💧'
    },
    {
      name: 'Chrismation',
      description: 'The sacrament of confirmation, sealing the baptized with the gift of the Holy Spirit and completing their initiation.',
      icon: '🕊️'
    },
    {
      name: 'Holy Eucharist',
      description: 'The central sacrament of the Church, where we receive the Body and Blood of Christ for our spiritual nourishment.',
      icon: '🍞'
    },
    {
      name: 'Confession',
      description: 'The sacrament of repentance and forgiveness, where we confess our sins and receive absolution from the priest.',
      icon: '🙏'
    },
    {
      name: 'Holy Unction',
      description: 'The sacrament of healing for the sick, both physically and spiritually, through anointing with holy oil.',
      icon: '🩹'
    },
    {
      name: 'Holy Matrimony',
      description: 'The sacrament of marriage, uniting a man and woman in holy matrimony before God and the Church.',
      icon: '💒'
    },
    {
      name: 'Holy Orders',
      description: 'The sacrament of ordination, conferring the grace and authority to serve as deacon, priest, or bishop.',
      icon: '👨‍💼'
    }
  ];

  return (
    <div className="bg-background">
      {/* Hero Section */}
      <section className="py-16 bg-gradient-to-br from-background to-muted">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="w-20 h-20 bg-primary rounded-lg flex items-center justify-center mx-auto mb-6 sacred-shadow-lg">
              <span className="text-primary-foreground text-4xl font-bold" role="img" aria-label="Sacraments">💒</span>
            </div>
            <h1 className="font-heading font-semibold text-4xl text-foreground mb-4">
              Sacraments
            </h1>
            <p className="font-body text-lg text-muted-foreground max-w-3xl mx-auto leading-relaxed">
              The seven sacraments and their significance.
            </p>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <section className="py-16 bg-card">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
            {/* Main Content */}
            <div className="lg:col-span-3">
              <div className="bg-background rounded-lg sacred-shadow p-8">
                {/* Featured Image */}
                <div className="mb-8">
                  <Image
                    src="/images/church/sacraments.jpg"
                    alt="Sacraments"
                    width={500}
                    height={300}
                    className="rounded-lg sacred-shadow w-full h-auto"
                    priority
                  />
                </div>

                {/* Content */}
                <div className="prose prose-lg max-w-none">
                  <h2 className="font-heading font-semibold text-2xl text-foreground mb-6">
                    The Seven Holy Mysteries
                  </h2>

                  <p className="font-body text-muted-foreground leading-relaxed mb-8">
                    The Orthodox Church recognizes seven sacraments, which are called "mysteries" (roze-d-idtho 
                    in Syriac). These are sacred rites instituted by Christ Himself, through which divine grace 
                    is imparted to the faithful. Each sacrament is a visible sign of an invisible grace, and 
                    through them, we participate in the divine life of God.
                  </p>

                  {/* Sacraments Grid */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                    {sacraments.map((sacrament, index) => (
                      <div key={index} className="bg-muted/30 rounded-lg p-6 hover:bg-muted/50 reverent-transition">
                        <div className="flex items-start space-x-4">
                          <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0">
                            <span className="text-2xl" role="img" aria-label={sacrament.name}>{sacrament.icon}</span>
                          </div>
                          <div>
                            <h3 className="font-heading font-semibold text-lg text-foreground mb-2">
                              {sacrament.name}
                            </h3>
                            <p className="font-body text-muted-foreground text-sm leading-relaxed">
                              {sacrament.description}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  <h3 className="font-heading font-semibold text-xl text-foreground mb-4">
                    The Nature of Sacraments
                  </h3>

                  <p className="font-body text-muted-foreground leading-relaxed mb-6">
                    In the Orthodox understanding, sacraments are not merely symbolic acts but are truly 
                    efficacious means of grace. They are channels through which God's grace flows into 
                    our lives, transforming us and making us partakers of the divine nature. The sacraments 
                    are celebrated within the community of the Church, and they require faith and proper 
                    preparation on the part of the recipient.
                  </p>

                  <h3 className="font-heading font-semibold text-xl text-foreground mb-4">
                    The Three Sacraments of Initiation
                  </h3>

                  <p className="font-body text-muted-foreground leading-relaxed mb-6">
                    Baptism, Chrismation, and Holy Eucharist are the three sacraments of initiation that 
                    bring a person into full membership in the Church. Baptism washes away original sin 
                    and incorporates the person into the Body of Christ. Chrismation seals the baptized 
                    with the gift of the Holy Spirit. Holy Eucharist nourishes the soul with the Body 
                    and Blood of Christ, maintaining our union with Him.
                  </p>

                  <h3 className="font-heading font-semibold text-xl text-foreground mb-4">
                    The Sacraments of Healing
                  </h3>

                  <p className="font-body text-muted-foreground leading-relaxed mb-6">
                    Confession and Holy Unction are the sacraments of healing. Confession provides 
                    spiritual healing through the forgiveness of sins, while Holy Unction offers 
                    healing for both body and soul, particularly for those who are ill or facing 
                    serious challenges in life.
                  </p>

                  <h3 className="font-heading font-semibold text-xl text-foreground mb-4">
                    The Sacraments of Service
                  </h3>

                  <p className="font-body text-muted-foreground leading-relaxed mb-6">
                    Holy Matrimony and Holy Orders are the sacraments of service. Holy Matrimony 
                    unites a man and woman in marriage, creating a sacred bond that reflects the 
                    relationship between Christ and His Church. Holy Orders confers the grace and 
                    authority to serve the Church in various ministries, from deacon to bishop.
                  </p>

                  <div className="bg-primary/5 rounded-lg p-6 mt-8">
                    <h4 className="font-heading font-semibold text-lg text-foreground mb-4">
                      The Importance of Sacraments
                    </h4>
                    <p className="font-body text-muted-foreground leading-relaxed">
                      The sacraments are essential to Orthodox Christian life. They are not optional 
                      extras but are fundamental to our spiritual growth and relationship with God. 
                      Through the sacraments, we receive the grace necessary for salvation and are 
                      strengthened in our journey toward union with God. They are the means by which 
                      the Church continues the work of Christ in the world, bringing healing, forgiveness, 
                      and divine life to all who receive them with faith and reverence.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Sidebar - The Church (all subpages, like mosc.in) */}
            <div className="lg:col-span-1">
              <TheChurchSidebar />

              {/* Quick Links */}
              <div className="bg-background rounded-lg sacred-shadow p-6">
                <h3 className="font-heading font-semibold text-lg text-foreground mb-4">
                  Quick Links
                </h3>
                <nav className="space-y-2">
                  <Link 
                    href="/mosc-old/downloads/kalpana" 
                    className="block px-3 py-2 text-muted-foreground hover:text-primary hover:bg-muted rounded-md font-body text-sm reverent-transition"
                  >
                    Kalpana
                  </Link>
                  <Link 
                    href="/mosc-old/downloads" 
                    className="block px-3 py-2 text-muted-foreground hover:text-primary hover:bg-muted rounded-md font-body text-sm reverent-transition"
                  >
                    Downloads
                  </Link>
                  <Link 
                    href="/mosc-old/institutions" 
                    className="block px-3 py-2 text-muted-foreground hover:text-primary hover:bg-muted rounded-md font-body text-sm reverent-transition"
                  >
                    Institutions
                  </Link>
                  <Link 
                    href="/mosc-old/training" 
                    className="block px-3 py-2 text-muted-foreground hover:text-primary hover:bg-muted rounded-md font-body text-sm reverent-transition"
                  >
                    Training
                  </Link>
                  <Link 
                    href="/mosc-old/publications" 
                    className="block px-3 py-2 text-muted-foreground hover:text-primary hover:bg-muted rounded-md font-body text-sm reverent-transition"
                  >
                    Publications
                  </Link>
                  <Link 
                    href="/mosc-old/spiritual" 
                    className="block px-3 py-2 text-muted-foreground hover:text-primary hover:bg-muted rounded-md font-body text-sm reverent-transition"
                  >
                    Spiritual Organisations
                  </Link>
                  <Link 
                    href="/mosc-old/theological" 
                    className="block px-3 py-2 text-muted-foreground hover:text-primary hover:bg-muted rounded-md font-body text-sm reverent-transition"
                  >
                    Theological Seminaries
                  </Link>
                  <Link 
                    href="/mosc-old/lectionary" 
                    className="block px-3 py-2 text-muted-foreground hover:text-primary hover:bg-muted rounded-md font-body text-sm reverent-transition"
                  >
                    Lectionary
                  </Link>
                  <Link 
                    href="/mosc-old/gallery" 
                    className="block px-3 py-2 text-muted-foreground hover:text-primary hover:bg-muted rounded-md font-body text-sm reverent-transition"
                  >
                    Gallery
                  </Link>
                  <Link 
                    href="/mosc-old/contact-info" 
                    className="block px-3 py-2 text-muted-foreground hover:text-primary hover:bg-muted rounded-md font-body text-sm reverent-transition"
                  >
                    Contact Info
                  </Link>
                  <Link 
                    href="/mosc-old/faqs" 
                    className="block px-3 py-2 text-muted-foreground hover:text-primary hover:bg-muted rounded-md font-body text-sm reverent-transition"
                  >
                    FAQs
                  </Link>
                </nav>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default SacramentsPage;

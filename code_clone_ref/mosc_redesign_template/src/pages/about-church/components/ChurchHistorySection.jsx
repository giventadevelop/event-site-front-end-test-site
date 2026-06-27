import React, { useState } from 'react';
import Icon from '../../../components/AppIcon';
import Image from '../../../components/AppImage';

const ChurchHistorySection = () => {
  const [expandedSection, setExpandedSection] = useState(null);

  const historyData = [
    {
      id: 'origins',
      title: 'Apostolic Origins',
      period: '52 AD - 4th Century',
      summary: 'Founded by St. Thomas the Apostle in 52 AD, establishing the first Christian community in India.',
      content: `The Malankara Orthodox Syrian Church traces its origins to the arrival of St. Thomas the Apostle in Kerala, India, in 52 AD. According to ancient tradition, St. Thomas landed at Muziris (modern-day Kodungallur) and established seven churches along the Malabar Coast.\n\nThese original churches became the foundation of what would later be known as the Saint Thomas Christian community. The early Christians maintained their unique identity while integrating with local culture, creating a distinctive form of Christianity that has endured for nearly two millennia.\n\nThe church preserved its apostolic traditions through centuries of foreign rule and cultural changes, maintaining its connection to the ancient Syrian Orthodox tradition while developing its own liturgical and theological characteristics.`,
      image: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400&h=300&fit=crop'
    },
    {
      id: 'syrian-connection',
      title: 'Syrian Orthodox Heritage',
      period: '4th - 16th Century',
      summary: 'Maintained communion with the Syrian Orthodox Church of Antioch, preserving ancient liturgical traditions.',
      content: `The Malankara Church maintained strong ties with the Syrian Orthodox Church of Antioch, receiving bishops and liturgical guidance from the Patriarch of Antioch. This connection ensured the preservation of ancient Syrian Christian traditions, including the use of Syriac language in liturgy.\n\nDuring this period, the church developed its distinctive identity as an Oriental Orthodox church, following the theological decisions of the first three Ecumenical Councils. The community grew and flourished under various rulers, maintaining its religious autonomy while adapting to changing political circumstances.\n\nThe Syrian connection brought rich theological traditions, monastic practices, and liturgical heritage that continue to define the church's identity today.`,image: 'https://images.unsplash.com/photo-1520637836862-4d197d17c93a?w=400&h=300&fit=crop'
    },
    {
      id: 'modern-era',title: 'Modern Development',period: '17th Century - Present',summary: 'Evolution into an autocephalous church while maintaining Orthodox traditions and expanding globally.',
      content: `The modern era began with significant challenges and transformations. The arrival of Portuguese colonizers in the 16th century brought pressure to conform to Roman Catholicism, leading to the famous Coonan Cross Oath in 1653, where a large portion of the community rejected foreign ecclesiastical control.\n\nIn 1912, the Malankara Orthodox Syrian Church was established as an autocephalous church under the Catholicos of the East, based in Kottayam, Kerala. This marked a new chapter of independence while maintaining Orthodox theological principles.\n\nToday, the church has expanded globally with parishes in North America, Europe, Australia, and the Middle East, serving the diaspora community while continuing its mission in India. The church operates numerous educational institutions, hospitals, and social service organizations.`,
      image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=300&fit=crop'
    }
  ];

  const toggleSection = (sectionId) => {
    setExpandedSection(expandedSection === sectionId ? null : sectionId);
  };

  return (
    <div className="bg-card rounded-lg sacred-shadow p-6 lg:p-8">
      <div className="flex items-center space-x-3 mb-6">
        <div className="w-10 h-10 bg-primary rounded-full flex items-center justify-center">
          <Icon name="BookOpen" size={20} color="white" />
        </div>
        <h2 className="text-2xl font-heading font-semibold text-foreground">Church History</h2>
      </div>
      <div className="space-y-4">
        {historyData?.map((section) => (
          <div key={section?.id} className="border border-border rounded-lg overflow-hidden">
            <button
              onClick={() => toggleSection(section?.id)}
              className="w-full px-6 py-4 text-left bg-muted/30 hover:bg-muted/50 reverent-transition flex items-center justify-between"
            >
              <div className="flex-1">
                <div className="flex items-center space-x-4 mb-2">
                  <h3 className="text-lg font-heading font-medium text-foreground">{section?.title}</h3>
                  <span className="text-sm font-body text-muted-foreground bg-muted px-2 py-1 rounded-full">
                    {section?.period}
                  </span>
                </div>
                <p className="text-sm font-body text-muted-foreground">{section?.summary}</p>
              </div>
              <Icon 
                name={expandedSection === section?.id ? "ChevronUp" : "ChevronDown"} 
                size={20} 
                className="text-muted-foreground ml-4" 
              />
            </button>

            {expandedSection === section?.id && (
              <div className="px-6 py-6 bg-card border-t border-border">
                <div className="grid lg:grid-cols-3 gap-6">
                  <div className="lg:col-span-2">
                    <div className="prose prose-sm max-w-none">
                      {section?.content?.split('\n\n')?.map((paragraph, index) => (
                        <p key={index} className="text-foreground font-body leading-relaxed mb-4">
                          {paragraph}
                        </p>
                      ))}
                    </div>
                  </div>
                  <div className="lg:col-span-1">
                    <div className="circular-frame overflow-hidden w-full h-48 lg:h-56">
                      <Image
                        src={section?.image}
                        alt={`${section?.title} historical image`}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default ChurchHistorySection;
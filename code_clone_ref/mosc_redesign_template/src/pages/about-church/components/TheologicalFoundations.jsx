import React, { useState } from 'react';
import Icon from '../../../components/AppIcon';

const TheologicalFoundations = () => {
  const [activeTab, setActiveTab] = useState('beliefs');

  const tabData = {
    beliefs: {
      title: 'Core Beliefs',
      icon: 'Cross',
      content: [
        {
          title: 'Trinity',
          description: 'We believe in one God in three persons: Father, Son, and Holy Spirit, co-equal and co-eternal.'
        },
        {
          title: 'Incarnation',
          description: 'Jesus Christ is true God and true man, united in one person without confusion or separation.'
        },
        {
          title: 'Salvation',
          description: 'Salvation is by grace through faith, accomplished by Christ\'s death and resurrection.'
        },
        {
          title: 'Scripture & Tradition',
          description: 'Holy Scripture and Sacred Tradition together form the foundation of our faith and practice.'
        },
        {
          title: 'Sacraments',
          description: 'Seven sacraments instituted by Christ for the sanctification of the faithful.'
        },
        {
          title: 'Resurrection',
          description: 'We believe in the resurrection of the dead and the life of the world to come.'
        }
      ]
    },
    liturgy: {
      title: 'Liturgical Tradition',
      icon: 'Music',
      content: [
        {
          title: 'Divine Liturgy',
          description: 'The Holy Qurbana (Divine Liturgy) is the central act of worship, celebrating the Eucharist.'
        },
        {
          title: 'Syriac Heritage',
          description: 'Ancient Syriac language and chants preserve our apostolic liturgical traditions.'
        },
        {
          title: 'Liturgical Calendar',
          description: 'Following the Oriental Orthodox calendar with seasons of fasting and celebration.'
        },
        {
          title: 'Canonical Hours',
          description: 'Daily prayer services marking the rhythm of monastic and parish life.'
        },
        {
          title: 'Feast Days',
          description: 'Celebration of major feasts honoring Christ, the Theotokos, and saints.'
        },
        {
          title: 'Sacred Music',
          description: 'Traditional chants and hymns that have been preserved for centuries.'
        }
      ]
    },
    theology: {
      title: 'Orthodox Theology',
      icon: 'BookOpen',
      content: [
        {
          title: 'Miaphysite Christology',
          description: 'Christ has one united nature that is both divine and human, following St. Cyril of Alexandria.'
        },
        {
          title: 'Theosis',
          description: 'The ultimate goal of Christian life is deification - participation in the divine nature.'
        },
        {
          title: 'Apostolic Succession',
          description: 'Unbroken chain of episcopal ordination from the apostles to present bishops.'
        },
        {
          title: 'Patristic Tradition',
          description: 'Following the teachings of the Church Fathers, especially the Oriental Orthodox tradition.'
        },
        {
          title: 'Ecumenical Councils',
          description: 'Accepting the first three Ecumenical Councils as authoritative for doctrine.'
        },
        {
          title: 'Mystical Theology',
          description: 'Emphasis on direct experience of God through prayer, contemplation, and sacraments.'
        }
      ]
    }
  };

  const tabs = Object.keys(tabData);

  return (
    <div className="bg-card rounded-lg sacred-shadow p-6 lg:p-8">
      <div className="flex items-center space-x-3 mb-6">
        <div className="w-10 h-10 bg-accent rounded-full flex items-center justify-center">
          <Icon name="Heart" size={20} color="white" />
        </div>
        <h2 className="text-2xl font-heading font-semibold text-foreground">Theological Foundations</h2>
      </div>
      {/* Tab Navigation */}
      <div className="flex flex-wrap gap-2 mb-6 border-b border-border">
        {tabs?.map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`flex items-center space-x-2 px-4 py-2 rounded-t-lg font-body font-medium reverent-transition ${
              activeTab === tab
                ? 'bg-primary text-primary-foreground border-b-2 border-primary'
                : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'
            }`}
          >
            <Icon name={tabData?.[tab]?.icon} size={16} />
            <span>{tabData?.[tab]?.title}</span>
          </button>
        ))}
      </div>
      {/* Tab Content */}
      <div className="min-h-[400px]">
        <div className="grid md:grid-cols-2 gap-6">
          {tabData?.[activeTab]?.content?.map((item, index) => (
            <div key={index} className="bg-muted/20 rounded-lg p-4 hover:bg-muted/30 reverent-transition">
              <h3 className="text-lg font-heading font-medium text-foreground mb-2">
                {item?.title}
              </h3>
              <p className="text-sm font-body text-muted-foreground leading-relaxed">
                {item?.description}
              </p>
            </div>
          ))}
        </div>
      </div>
      {/* Additional Information */}
      <div className="mt-8 p-4 bg-muted/20 rounded-lg">
        <div className="flex items-start space-x-3">
          <Icon name="Info" size={20} className="text-primary mt-1 flex-shrink-0" />
          <div>
            <h4 className="font-heading font-medium text-foreground mb-2">
              Oriental Orthodox Tradition
            </h4>
            <p className="text-sm font-body text-muted-foreground leading-relaxed">
              The Malankara Orthodox Syrian Church is part of the Oriental Orthodox family of churches, 
              which includes the Coptic, Armenian, Ethiopian, Eritrean, and Syriac Orthodox Churches. 
              We share a common theological heritage dating back to the early centuries of Christianity, 
              maintaining the faith as received from the apostles and preserved by the Church Fathers.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TheologicalFoundations;
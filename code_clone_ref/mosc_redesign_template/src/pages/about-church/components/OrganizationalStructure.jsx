import React from 'react';
import Icon from '../../../components/AppIcon';
import Image from '../../../components/AppImage';

const OrganizationalStructure = () => {
  const hierarchyData = [
    {
      level: 1,
      title: 'Catholicos of the East',
      description: 'Supreme head of the Malankara Orthodox Syrian Church',
      responsibilities: [
        'Spiritual leadership of the entire church',
        'Ordination of bishops and consecration of holy chrism',
        'Final authority in matters of faith and discipline',
        'Representation of the church in ecumenical relations'
      ],
      image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300&h=300&fit=crop',
      icon: 'Crown'
    },
    {
      level: 2,
      title: 'Metropolitan Bishops',
      description: 'Regional archbishops overseeing dioceses',
      responsibilities: [
        'Administration of assigned dioceses',
        'Ordination of priests and deacons',
        'Pastoral care of clergy and faithful',
        'Implementation of church policies'
      ],
      image: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=300&h=300&fit=crop',
      icon: 'Users'
    },
    {
      level: 3,
      title: 'Parish Priests',
      description: 'Local clergy serving individual parishes',
      responsibilities: [
        'Celebration of Divine Liturgy and sacraments',
        'Pastoral care of parishioners',
        'Religious education and preaching',
        'Community leadership and guidance'
      ],
      image: 'https://images.unsplash.com/photo-1520637836862-4d197d17c93a?w=300&h=300&fit=crop',
      icon: 'Church'
    },
    {
      level: 4,
      title: 'Deacons & Lay Leaders',
      description: 'Assisting clergy and lay ministry leaders',
      responsibilities: [
        'Assistance in liturgical services',
        'Parish administration and coordination',
        'Youth and family ministry programs',
        'Community outreach and social services'
      ],
      image: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=300&h=300&fit=crop',
      icon: 'HandHeart'
    }
  ];

  const organizationalStats = [
    { label: 'Dioceses Worldwide', value: '30+', icon: 'MapPin' },
    { label: 'Parishes', value: '1,200+', icon: 'Church' },
    { label: 'Clergy Members', value: '800+', icon: 'Users' },
    { label: 'Countries', value: '25+', icon: 'Globe' }
  ];

  return (
    <div className="bg-card rounded-lg sacred-shadow p-6 lg:p-8">
      <div className="flex items-center space-x-3 mb-6">
        <div className="w-10 h-10 bg-secondary rounded-full flex items-center justify-center">
          <Icon name="Layers" size={20} color="white" />
        </div>
        <h2 className="text-2xl font-heading font-semibold text-foreground">Organizational Structure</h2>
      </div>
      {/* Statistics Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {organizationalStats?.map((stat, index) => (
          <div key={index} className="bg-muted/20 rounded-lg p-4 text-center">
            <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center mx-auto mb-2">
              <Icon name={stat?.icon} size={16} color="white" />
            </div>
            <div className="text-2xl font-heading font-bold text-primary mb-1">{stat?.value}</div>
            <div className="text-xs font-body text-muted-foreground">{stat?.label}</div>
          </div>
        ))}
      </div>
      {/* Hierarchy Structure */}
      <div className="space-y-6">
        {hierarchyData?.map((level, index) => (
          <div key={level?.level} className="relative">
            {/* Connection Line */}
            {index < hierarchyData?.length - 1 && (
              <div className="absolute left-6 top-20 w-0.5 h-16 bg-border hidden lg:block"></div>
            )}
            
            <div className="flex flex-col lg:flex-row lg:items-start space-y-4 lg:space-y-0 lg:space-x-6">
              {/* Level Indicator & Image */}
              <div className="flex items-center space-x-4 lg:flex-col lg:space-x-0 lg:space-y-4 lg:items-center">
                <div className="w-12 h-12 bg-primary rounded-full flex items-center justify-center flex-shrink-0">
                  <Icon name={level?.icon} size={20} color="white" />
                </div>
                <div className="circular-frame overflow-hidden w-16 h-16 lg:w-20 lg:h-20 flex-shrink-0">
                  <Image
                    src={level?.image}
                    alt={`${level?.title} representative`}
                    className="w-full h-full object-cover"
                  />
                </div>
              </div>

              {/* Content */}
              <div className="flex-1 bg-muted/20 rounded-lg p-4 lg:p-6">
                <div className="flex items-center space-x-3 mb-3">
                  <h3 className="text-xl font-heading font-semibold text-foreground">
                    {level?.title}
                  </h3>
                  <span className="text-xs font-body bg-primary text-primary-foreground px-2 py-1 rounded-full">
                    Level {level?.level}
                  </span>
                </div>
                
                <p className="text-sm font-body text-muted-foreground mb-4 leading-relaxed">
                  {level?.description}
                </p>

                <div>
                  <h4 className="text-sm font-heading font-medium text-foreground mb-2">
                    Key Responsibilities:
                  </h4>
                  <ul className="space-y-1">
                    {level?.responsibilities?.map((responsibility, idx) => (
                      <li key={idx} className="flex items-start space-x-2 text-sm font-body text-muted-foreground">
                        <Icon name="Check" size={14} className="text-success mt-0.5 flex-shrink-0" />
                        <span>{responsibility}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
      {/* Additional Information */}
      <div className="mt-8 p-4 bg-accent/10 rounded-lg border border-accent/20">
        <div className="flex items-start space-x-3">
          <Icon name="Info" size={20} className="text-accent mt-1 flex-shrink-0" />
          <div>
            <h4 className="font-heading font-medium text-foreground mb-2">
              Synodical Governance
            </h4>
            <p className="text-sm font-body text-muted-foreground leading-relaxed">
              The Malankara Orthodox Syrian Church follows a synodical system of governance where major 
              decisions are made collectively by the Holy Synod, consisting of all bishops. This ensures 
              democratic participation while maintaining apostolic authority and traditional Orthodox 
              ecclesiastical structure.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrganizationalStructure;
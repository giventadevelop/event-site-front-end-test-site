import React from 'react';
import Icon from '../../../components/AppIcon';

const QuickFactsPanel = () => {
  const quickFacts = [
    {
      category: 'Foundation',
      facts: [
        { label: 'Established', value: '52 AD', icon: 'Calendar' },
        { label: 'Founder', value: 'St. Thomas the Apostle', icon: 'User' },
        { label: 'Autocephalous Since', value: '1912', icon: 'Crown' },
        { label: 'Headquarters', value: 'Kottayam, Kerala', icon: 'MapPin' }
      ]
    },
    {
      category: 'Global Presence',
      facts: [
        { label: 'Total Members', value: '2.5+ Million', icon: 'Users' },
        { label: 'Countries', value: '25+', icon: 'Globe' },
        { label: 'Dioceses', value: '30+', icon: 'Building' },
        { label: 'Parishes', value: '1,200+', icon: 'Church' }
      ]
    },
    {
      category: 'Traditions',
      facts: [
        { label: 'Liturgical Language', value: 'Syriac & Malayalam', icon: 'Languages' },
        { label: 'Calendar', value: 'Oriental Orthodox', icon: 'Calendar' },
        { label: 'Theological Tradition', value: 'Miaphysite', icon: 'BookOpen' },
        { label: 'Communion', value: 'Oriental Orthodox', icon: 'Heart' }
      ]
    }
  ];

  const keyDates = [
    { year: '52 AD', event: 'St. Thomas arrives in India' },
    { year: '1653', event: 'Coonan Cross Oath' },
    { year: '1912', event: 'Autocephalous status granted' },
    { year: '1958', event: 'Catholicos throne established' },
    { year: '2025', event: 'Continuing global expansion' }
  ];

  return (
    <div className="space-y-6">
      {/* Quick Facts Cards */}
      <div className="bg-card rounded-lg sacred-shadow p-6">
        <div className="flex items-center space-x-3 mb-6">
          <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center">
            <Icon name="Info" size={16} color="white" />
          </div>
          <h3 className="text-lg font-heading font-semibold text-foreground">Quick Facts</h3>
        </div>

        <div className="space-y-6">
          {quickFacts?.map((category, categoryIndex) => (
            <div key={categoryIndex}>
              <h4 className="text-sm font-heading font-medium text-primary mb-3 uppercase tracking-wide">
                {category?.category}
              </h4>
              <div className="grid grid-cols-1 gap-3">
                {category?.facts?.map((fact, factIndex) => (
                  <div key={factIndex} className="flex items-center justify-between p-3 bg-muted/20 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <Icon name={fact?.icon} size={16} className="text-muted-foreground" />
                      <span className="text-sm font-body text-muted-foreground">{fact?.label}</span>
                    </div>
                    <span className="text-sm font-body font-medium text-foreground">{fact?.value}</span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
      {/* Key Dates Timeline */}
      <div className="bg-card rounded-lg sacred-shadow p-6">
        <div className="flex items-center space-x-3 mb-6">
          <div className="w-8 h-8 bg-accent rounded-full flex items-center justify-center">
            <Icon name="Clock" size={16} color="white" />
          </div>
          <h3 className="text-lg font-heading font-semibold text-foreground">Key Dates</h3>
        </div>

        <div className="space-y-4">
          {keyDates?.map((date, index) => (
            <div key={index} className="flex items-start space-x-4">
              <div className="flex flex-col items-center">
                <div className="w-3 h-3 bg-primary rounded-full"></div>
                {index < keyDates?.length - 1 && (
                  <div className="w-0.5 h-8 bg-border mt-2"></div>
                )}
              </div>
              <div className="flex-1 pb-4">
                <div className="text-sm font-body font-medium text-primary mb-1">
                  {date?.year}
                </div>
                <div className="text-sm font-body text-muted-foreground">
                  {date?.event}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
      {/* Church Statistics */}
      <div className="bg-card rounded-lg sacred-shadow p-6">
        <div className="flex items-center space-x-3 mb-6">
          <div className="w-8 h-8 bg-secondary rounded-full flex items-center justify-center">
            <Icon name="BarChart3" size={16} color="white" />
          </div>
          <h3 className="text-lg font-heading font-semibold text-foreground">Church Statistics</h3>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="text-center p-4 bg-muted/20 rounded-lg">
            <div className="text-2xl font-heading font-bold text-primary mb-1">800+</div>
            <div className="text-xs font-body text-muted-foreground">Clergy</div>
          </div>
          <div className="text-center p-4 bg-muted/20 rounded-lg">
            <div className="text-2xl font-heading font-bold text-primary mb-1">150+</div>
            <div className="text-xs font-body text-muted-foreground">Institutions</div>
          </div>
          <div className="text-center p-4 bg-muted/20 rounded-lg">
            <div className="text-2xl font-heading font-bold text-primary mb-1">50+</div>
            <div className="text-xs font-body text-muted-foreground">Monasteries</div>
          </div>
          <div className="text-center p-4 bg-muted/20 rounded-lg">
            <div className="text-2xl font-heading font-bold text-primary mb-1">1973</div>
            <div className="text-xs font-body text-muted-foreground">Years of History</div>
          </div>
        </div>
      </div>
      {/* Contact Information */}
      <div className="bg-card rounded-lg sacred-shadow p-6">
        <div className="flex items-center space-x-3 mb-4">
          <div className="w-8 h-8 bg-success rounded-full flex items-center justify-center">
            <Icon name="Phone" size={16} color="white" />
          </div>
          <h3 className="text-lg font-heading font-semibold text-foreground">Contact</h3>
        </div>

        <div className="space-y-3">
          <div className="flex items-center space-x-3">
            <Icon name="MapPin" size={16} className="text-muted-foreground" />
            <div className="text-sm font-body text-muted-foreground">
              Catholicate Palace<br />
              Kottayam, Kerala 686001
            </div>
          </div>
          <div className="flex items-center space-x-3">
            <Icon name="Phone" size={16} className="text-muted-foreground" />
            <div className="text-sm font-body text-muted-foreground">
              +91 481 2563456
            </div>
          </div>
          <div className="flex items-center space-x-3">
            <Icon name="Mail" size={16} className="text-muted-foreground" />
            <div className="text-sm font-body text-muted-foreground">
              info@mosc.in
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default QuickFactsPanel;
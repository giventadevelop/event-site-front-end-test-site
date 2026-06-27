import React from 'react';
import Icon from '../../../components/AppIcon';

const SponsorsSection = () => {
  const sponsors = [
  {
    id: 1,
    name: "TechCorp Solutions",
    logo: "https://img.rocket.new/generatedImages/rocket_gen_img_1abda26b3-1762717812480.png",
    logoAlt: "TechCorp Solutions company logo featuring modern typography and blue geometric design",
    tier: "Platinum",
    website: "https://techcorp.example.com"
  },
  {
    id: 2,
    name: "InnovateHub",
    logo: "https://img.rocket.new/generatedImages/rocket_gen_img_1c9f3bdc1-1762717811815.png",
    logoAlt: "InnovateHub brand logo with orange and white color scheme and modern tech-inspired iconography",
    tier: "Gold",
    website: "https://innovatehub.example.com"
  },
  {
    id: 3,
    name: "Digital Dynamics",
    logo: "https://img.rocket.new/generatedImages/rocket_gen_img_1cbea7cdc-1762717813422.png",
    logoAlt: "Digital Dynamics corporate logo featuring gradient design with purple and blue elements",
    tier: "Gold",
    website: "https://digitaldynamics.example.com"
  },
  {
    id: 4,
    name: "FutureWorks Inc",
    logo: "https://img.rocket.new/generatedImages/rocket_gen_img_195288b9d-1762717812477.png",
    logoAlt: "FutureWorks Inc professional logo with clean typography and green accent colors",
    tier: "Silver",
    website: "https://futureworks.example.com"
  },
  {
    id: 5,
    name: "NextGen Enterprises",
    logo: "https://img.rocket.new/generatedImages/rocket_gen_img_1a7f95b3d-1762717811559.png",
    logoAlt: "NextGen Enterprises logo with modern design featuring red and gray color palette",
    tier: "Silver",
    website: "https://nextgen.example.com"
  },
  {
    id: 6,
    name: "CloudTech Partners",
    logo: "https://img.rocket.new/generatedImages/rocket_gen_img_19b287b91-1762717813293.png",
    logoAlt: "CloudTech Partners brand identity with cloud-inspired imagery and blue technology theme",
    tier: "Bronze",
    website: "https://cloudtech.example.com"
  }];


  const getTierColor = (tier) => {
    switch (tier) {
      case 'Platinum':
        return 'from-gray-400 to-gray-600';
      case 'Gold':
        return 'from-yellow-400 to-yellow-600';
      case 'Silver':
        return 'from-gray-300 to-gray-500';
      case 'Bronze':
        return 'from-orange-400 to-orange-600';
      default:
        return 'from-blue-400 to-blue-600';
    }
  };

  return (
    <section className="py-16 bg-gradient-to-br from-slate-50 to-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-12">
          <div className="flex items-center justify-center space-x-2 mb-4">
            <Icon name="Award" size={32} className="text-blue-600" />
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900">Our Sponsors</h2>
          </div>
          <p className="text-lg text-gray-600 max-w-3xl mx-auto leading-relaxed">
            We're grateful to our amazing sponsors who make this event possible. 
            Each partner brings unique value to our community and supports our mission of excellence.
          </p>
        </div>

        {/* Sponsors Grid - Each sponsor in its own line */}
        <div className="space-y-4">
          {sponsors?.map((sponsor) =>
          <div
            key={sponsor?.id}
            className="bg-white rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-100 group">

              <div className="flex flex-col md:flex-row items-center justify-between gap-6">
                {/* Sponsor Info */}
                <div className="flex items-center space-x-6">
                  {/* Logo */}
                  <div className="flex-shrink-0">
                    <div className="w-20 h-20 rounded-xl overflow-hidden bg-gray-100 border border-gray-200">
                      <img
                      src={sponsor?.logo}
                      alt={sponsor?.logoAlt}
                      className="w-full h-full object-cover" />

                    </div>
                  </div>
                  
                  {/* Name and Tier */}
                  <div>
                    <h3 className="text-xl font-bold text-gray-900 mb-2">{sponsor?.name}</h3>
                    <div className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium text-white bg-gradient-to-r ${getTierColor(sponsor?.tier)}`}>
                      <Icon name="Award" size={14} className="mr-1" />
                      {sponsor?.tier} Sponsor
                    </div>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex flex-col sm:flex-row gap-3">
                  <button
                  className="px-6 py-3 bg-gradient-to-r from-blue-500 to-indigo-500 text-white font-semibold rounded-full hover:from-blue-600 hover:to-indigo-600 transition-all duration-200 shadow-lg hover:shadow-xl flex items-center space-x-2"
                  onClick={() => window.open(sponsor?.website, '_blank')}>

                    <Icon name="ExternalLink" size={16} />
                    <span>Visit Website</span>
                  </button>
                  
                  <button className="px-6 py-3 border-2 border-gray-300 text-gray-700 font-semibold rounded-full hover:bg-gray-50 hover:border-gray-400 transition-all duration-200 flex items-center space-x-2">
                    <Icon name="Heart" size={16} />
                    <span>Learn More</span>
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Call to Action for Potential Sponsors */}
        <div className="mt-12 text-center">
          <div className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-2xl p-8 text-white">
            <h3 className="text-2xl font-bold mb-4">Become a Sponsor</h3>
            <p className="text-blue-100 mb-6 max-w-2xl mx-auto">
              Join our community of supporters and help us create amazing experiences. 
              Various sponsorship packages available to meet your needs.
            </p>
            <button className="bg-white text-blue-600 font-semibold py-3 px-8 rounded-full hover:bg-gray-50 transition-all duration-200 shadow-lg hover:shadow-xl flex items-center space-x-2 mx-auto">
              <Icon name="Plus" size={20} />
              <span>Become a Sponsor</span>
            </button>
          </div>
        </div>
      </div>
    </section>);

};

export default SponsorsSection;
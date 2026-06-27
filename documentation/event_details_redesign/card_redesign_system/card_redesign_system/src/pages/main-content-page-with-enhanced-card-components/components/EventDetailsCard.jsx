import React from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';

const EventDetailsCard = () => {
  const featuredArtists = [
    "Swasika", "Afsal", "Mokksha", "Akhila Anand", "Veda Mithra", 
    "Sidhique Roshan", "Kukku", "Minnale Nazeer", "Shiju", 
    "Vipin Kumar", "Jojo Mathew", "Suneeshmon"
  ];

  return (
    <div className="bg-gradient-to-br from-orange-50 via-red-50 to-pink-50 rounded-3xl p-8 shadow-xl hover:shadow-2xl transition-all duration-300 border border-orange-100/50">
      {/* Header Section */}
      <div className="text-center mb-8">
        <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-orange-500 to-red-500 rounded-2xl mb-4">
          <Icon name="Sparkles" size={32} color="white" />
        </div>
        <h3 className="text-2xl md:text-3xl font-bold text-gray-800 mb-2">
          Spark of Kerala
        </h3>
        <div className="inline-block bg-gradient-to-r from-orange-500 to-red-500 text-white px-4 py-2 rounded-full text-sm font-medium mb-4">
          Performance Arts & Rhythm
        </div>
      </div>
      {/* Event Description */}
      <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-6 mb-6">
        <p className="text-gray-700 leading-relaxed text-center">
          "Spark of Kerala," a showcase of performance arts and rhythm organized by MCEFEE, 
          taking place in the USA from August to September 2025.
        </p>
      </div>
      {/* Event Details */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-white/70 backdrop-blur-sm rounded-xl p-4 text-center">
          <Icon name="MapPin" size={20} className="text-orange-500 mx-auto mb-2" />
          <p className="text-sm font-medium text-gray-600">Location</p>
          <p className="text-gray-800 font-semibold">USA</p>
        </div>
        <div className="bg-white/70 backdrop-blur-sm rounded-xl p-4 text-center">
          <Icon name="Calendar" size={20} className="text-orange-500 mx-auto mb-2" />
          <p className="text-sm font-medium text-gray-600">Duration</p>
          <p className="text-gray-800 font-semibold">Aug - Sep 2025</p>
        </div>
        <div className="bg-white/70 backdrop-blur-sm rounded-xl p-4 text-center">
          <Icon name="Building" size={20} className="text-orange-500 mx-auto mb-2" />
          <p className="text-sm font-medium text-gray-600">Organizer</p>
          <p className="text-gray-800 font-semibold">MCEFEE</p>
        </div>
      </div>
      {/* Featured Artists */}
      <div className="mb-8">
        <h4 className="text-lg font-bold text-gray-800 mb-4 flex items-center">
          <Icon name="Star" size={20} className="text-orange-500 mr-2" />
          Featured Artists
        </h4>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          {featuredArtists?.map((artist, index) => (
            <div
              key={index}
              className="bg-gradient-to-r from-orange-100 to-red-100 rounded-lg px-3 py-2 text-center border border-orange-200/50"
            >
              <span className="text-sm font-medium text-gray-700">{artist}</span>
            </div>
          ))}
        </div>
      </div>
      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row gap-4">
        <Button
          variant="default"
          size="lg"
          className="flex-1 bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white font-semibold rounded-full shadow-lg hover:shadow-xl transition-all duration-200"
          iconName="Calendar"
          iconPosition="left"
        >
          Add to Calendar
        </Button>
        <Button
          variant="outline"
          size="lg"
          className="flex-1 border-2 border-orange-300 text-orange-600 hover:bg-orange-50 rounded-full font-semibold transition-all duration-200"
          iconName="Eye"
          iconPosition="left"
        >
          See Event Details
        </Button>
      </div>
    </div>
  );
};

export default EventDetailsCard;
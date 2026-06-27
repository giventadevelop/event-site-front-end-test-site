import React from 'react';
import Image from '../../../components/AppImage';
import Icon from '../../../components/AppIcon';

const FeaturedGuestCard = ({ guest }) => {
  return (
    <div className="bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 p-6 border border-white/20 hover:scale-[1.02]">
      <div className="flex items-start space-x-4">
        <div className="flex-shrink-0">
          <Image 
            className="w-16 h-16 rounded-full object-cover ring-2 ring-white shadow-md" 
            src={guest?.avatar} 
            alt={guest?.avatarAlt}
          />
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">{guest?.name}</h3>
          <p className="text-gray-600 text-sm leading-relaxed mb-4">{guest?.bio}</p>
          <div className="flex space-x-3">
            {guest?.socialLinks?.map((link, index) => (
              <a 
                key={index}
                href={link?.url}
                className="text-indigo-600 hover:text-indigo-800 transition-colors duration-200 p-2 hover:bg-indigo-50 rounded-lg"
                aria-label={`Visit ${guest?.name}'s ${link?.platform}`}
              >
                <Icon name={link?.icon} size={20} />
              </a>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default FeaturedGuestCard;
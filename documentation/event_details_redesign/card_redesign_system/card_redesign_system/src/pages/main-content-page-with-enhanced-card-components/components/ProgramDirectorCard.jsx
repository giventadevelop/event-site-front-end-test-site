import React from 'react';
import Image from '../../../components/AppImage';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';

const ProgramDirectorCard = ({ director }) => {
  return (
    <div className="bg-gradient-to-br from-rose-50 via-pink-50 to-orange-50 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 p-6 border border-white/20 hover:scale-[1.02]">
      <div className="text-center">
        <div className="mb-4">
          <Image 
            className="w-20 h-20 rounded-full object-cover mx-auto ring-2 ring-white shadow-md" 
            src={director?.avatar} 
            alt={director?.avatarAlt}
          />
        </div>
        
        <h3 className="text-lg font-semibold text-gray-900 mb-1">{director?.name}</h3>
        <p className="text-rose-600 font-medium text-sm mb-3">{director?.title}</p>
        <p className="text-gray-600 text-sm leading-relaxed mb-4">{director?.bio}</p>
        
        {director?.expertise && (
          <div className="mb-4">
            <div className="flex flex-wrap justify-center gap-2">
              {director?.expertise?.map((skill, index) => (
                <span 
                  key={index}
                  className="px-2 py-1 bg-rose-100 text-rose-700 text-xs rounded-full font-medium"
                >
                  {skill}
                </span>
              ))}
            </div>
          </div>
        )}
        
        <div className="flex justify-center space-x-3 mb-4">
          {director?.socialLinks?.map((link, index) => (
            <a 
              key={index}
              href={link?.url}
              className="text-rose-600 hover:text-rose-800 transition-colors duration-200 p-2 hover:bg-rose-50 rounded-lg"
              aria-label={`Visit ${director?.name}'s ${link?.platform}`}
            >
              <Icon name={link?.icon} size={20} />
            </a>
          ))}
        </div>
        
        <Button 
          variant="default" 
          className="bg-gradient-to-r from-rose-500 to-pink-500 hover:from-rose-600 hover:to-pink-600 text-white font-medium shadow-md hover:shadow-lg"
          iconName="User"
          iconPosition="left"
        >
          View Profile
        </Button>
      </div>
    </div>
  );
};

export default ProgramDirectorCard;
import React from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';

const ContactInfoCard = ({ contact }) => {
  return (
    <div className="bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-50 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 p-6 border border-white/20 hover:scale-[1.02]">
      <div className="space-y-4">
        <h3 className="text-xl font-semibold text-gray-900 mb-4">Contact Information</h3>
        
        <div className="space-y-3">
          <div className="flex items-center space-x-3">
            <div className="flex-shrink-0 w-8 h-8 bg-emerald-100 rounded-lg flex items-center justify-center">
              <Icon name="Phone" size={16} className="text-emerald-600" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-900">Phone</p>
              <a 
                href={`tel:${contact?.phone}`} 
                className="text-emerald-600 hover:text-emerald-800 transition-colors duration-200 font-medium"
              >
                {contact?.phone}
              </a>
            </div>
          </div>
          
          <div className="flex items-center space-x-3">
            <div className="flex-shrink-0 w-8 h-8 bg-emerald-100 rounded-lg flex items-center justify-center">
              <Icon name="Mail" size={16} className="text-emerald-600" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-900">Email</p>
              <a 
                href={`mailto:${contact?.email}`} 
                className="text-emerald-600 hover:text-emerald-800 transition-colors duration-200 font-medium"
              >
                {contact?.email}
              </a>
            </div>
          </div>
          
          <div className="flex items-start space-x-3">
            <div className="flex-shrink-0 w-8 h-8 bg-emerald-100 rounded-lg flex items-center justify-center mt-1">
              <Icon name="MapPin" size={16} className="text-emerald-600" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-900">Location</p>
              <p className="text-gray-600 text-sm leading-relaxed">{contact?.address}</p>
            </div>
          </div>

          {contact?.hours && (
            <div className="flex items-start space-x-3">
              <div className="flex-shrink-0 w-8 h-8 bg-emerald-100 rounded-lg flex items-center justify-center mt-1">
                <Icon name="Clock" size={16} className="text-emerald-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-900">Business Hours</p>
                <p className="text-gray-600 text-sm leading-relaxed">{contact?.hours}</p>
              </div>
            </div>
          )}
        </div>
        
        <div className="pt-4 border-t border-emerald-100">
          <Button 
            variant="default" 
            fullWidth 
            className="bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white font-medium shadow-md hover:shadow-lg"
            iconName="MessageCircle"
            iconPosition="left"
          >
            Get in Touch
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ContactInfoCard;
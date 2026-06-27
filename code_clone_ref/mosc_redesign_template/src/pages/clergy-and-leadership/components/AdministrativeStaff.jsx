import React from 'react';
import Image from '../../../components/AppImage';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';

const AdministrativeStaff = () => {
  const administrativeStaff = [
    {
      id: 1,
      name: "Mr. Thomas Mathew",
      position: "Church Administrator",
      department: "Administration",
      email: "admin@mosc.in",
      phone: "+91-9876543210",
      image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=300&h=300",
      responsibilities: ["Financial Management", "Property Maintenance", "Event Coordination"],
      experience: "15 years"
    },
    {
      id: 2,
      name: "Mrs. Sarah John",
      position: "Education Coordinator",
      department: "Christian Education",
      email: "education@mosc.in",
      phone: "+91-9876543211",
      image: "https://images.unsplash.com/photo-1494790108755-2616b612b786?auto=format&fit=crop&w=300&h=300",
      responsibilities: ["Sunday School Programs", "Youth Ministry", "Adult Education"],
      experience: "12 years"
    },
    {
      id: 3,
      name: "Mr. Joseph Abraham",
      position: "Music Director",
      department: "Liturgical Music",
      email: "music@mosc.in",
      phone: "+91-9876543212",
      image: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=300&h=300",
      responsibilities: ["Choir Direction", "Liturgical Music", "Music Education"],
      experience: "20 years"
    },
    {
      id: 4,
      name: "Mrs. Mary George",
      position: "Women\'s Ministry Coordinator",
      department: "Women\'s Fellowship",
      email: "womens@mosc.in",
      phone: "+91-9876543213",
      image: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&w=300&h=300",
      responsibilities: ["Women\'s Programs", "Community Outreach", "Social Services"],
      experience: "10 years"
    },
    {
      id: 5,
      name: "Mr. David Samuel",
      position: "Youth Ministry Leader",
      department: "Youth Programs",
      email: "youth@mosc.in",
      phone: "+91-9876543214",
      image: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=300&h=300",
      responsibilities: ["Youth Activities", "Sports Programs", "Leadership Development"],
      experience: "8 years"
    },
    {
      id: 6,
      name: "Mrs. Rachel Thomas",
      position: "Communications Manager",
      department: "Communications",
      email: "communications@mosc.in",
      phone: "+91-9876543215",
      image: "https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?auto=format&fit=crop&w=300&h=300",
      responsibilities: ["Website Management", "Social Media", "Publications"],
      experience: "6 years"
    }
  ];

  return (
    <div className="bg-card rounded-lg p-6 sacred-shadow">
      <div className="mb-8">
        <h3 className="text-2xl font-heading font-semibold text-foreground mb-2">
          Administrative Staff
        </h3>
        <p className="text-muted-foreground font-body">
          Dedicated professionals supporting church operations and ministry programs
        </p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {administrativeStaff?.map((staff) => (
          <div
            key={staff?.id}
            className="bg-background rounded-lg p-5 border border-border reverent-transition reverent-hover"
          >
            {/* Staff Image and Basic Info */}
            <div className="text-center mb-4">
              <div className="w-20 h-20 mx-auto mb-3 circular-frame overflow-hidden bg-muted">
                <Image
                  src={staff?.image}
                  alt={staff?.name}
                  className="w-full h-full object-cover"
                />
              </div>
              <h4 className="font-heading font-semibold text-foreground mb-1">
                {staff?.name}
              </h4>
              <p className="text-primary font-medium text-sm mb-1">
                {staff?.position}
              </p>
              <p className="text-xs text-muted-foreground">
                {staff?.department}
              </p>
            </div>

            {/* Experience */}
            <div className="flex items-center justify-center space-x-2 mb-4">
              <Icon name="Clock" size={14} className="text-muted-foreground" />
              <span className="text-sm text-muted-foreground">
                {staff?.experience} experience
              </span>
            </div>

            {/* Responsibilities */}
            <div className="mb-4">
              <h5 className="text-sm font-medium text-foreground mb-2">
                Key Responsibilities:
              </h5>
              <ul className="space-y-1">
                {staff?.responsibilities?.map((responsibility, index) => (
                  <li key={index} className="flex items-start space-x-2">
                    <Icon name="CheckCircle" size={12} className="text-primary mt-0.5 flex-shrink-0" />
                    <span className="text-xs text-muted-foreground">
                      {responsibility}
                    </span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Contact Information */}
            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <Icon name="Mail" size={14} className="text-muted-foreground" />
                <a
                  href={`mailto:${staff?.email}`}
                  className="text-xs text-primary hover:text-primary/80 reverent-transition"
                >
                  {staff?.email}
                </a>
              </div>
              <div className="flex items-center space-x-2">
                <Icon name="Phone" size={14} className="text-muted-foreground" />
                <a
                  href={`tel:${staff?.phone}`}
                  className="text-xs text-primary hover:text-primary/80 reverent-transition"
                >
                  {staff?.phone}
                </a>
              </div>
            </div>

            {/* Contact Actions */}
            <div className="flex space-x-2 mt-4">
              <Button
                variant="outline"
                size="sm"
                iconName="Mail"
                iconPosition="left"
                onClick={() => window.location.href = `mailto:${staff?.email}`}
                className="flex-1"
              >
                Email
              </Button>
              <Button
                variant="outline"
                size="sm"
                iconName="Phone"
                iconPosition="left"
                onClick={() => window.location.href = `tel:${staff?.phone}`}
                className="flex-1"
              >
                Call
              </Button>
            </div>
          </div>
        ))}
      </div>
      {/* Contact Information Footer */}
      <div className="mt-8 pt-6 border-t border-border">
        <div className="text-center">
          <h4 className="font-heading font-medium text-foreground mb-2">
            General Administrative Contact
          </h4>
          <p className="text-sm text-muted-foreground mb-4">
            For general inquiries or to reach any department
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center space-y-2 sm:space-y-0 sm:space-x-6">
            <div className="flex items-center space-x-2">
              <Icon name="Mail" size={16} className="text-primary" />
              <a
                href="mailto:office@mosc.in"
                className="text-primary hover:text-primary/80 reverent-transition"
              >
                office@mosc.in
              </a>
            </div>
            <div className="flex items-center space-x-2">
              <Icon name="Phone" size={16} className="text-primary" />
              <a
                href="tel:+91-9876543200"
                className="text-primary hover:text-primary/80 reverent-transition"
              >
                +91-9876543200
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdministrativeStaff;
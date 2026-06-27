import React, { useState } from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';
import Input from '../../../components/ui/Input';
import Select from '../../../components/ui/Select';

const PastoralRequestForm = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    requestType: '',
    preferredClergy: '',
    urgency: '',
    message: '',
    preferredContact: ''
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const requestTypes = [
    { value: 'counseling', label: 'Spiritual Counseling' },
    { value: 'confession', label: 'Confession' },
    { value: 'blessing', label: 'House Blessing' },
    { value: 'prayer', label: 'Prayer Request' },
    { value: 'baptism', label: 'Baptism Inquiry' },
    { value: 'marriage', label: 'Marriage Counseling' },
    { value: 'funeral', label: 'Funeral Services' },
    { value: 'visitation', label: 'Hospital/Home Visit' },
    { value: 'other', label: 'Other' }
  ];

  const clergyOptions = [
    { value: 'any', label: 'Any Available Clergy' },
    { value: 'catholicos', label: 'His Holiness Catholicos' },
    { value: 'metropolitan', label: 'Metropolitan Bishop' },
    { value: 'parish-priest', label: 'Parish Priest' },
    { value: 'specific', label: 'Specific Clergy Member' }
  ];

  const urgencyLevels = [
    { value: 'routine', label: 'Routine (Within a week)' },
    { value: 'priority', label: 'Priority (Within 2-3 days)' },
    { value: 'urgent', label: 'Urgent (Within 24 hours)' },
    { value: 'emergency', label: 'Emergency (Immediate)' }
  ];

  const contactMethods = [
    { value: 'phone', label: 'Phone Call' },
    { value: 'email', label: 'Email' },
    { value: 'in-person', label: 'In-Person Meeting' },
    { value: 'video', label: 'Video Call' }
  ];

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSubmit = async (e) => {
    e?.preventDefault();
    setIsSubmitting(true);

    // Simulate form submission
    await new Promise(resolve => setTimeout(resolve, 2000));

    setIsSubmitting(false);
    setIsSubmitted(true);

    // Reset form after 3 seconds
    setTimeout(() => {
      setIsSubmitted(false);
      setFormData({
        name: '',
        email: '',
        phone: '',
        requestType: '',
        preferredClergy: '',
        urgency: '',
        message: '',
        preferredContact: ''
      });
    }, 3000);
  };

  if (isSubmitted) {
    return (
      <div className="bg-card rounded-lg p-6 sacred-shadow">
        <div className="text-center py-8">
          <div className="w-16 h-16 bg-success rounded-full flex items-center justify-center mx-auto mb-4">
            <Icon name="CheckCircle" size={32} color="white" />
          </div>
          <h3 className="text-xl font-heading font-semibold text-foreground mb-2">
            Request Submitted Successfully
          </h3>
          <p className="text-muted-foreground mb-4">
            Your pastoral request has been received. A member of our clergy will contact you soon.
          </p>
          <p className="text-sm text-muted-foreground">
            Reference ID: PR-{Date.now()?.toString()?.slice(-6)}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-card rounded-lg p-6 sacred-shadow">
      <div className="mb-6">
        <h3 className="text-2xl font-heading font-semibold text-foreground mb-2">
          Pastoral Request Form
        </h3>
        <p className="text-muted-foreground font-body">
          Submit a request for pastoral care, spiritual guidance, or church services
        </p>
      </div>
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Personal Information */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input
            label="Full Name"
            type="text"
            required
            value={formData?.name}
            onChange={(e) => handleInputChange('name', e?.target?.value)}
            placeholder="Enter your full name"
          />
          
          <Input
            label="Email Address"
            type="email"
            required
            value={formData?.email}
            onChange={(e) => handleInputChange('email', e?.target?.value)}
            placeholder="your.email@example.com"
          />
        </div>

        <Input
          label="Phone Number"
          type="tel"
          required
          value={formData?.phone}
          onChange={(e) => handleInputChange('phone', e?.target?.value)}
          placeholder="+91-XXXXXXXXXX"
        />

        {/* Request Details */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Select
            label="Type of Request"
            required
            options={requestTypes}
            value={formData?.requestType}
            onChange={(value) => handleInputChange('requestType', value)}
            placeholder="Select request type"
          />

          <Select
            label="Preferred Clergy"
            options={clergyOptions}
            value={formData?.preferredClergy}
            onChange={(value) => handleInputChange('preferredClergy', value)}
            placeholder="Select clergy preference"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Select
            label="Urgency Level"
            required
            options={urgencyLevels}
            value={formData?.urgency}
            onChange={(value) => handleInputChange('urgency', value)}
            placeholder="Select urgency level"
          />

          <Select
            label="Preferred Contact Method"
            required
            options={contactMethods}
            value={formData?.preferredContact}
            onChange={(value) => handleInputChange('preferredContact', value)}
            placeholder="How should we contact you?"
          />
        </div>

        {/* Message */}
        <div>
          <label className="block text-sm font-medium text-foreground mb-2">
            Message/Details
            <span className="text-destructive ml-1">*</span>
          </label>
          <textarea
            required
            value={formData?.message}
            onChange={(e) => handleInputChange('message', e?.target?.value)}
            placeholder="Please provide details about your request, including any specific needs or circumstances..."
            rows={4}
            className="w-full px-3 py-2 border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent bg-input text-foreground placeholder:text-muted-foreground"
          />
          <p className="text-xs text-muted-foreground mt-1">
            Please be as specific as possible to help us serve you better
          </p>
        </div>

        {/* Privacy Notice */}
        <div className="bg-muted rounded-lg p-4">
          <div className="flex items-start space-x-3">
            <Icon name="Shield" size={20} className="text-primary mt-0.5 flex-shrink-0" />
            <div>
              <h4 className="font-medium text-foreground text-sm mb-1">
                Privacy & Confidentiality
              </h4>
              <p className="text-xs text-muted-foreground">
                All pastoral requests are treated with strict confidentiality. Your information will only be shared with the assigned clergy member and will not be used for any other purposes.
              </p>
            </div>
          </div>
        </div>

        {/* Submit Button */}
        <div className="flex justify-end">
          <Button
            type="submit"
            loading={isSubmitting}
            iconName="Send"
            iconPosition="right"
            className="min-w-32"
          >
            {isSubmitting ? 'Submitting...' : 'Submit Request'}
          </Button>
        </div>
      </form>
      {/* Contact Information */}
      <div className="mt-8 pt-6 border-t border-border">
        <div className="bg-background rounded-lg p-4">
          <h4 className="font-heading font-medium text-foreground mb-3">
            Alternative Contact Methods
          </h4>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
            <div className="flex items-center space-x-2">
              <Icon name="Phone" size={16} className="text-primary" />
              <div>
                <span className="text-muted-foreground">Emergency:</span>
                <a href="tel:+91-9876543200" className="text-primary hover:text-primary/80 ml-2">
                  +91-9876543200
                </a>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <Icon name="Mail" size={16} className="text-primary" />
              <div>
                <span className="text-muted-foreground">Email:</span>
                <a href="mailto:pastoral@mosc.in" className="text-primary hover:text-primary/80 ml-2">
                  pastoral@mosc.in
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PastoralRequestForm;
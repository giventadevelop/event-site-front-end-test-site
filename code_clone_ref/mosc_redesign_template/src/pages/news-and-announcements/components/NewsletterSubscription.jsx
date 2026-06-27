import React, { useState } from 'react';
import Input from '../../../components/ui/Input';
import Button from '../../../components/ui/Button';
import Icon from '../../../components/AppIcon';

const NewsletterSubscription = () => {
  const [email, setEmail] = useState('');
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubscribe = async (e) => {
    e?.preventDefault();
    if (!email) return;

    setIsLoading(true);
    
    // Simulate API call
    setTimeout(() => {
      setIsSubscribed(true);
      setIsLoading(false);
      setEmail('');
    }, 1500);
  };

  if (isSubscribed) {
    return (
      <div className="bg-success/10 border border-success/20 rounded-lg p-6 text-center">
        <div className="w-16 h-16 bg-success rounded-full flex items-center justify-center mx-auto mb-4">
          <Icon name="Check" size={24} className="text-success-foreground" />
        </div>
        <h3 className="font-heading font-semibold text-lg text-success mb-2">
          Successfully Subscribed!
        </h3>
        <p className="text-success/80 font-body">
          You'll receive our latest announcements and updates via email.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-card rounded-lg sacred-shadow p-6">
      <div className="text-center mb-6">
        <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
          <Icon name="Mail" size={24} className="text-primary" />
        </div>
        <h3 className="font-heading font-semibold text-xl text-foreground mb-2">
          Stay Updated
        </h3>
        <p className="text-muted-foreground font-body">
          Subscribe to receive the latest church announcements and updates directly in your inbox.
        </p>
      </div>
      <form onSubmit={handleSubscribe} className="space-y-4">
        <Input
          type="email"
          label="Email Address"
          placeholder="Enter your email address"
          value={email}
          onChange={(e) => setEmail(e?.target?.value)}
          required
        />
        
        <Button
          type="submit"
          variant="default"
          size="lg"
          fullWidth
          loading={isLoading}
          iconName="Mail"
          iconPosition="left"
          disabled={!email}
        >
          Subscribe to Updates
        </Button>
      </form>
      <p className="text-xs text-muted-foreground text-center mt-4">
        We respect your privacy. Unsubscribe at any time.
      </p>
    </div>
  );
};

export default NewsletterSubscription;
'use client';

import React, { useState } from 'react';
import AppIcon from '../components/AppIcon';

interface FormErrors {
  reportName?: string;
  email?: string;
  notes?: string;
}

export default function CreatorAnalyticsPage() {
  const [dateRange, setDateRange] = useState<'7d' | '30d' | '90d' | 'all'>('30d');
  const [reportName, setReportName] = useState('');
  const [email, setEmail] = useState('');
  const [sortBy, setSortBy] = useState('views');
  const [notes, setNotes] = useState('');
  const [errors, setErrors] = useState<FormErrors>({});
  const [formStatus, setFormStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [formMessage, setFormMessage] = useState('');

  const handleFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    if (name === 'reportName') setReportName(value);
    else if (name === 'email') setEmail(value);
    else if (name === 'sortBy') setSortBy(value);
    else if (name === 'notes') setNotes(value);
    if (errors[name as keyof FormErrors]) {
      setErrors((prev) => ({ ...prev, [name]: undefined }));
    }
    if (formStatus !== 'idle') {
      setFormStatus('idle');
      setFormMessage('');
    }
  };

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};
    if (!reportName.trim()) newErrors.reportName = 'Report name is required';
    else if (reportName.trim().length < 2) newErrors.reportName = 'Report name must be at least 2 characters';
    if (!email.trim()) newErrors.email = 'Email is required';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) newErrors.email = 'Please enter a valid email address';
    if (notes.trim() && notes.trim().length < 10) newErrors.notes = 'Notes must be at least 10 characters if provided';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleApplyReport = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;
    setFormStatus('success');
    setFormMessage('Report settings applied. Your customized view has been updated.');
    setTimeout(() => {
      setFormStatus('idle');
      setFormMessage('');
    }, 5000);
  };

  // Mock analytics data - in real app, this would come from API
  const stats = {
    totalViews: 125000,
    totalSubscribers: 8500,
    totalRevenue: 12500.50,
    avgEngagement: 8.5,
    totalContent: 142,
    growthRate: 12.5
  };

  const recentContent = [
    { id: 1, title: 'How to Build a Brand', views: 12500, engagement: 9.2, revenue: 450.25 },
    { id: 2, title: 'Marketing Strategies 2024', views: 9800, engagement: 8.7, revenue: 320.50 },
    { id: 3, title: 'Content Creation Tips', views: 15200, engagement: 9.5, revenue: 580.75 },
  ];

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount);
  };

  const formatNumber = (num: number) => {
    if (num >= 1000000) {
      return (num / 1000000).toFixed(1) + 'M';
    }
    if (num >= 1000) {
      return (num / 1000).toFixed(1) + 'K';
    }
    return num.toString();
  };

  return (
    <div className="bg-background">
      {/* Hero Section with Gradient Background */}
      <section className="relative bg-gradient-to-br from-background to-muted py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Page Header */}
          <div className="text-center mb-12">
            <div className="flex items-center justify-center space-x-3 mb-6">
              <div className="w-12 h-12 bg-primary rounded-full flex items-center justify-center sacred-shadow">
                <AppIcon name="BarChart" size={32} className="text-primary-foreground" />
              </div>
            </div>
            <h1 className="font-heading font-semibold text-3xl lg:text-4xl text-foreground mb-4">
              Creator Analytics Dashboard
            </h1>
            <p className="font-body text-lg text-muted-foreground max-w-3xl mx-auto">
              Track your content performance, audience growth, and revenue metrics with comprehensive insights
            </p>
          </div>

          {/* Date Range Toggle */}
          <div className="flex justify-center items-center gap-4 mb-8">
            <span className={`font-body text-lg font-semibold transition-colors duration-300 reverent-transition ${dateRange !== '7d' ? 'text-primary' : 'text-muted-foreground'}`}>
              7 Days
            </span>
            <button
              onClick={() => setDateRange(dateRange === '7d' ? '30d' : dateRange === '30d' ? '90d' : dateRange === '90d' ? 'all' : '7d')}
              className={`relative inline-flex h-10 w-16 items-center rounded-full transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-offset-2 hover:scale-105 reverent-transition ${
                dateRange === '30d' || dateRange === '90d' || dateRange === 'all'
                  ? 'bg-primary focus:ring-ring'
                  : 'bg-accent focus:ring-ring'
              }`}
              title="Toggle Date Range"
              aria-label="Toggle Date Range"
            >
              <span
                className={`inline-flex items-center justify-center h-8 w-8 transform rounded-full bg-card transition-transform duration-300 sacred-shadow-sm ${
                  dateRange === '30d' || dateRange === '90d' || dateRange === 'all' ? 'translate-x-7' : 'translate-x-1'
                }`}
              >
                {(dateRange === '30d' || dateRange === '90d' || dateRange === 'all') ? (
                  <AppIcon name="Calendar" size={20} className={dateRange === '30d' || dateRange === '90d' || dateRange === 'all' ? 'text-primary' : 'text-accent'} />
                ) : (
                  <AppIcon name="Clock" size={20} className="text-accent" />
                )}
              </span>
            </button>
            <span className={`font-body text-lg font-semibold transition-colors duration-300 reverent-transition ${dateRange === '30d' || dateRange === '90d' || dateRange === 'all' ? 'text-primary' : 'text-muted-foreground'}`}>
              {dateRange === '30d' ? '30 Days' : dateRange === '90d' ? '90 Days' : 'All Time'}
            </span>
          </div>
        </div>
      </section>

      {/* Customize Report Form – MOSC form design system example */}
      <section className="py-16 bg-background">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-card rounded-lg sacred-shadow p-8 md:p-12">
            <div className="flex items-center space-x-4 mb-8">
              <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
                <AppIcon name="Settings" size={24} className="text-primary" />
              </div>
              <div>
                <h2 className="font-heading font-semibold text-2xl text-foreground">Customize Report</h2>
                <p className="font-body text-sm text-muted-foreground">
                  Save report settings and optionally email a summary
                </p>
              </div>
            </div>

            <form onSubmit={handleApplyReport} className="space-y-6">
              {/* Report Name – text input */}
              <div>
                <label htmlFor="reportName" className="block font-body font-medium text-foreground mb-2">
                  Report name <span className="text-destructive">*</span>
                </label>
                <input
                  type="text"
                  id="reportName"
                  name="reportName"
                  value={reportName}
                  onChange={handleFormChange}
                  className={`w-full px-4 py-3 bg-input border rounded-lg font-body text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 reverent-transition ${
                    errors.reportName ? 'border-destructive' : 'border-border'
                  }`}
                  placeholder="Enter a name for this report"
                />
                {errors.reportName && (
                  <p className="mt-2 inline-flex items-center gap-2 rounded-md bg-red-50 px-4 py-2 text-sm font-body text-red-700 border border-red-300">
                    <span className="inline-flex h-5 w-5 items-center justify-center rounded-full bg-red-600 text-white text-[11px] font-bold">
                      !
                    </span>
                    {errors.reportName}
                  </p>
                )}
              </div>

              {/* Email – email input */}
              <div>
                <label htmlFor="email" className="block font-body font-medium text-foreground mb-2">
                  Email report to <span className="text-destructive">*</span>
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={email}
                  onChange={handleFormChange}
                  className={`w-full px-4 py-3 bg-input border rounded-lg font-body text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 reverent-transition ${
                    errors.email ? 'border-destructive' : 'border-border'
                  }`}
                  placeholder="Enter your email address"
                />
                {errors.email && (
                  <p className="mt-2 inline-flex items-center gap-2 rounded-md bg-red-50 px-4 py-2 text-sm font-body text-red-700 border border-red-300">
                    <span className="inline-flex h-5 w-5 items-center justify-center rounded-full bg-red-600 text-white text-[11px] font-bold">
                      !
                    </span>
                    {errors.email}
                  </p>
                )}
              </div>

              {/* Sort by – select */}
              <div>
                <label htmlFor="sortBy" className="block font-body font-medium text-foreground mb-2">
                  Sort top content by
                </label>
                <select
                  id="sortBy"
                  name="sortBy"
                  value={sortBy}
                  onChange={handleFormChange}
                  className="w-full px-4 py-3 bg-input border border-border rounded-lg font-body text-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 reverent-transition"
                >
                  <option value="views">Views</option>
                  <option value="engagement">Engagement</option>
                  <option value="revenue">Revenue</option>
                </select>
              </div>

              {/* Notes – textarea */}
              <div>
                <label htmlFor="notes" className="block font-body font-medium text-foreground mb-2">
                  Notes <span className="text-muted-foreground text-sm font-normal">(optional)</span>
                </label>
                <textarea
                  id="notes"
                  name="notes"
                  value={notes}
                  onChange={handleFormChange}
                  rows={6}
                  className={`w-full px-4 py-3 bg-input border rounded-lg font-body text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 reverent-transition resize-none ${
                    errors.notes ? 'border-destructive' : 'border-border'
                  }`}
                  placeholder="Add notes or description for this report (min 10 characters if provided)"
                />
                {errors.notes && (
                  <p className="mt-2 inline-flex items-center gap-2 rounded-md bg-red-50 px-4 py-2 text-sm font-body text-red-700 border border-red-300">
                    <span className="inline-flex h-5 w-5 items-center justify-center rounded-full bg-red-600 text-white text-[11px] font-bold">
                      !
                    </span>
                    {errors.notes}
                  </p>
                )}
              </div>

              {/* Status message */}
              {formStatus !== 'idle' && (
                <div
                  className={`rounded-lg border px-4 py-3 sacred-shadow-sm ${
                    formStatus === 'success'
                      ? 'bg-emerald-50 border-emerald-300 text-emerald-700'
                      : 'bg-red-50 border-red-300 text-red-700'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <div className="mt-0.5 flex h-8 w-8 items-center justify-center rounded-full bg-white/90 sacred-shadow-sm flex-shrink-0">
                      {formStatus === 'success' ? (
                        <AppIcon name="Check" size={16} className="text-emerald-600" />
                      ) : (
                        <AppIcon name="X" size={16} className="text-red-600" />
                      )}
                    </div>
                    <div>
                      <p className="font-heading text-sm font-semibold">
                        {formStatus === 'success' ? 'Settings applied' : 'Something went wrong'}
                      </p>
                      <p className="mt-1 font-body text-sm text-muted-foreground">{formMessage}</p>
                    </div>
                  </div>
                </div>
              )}

              {/* Submit button */}
              <button
                type="submit"
                className="w-full bg-primary text-primary-foreground font-body font-medium px-6 py-3 rounded-lg hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 reverent-transition flex items-center justify-center space-x-2"
              >
                <AppIcon name="RefreshCw" size={20} className="text-primary-foreground" />
                <span>Apply &amp; Refresh</span>
              </button>
            </form>
          </div>
        </div>
      </section>

      {/* Stats Cards Section */}
      <section className="py-16 bg-card">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Stats Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8 mb-12">
            {/* Total Views Card */}
            <div className="bg-card rounded-lg sacred-shadow p-6 hover:sacred-shadow-lg reverent-transition text-center group">
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:bg-primary/20 reverent-transition">
                <AppIcon name="Eye" size={32} className="text-primary" />
              </div>
              <h3 className="font-heading font-bold text-4xl text-primary mb-2">{formatNumber(stats.totalViews)}</h3>
              <p className="font-body text-sm text-muted-foreground">Total Views</p>
            </div>

            {/* Total Subscribers Card */}
            <div className="bg-card rounded-lg sacred-shadow p-6 hover:sacred-shadow-lg reverent-transition text-center group">
              <div className="w-16 h-16 bg-success/10 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:bg-success/20 reverent-transition">
                <AppIcon name="Users" size={32} className="text-success" />
              </div>
              <h3 className="font-heading font-bold text-4xl text-success mb-2">{formatNumber(stats.totalSubscribers)}</h3>
              <p className="font-body text-sm text-muted-foreground">Subscribers</p>
            </div>

            {/* Total Revenue Card */}
            <div className="bg-card rounded-lg sacred-shadow p-6 hover:sacred-shadow-lg reverent-transition text-center group">
              <div className="w-16 h-16 bg-accent/10 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:bg-accent/20 reverent-transition">
                <AppIcon name="DollarSign" size={32} className="text-accent" />
              </div>
              <h3 className="font-heading font-bold text-4xl text-accent mb-2">{formatCurrency(stats.totalRevenue)}</h3>
              <p className="font-body text-sm text-muted-foreground">Total Revenue</p>
            </div>

            {/* Avg Engagement Card */}
            <div className="bg-card rounded-lg sacred-shadow p-6 hover:sacred-shadow-lg reverent-transition text-center group">
              <div className="w-16 h-16 bg-warning/10 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:bg-warning/20 reverent-transition">
                <AppIcon name="TrendingUp" size={32} className="text-warning" />
              </div>
              <h3 className="font-heading font-bold text-4xl text-warning mb-2">{stats.avgEngagement}%</h3>
              <p className="font-body text-sm text-muted-foreground">Avg Engagement</p>
            </div>
          </div>

          {/* Growth Metrics Section */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
            <div className="bg-gradient-to-br from-primary/10 via-primary/5 to-transparent rounded-lg sacred-shadow p-8 border border-primary/20">
              <div className="flex items-center space-x-3 mb-6">
                <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center">
                  <AppIcon name="ArrowUp" size={20} className="text-primary-foreground" />
                </div>
                <h3 className="font-heading font-semibold text-lg text-foreground">Growth Rate</h3>
              </div>
              <p className="font-heading font-bold text-3xl text-primary mb-2">{stats.growthRate}%</p>
              <p className="font-body text-muted-foreground leading-relaxed">Compared to last period</p>
            </div>

            <div className="bg-gradient-to-br from-success/10 via-success/5 to-transparent rounded-lg sacred-shadow p-8 border border-success/20">
              <div className="flex items-center space-x-3 mb-6">
                <div className="w-8 h-8 bg-success rounded-full flex items-center justify-center">
                  <AppIcon name="FileText" size={20} className="text-success-foreground" />
                </div>
                <h3 className="font-heading font-semibold text-lg text-foreground">Total Content</h3>
              </div>
              <p className="font-heading font-bold text-3xl text-success mb-2">{stats.totalContent}</p>
              <p className="font-body text-muted-foreground leading-relaxed">Published pieces</p>
            </div>
          </div>

          {/* Top Performing Content Section */}
          <div className="bg-card rounded-lg sacred-shadow p-8">
            <div className="flex items-center space-x-3 mb-6">
              <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center">
                <AppIcon name="Star" size={20} className="text-primary-foreground" />
              </div>
              <h3 className="font-heading font-semibold text-xl text-foreground">Top Performing Content</h3>
            </div>
            
            <div className="space-y-4">
              {recentContent.map((content) => (
                <div 
                  key={content.id} 
                  className="border border-border rounded-lg p-6 hover:sacred-shadow reverent-transition bg-card"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <h4 className="font-heading font-medium text-lg text-foreground mb-3">{content.title}</h4>
                      <div className="flex flex-wrap items-center gap-6 text-sm">
                        <span className="flex items-center gap-2 font-body text-muted-foreground">
                          <AppIcon name="Eye" size={16} className="text-primary" />
                          {formatNumber(content.views)} views
                        </span>
                        <span className="flex items-center gap-2 font-body text-muted-foreground">
                          <AppIcon name="TrendingUp" size={16} className="text-warning" />
                          {content.engagement}% engagement
                        </span>
                        <span className="flex items-center gap-2 font-body text-muted-foreground">
                          <AppIcon name="DollarSign" size={16} className="text-accent" />
                          {formatCurrency(content.revenue)}
                        </span>
                      </div>
                    </div>
                    <button
                      className="flex-shrink-0 w-10 h-10 rounded-lg bg-primary/10 hover:bg-primary/20 flex items-center justify-center transition-all duration-300 hover:scale-110 reverent-transition"
                      title="View Details"
                      aria-label="View content details"
                    >
                      <AppIcon name="ArrowRight" size={20} className="text-primary" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

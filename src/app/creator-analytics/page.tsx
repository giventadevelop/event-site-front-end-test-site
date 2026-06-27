'use client';

import React, { useState } from 'react';
import Link from 'next/link';

export default function CreatorAnalyticsPage() {
  const [dateRange, setDateRange] = useState<'7d' | '30d' | '90d' | 'all'>('30d');

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
    <div className="min-h-screen bg-background">
      {/* Hero Section with Gradient Background */}
      <section className="relative bg-gradient-to-br from-background to-muted py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Page Header */}
          <div className="text-center mb-12">
            <div className="flex items-center justify-center space-x-3 mb-6">
              <div className="w-12 h-12 bg-primary rounded-full flex items-center justify-center sacred-shadow">
                <svg className="w-8 h-8 text-primary-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
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
            <span className={`font-body text-lg font-semibold transition-colors duration-300 ${dateRange !== '7d' ? 'text-primary' : 'text-muted-foreground'}`}>
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
                  <svg className="w-5 h-5 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                ) : (
                  <svg className="w-5 h-5 text-accent" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                )}
              </span>
            </button>
            <span className={`font-body text-lg font-semibold transition-colors duration-300 ${dateRange === '30d' || dateRange === '90d' || dateRange === 'all' ? 'text-primary' : 'text-muted-foreground'}`}>
              {dateRange === '30d' ? '30 Days' : dateRange === '90d' ? '90 Days' : 'All Time'}
            </span>
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
                <svg className="w-10 h-10 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                </svg>
              </div>
              <h3 className="font-heading font-bold text-4xl text-primary mb-2">{formatNumber(stats.totalViews)}</h3>
              <p className="font-body text-sm text-muted-foreground">Total Views</p>
            </div>

            {/* Total Subscribers Card */}
            <div className="bg-card rounded-lg sacred-shadow p-6 hover:sacred-shadow-lg reverent-transition text-center group">
              <div className="w-16 h-16 bg-success/10 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:bg-success/20 reverent-transition">
                <svg className="w-10 h-10 text-success" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
              </div>
              <h3 className="font-heading font-bold text-4xl text-success mb-2">{formatNumber(stats.totalSubscribers)}</h3>
              <p className="font-body text-sm text-muted-foreground">Subscribers</p>
            </div>

            {/* Total Revenue Card */}
            <div className="bg-card rounded-lg sacred-shadow p-6 hover:sacred-shadow-lg reverent-transition text-center group">
              <div className="w-16 h-16 bg-accent/10 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:bg-accent/20 reverent-transition">
                <svg className="w-10 h-10 text-accent" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="font-heading font-bold text-4xl text-accent mb-2">{formatCurrency(stats.totalRevenue)}</h3>
              <p className="font-body text-sm text-muted-foreground">Total Revenue</p>
            </div>

            {/* Avg Engagement Card */}
            <div className="bg-card rounded-lg sacred-shadow p-6 hover:sacred-shadow-lg reverent-transition text-center group">
              <div className="w-16 h-16 bg-warning/10 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:bg-warning/20 reverent-transition">
                <svg className="w-10 h-10 text-warning" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
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
                  <svg className="w-5 h-5 text-primary-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                  </svg>
                </div>
                <h3 className="font-heading font-semibold text-lg text-foreground">Growth Rate</h3>
              </div>
              <p className="font-heading font-bold text-3xl text-primary mb-2">{stats.growthRate}%</p>
              <p className="font-body text-muted-foreground leading-relaxed">Compared to last period</p>
            </div>

            <div className="bg-gradient-to-br from-success/10 via-success/5 to-transparent rounded-lg sacred-shadow p-8 border border-success/20">
              <div className="flex items-center space-x-3 mb-6">
                <div className="w-8 h-8 bg-success rounded-full flex items-center justify-center">
                  <svg className="w-5 h-5 text-success-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
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
                <svg className="w-5 h-5 text-primary-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
                </svg>
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
                          <svg className="w-4 h-4 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                          </svg>
                          {formatNumber(content.views)} views
                        </span>
                        <span className="flex items-center gap-2 font-body text-muted-foreground">
                          <svg className="w-4 h-4 text-warning" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                          </svg>
                          {content.engagement}% engagement
                        </span>
                        <span className="flex items-center gap-2 font-body text-muted-foreground">
                          <svg className="w-4 h-4 text-accent" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                          {formatCurrency(content.revenue)}
                        </span>
                      </div>
                    </div>
                    <Link
                      href={`/creator-analytics/content/${content.id}`}
                      className="flex-shrink-0 w-10 h-10 rounded-lg bg-primary/10 hover:bg-primary/20 flex items-center justify-center transition-all duration-300 hover:scale-110 reverent-transition"
                      title="View Details"
                      aria-label="View content details"
                    >
                      <svg className="w-6 h-6 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </Link>
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

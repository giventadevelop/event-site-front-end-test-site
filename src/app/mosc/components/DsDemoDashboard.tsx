'use client';

import React, { useState } from 'react';
import Link from 'next/link';

const STATS = [
  {
    value: '124.5K',
    label: 'Total Views',
    change: '+12.5%',
    positive: true,
    icon: (
      <svg className="w-[26px] h-[26px] text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
      </svg>
    ),
  },
  {
    value: '8.2K',
    label: 'Total Subscribers',
    change: '+8.3%',
    positive: true,
    icon: (
      <svg className="w-[26px] h-[26px] text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
      </svg>
    ),
  },
  {
    value: '45.8K',
    label: 'Total Likes',
    change: '-2.1%',
    positive: false,
    icon: (
      <svg className="w-[26px] h-[26px] text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
      </svg>
    ),
  },
  {
    value: '$12,450',
    label: 'Total Revenue',
    change: '+15.7%',
    positive: true,
    icon: (
      <svg className="w-[26px] h-[26px] text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
  },
];

const RECENT_CONTENT = [
  { title: 'Introduction to Orthodox Faith', type: 'Video', views: '12,450', status: 'Published', date: '2024-01-15' },
  { title: 'Weekly Sermon Series', type: 'Video', views: '8,920', status: 'Published', date: '2024-01-14' },
  { title: 'Community News Update', type: 'Article', views: '5,340', status: 'Draft', date: '2024-01-13' },
  { title: 'Liturgical Calendar Guide', type: 'Article', views: '3,210', status: 'Published', date: '2024-01-12' },
];

const CHART_OPTIONS = ['7 Days', '30 Days', '90 Days'];

const QUICK_ACTIONS = [
  { label: 'Create Video', href: '#', icon: 'video' },
  { label: 'View Analytics', href: '#', icon: 'chart' },
  { label: 'Promote Content', href: '#', icon: 'bullhorn' },
  { label: 'Settings', href: '#', icon: 'cog' },
];

function QuickActionIcon({ name }: { name: string }) {
  const className = 'w-10 h-10 text-syro-blue';
  switch (name) {
    case 'video':
      return (
        <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
        </svg>
      );
    case 'chart':
      return (
        <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
        </svg>
      );
    case 'bullhorn':
      return (
        <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5.882V19.24a1.76 1.76 0 01-3.417.592l-2.147-6.15M18 13a3 3 0 100-6M5.436 13a3 3 0 100-6M12 9c0 1.605-.42 3.11-1.157 4.418M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      );
    case 'cog':
      return (
        <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
      );
    default:
      return null;
  }
}

export default function DsDemoDashboard() {
  const [chartOption, setChartOption] = useState(0);

  return (
    <div className="max-w-[1200px] mx-auto px-4 sm:px-6 py-14 sm:py-16">
      {/* Section Title - OVERVIEW */}
      <div className="syro-section-title">
        <h6>OVERVIEW</h6>
      </div>

      {/* Main Title */}
      <div className="mb-syro-xxl">
        <h1 className="text-syro-h1 font-bold text-syro-blue mb-syro-sm">
          Dashboard <span className="syro-imp-color">Overview</span>
        </h1>
        <p className="text-syro-body text-syro-dark-gray mb-syro-xxl">
          Welcome to your analytics dashboard. Monitor your performance metrics and track your growth.
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-syro-xl mb-syro-xxxl">
        {STATS.map((stat) => (
          <div
            key={stat.label}
            className="bg-white p-syro-xxl rounded-[5px] shadow-syro-card transition-all duration-500 hover:shadow-syro-card-hover relative"
          >
            <div className="flex justify-between items-center mb-syro-lg">
              <div className="w-[65px] h-[65px] syro-stat-icon rounded-[5px] flex items-center justify-center">
                {stat.icon}
              </div>
            </div>
            <div className="text-syro-h2 font-bold text-syro-blue mb-1">{stat.value}</div>
            <div className="text-syro-label text-syro-medium-gray font-light">{stat.label}</div>
            <div
              className={`text-syro-small font-medium mt-syro-sm ${
                stat.positive ? 'text-syro-success' : 'text-syro-red'
              }`}
            >
              {stat.positive ? (
                <svg className="inline w-4 h-4 mr-1 -mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 10l7-7m0 0l7 7m-7-7v18" />
                </svg>
              ) : (
                <svg className="inline w-4 h-4 mr-1 -mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
                </svg>
              )}
              {stat.change}
            </div>
          </div>
        ))}
      </div>

      {/* Chart Section */}
      <div className="bg-white p-syro-xxl rounded-[5px] shadow-syro-card mb-syro-xxxl">
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-syro-xl">
          <h3 className="text-syro-h3 font-semibold text-syro-blue">Performance Analytics</h3>
          <div className="flex gap-syro-sm">
            {CHART_OPTIONS.map((opt, i) => (
              <button
                key={opt}
                type="button"
                onClick={() => setChartOption(i)}
                className={`px-2.5 py-1.5 border-2 border-[#315984] text-syro-small font-medium transition-all duration-300 ${
                  chartOption === i
                    ? 'bg-[#315984] text-white'
                    : 'bg-transparent text-syro-blue hover:bg-[#315984] hover:text-white'
                }`}
              >
                {opt}
              </button>
            ))}
          </div>
        </div>
        <div className="syro-chart-placeholder h-[250px] sm:h-[400px] rounded-[5px] flex items-center justify-center text-syro-blue text-lg font-light">
          Chart visualization will appear here
        </div>
      </div>

      {/* Data Section - Recent Activity */}
      <div className="relative pl-0 sm:pl-20">
        <div className="syro-section-title">
          <h6>RECENT ACTIVITY</h6>
        </div>

        <div className="bg-white p-syro-xxl rounded-[5px] shadow-syro-card">
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-syro-xl">
            <h3 className="text-syro-h3 font-semibold text-syro-blue">Recent Content</h3>
            <Link
              href="#"
              className="syro-primary-button inline-flex items-center gap-2"
            >
              <span>View All</span>
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
              </svg>
            </Link>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr>
                  <th className="text-left py-4 px-4 font-semibold text-syro-blue border-b-2 border-syro-table-border">
                    Title
                  </th>
                  <th className="text-left py-4 px-4 font-semibold text-syro-blue border-b-2 border-syro-table-border">
                    Type
                  </th>
                  <th className="text-left py-4 px-4 font-semibold text-syro-blue border-b-2 border-syro-table-border">
                    Views
                  </th>
                  <th className="text-left py-4 px-4 font-semibold text-syro-blue border-b-2 border-syro-table-border">
                    Status
                  </th>
                  <th className="text-left py-4 px-4 font-semibold text-syro-blue border-b-2 border-syro-table-border">
                    Date
                  </th>
                </tr>
              </thead>
              <tbody>
                {RECENT_CONTENT.map((row) => (
                  <tr
                    key={row.title}
                    className="hover:bg-syro-red/20 transition-colors"
                  >
                    <td className="py-4 px-4 border-b border-syro-table-border text-syro-dark-gray">
                      {row.title}
                    </td>
                    <td className="py-4 px-4 border-b border-syro-table-border text-syro-dark-gray">
                      {row.type}
                    </td>
                    <td className="py-4 px-4 border-b border-syro-table-border text-syro-dark-gray">
                      {row.views}
                    </td>
                    <td className="py-4 px-4 border-b border-syro-table-border">
                      <span
                        className={`inline-block py-1.5 px-3 rounded text-syro-small font-medium ${
                          row.status === 'Published'
                            ? 'bg-syro-success-bg text-syro-success'
                            : 'bg-syro-warning-bg text-syro-warning'
                        }`}
                      >
                        {row.status}
                      </span>
                    </td>
                    <td className="py-4 px-4 border-b border-syro-table-border text-syro-dark-gray">
                      {row.date}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {/* Pagination */}
          <ul className="flex flex-wrap gap-2 mt-syro-xl list-none">
            <li>
              <Link
                href="#"
                className="inline-block py-2 px-3 border border-syro-table-border bg-white text-syro-blue rounded-[5px] text-syro-small no-underline transition-colors hover:bg-syro-red/20 hover:border-syro-red"
              >
                &laquo; Previous
              </Link>
            </li>
            <li>
              <Link href="#" className="inline-block py-2 px-3 border border-syro-table-border bg-white text-syro-blue rounded-[5px] text-syro-small no-underline transition-colors hover:bg-syro-red/20 hover:border-syro-red">
                1
              </Link>
            </li>
            <li>
              <span className="inline-block py-2 px-3 border border-syro-red bg-syro-red text-white rounded-[5px] text-syro-small">
                2
              </span>
            </li>
            <li>
              <Link href="#" className="inline-block py-2 px-3 border border-syro-table-border bg-white text-syro-blue rounded-[5px] text-syro-small no-underline transition-colors hover:bg-syro-red/20 hover:border-syro-red">
                3
              </Link>
            </li>
            <li>
              <Link href="#" className="inline-block py-2 px-3 border border-syro-table-border bg-white text-syro-blue rounded-[5px] text-syro-small no-underline transition-colors hover:bg-syro-red/20 hover:border-syro-red">
                4
              </Link>
            </li>
            <li>
              <Link
                href="#"
                className="inline-block py-2 px-3 border border-syro-table-border bg-white text-syro-blue rounded-[5px] text-syro-small no-underline transition-colors hover:bg-syro-red/20 hover:border-syro-red"
              >
                Next &raquo;
              </Link>
            </li>
          </ul>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-syro-red/20 p-syro-xl rounded-[5px] mt-syro-xxxl">
        <h4 className="text-syro-h4 font-semibold text-syro-maroon mb-syro-xl">Quick Actions</h4>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-syro-lg">
          {QUICK_ACTIONS.map((action) => (
            <Link
              key={action.label}
              href={action.href}
              className="bg-white p-syro-lg rounded-[5px] no-underline text-syro-blue transition-colors duration-500 border-r border-syro-blue hover:text-syro-blue-secondary"
            >
              <div className="mb-syro-sm">
                <QuickActionIcon name={action.icon} />
              </div>
              <h6 className="text-syro-h6 font-semibold m-0">{action.label}</h6>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}

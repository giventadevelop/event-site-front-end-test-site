#!/usr/bin/env node

/**
 * TaskMaster Script for Tenant Management System
 * 
 * This script parses the PRD.md file and generates structured tasks
 * for implementing the tenant management system.
 */

const fs = require('fs');
const path = require('path');

// Read the PRD file
const prdPath = path.join(__dirname, 'PRD.md');
const prdContent = fs.readFileSync(prdPath, 'utf8');

// Parse the PRD and generate tasks
function generateTasks() {
  const tasks = [
    {
      id: 1,
      title: "Setup Tenant Management Infrastructure",
      description: "Create the foundational infrastructure for tenant management system",
      status: "pending",
      priority: "high",
      dependencies: [],
      details: `
        - Create proxy API handlers for tenant operations
        - Set up authentication and authorization for super admin access
        - Create database DTOs and types for tenant entities
        - Implement basic CRUD operations for tenant_organization table
        - Implement basic CRUD operations for tenant_settings table
        - Set up audit logging for tenant operations
      `,
      testStrategy: "Verify all CRUD operations work correctly, test authentication, validate data constraints"
    },
    {
      id: 2,
      title: "Create Tenant Dashboard",
      description: "Build the main tenant management dashboard interface",
      status: "pending",
      priority: "high",
      dependencies: [1],
      details: `
        - Create tenant dashboard page at /admin/tenant-management
        - Implement tenant list view with key information display
        - Add search and filtering capabilities
        - Implement pagination for large tenant lists
        - Add sorting functionality for all columns
        - Create responsive design for mobile and desktop
        - Integrate with existing admin navigation
      `,
      testStrategy: "Test dashboard loads correctly, verify search/filter/sort work, test responsive design"
    },
    {
      id: 3,
      title: "Implement Tenant Creation Form",
      description: "Build the form for creating new tenant organizations",
      status: "pending",
      priority: "high",
      dependencies: [1, 2],
      details: `
        - Create tenant creation form with all required fields
        - Implement client-side validation for form inputs
        - Add server-side validation matching database constraints
        - Implement tenant ID and domain uniqueness checks
        - Add color picker for primary/secondary colors
        - Create subscription plan selection dropdown
        - Implement form submission and error handling
        - Add success/error notifications
      `,
      testStrategy: "Test form validation, verify uniqueness constraints, test form submission, validate data persistence"
    },
    {
      id: 4,
      title: "Implement Tenant Editing Interface",
      description: "Build the interface for editing existing tenant organizations",
      status: "pending",
      priority: "high",
      dependencies: [1, 2, 3],
      details: `
        - Create tenant edit form with pre-populated data
        - Implement inline editing capabilities
        - Add real-time validation during editing
        - Implement auto-save functionality
        - Add confirmation dialogs for critical changes
        - Create audit trail for modifications
        - Implement optimistic updates for better UX
      `,
      testStrategy: "Test edit form loads correctly, verify validation, test auto-save, verify audit trail"
    },
    {
      id: 5,
      title: "Add Tenant Settings Management",
      description: "Implement the interface for managing tenant-specific settings",
      status: "pending",
      priority: "medium",
      dependencies: [1, 2, 3, 4],
      details: `
        - Create tenant settings configuration interface
        - Implement settings inheritance system
        - Add default values for new tenants
        - Create settings templates for common use cases
        - Implement bulk settings updates
        - Add settings validation and constraints
        - Create settings preview functionality
      `,
      testStrategy: "Test settings inheritance, verify validation, test bulk operations, validate settings persistence"
    },
    {
      id: 6,
      title: "Implement Subscription Management",
      description: "Build the subscription plan and billing management system",
      status: "pending",
      priority: "medium",
      dependencies: [1, 2, 3, 4, 5],
      details: `
        - Create subscription plan management interface
        - Implement plan feature definitions
        - Add pricing configuration
        - Implement plan migration functionality
        - Add Stripe integration for billing
        - Create payment tracking and monitoring
        - Implement billing alerts and notifications
      `,
      testStrategy: "Test plan management, verify Stripe integration, test billing workflows, validate payment tracking"
    },
    {
      id: 7,
      title: "Add Tenant Deactivation/Activation",
      description: "Implement tenant status management and soft delete functionality",
      status: "pending",
      priority: "medium",
      dependencies: [1, 2, 3, 4],
      details: `
        - Implement soft delete for tenant organizations
        - Add bulk deactivation/activation operations
        - Create confirmation dialogs for destructive actions
        - Implement status change notifications
        - Add deactivation reason tracking
        - Create reactivation workflow
        - Implement data retention policies
      `,
      testStrategy: "Test soft delete functionality, verify bulk operations, test confirmation dialogs, validate status changes"
    },
    {
      id: 8,
      title: "Implement Platform Administration Features",
      description: "Build platform-wide administration and monitoring capabilities",
      status: "pending",
      priority: "low",
      dependencies: [1, 2, 3, 4, 5, 6, 7],
      details: `
        - Create system monitoring dashboard
        - Implement tenant metrics and analytics
        - Add performance monitoring across tenants
        - Create error tracking and logging
        - Implement global settings management
        - Add feature flags system
        - Create maintenance mode controls
      `,
      testStrategy: "Test monitoring dashboard, verify metrics accuracy, test global settings, validate feature flags"
    },
    {
      id: 9,
      title: "Add Data Export and Reporting",
      description: "Implement data export functionality and reporting capabilities",
      status: "pending",
      priority: "low",
      dependencies: [1, 2, 3, 4, 5, 6, 7, 8],
      details: `
        - Implement CSV/Excel export functionality
        - Create tenant data reports
        - Add usage analytics and insights
        - Implement scheduled report generation
        - Create custom report builder
        - Add report delivery via email
        - Implement report archiving
      `,
      testStrategy: "Test export functionality, verify report accuracy, test scheduled reports, validate data integrity"
    },
    {
      id: 10,
      title: "Performance Optimization and Testing",
      description: "Optimize performance and conduct comprehensive testing",
      status: "pending",
      priority: "medium",
      dependencies: [1, 2, 3, 4, 5, 6, 7, 8, 9],
      details: `
        - Implement caching for tenant data
        - Optimize database queries and indexing
        - Add lazy loading for tenant details
        - Implement virtual scrolling for large lists
        - Conduct performance testing and optimization
        - Implement comprehensive error handling
        - Add automated testing suite
        - Conduct user acceptance testing
      `,
      testStrategy: "Test performance under load, verify caching effectiveness, run automated tests, conduct UAT"
    }
  ];

  return tasks;
}

// Generate tasks.json file
function generateTasksJson() {
  const tasks = generateTasks();
  const tasksJson = {
    project: "Tenant Management System",
    version: "1.0.0",
    description: "Multi-tenant organization management system for Malayalees US platform",
    tasks: tasks,
    metadata: {
      generatedAt: new Date().toISOString(),
      source: "PRD.md",
      totalTasks: tasks.length,
      estimatedWeeks: 10,
      estimatedHours: 160
    }
  };

  const outputPath = path.join(__dirname, 'tasks.json');
  fs.writeFileSync(outputPath, JSON.stringify(tasksJson, null, 2));
  console.log(`✅ Generated tasks.json with ${tasks.length} tasks`);
  console.log(`📁 Output: ${outputPath}`);
}

// Generate individual task files
function generateTaskFiles() {
  const tasks = generateTasks();
  const tasksDir = path.join(__dirname, 'tasks');
  
  // Create tasks directory if it doesn't exist
  if (!fs.existsSync(tasksDir)) {
    fs.mkdirSync(tasksDir);
  }

  tasks.forEach(task => {
    const taskContent = `# Task ID: ${task.id}
# Title: ${task.title}
# Status: ${task.status}
# Dependencies: ${task.dependencies.join(', ') || 'none'}
# Priority: ${task.priority}
# Description: ${task.description}

# Details:
${task.details}

# Test Strategy:
${task.testStrategy}
`;

    const taskFile = path.join(tasksDir, `task-${task.id.toString().padStart(2, '0')}.txt`);
    fs.writeFileSync(taskFile, taskContent);
  });

  console.log(`✅ Generated ${tasks.length} individual task files in ${tasksDir}/`);
}

// Main execution
if (require.main === module) {
  console.log('🚀 TaskMaster for Tenant Management System');
  console.log('==========================================\n');
  
  try {
    generateTasksJson();
    generateTaskFiles();
    
    console.log('\n📋 Summary:');
    console.log('- Core Infrastructure: Tasks 1-2');
    console.log('- Tenant Management UI: Tasks 3-4');
    console.log('- Settings & Subscriptions: Tasks 5-6');
    console.log('- Advanced Features: Tasks 7-8');
    console.log('- Optimization & Testing: Tasks 9-10');
    
    console.log('\n🎯 Next Steps:');
    console.log('1. Review generated tasks in tasks.json');
    console.log('2. Check individual task files in tasks/ directory');
    console.log('3. Begin with Task 1: Setup Tenant Management Infrastructure');
    console.log('4. Follow dependency order for implementation');
    
  } catch (error) {
    console.error('❌ Error generating tasks:', error.message);
    process.exit(1);
  }
}

module.exports = { generateTasks, generateTasksJson, generateTaskFiles };

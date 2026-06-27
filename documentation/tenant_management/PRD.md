# Tenant Management System - Product Requirements Document (PRD)

## Executive Summary

The Tenant Management System is a comprehensive administrative interface that allows super administrators to manage multi-tenant organizations, their settings, and configurations within the Malayalees US event management platform. This system provides centralized control over tenant organizations, their subscription plans, and platform-wide settings.

## Background & Context

The platform currently supports multi-tenancy through the `tenant_organization` and `tenant_settings` tables, but lacks a user interface for administrators to manage these tenants. This system will enable platform administrators to:

- Create and manage tenant organizations
- Configure tenant-specific settings and permissions
- Monitor subscription status and billing
- Manage platform-wide configurations
- Oversee tenant onboarding and offboarding

## Business Objectives

1. **Centralized Tenant Management**: Provide a single interface for managing all tenant organizations
2. **Operational Efficiency**: Streamline tenant onboarding, configuration, and monitoring processes
3. **Revenue Management**: Track subscription plans, billing, and payment status
4. **Platform Control**: Maintain oversight of tenant configurations and platform settings
5. **Scalability**: Support growth from current tenant base to hundreds of organizations

## User Stories

### Super Administrator
- As a super administrator, I want to view all tenant organizations in a centralized dashboard
- As a super administrator, I want to create new tenant organizations with proper configuration
- As a super administrator, I want to edit tenant organization details and settings
- As a super administrator, I want to manage tenant subscription plans and billing
- As a super administrator, I want to configure platform-wide settings that affect all tenants
- As a super administrator, I want to monitor tenant usage and performance metrics
- As a super administrator, I want to deactivate or reactivate tenant organizations

### Tenant Organization Manager
- As a tenant organization manager, I want to view my organization's current settings
- As a tenant organization manager, I want to update my organization's branding and contact information
- As a tenant organization manager, I want to manage my organization's subscription plan

## Functional Requirements

### 1. Tenant Organization Management

#### 1.1 Tenant Dashboard
- **List View**: Display all tenant organizations with key information
  - Organization name
  - Tenant ID
  - Domain
  - Subscription plan and status
  - Contact information
  - Active status
  - Created/updated dates
- **Search & Filter**:
  - Search by organization name, tenant ID, or domain
  - Filter by subscription plan, status, or active status
  - Sort by various columns
- **Pagination**: Handle large numbers of tenants efficiently

#### 1.2 Tenant Creation
- **Form Fields**:
  - Organization name (required)
  - Tenant ID (required, unique)
  - Domain (optional, unique)
  - Contact email (required)
  - Contact phone (optional)
  - Primary color (optional, hex format)
  - Secondary color (optional, hex format)
  - Logo URL (optional)
  - Subscription plan selection
  - Monthly fee (USD)
- **Validation**:
  - Tenant ID uniqueness
  - Domain uniqueness (if provided)
  - Email format validation
  - Color format validation (hex codes)
  - Required field validation

#### 1.3 Tenant Editing
- **Editable Fields**: All fields except tenant ID (immutable)
- **Real-time Updates**: Immediate reflection of changes
- **Audit Trail**: Track all modifications with timestamps

#### 1.4 Tenant Deactivation/Activation
- **Soft Delete**: Mark tenants as inactive without data loss
- **Bulk Operations**: Select multiple tenants for status changes
- **Confirmation Dialogs**: Prevent accidental deactivation

### 2. Tenant Settings Management

#### 2.1 Settings Configuration
- **User Registration Settings**:
  - Allow user registration (boolean)
  - Require admin approval (boolean)
- **Integration Settings**:
  - Enable WhatsApp integration (boolean)
  - WhatsApp API key configuration
  - Enable email marketing (boolean)
  - Email provider configuration (JSON)
- **Event Management Settings**:
  - Maximum events per month
  - Maximum attendees per event
  - Enable guest registration (boolean)
  - Maximum guests per attendee
  - Default event capacity
- **Platform Settings**:
  - Platform fee percentage
  - Custom CSS (8192 characters)
  - Custom JavaScript (16384 characters)

#### 2.2 Settings Inheritance
- **Default Values**: Provide sensible defaults for new tenants
- **Template System**: Pre-configured settings templates for common use cases
- **Bulk Updates**: Apply settings changes to multiple tenants

### 3. Subscription Management

#### 3.1 Plan Management
- **Subscription Plans**: FREE, BASIC, PREMIUM, ENTERPRISE
- **Plan Features**: Define what each plan includes
- **Pricing**: Set monthly fees for each plan
- **Plan Migration**: Allow tenants to upgrade/downgrade plans

#### 3.2 Billing Integration
- **Stripe Integration**: Connect tenant organizations to Stripe customers
- **Payment Tracking**: Monitor subscription status and payment history
- **Billing Alerts**: Notify administrators of payment issues

### 4. Platform Administration

#### 4.1 System Monitoring
- **Tenant Metrics**: Track active tenants, usage patterns
- **Performance Monitoring**: Monitor system performance across tenants
- **Error Tracking**: Log and display system errors by tenant

#### 4.2 Global Settings
- **Platform-wide Configuration**: Settings that affect all tenants
- **Feature Flags**: Enable/disable features across the platform
- **Maintenance Mode**: Platform-wide maintenance controls

## Technical Requirements

### 1. Architecture
- **Next.js App Router**: Use the existing Next.js 15+ architecture
- **Server Components**: Implement server-side rendering for data fetching
- **API Routes**: Create proxy endpoints for tenant management operations
- **Authentication**: Super admin role required for all operations

### 2. Database Operations
- **CRUD Operations**: Full CRUD for tenant_organization and tenant_settings
- **Data Validation**: Server-side validation matching database constraints
- **Transaction Support**: Ensure data consistency across related tables
- **Audit Logging**: Track all administrative actions

### 3. Security
- **Role-based Access**: Only super administrators can access tenant management
- **Input Validation**: Prevent SQL injection and XSS attacks
- **Rate Limiting**: Prevent abuse of administrative endpoints
- **Audit Trail**: Log all administrative actions for compliance

### 4. Performance
- **Pagination**: Efficient handling of large tenant lists
- **Caching**: Cache frequently accessed tenant data
- **Optimized Queries**: Efficient database queries with proper indexing
- **Lazy Loading**: Load tenant details on demand

## User Interface Requirements

### 1. Layout & Navigation
- **Admin Dashboard**: Integrate with existing admin interface
- **Breadcrumb Navigation**: Clear navigation hierarchy
- **Responsive Design**: Mobile-friendly interface

### 2. Data Tables
- **Sortable Columns**: Sort by any relevant field
- **Search Functionality**: Global search across tenant data
- **Bulk Actions**: Select multiple tenants for operations
- **Export Options**: Export tenant data to CSV/Excel

### 3. Forms
- **Validation Feedback**: Real-time validation with clear error messages
- **Auto-save**: Save changes automatically to prevent data loss
- **Confirmation Dialogs**: Confirm destructive actions
- **Progress Indicators**: Show operation progress for long-running tasks

### 4. Notifications
- **Success Messages**: Confirm successful operations
- **Error Handling**: Clear error messages with resolution steps
- **Warning Alerts**: Highlight potential issues or conflicts

## Data Models

### Tenant Organization
```typescript
interface TenantOrganization {
  id: number;
  tenant_id: string;
  organization_name: string;
  domain?: string;
  primary_color?: string;
  secondary_color?: string;
  logo_url?: string;
  contact_email: string;
  contact_phone?: string;
  subscription_plan?: string;
  subscription_status?: string;
  subscription_start_date?: Date;
  subscription_end_date?: Date;
  monthly_fee_usd?: number;
  stripe_customer_id?: string;
  is_active: boolean;
  created_at: Date;
  updated_at: Date;
}
```

### Tenant Settings
```typescript
interface TenantSettings {
  id: number;
  tenant_id: string;
  allow_user_registration: boolean;
  require_admin_approval: boolean;
  enable_whatsapp_integration: boolean;
  enable_email_marketing: boolean;
  whatsapp_api_key?: string;
  email_provider_config?: string;
  custom_css?: string;
  custom_js?: string;
  max_events_per_month?: number;
  max_attendees_per_event?: number;
  enable_guest_registration: boolean;
  max_guests_per_attendee: number;
  default_event_capacity: number;
  platform_fee_percentage?: number;
  created_at: Date;
  updated_at: Date;
}
```

## API Endpoints

### Tenant Organizations
- `GET /api/proxy/tenant-organizations` - List all tenants
- `GET /api/proxy/tenant-organizations/:id` - Get tenant details
- `POST /api/proxy/tenant-organizations` - Create new tenant
- `PUT /api/proxy/tenant-organizations/:id` - Update tenant
- `DELETE /api/proxy/tenant-organizations/:id` - Deactivate tenant

### Tenant Settings
- `GET /api/proxy/tenant-settings` - List all tenant settings
- `GET /api/proxy/tenant-settings/:tenantId` - Get settings for specific tenant
- `POST /api/proxy/tenant-settings` - Create tenant settings
- `PUT /api/proxy/tenant-settings/:id` - Update tenant settings
- `DELETE /api/proxy/tenant-settings/:id` - Delete tenant settings

## Success Metrics

### 1. Operational Efficiency
- **Time to Onboard**: Reduce tenant onboarding time by 50%
- **Administrative Overhead**: Reduce manual tenant management tasks by 70%
- **Error Rate**: Maintain <1% error rate in tenant operations

### 2. User Experience
- **Admin Satisfaction**: Achieve >90% satisfaction score from administrators
- **Task Completion**: 95% of administrative tasks completed successfully
- **Response Time**: <2 second response time for all operations

### 3. Business Impact
- **Tenant Retention**: Improve tenant retention rate by 20%
- **Revenue Growth**: Support 3x growth in tenant base
- **Operational Scale**: Support management of 100+ tenants efficiently

## Implementation Phases

### Phase 1: Core Infrastructure (Week 1-2)
- Database proxy handlers for tenant operations
- Basic CRUD operations for tenant organizations
- Authentication and authorization setup

### Phase 2: Tenant Management UI (Week 3-4)
- Tenant dashboard with list view
- Create/edit forms for tenant organizations
- Basic search and filtering

### Phase 3: Settings Management (Week 5-6)
- Tenant settings configuration interface
- Settings inheritance and templates
- Bulk operations support

### Phase 4: Advanced Features (Week 7-8)
- Subscription management
- Billing integration
- Advanced monitoring and analytics

### Phase 5: Testing & Polish (Week 9-10)
- Comprehensive testing
- Performance optimization
- User experience improvements

## Risk Assessment

### 1. Technical Risks
- **Data Migration**: Existing tenant data may need migration
- **Performance**: Large tenant lists may impact performance
- **Integration**: Stripe integration complexity

### 2. Business Risks
- **Data Loss**: Accidental tenant deactivation
- **Security**: Unauthorized access to tenant management
- **Compliance**: Audit and compliance requirements

### 3. Mitigation Strategies
- **Backup Systems**: Regular data backups and recovery procedures
- **Access Controls**: Strict role-based access control
- **Testing**: Comprehensive testing before production deployment
- **Monitoring**: Real-time monitoring and alerting

## Conclusion

The Tenant Management System will provide the foundation for scalable multi-tenant operations, enabling efficient administration of tenant organizations while maintaining security and performance. This system will support the platform's growth and provide administrators with the tools needed to manage a growing tenant base effectively.

## Appendix

### Database Schema References
- `tenant_organization` table: Lines 1666-1708 in db_SQL_Temp_ VER_1.sql
- `tenant_settings` table: Lines 1709-1750 in db_SQL_Temp_ VER_1.sql
- Foreign key relationship: `tenant_settings.tenant_id` references `tenant_organization.tenant_id`

### Related Tables with Tenant ID
- `user_profile`
- `event_details`
- `event_media`
- `event_ticket_type`
- `event_attendee`
- `user_subscription`
- And many more event-related tables

### Existing Admin Infrastructure
- Admin dashboard at `/admin`
- Executive committee management
- Event management
- Media management
- Usage management


























































